// LocalStorage wrapper for progress tracking
const STORAGE_KEYS = {
  PROGRESS: 'enaire_progress',
  QUIZ_HISTORY: 'enaire_quiz_history',
  FLASHCARDS: 'enaire_flashcards',
  SETTINGS: 'enaire_settings'
};

export function initStorage() {
  // Initialize storage with default values if empty
  if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
    const defaultProgress = {
      userId: 'default',
      lastStudyDate: null,
      modules: {},
      stats: {
        totalQuestionsSeen: 0,
        totalQuestionsCorrect: 0,
        totalFlashcardsReviewed: 0,
        studyMinutes: 0
      }
    };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(defaultProgress));
  }

  if (!localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.FLASHCARDS)) {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify({}));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    const defaultSettings = {
      theme: 'light',
      language: 'es',
      defaultQuizMode: 'practice',
      defaultQuizDifficulty: 'all'
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
}

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to storage:', error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  },

  // Progress specific methods
  getProgress() {
    return this.get(STORAGE_KEYS.PROGRESS);
  },

  updateModuleProgress(moduleId, data) {
    const progress = this.getProgress();
    if (!progress.modules[moduleId]) {
      progress.modules[moduleId] = {
        questionsSeen: 0,
        questionsCorrect: 0,
        averageScore: 0,
        flashcardsReviewed: 0,
        lastStudied: null
      };
    }

    Object.assign(progress.modules[moduleId], data, {
      lastStudied: new Date().toISOString()
    });

    progress.lastStudyDate = new Date().toISOString().split('T')[0];
    this.set(STORAGE_KEYS.PROGRESS, progress);
    return progress.modules[moduleId];
  },

  addQuizHistory(quizResult) {
    const history = this.get(STORAGE_KEYS.QUIZ_HISTORY, []);
    history.unshift({
      ...quizResult,
      date: new Date().toISOString()
    });
    // Keep only last 50 quizzes
    if (history.length > 50) history.pop();
    this.set(STORAGE_KEYS.QUIZ_HISTORY, history);
    return history;
  },

  getQuizHistory() {
    return this.get(STORAGE_KEYS.QUIZ_HISTORY, []);
  },

  // Flashcard specific methods
  getFlashcardProgress(cardId) {
    const flashcards = this.get(STORAGE_KEYS.FLASHCARDS, {});
    return flashcards[cardId] || { box: 1, nextReview: Date.now() };
  },

  updateFlashcardProgress(cardId, data) {
    const flashcards = this.get(STORAGE_KEYS.FLASHCARDS, {});
    flashcards[cardId] = {
      ...flashcards[cardId],
      ...data
    };
    this.set(STORAGE_KEYS.FLASHCARDS, flashcards);

    // Update module stats
    const progress = this.getProgress();
    const totalReviewed = Object.values(flashcards).length;
    progress.stats.totalFlashcardsReviewed = totalReviewed;
    this.set(STORAGE_KEYS.PROGRESS, progress);
  },

  getDueFlashcards(allFlashcards) {
    const now = Date.now();
    const flashcardProgress = this.get(STORAGE_KEYS.FLASHCARDS, {});

    return allFlashcards.filter(card => {
      const progress = flashcardProgress[card.id];
      const nextReview = progress ? progress.nextReview : 0;
      return nextReview <= now;
    });
  },

  // Settings
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS);
  },

  updateSettings(settings) {
    const current = this.getSettings();
    this.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  }
};
