import { filterQuestions, QuizSession, formatTime } from '../../js/utils/quiz.js';
import { storage } from '../../js/storage.js';

let quizSession = null;
let quizTimer = null;

export async function render(params) {
  const content = document.getElementById('page-content');

  // If no specific action, show setup
  if (!params.action) {
    await renderQuizSetup(content, params);
  } else if (params.action === 'start') {
    await startQuiz(content, params);
  } else if (params.action === 'results') {
    await renderResults(content, params);
  }
}

async function renderQuizSetup(content, params) {
  // Load available modules
  const modulesData = await loadModulesIndex();
  const modulesWithMCQ = modulesData.modules.filter(m => m.mcqFile);

  content.innerHTML = `
    <div class="quiz-setup">
      <header class="page-header text-center mb-4">
        <h1>🧠 Quiz Configuration</h1>
        <p class="text-muted">Configura tu test personalizado</p>
      </header>

      <!-- Module Selection -->
      <section class="quiz-setup-section card">
        <h2 class="quiz-setup-title">1. Selecciona Módulos</h2>
        <div class="module-selector">
          ${modulesWithMCQ.map(module => `
            <label class="module-checkbox">
              <input type="checkbox" name="module" value="${module.id}" ${params.module === module.id ? 'checked' : ''}>
              <span>${module.icon} ${module.shortName}</span>
            </label>
          `).join('')}
        </div>
      </section>

      <!-- Quiz Options -->
      <section class="quiz-setup-section card">
        <h2 class="quiz-setup-title">2. Configura Opciones</h2>
        <div class="quiz-options">
          <div class="option-group">
            <label class="option-label">Dificultad</label>
            <select id="difficulty" class="option-select">
              <option value="all">Todas</option>
              <option value="1">Fácil (1)</option>
              <option value="2">Media (2)</option>
              <option value="3">Difícil (3)</option>
            </select>
          </div>

          <div class="option-group">
            <label class="option-label">Número de Preguntas</label>
            <select id="count" class="option-select">
              <option value="10">10 preguntas</option>
              <option value="20" selected>20 preguntas</option>
              <option value="30">30 preguntas</option>
              <option value="all">Todas</option>
            </select>
          </div>

          <div class="option-group">
            <label class="option-label">Modo</label>
            <select id="mode" class="option-select">
              <option value="practice">Práctica (feedback inmediato)</option>
              <option value="exam">Examen (feedback al final)</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Start Button -->
      <div class="text-center">
        <button id="start-quiz" class="btn btn-primary btn-lg">🚀 Comenzar Quiz</button>
      </div>
    </div>
  `;

  // Add event listener to start button
  document.getElementById('start-quiz').addEventListener('click', () => {
    const selectedModules = Array.from(document.querySelectorAll('input[name="module"]:checked'))
      .map(cb => cb.value);

    if (selectedModules.length === 0) {
      alert('Por favor, selecciona al menos un módulo');
      return;
    }

    const difficulty = document.getElementById('difficulty').value;
    const count = document.getElementById('count').value;
    const mode = document.getElementById('mode').value;

    const params = new URLSearchParams({
      action: 'start',
      modules: selectedModules.join(','),
      difficulty,
      count,
      mode
    });

    window.location.hash = `#/quiz?${params.toString()}`;
  });
}

async function startQuiz(content, params) {
  const moduleIds = params.modules.split(',');
  const difficulty = params.difficulty;
  const count = params.count === 'all' ? null : parseInt(params.count);
  const mode = params.mode;

  // Load questions
  const questions = await loadQuestions(moduleIds);

  if (questions.length === 0) {
    content.innerHTML = `
      <div class="card text-center">
        <h2>❌ No hay preguntas disponibles</h2>
        <p>No se encontraron preguntas para los módulos seleccionados.</p>
        <a href="#/quiz" class="btn btn-primary">Volver</a>
      </div>
    `;
    return;
  }

  // Filter questions
  const filteredQuestions = filterQuestions(questions, {
    moduleIds,
    difficulty,
    count
  });

  if (filteredQuestions.length === 0) {
    content.innerHTML = `
      <div class="card text-center">
        <h2>❌ No hay preguntas que coincidan con los filtros</h2>
        <p>Intenta con diferentes opciones.</p>
        <a href="#/quiz" class="btn btn-primary">Volver</a>
      </div>
    `;
    return;
  }

  // Create quiz session
  quizSession = new QuizSession(filteredQuestions, { mode });

  // Render quiz interface
  renderQuizInterface(content);

  // Start timer
  startTimer();
}

