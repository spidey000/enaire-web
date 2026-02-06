/**
 * SISTEMA COMPLETO DE GESTIÓN DE ESTADO
 *
 * Este módulo gestiona TODA la información de la aplicación:
 * - Progreso de estudio
 * - Historial de quizzes (todas las respuestas)
 * - Estado de flashcards
 * - Estado de navegación (última página, scroll)
 * - Plan de estudio (tareas completadas, notas)
 * - Configuración del usuario
 *
 * Todo se guarda en localStorage y se restaura automáticamente.
 */

const STORAGE_KEYS = {
  // Datos principales
  PROGRESS: 'enaire_progress',
  QUIZ_HISTORY: 'enaire_quiz_history',
  FLASHCARDS: 'enaire_flashcards',

  // Plan de estudio
  PLAN_STATE: 'enaire_plan_state',

  // Estado de navegación
  NAVIGATION: 'enaire_navigation',

  // Respuestas detalladas (todas las preguntas contestadas)
  ANSWERS: 'enaire_all_answers',

  // Configuración
  SETTINGS: 'enaire_settings',

  // Sesión actual (para recuperación tras refresh)
  CURRENT_SESSION: 'enaire_current_session'
};

/**
 * Inicializa todos los almacenamientos si no existen
 */
export function initStorage() {
  // Progreso general
  if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify({
      userId: 'default',
      lastStudyDate: null,
      modules: {},
      stats: {
        totalQuestionsSeen: 0,
        totalQuestionsCorrect: 0,
        totalFlashcardsReviewed: 0,
        studyMinutes: 0
      }
    }));
  }

  // Historial de quizzes
  if (!localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify([]));
  }

  // Estado de flashcards
  if (!localStorage.getItem(STORAGE_KEYS.FLASHCARDS)) {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify({}));
  }

  // Estado del plan de estudio
  if (!localStorage.getItem(STORAGE_KEYS.PLAN_STATE)) {
    localStorage.setItem(STORAGE_KEYS.PLAN_STATE, JSON.stringify({
      tasksCompleted: {},
      tasksNotes: {},
      expandedSections: {},
      lastVisit: null
    }));
  }

  // Estado de navegación
  if (!localStorage.getItem(STORAGE_KEYS.NAVIGATION)) {
    localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify({
      lastPage: '/',
      lastVisit: null,
      scrollPositions: {},
      pageVisits: {}
    }));
  }

  // Todas las respuestas dadas
  if (!localStorage.getItem(STORAGE_KEYS.ANSWERS)) {
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify({
      answers: [], // { questionId, moduleId, yourAnswer, correctAnswer, isCorrect, timestamp }
      stats: {
        totalAnswers: 0,
        correctAnswers: 0,
        uniqueQuestions: 0
      }
    }));
  }

  // Configuración
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      theme: 'light',
      language: 'es',
      defaultQuizMode: 'practice',
      defaultQuizDifficulty: 'all',
      autoSaveInterval: 30 // segundos
    }));
  }

  // Sesión actual
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify({
      currentPage: '/',
      quizInProgress: null,
      flashcardInProgress: null
    }));
  }
}

/**
 * Clase principal de gestión de estado
 */
export class StateManager {
  constructor() {
    initStorage();
  }

  // ==================== PROGRESO ====================

  getProgress() {
    return this._get(STORAGE_KEYS.PROGRESS);
  }

