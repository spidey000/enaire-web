import { stateManager } from '../../js/state-manager.js';

export async function render(params) {
  const content = document.getElementById('page-content');

  // Cargar plan y estado guardado
  const planData = await loadPlanData();
  const planState = stateManager.getPlanState();

  // Guardar última visita
  stateManager.updatePlanState('lastVisit', new Date().toISOString());

  content.innerHTML = `
    <div class="plan-page">
      <header class="page-header mb-4">
        <h1>📋 Plan de Estudio ENAIRE</h1>
        <p class="text-muted">Preparación para el examen de Controlador de Tránsito Aéreo</p>
      </header>

      <!-- Resumen General -->
      <section class="plan-summary card mb-4">
        <div class="plan-overview">
          <div class="overview-stat">
            <div class="stat-value">${calculateCompletion(planData)}%</div>
            <div class="stat-label">Completado</div>
          </div>
          <div class="overview-stat">
            <div class="stat-value">${planData.modules.filter(m => m.completed).length}/6</div>
            <div class="stat-label">Módulos</div>
          </div>
          <div class="overview-stat">
            <div class="stat-value">${countTasks(planData)}</div>
            <div class="stat-label">Tareas</div>
          </div>
          <div class="overview-stat">
            <div class="stat-value">${countCompletedTasks(planData)}</div>
            <div class="stat-label">Completadas</div>
          </div>
        </div>
      </section>

      <!-- Progreso por Fases -->
      <section class="phases-progress mb-4">
        <h2 class="mb-2">Progreso por Fase</h2>
        <div class="phases-grid">
          ${planData.phases.map(phase => renderPhaseCard(phase, planData)).join('')}
        </div>
      </section>

      <!-- Módulos -->
      <section class="modules-progress mb-4">
        <h2 class="mb-2">Progreso por Módulo</h2>
        <div class="modules-progress-list">
          ${planData.modules.map(module => renderModuleProgress(module)).join('')}
        </div>
      </section>

      <!-- Entregables -->
      <section class="deliverables mb-4">
        <h2 class="mb-2">Entregables</h2>
        <div class="card">
          <ul class="deliverables-list">
            ${planData.deliverables.map(item => `
              <li class="deliverable-item ${item.completed ? 'completed' : ''}">
                <input type="checkbox"
                       id="deliv-${item.id}"
                       ${item.completed ? 'checked' : ''}
                       onchange="window.toggleDeliverable('${item.id}', this.checked)">
                <label for="deliv-${item.id}" class="deliverable-label">
                  <span class="checkbox-indicator">${item.completed ? '✅' : '⬜'}</span>
                  <span class="deliverable-text ${item.completed ? 'line-through' : ''}">${item.text}</span>
                </label>
              </li>
            `).join('')}
          </ul>
        </div>
      </section>

      <!-- Acciones -->
      <section class="plan-actions">
        <div class="card">
          <h3>⚙️ Acciones</h3>
          <div class="action-buttons mt-2">
            <button onclick="window.exportProgress()" class="btn btn-primary">📥 Exportar Progreso</button>
            <button onclick="window.importProgress()" class="btn btn-secondary">📤 Importar Progreso</button>
            <button onclick="window.resetProgress()" class="btn btn-error">🗑️ Reiniciar Progreso</button>
          </div>
        </div>
      </section>
    </div>
  `;

  // Restaurar secciones expandidas
  restoreExpandedSections();

  // Exponer funciones globales
  exposeGlobalFunctions(planData);
}

async function loadPlanData() {
  try {
    const response = await fetch('./study-plan.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading plan:', error);
    return { phases: [], modules: [], deliverables: [] };
  }
}

// loadState and saveState are now handled by stateManager
// These functions are kept for reference but not used