function renderQuizInterface(content) {
  const question = quizSession.getCurrentQuestion();
  const totalQuestions = quizSession.questions.length;
  const currentNumber = quizSession.currentQuestion + 1;

  content.innerHTML = `
    <div class="quiz-interface">
      <header class="quiz-header">
        <div class="quiz-progress">
          <span class="quiz-progress-text">Pregunta ${currentNumber} de ${totalQuestions}</span>
          <div class="progress-bar" style="width: 200px;">
            <div class="progress-fill" style="width: ${(currentNumber / totalQuestions) * 100}%"></div>
          </div>
        </div>
        <div class="quiz-timer" id="quiz-timer">00:00</div>
      </header>

      <div class="question-card">
        <div class="question-text">${question.questionText}</div>

        <div class="question-options">
          ${question.options.map((option, index) => {
            const letters = ['A', 'B', 'C', 'D'];
            return `
              <div class="question-option" data-option="${option.optionId}" data-index="${index}">
                <span class="option-letter">${letters[index]}</span>
                <span class="option-text">${option.text}</span>
              </div>
            `;
          }).join('')}
        </div>

        ${question.hint ? `
          <details class="mt-3">
            <summary class="btn btn-outline btn-sm">💡 Mostrar Pista</summary>
            <div class="question-hint mt-2 p-2" style="background-color: var(--bg); border-radius: var(--radius);">
              ${question.hint}
            </div>
          </details>
        ` : ''}

        <div id="feedback-container"></div>
      </div>

      <div class="quiz-actions">
        <button id="submit-answer" class="btn btn-primary" disabled>Enviar Respuesta</button>
      </div>
    </div>
  `;

  // Add event listeners
  const options = document.querySelectorAll('.question-option');
  let selectedOption = null;

  options.forEach(option => {
    option.addEventListener('click', () => {
      // Remove previous selection
      options.forEach(opt => opt.classList.remove('selected'));

      // Select this option
      option.classList.add('selected');
      selectedOption = option.dataset.option;

      // Enable submit button
      document.getElementById('submit-answer').disabled = false;
    });
  });

  document.getElementById('submit-answer').addEventListener('click', () => {
    if (!selectedOption) return;

    const result = quizSession.submitAnswer(selectedOption);
    showFeedback(result, question);

    if (quizSession.mode === 'practice') {
      // In practice mode, change button to continue
      const submitBtn = document.getElementById('submit-answer');
      submitBtn.textContent = 'Continuar';
      submitBtn.onclick = () => nextQuestion();
    } else {
      // In exam mode, continue immediately
      nextQuestion();
    }
  });
}

