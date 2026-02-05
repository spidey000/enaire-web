import { storage } from '../../js/storage.js';

export async function render() {
  const content = document.getElementById('page-content');

  // Load data
  const progress = storage.getProgress();
  const modulesData = await loadModulesIndex();
  const quizHistory = storage.getQuizHistory();

  content.innerHTML = `
    <div class="progress-page">
      <header class="page-header mb-4">
        <h1>📊 Progreso de Estudio</h1>
        <p class="text-muted">Tu evolución en la preparación del examen</p>
      </header>

      <!-- Global Stats -->
      <section class="progress-overview">
        <div class="grid grid-4">
          <div class="card stat-card">
            <div class="stat-value">${progress.stats.totalQuestionsSeen}</div>
            <div class="stat-label">Preguntas Vistas</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value">${progress.stats.totalQuestionsCorrect}</div>
            <div class="stat-label">Correctas</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value">${progress.stats.totalQuestionsSeen > 0 ? Math.round((progress.stats.totalQuestionsCorrect / progress.stats.totalQuestionsSeen) * 100) : 0}%</div>
            <div class="stat-label">Precisión Global</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value">${progress.stats.totalFlashcardsReviewed}</div>
            <div class="stat-label">Flashcards Repasadas</div>
          </div>
        </div>
      </section>

      <!-- Module Progress -->
      <section class="progress-chart">
        <h2 class="chart-title">Progreso por Módulo</h2>
        <div class="progress-bars">
          ${modulesData.modules.map(module => {
            const moduleProgress = progress.modules[module.id] || { questionsSeen: 0, questionsCorrect: 0 };
            const percentage = module.questionCount > 0
              ? Math.round((moduleProgress.questionsSeen / module.questionCount) * 100)
              : 0;
            const accuracy = moduleProgress.questionsSeen > 0
              ? Math.round((moduleProgress.questionsCorrect / moduleProgress.questionsSeen) * 100)
              : 0;

            return `
              <div class="progress-bar-item">
                <div class="progress-bar-label">
                  ${module.icon} ${module.shortName}
                  <span class="text-muted text-sm">(${moduleProgress.questionsCorrect}/${moduleProgress.questionsSeen})</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill ${accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'error'}" style="width: ${percentage}%;">
                    ${percentage}%
                  </div>
                </div>
                <div class="progress-bar-value">${accuracy}% precisión</div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Recent Quizzes -->
      <section class="recent-quizzes mt-4">
        <h2 class="chart-title">Quizzes Recientes</h2>
        ${quizHistory.length > 0 ? `
          <div class="activity-list">
            ${quizHistory.slice(0, 10).map(quiz => `
              <div class="activity-item">
                <div class="activity-info">
                  <div class="activity-title">Quiz - ${quiz.modules ? quiz.modules.join(', ') : 'Mixto'}</div>
                  <div class="activity-date">${new Date(quiz.date).toLocaleDateString('es-ES')} ${new Date(quiz.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="activity-score">
                  <span class="badge ${quiz.score >= 80 ? 'badge-success' : quiz.score >= 60 ? 'badge-warning' : 'badge-error'}">
                    ${quiz.score}%
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="card text-center">
            <p class="text-muted">Aún no has realizado ningún quiz</p>
            <a href="#/quiz" class="btn btn-primary mt-2">Comenzar Primer Quiz</a>
          </div>
        `}
      </section>
    </div>
  `;
}

async function loadModulesIndex() {
  try {
    const response = await fetch('/modules-index.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading modules index:', error);
    return { modules: [] };
  }
}