  /**
   * Recalculates progress statistics from the raw answer history.
   * This ensures consistency and fixes any drift in counters.
   */
  recalculateProgress() {
    const answersData = this._get(STORAGE_KEYS.ANSWERS);
    const allAnswers = answersData.answers || [];
    const progress = this.getProgress();
    
    // Reset stats
    progress.stats = {
      totalQuestionsSeen: 0,
      totalQuestionsCorrect: 0,
      totalFlashcardsReviewed: this._get(STORAGE_KEYS.FLASHCARDS) ? Object.keys(this._get(STORAGE_KEYS.FLASHCARDS)).length : 0,
      studyMinutes: progress.stats.studyMinutes || 0 // Preserve study time if tracked elsewhere
    };

    // Group answers by module
    const answersByModule = {};
    const uniqueQuestionsGlobal = new Set();
    const uniqueCorrectGlobal = new Set(); // Unique questions answered correctly at least once

    allAnswers.forEach(ans => {
      if (!answersByModule[ans.moduleId]) {
        answersByModule[ans.moduleId] = [];
      }
      answersByModule[ans.moduleId].push(ans);
      
      uniqueQuestionsGlobal.add(ans.questionId);
      if (ans.isCorrect) {
        uniqueCorrectGlobal.add(ans.questionId);
      }
    });

    progress.stats.totalQuestionsSeen = uniqueQuestionsGlobal.size;
    progress.stats.totalQuestionsCorrect = uniqueCorrectGlobal.size; // Or total correct answers? UI usually implies unique for "progress"
    // Wait, "Correctas" in the main dashboard usually implies total correct answers given in quizzes vs total answers?
    // Let's stick to unique questions "mastered" for the progress bar, but maybe "Total Correct Answers" for the counter?
    // The previous implementation was accumulating.
    // If I answer the same question correctly 10 times, should it count as 10?
    // Usually "Seen" = Unique. "Correct" in context of "Seen" = Unique Correct.
    // Let's stick to UNIQUE for consistency with "Vistas".
    
    // Update per-module stats
    Object.keys(answersByModule).forEach(moduleId => {
      const moduleAnswers = answersByModule[moduleId];
      const uniqueSeen = new Set(moduleAnswers.map(a => a.questionId));
      const uniqueCorrect = new Set(moduleAnswers.filter(a => a.isCorrect).map(a => a.questionId));
      const incorrectIds = [...new Set(moduleAnswers.filter(a => !a.isCorrect).map(a => a.questionId))];
      
      // Calculate average score (Accuracy) based on ALL attempts
      const totalAttempts = moduleAnswers.length;
      const totalCorrectAttempts = moduleAnswers.filter(a => a.isCorrect).length;
      const averageScore = totalAttempts > 0 
        ? Math.round((totalCorrectAttempts / totalAttempts) * 100) 
        : 0;

      if (!progress.modules[moduleId]) {
        progress.modules[moduleId] = {};
      }

      Object.assign(progress.modules[moduleId], {
        questionsSeen: uniqueSeen.size,
        questionsCorrect: uniqueCorrect.size,
        questionsIncorrect: incorrectIds,
        averageScore: averageScore,
        // Preserve other fields
        lastStudied: progress.modules[moduleId].lastStudied || new Date().toISOString()
      });
    });

    this._set(STORAGE_KEYS.PROGRESS, progress);
    return progress;
  }

  updateModuleProgress(moduleId, data) {
    // Instead of partial updates, we trigger a recalculation
    // but we can optimize if needed. For now, let's just use the recalculate
    // to guarantee correctness, as it's fast enough for client-side lists.
    return this.recalculateProgress().modules[moduleId];
  }

  recordIncorrectAnswer(moduleId, questionId) {
   // This is handled in recalculateProgress now
  }


  // ==================== RESPUESTAS ====================

  /**
   * Guarda TODAS las respuestas que se dan
   */
  recordAnswer(answerData) {
    const answers = this._get(STORAGE_KEYS.ANSWERS);

    // Crear registro de respuesta
    const answerRecord = {
      id: `${answerData.questionId}_${Date.now()}`,
      questionId: answerData.questionId,
      moduleId: answerData.moduleId,
      questionText: answerData.questionText,
      yourAnswer: answerData.yourAnswer,
      correctAnswer: answerData.correctAnswer,
      isCorrect: answerData.isCorrect,
      timestamp: new Date().toISOString(),
      quizId: answerData.quizId,
      mode: answerData.mode || 'practice',
      timeSpent: answerData.timeSpent,
      difficulty: answerData.difficulty
    };

    // Añadir al array
    answers.answers.push(answerRecord);

    // Actualizar estadísticas
    answers.stats.totalAnswers++;
    if (answerData.isCorrect) {
      answers.stats.correctAnswers++;
    }

    // Contar preguntas únicas
    const uniqueQuestions = new Set(answers.answers.map(a => a.questionId));
    answers.stats.uniqueQuestions = uniqueQuestions.size;

    this._set(STORAGE_KEYS.ANSWERS, answers);

    return answerRecord;
  }

  /**
   * Obtiene todas las respuestas dadas
   */
  getAllAnswers(filters = {}) {
    const data = this._get(STORAGE_KEYS.ANSWERS);
    let answers = data.answers;

    // Filtrar si se solicita
    if (filters.moduleId) {
      answers = answers.filter(a => a.moduleId === filters.moduleId);
    }
    if (filters.isCorrect !== undefined) {
      answers = answers.filter(a => a.isCorrect === filters.isCorrect);
    }
    if (filters.startDate) {
      answers = answers.filter(a => new Date(a.timestamp) >= new Date(filters.startDate));
    }

    return {
      answers,
      stats: data.stats
    };
  }

  /**
   * Obtiene respuestas incorrectas para repaso
   */
  getIncorrectAnswers(moduleId = null) {
    return this.getAllAnswers({ isCorrect: false }).answers
      .filter(a => !moduleId || a.moduleId === moduleId);
  }

  /**
   * Obtiene historial de una pregunta específica
   */
  getQuestionHistory(questionId) {
    const data = this._get(STORAGE_KEYS.ANSWERS);
    return data.answers.filter(a => a.questionId === questionId);
  }