function showFeedback(result, question) {
  const container = document.getElementById('feedback-container');
  const isCorrect = result.isCorrect;

  // Highlight correct/incorrect options
  const options = document.querySelectorAll('.question-option');
  options.forEach(opt => {
    const optionId = opt.dataset.option;
    if (optionId === question.correctAnswer) {
      opt.classList.add('correct');
    } else if (opt.classList.contains('selected') && !isCorrect) {
      opt.classList.add('incorrect');
    }
    opt.style.pointerEvents = 'none'; // Disable further clicks
  });

  // Show feedback message
  container.innerHTML = `
    <div class="question-feedback ${isCorrect ? 'correct' : 'incorrect'}">
      <div class="feedback-header">${isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}</div>
      ${!isCorrect || quizSession.mode === 'practice' ? `
        <div class="feedback-content">
          <p><strong>Respuesta correcta:</strong> ${question.correctAnswer}</p>
          ${question.explanation ? `<p><strong>Explicación:</strong> ${question.explanation}</p>` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function nextQuestion() {
  if (quizSession.nextQuestion()) {
    // More questions
    const content = document.getElementById('page-content');
    renderQuizInterface(content);
  } else {
    // Quiz complete
    stopTimer();
    showResults();
  }
}

function showResults() {
  const results = quizSession.getResults();

  // Save to storage
  storage.addQuizHistory(results);

  // Update module progress
  const moduleIds = [...new Set(quizSession.questions.map(q => q.moduleId))];
  moduleIds.forEach(moduleId => {
    const moduleQuestions = quizSession.questions.filter(q => q.moduleId === moduleId);
    const moduleCorrect = quizSession.answers.filter(a =>
      moduleQuestions.some(q => q.questionId === a.questionId) && a.isCorrect
    ).length;

    storage.updateModuleProgress(moduleId, {
      questionsSeen: (storage.getProgress().modules[moduleId]?.questionsSeen || 0) + moduleQuestions.length,
      questionsCorrect: (storage.getProgress().modules[moduleId]?.questionsCorrect || 0) + moduleCorrect,
      averageScore: Math.round((moduleCorrect / moduleQuestions.length) * 100)
    });
  });

  // Navigate to results page
  const params = new URLSearchParams({
    action: 'results',
    score: results.percentage,
    correct: results.correct,
    total: results.total,
    time: results.timeSpent
  });

  window.location.hash = `#/quiz?${params.toString()}`;
}

async function renderResults(content, params) {
  const score = parseInt(params.score);
  const correct = parseInt(params.correct);
  const total = parseInt(params.total);
  const time = parseInt(params.time);
  const quizHistory = storage.getQuizHistory();
  const lastQuiz = quizHistory[0];

  content.innerHTML = `
    <div class="quiz-results">
      <header class="results-header">
        <h1>📊 Resultados del Quiz</h1>
        <div class="results-score">${score}%</div>
        <p class="text-muted">${correct} de ${total} respuestas correctas</p>
      </header>

      <div class="results-stats">
        <div class="results-stat">
          <div class="results-stat-value">${correct}</div>
          <div class="results-stat-label">Correctas</div>
        </div>
        <div class="results-stat">
          <div class="results-stat-value">${total - correct}</div>
          <div class="results-stat-label">Incorrectas</div>
        </div>
        <div class="results-stat">
          <div class="results-stat-value">${formatTime(time)}</div>
          <div class="results-stat-label">Tiempo</div>
        </div>
        <div class="results-stat">
          <div class="results-stat-value">${Math.round(correct / total * 100)}%</div>
          <div class="results-stat-label">Precisión</div>
        </div>
      </div>

      ${lastQuiz && lastQuiz.wrongAnswers && lastQuiz.wrongAnswers.length > 0 ? `
        <div class="wrong-answers">
          <h2>❌ Respuestas Incorrectas</h2>
          <p class="text-muted mb-4">Repasa estos conceptos para mejorar</p>
          ${lastQuiz.wrongAnswers.map(item => `
            <div class="wrong-answer-item">
              <div class="wrong-answer-question">${item.question.questionText}</div>
              <div class="wrong-answer-details">
                <span>Tu respuesta: <strong>${item.yourAnswer}</strong> | </span>
                <span>Correcta: <strong>${item.correctAnswer}</strong></span>
                ${item.question.explanation ? `<p class="mt-1"><strong>Explicación:</strong> ${item.question.explanation}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="quiz-actions">
        <a href="#/quiz" class="btn btn-primary">🔄 Nuevo Quiz</a>
        <a href="#/syllabus" class="btn btn-outline">📖 Estudiar Temario</a>
        <a href="#/" class="btn btn-secondary">🏠 Inicio</a>
      </div>
    </div>
  `;
}

async function loadQuestions(moduleIds) {
  const modulesData = await loadModulesIndex();
  const allQuestions = [];

  for (const moduleId of moduleIds) {
    const module = modulesData.modules.find(m => m.id === moduleId);
    if (!module || !module.mcqFile) continue;

    try {
      const response = await fetch(`./mcq/${module.mcqFile}`);
      const data = await response.json();

      const questions = data.mcq_set.map(q => ({
        questionId: q.question_id,
        moduleId: module.id,
        questionText: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
        hint: q.hint,
        explanation: q.explanation,
        difficulty: q.difficulty,
        tags: q.tags
      }));

      allQuestions.push(...questions);
    } catch (error) {
      console.error(`Error loading questions for ${module.id}:`, error);
    }
  }

  return allQuestions;
}

async function loadModulesIndex() {
  try {
    const response = await fetch('./modules-index.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading modules index:', error);
    return { modules: [] };
  }
}

function startTimer() {
  const startTime = Date.now();
  quizTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const timerElement = document.getElementById('quiz-timer');
    if (timerElement) {
      timerElement.textContent = formatTime(elapsed);
    }
  }, 1000);
}

function stopTimer() {
  if (quizTimer) {
    clearInterval(quizTimer);
    quizTimer = null;
  }
}
