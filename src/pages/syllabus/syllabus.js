import { renderMarkdown, extractTOC, searchInMarkdown, highlightText } from '../../js/utils/markdown.js';
import { storage } from '../../js/storage.js';

export async function render(params) {
  const content = document.getElementById('page-content');

  // Load modules index
  const modulesData = await loadModulesIndex();
  const moduleId = params.id || modulesData.modules[0].id;
  const currentModule = modulesData.modules.find(m => m.id === moduleId);

  if (!currentModule) {
    content.innerHTML = '<div class="card"><h2>Módulo no encontrado</h2></div>';
    return;
  }

  // Load module content
  const markdown = await loadModuleContent(currentModule.syllabusFile);
  const toc = extractTOC(markdown);
  const html = renderMarkdown(markdown);

  content.innerHTML = `
    <div class="syllabus-container">
      <!-- Sidebar -->
      <aside class="sidebar-modules">
        <div class="sidebar-header">Módulos</div>
        <ul class="sidebar-modules-list">
          ${modulesData.modules.map(module => `
            <li class="sidebar-modules-item">
              <a href="#/syllabus?id=${module.id}" class="sidebar-modules-link ${module.id === moduleId ? 'active' : ''}">
                <span class="module-link-icon">${module.icon}</span>
                <div class="module-link-info">
                  <div class="module-link-title">${module.shortName}</div>
                  <div class="module-link-subtitle">${module.questionCount} preguntas</div>
                </div>
              </a>
            </li>
          `).join('')}
        </ul>
      </aside>

      <!-- Main Content -->
      <div class="syllabus-content">
        <header class="syllabus-header">
          <h1 class="syllabus-title">${currentModule.icon} ${currentModule.name}</h1>
          <div class="syllabus-meta">
            <span>${currentModule.questionCount} preguntas</span>
            ${currentModule.mcqFile ? `<span>• <a href="#/quiz?module=${currentModule.id}" class="btn-link">Practicar Quiz</a></span>` : ''}
          </div>
        </header>

        <!-- Search -->
        <div class="syllabus-search">
          <input type="text" class="search-input" placeholder="🔍 Buscar en este módulo..." id="search-input">
        </div>

        <!-- Table of Contents -->
        ${toc.length > 0 ? `
          <nav class="toc mb-4">
            <h3>Índice</h3>
            <ul class="toc-list">
              ${toc.map(item => `
                <li class="toc-item toc-level-${item.level}">
                  <a href="#${item.id}" class="toc-link">${item.title}</a>
                </li>
              `).join('')}
            </ul>
          </nav>
        ` : ''}

        <!-- Content -->
        <article class="markdown-content">
          ${html}
        </article>
      </div>
    </div>
  `;

  // Initialize search functionality
  initSearch(markdown);

  // Save reading progress
  saveReadingProgress(moduleId);
}

async function loadModulesIndex() {
  try {
    const response = await fetch('/src/data/modules-index.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading modules index:', error);
    return { modules: [] };
  }
}

async function loadModuleContent(filename) {
  try {
    const response = await fetch(`/src/data/modules/${filename}`);
    return await response.text();
  } catch (error) {
    console.error('Error loading module content:', error);
    return '# Error cargando contenido';
  }
}

function initSearch(markdown) {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    const content = document.querySelector('.markdown-content');

    if (!query) {
      // Restore original content
      content.innerHTML = renderMarkdown(markdown);
      return;
    }

    // Perform search
    const results = searchInMarkdown(markdown, query);

    if (results.length === 0) {
      content.innerHTML = `
        <div class="text-center p-4">
          <p class="text-muted">No se encontraron resultados para "${query}"</p>
        </div>
      `;
      return;
    }

    // Display search results
    content.innerHTML = `
      <h2>Resultados de búsqueda: "${query}"</h2>
      <p class="text-muted mb-4">${results.length} resultados encontrados</p>
      <div class="search-results">
        ${results.map(result => `
          <div class="search-result card mb-2">
            <div class="search-result-line">Línea ${result.line}</div>
            <div class="search-result-text">${highlightText(result.text, query)}</div>
            ${result.context && result.context !== result.text ? `
              <div class="search-result-context mt-2">
                <details>
                  <summary class="text-muted">Ver contexto</summary>
                  <pre class="mt-1">${highlightText(result.context, query)}</pre>
                </details>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  });
}

function saveReadingProgress(moduleId) {
  // Update module progress with reading time
  const progress = storage.getProgress();
  const now = new Date().toISOString();

  if (!progress.modules[moduleId]) {
    progress.modules[moduleId] = {
      questionsSeen: 0,
      questionsCorrect: 0,
      averageScore: 0,
      flashcardsReviewed: 0,
      lastStudied: null,
      readingTime: 0
    };
  }

  // Add reading time (simple tracking)
  progress.modules[moduleId].lastStudied = now;
  progress.lastStudyDate = now.split('T')[0];

  storage.set('enaire_progress', progress);
}
