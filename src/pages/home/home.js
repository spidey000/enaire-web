import { storage } from '../../js/storage.js';

export async function render() {
  const content = document.getElementById('page-content');

  // Load data
  const modules = await loadModules();
  const progress = storage.getProgress();

  content.innerHTML = `
    <div class="home-page">
      <header class="page-header mb-4">
        <h1>📚 ENAIRE Study</h1>
        <p class="text-muted">Preparación para el examen de Controlador de Tránsito Aéreo</p>
      </header>

      <!-- Quick Stats -->
      <section class="quick-stats grid grid-4 mb-4">
        <div class="card stat-card">
          <div class="stat-value">${progress.stats.totalQuestionsSeen}</div>
          <div class="stat-label">Preguntas Vistas</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${progress.stats.totalQuestionsCorrect}</div>
          <div class="stat-label">Correctas</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${progress.stats.totalFlashcardsReviewed}</div>
          <div class="stat-label">Flashcards Repasadas</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${Object.keys(progress.modules).length}</div>
          <div class="stat-label">Módulos Estudiados</div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions mb-4">
        <h2 class="mb-2">Acciones Rápidas</h2>
        <div class="card grid grid-3">
          <a href="#/quiz" class="action-card">
            <div class="action-icon">🧠</div>
            <div class="action-title">Practicar Quiz</div>
            <div class="action-description">Test interactivos con feedback</div>
          </a>
          <a href="#/flashcards" class="action-card">
            <div class="action-icon">🎴</div>
            <div class="action-title">Flashcards</div>
            <div class="action-description">Repaso con spaced repetition</div>
          </a>
          <a href="#/syllabus" class="action-card">
            <div class="action-icon">📖</div>
            <div class="action-title">Ver Temario</div>
            <div class="action-description">Material de estudio completo</div>
          </a>
        </div>
      </section>

      <!-- Modules Grid -->
      <section class="modules-section">
        <h2 class="mb-2">Módulos de Estudio</h2>
        <div class="modules-grid grid grid-3">
          ${modules.map(module => renderModuleCard(module, progress.modules[module.id])).join('')}
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="recent-activity mt-4">
        <h2 class="mb-2">Actividad Reciente</h2>
        ${renderRecentActivity(progress)}
      </section>
    </div>
  `;
}

async function loadModules() {
  try {
    const response = await fetch('./modules-index.json');
    const data = await response.json();
    return data.modules;
  } catch (error) {
    console.error('Error loading modules:', error);
    return [];
  }
}

function renderModuleCard(module, progress) {
  const moduleProgress = progress || { questionsSeen: 0, questionsCorrect: 0 };
  const percentage = module.questionCount > 0
    ? Math.round((moduleProgress.questionsSeen / module.questionCount) * 100)
    : 0;

  return `
    <div class="card module-card">
      <div class="module-header">
        <span class="module-icon">${module.icon}</span>
        <div class="module-info">
          <h3 class="module-title">${module.shortName}</h3>
          <div class="module-subtitle">${module.questionCount} preguntas</div>
        </div>
      </div>
      <div class="module-progress mt-2">
        <div class="progress-bar">
          <div class="progress-fill ${percentage >= 80 ? 'progress-success' : ''}" style="width: ${percentage}%"></div>
        </div>
        <div class="progress-stats mt-1">
          <span>${moduleProgress.questionsCorrect}/${moduleProgress.questionsSeen} correctas</span>
          <span>${percentage}%</span>
        </div>
      </div>
      <div class="module-actions mt-2">
        <a href="#/syllabus?id=${module.id}" class="btn btn-outline btn-sm">📖 Estudiar</a>
        ${module.mcqFile ? `<a href="#/quiz?module=${module.id}" class="btn btn-primary btn-sm">🧠 Quiz</a>` : ''}
      </div>
    </div>
  `;
}

function renderRecentActivity(progress) {
  const quizHistory = storage.getQuizHistory();
  const recentQuizzes = quizHistory.slice(0, 5);

  if (recentQuizzes.length === 0) {
    return `
      <div class="card">
        <p class="text-muted text-center">
          ¡Aún no has realizado ningún quiz!
          <a href="#/quiz" style="margin-left: 0.5rem;">Comenzar</a>
        </p>
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="activity-list">
        ${recentQuizzes.map(quiz => `
          <div class="activity-item">
            <div class="activity-info">
              <div class="activity-title">Quiz - ${quiz.modules ? quiz.modules.join(', ') : 'Mixto'}</div>
              <div class="activity-date">${new Date(quiz.date).toLocaleDateString('es-ES')}</div>
            </div>
            <div class="activity-score">
              <span class="badge ${quiz.score >= 80 ? 'badge-success' : quiz.score >= 60 ? 'badge-warning' : 'badge-error'}">
                ${quiz.score}%
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