function calculateCompletion(plan) {
  const totalTasks = countTasks(plan);
  const completedTasks = countCompletedTasks(plan);
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

function countTasks(plan) {
  let count = 0;
  plan.phases.forEach(phase => {
    if (phase.tasks) {
      count += phase.tasks.length;
    }
  });
  plan.deliverables.forEach(d => count++);
  return count;
}

function countCompletedTasks(plan) {
  let count = 0;
  const planState = stateManager.getPlanState();
  plan.phases.forEach(phase => {
    if (phase.tasks) {
      count += phase.tasks.filter(t => t.completed || planState.tasksCompleted[t.id]).length;
    }
  });
  plan.deliverables.forEach(d => {
    if (d.completed || planState.tasksCompleted['d-' + d.id]) count++;
  });
  return count;
}

function renderPhaseCard(phase, plan) {
  const planState = stateManager.getPlanState();
  const phaseTasks = phase.tasks || [];
  const completedTasks = phaseTasks.filter(t =>
    t.completed || planState.tasksCompleted[t.id]
  ).length;
  const percentage = phaseTasks.length > 0
    ? Math.round((completedTasks / phaseTasks.length) * 100)
    : (phase.completed ? 100 : 0);

  const isExpanded = planState.expandedSections[phase.id];

  return `
    <div class="phase-card card ${isExpanded ? 'expanded' : ''}" data-phase="${phase.id}">
      <div class="phase-header" onclick="window.toggleSection('${phase.id}')">
        <div class="phase-info">
          <span class="phase-icon">${isExpanded ? '📂' : '📁'}</span>
          <div>
            <h3 class="phase-title">${phase.name}</h3>
            <div class="progress-bar mt-1" style="max-width: 200px;">
              <div class="progress-fill ${percentage >= 100 ? 'progress-success' : ''}" style="width: ${percentage}%"></div>
            </div>
          </div>
        </div>
        <div class="phase-stats">
          <span class="badge ${percentage >= 100 ? 'badge-success' : 'badge-primary'}">${percentage}%</span>
          <span class="phase-toggle">${isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      ${isExpanded ? `
        <div class="phase-content">
          ${phase.tasks ? `
            <ul class="task-list">
              ${phase.tasks.map(task => renderTask(task)).join('')}
            </ul>
          ` : ''}
          ${phase.modules ? `
            <div class="phase-modules">
              ${phase.modules.map(m => `
                <div class="module-item ${m.completed ? 'completed' : ''}">
                  <span>${m.completed ? '✅' : '⬜'}</span>
                  <span>${m.name}</span>
                  ${m.cards ? `<span class="text-muted">(${m.cards} tarjetas)</span>` : ''}
                  ${m.questions ? `<span class="text-muted">(${m.questions} preguntas)</span>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function renderTask(task) {
  const planState = stateManager.getPlanState();
  const isChecked = task.completed || planState.tasksCompleted[task.id];
  const note = planState.tasksNotes[task.id] || '';

  return `
    <li class="task-item ${isChecked ? 'completed' : ''}">
      <div class="task-main">
        <input type="checkbox"
               id="task-${task.id}"
               ${isChecked ? 'checked' : ''}
               onchange="window.toggleTask('${task.id}', this.checked)">
        <label for="task-${task.id}" class="task-label">
          <span class="task-text ${isChecked ? 'line-through' : ''}">${task.text}</span>
        </label>
      </div>
      <div class="task-note">
        <textarea placeholder="Añadir nota..."
                  class="note-input"
                  data-task="${task.id}"
                  onchange="window.saveNote('${task.id}', this.value)">${note}</textarea>
      </div>
    </li>
  `;
}

function renderModuleProgress(module) {
  const progress = stateManager.getProgress().modules[module.id];
  const questionsSeen = progress?.questionsSeen || 0;
  const questionsCorrect = progress?.questionsCorrect || 0;
  const percentage = module.mcq > 0 ? Math.round((questionsSeen / module.mcq) * 100) : 0;

  return `
    <div class="module-progress-item card">
      <div class="module-info">
        <span class="module-status">${module.completed ? '✅' : '⏳'}</span>
        <div class="module-details">
          <div class="module-name">${module.name}</div>
          <div class="module-meta text-muted">
            ${questionsCorrect}/${questionsSeen}/${module.mcq} correctas/vistas/total
          </div>
        </div>
      </div>
      <div class="module-progress-bar">
        <div class="progress-bar">
          <div class="progress-fill ${percentage >= 80 ? 'progress-success' : percentage >= 50 ? 'progress-warning' : 'progress-error'}" style="width: ${percentage}%"></div>
        </div>
        <span class="progress-percentage">${percentage}%</span>
      </div>
      <a href="#/quiz?module=${module.id}" class="btn btn-sm btn-primary">Practicar</a>
    </div>
  `;
}

function restoreExpandedSections() {
  // Las secciones ya se renderizan con el estado correcto
}

// Funciones globales para HTML
window.toggleSection = function(sectionId) {
  stateManager.togglePlanSection(sectionId,
    !stateManager.getPlanState().expandedSections[sectionId]);
  // Re-render solo si es necesario, o usar toggle de CSS
  const card = document.querySelector(`[data-phase="${sectionId}"]`);
  if (card) {
    card.classList.toggle('expanded');
    const icon = card.querySelector('.phase-icon');
    const toggle = card.querySelector('.phase-toggle');
    if (stateManager.getPlanState().expandedSections[sectionId]) {
      icon.textContent = '📂';
      toggle.textContent = '▼';
      // Añadir contenido
      const phase = window.currentPlanData?.phases.find(p => p.id === sectionId);
      if (phase && !card.querySelector('.phase-content')) {
        const content = document.createElement('div');
        content.className = 'phase-content';
        if (phase.tasks) {
          content.innerHTML = `<ul class="task-list">${phase.tasks.map(t => renderTask(t)).join('')}</ul>`;
        }
        card.appendChild(content);
      }
    } else {
      icon.textContent = '📁';
      toggle.textContent = '▶';
      const existingContent = card.querySelector('.phase-content');
      if (existingContent) existingContent.remove();
    }
  }
};

window.toggleTask = function(taskId, checked) {
  stateManager.togglePlanTask(taskId, checked);
  const taskItem = document.querySelector(`#task-${taskId}`).closest('.task-item');
  const taskText = taskItem.querySelector('.task-text');
  if (checked) {
    taskItem.classList.add('completed');
    taskText.classList.add('line-through');
  } else {
    taskItem.classList.remove('completed');
    taskText.classList.remove('line-through');
  }
  // Actualizar contadores
  updateCounters();
};

window.saveNote = function(taskId, note) {
  stateManager.savePlanNote(taskId, note);
};

window.toggleDeliverable = function(deliverableId, checked) {
  stateManager.togglePlanTask('d-' + deliverableId, checked);
  const item = document.querySelector(`#deliv-${deliverableId}`).closest('.deliverable-item');
  const text = item.querySelector('.deliverable-text');
  const indicator = item.querySelector('.checkbox-indicator');
  if (checked) {
    item.classList.add('completed');
    text.classList.add('line-through');
    indicator.textContent = '✅';
  } else {
    item.classList.remove('completed');
    text.classList.remove('line-through');
    indicator.textContent = '⬜';
  }
  updateCounters();
};

window.exportProgress = function() {
  const data = stateManager.exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `enaire-progreso-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.importProgress = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      stateManager.importAllData(data);
      alert('✅ Progreso importado correctamente. La página se recargará.');
      location.reload();
    } catch (error) {
      alert('❌ Error al importar: ' + error.message);
    }
  };
  input.click();
};

window.resetProgress = function() {
  if (!confirm('⚠️ ¿Estás seguro de que quieres reiniciar TODO el progreso? Esta acción no se puede deshacer.')) {
    return;
  }
  if (!confirm('🚨 ¿REALMENTE quieres borrar todo? Se perderán todos tus datos guardados.')) {
    return;
  }

  stateManager.clearAllData();
  alert('🗑️ Progreso reiniciado. La página se recargará.');
  location.reload();
};

function updateCounters() {
  // Actualizar contadores visuales
  const counters = document.querySelectorAll('.overview-stat .stat-value');
  if (counters.length >= 4 && window.currentPlanData) {
    counters[0].textContent = calculateCompletion(window.currentPlanData) + '%';
    counters[3].textContent = countCompletedTasks(window.currentPlanData);
  }
}

function exposeGlobalFunctions(planData) {
  window.currentPlanData = planData;
}