  // ==================== QUIZ ====================

  addQuizHistory(quizResult) {
    const history = this._get(STORAGE_KEYS.QUIZ_HISTORY);
    const record = {
      id: `quiz_${Date.now()}`,
      ...quizResult,
      date: new Date().toISOString(),
      answers: quizResult.answers || []
    };

    history.unshift(record);

    // Mantener solo los últimos 100 quizzes
    if (history.length > 100) {
      history.splice(100);
    }

    this._set(STORAGE_KEYS.QUIZ_HISTORY, history);

    // Actualizar progreso de módulos
    if (quizResult.modules) {
      // Trigger full recalculation to ensure stats are correct
      this.recalculateProgress();
    }

    return record;
  }

  getQuizHistory(limit = 50) {
    const history = this._get(STORAGE_KEYS.QUIZ_HISTORY);
    return history.slice(0, limit);
  }

  // ==================== FLASHCARDS ====================

  getFlashcardProgress(cardId) {
    const flashcards = this._get(STORAGE_KEYS.FLASHCARDS);
    return flashcards[cardId] || {
      box: 1,
      nextReview: Date.now(),
      timesReviewed: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastReviewed: null
    };
  }

  updateFlashcardProgress(cardId, updateData) {
    const flashcards = this._get(STORAGE_KEYS.FLASHCARDS);
    const current = this.getFlashcardProgress(cardId);

    flashcards[cardId] = {
      ...current,
      ...updateData,
      lastReviewed: new Date().toISOString()
    };

    this._set(STORAGE_KEYS.FLASHCARDS, flashcards);

    // Actualizar estadísticas globales
    const progress = this.getProgress();
    progress.stats.totalFlashcardsReviewed = Object.keys(flashcards).length;
    this._set(STORAGE_KEYS.PROGRESS, progress);

    return flashcards[cardId];
  }

  recordFlashcardReview(cardId, quality) {
    // quality: 1-5 (1=fallo total, 5=perfecto)
    const current = this.getFlashcardProgress(cardId);

    let newBox = current.box || 1;
    let daysUntilNext;

    if (quality < 3) {
      // Fallo - resetear a box 1
      newBox = 1;
      daysUntilNext = 1;
      current.timesIncorrect = (current.timesIncorrect || 0) + 1;
    } else {
      // Éxito - avanzar de nivel
      newBox = Math.min(newBox + 1, 5);
      const daysMap = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
      daysUntilNext = daysMap[newBox];
      current.timesCorrect = (current.timesCorrect || 0) + 1;
    }

    current.timesReviewed = (current.timesReviewed || 0) + 1;

    return this.updateFlashcardProgress(cardId, {
      box: newBox,
      nextReview: Date.now() + (daysUntilNext * 24 * 60 * 60 * 1000)
    });
  }

  getDueFlashcards(allFlashcards) {
    const now = Date.now();
    const flashcardProgress = this._get(STORAGE_KEYS.FLASHCARDS);

    return allFlashcards.filter(card => {
      const progress = flashcardProgress[card.id];
      const nextReview = progress ? progress.nextReview : 0;
      return nextReview <= now;
    });
  }

  getFlashcardStats() {
    const flashcards = this._get(STORAGE_KEYS.FLASHCARDS);
    const cardIds = Object.keys(flashcards);

    return {
      total: cardIds.length,
      box1: cardIds.filter(id => flashcards[id].box === 1).length,
      box2: cardIds.filter(id => flashcards[id].box === 2).length,
      box3: cardIds.filter(id => flashcards[id].box === 3).length,
      box4: cardIds.filter(id => flashcards[id].box === 4).length,
      box5: cardIds.filter(id => flashcards[id].box === 5).length,
      due: cardIds.filter(id => flashcards[id].nextReview <= Date.now()).length
    };
  }

  // ==================== PLAN DE ESTUDIO ====================

  getPlanState() {
    return this._get(STORAGE_KEYS.PLAN_STATE);
  }

  updatePlanState(key, value) {
    const state = this.getPlanState();
    state[key] = value;
    state.lastModified = new Date().toISOString();
    this._set(STORAGE_KEYS.PLAN_STATE, state);
  }

  togglePlanTask(taskId, completed) {
    const state = this.getPlanState();
    state.tasksCompleted[taskId] = completed;
    state.lastModified = new Date().toISOString();
    this._set(STORAGE_KEYS.PLAN_STATE, state);
  }

  savePlanNote(taskId, note) {
    const state = this.getPlanState();
    state.tasksNotes[taskId] = note;
    state.lastModified = new Date().toISOString();
    this._set(STORAGE_KEYS.PLAN_STATE, state);
  }

  togglePlanSection(sectionId, expanded) {
    const state = this.getPlanState();
    state.expandedSections[sectionId] = expanded;
    this._set(STORAGE_KEYS.PLAN_STATE, state);
  }

  // ==================== NAVEGACIÓN ====================

  saveScrollPosition(page, position) {
    const nav = this._get(STORAGE_KEYS.NAVIGATION);
    nav.scrollPositions[page] = position;
    nav.lastPage = page;
    nav.lastVisit = new Date().toISOString();
    this._set(STORAGE_KEYS.NAVIGATION, nav);
  }

  getScrollPosition(page) {
    const nav = this._get(STORAGE_KEYS.NAVIGATION);
    return nav.scrollPositions[page] || 0;
  }

  getLastPage() {
    const nav = this._get(STORAGE_KEYS.NAVIGATION);
    return nav.lastPage || '/';
  }

  recordPageVisit(page) {
    const nav = this._get(STORAGE_KEYS.NAVIGATION);
    if (!nav.pageVisits[page]) {
      nav.pageVisits[page] = { count: 0, firstVisit: null, lastVisit: null };
    }
    nav.pageVisits[page].count++;
    nav.pageVisits[page].lastVisit = new Date().toISOString();
    if (!nav.pageVisits[page].firstVisit) {
      nav.pageVisits[page].firstVisit = new Date().toISOString();
    }
    nav.lastPage = page;
    nav.lastVisit = new Date().toISOString();
    this._set(STORAGE_KEYS.NAVIGATION, nav);
  }

  getPageVisitStats() {
    const nav = this._get(STORAGE_KEYS.NAVIGATION);
    return nav.pageVisits || {};
  }

  // ==================== SESIÓN ACTUAL ====================

  saveCurrentSession(data) {
    this._updateCurrentSession(data);
  }

  getCurrentSession() {
    return this._get(STORAGE_KEYS.CURRENT_SESSION);
  }

  clearCurrentSession() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify({
      currentPage: '/',
      quizInProgress: null,
      flashcardInProgress: null
    }));
  }

  // ==================== SETTINGS ====================

  getSettings() {
    return this._get(STORAGE_KEYS.SETTINGS);
  }

  updateSettings(settings) {
    const current = this.getSettings();
    this._set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  }

  // ==================== EXPORT/IMPORT ====================

  exportAllData() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      progress: this.getProgress(),
      quizHistory: this._get(STORAGE_KEYS.QUIZ_HISTORY),
      flashcards: this._get(STORAGE_KEYS.FLASHCARDS),
      planState: this.getPlanState(),
      navigation: this._get(STORAGE_KEYS.NAVIGATION),
      answers: this._get(STORAGE_KEYS.ANSWERS),
      settings: this.getSettings()
    };
  }

  importAllData(data) {
    if (data.progress) this._set(STORAGE_KEYS.PROGRESS, data.progress);
    if (data.quizHistory) this._set(STORAGE_KEYS.QUIZ_HISTORY, data.quizHistory);
    if (data.flashcards) this._set(STORAGE_KEYS.FLASHCARDS, data.flashcards);
    if (data.planState) this._set(STORAGE_KEYS.PLAN_STATE, data.planState);
    if (data.navigation) this._set(STORAGE_KEYS.NAVIGATION, data.navigation);
    if (data.answers) this._set(STORAGE_KEYS.ANSWERS, data.answers);
    if (data.settings) this._set(STORAGE_KEYS.SETTINGS, data.settings);
  }

  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    initStorage();
  }

  // ==================== UTILIDADES ====================

  _get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
      return false;
    }
  }

  _updateCurrentSession(data) {
    const session = this.getCurrentSession();
    this._set(STORAGE_KEYS.CURRENT_SESSION, { ...session, ...data });
  }
}

// Instancia singleton
export const stateManager = new StateManager();

export const storage = {
  get(key) {
    return stateManager._get(key);
  },
  set(key, value) {
    return stateManager._set(key, value);
  },
  getProgress() {
    return stateManager.getProgress();
  },
  updateModuleProgress(moduleId, data) {
    return stateManager.updateModuleProgress(moduleId, data);
  },
  addQuizHistory(result) {
    return stateManager.addQuizHistory(result);
  },
  getQuizHistory(limit) {
    return stateManager.getQuizHistory(limit);
  },
  getFlashcardProgress(cardId) {
    return stateManager.getFlashcardProgress(cardId);
  },
  updateFlashcardProgress(cardId, data) {
    return stateManager.updateFlashcardProgress(cardId, data);
  },
  getDueFlashcards(cards) {
    return stateManager.getDueFlashcards(cards);
  },
  getSettings() {
    return stateManager.getSettings();
  },
  updateSettings(settings) {
    return stateManager.updateSettings(settings);
  }
};
