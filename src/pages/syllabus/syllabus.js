import { renderMarkdown, extractTOC, searchInMarkdown, highlightText } from '../../js/utils/markdown.js';
import { storage } from '../../js/storage.js';
import { modulesManager } from '../../js/modules-manager.js';
// RSVPUI import removed - will be loaded dynamically to avoid breaking page rendering
// import { RSVPUI } from '../../js/rsvp/ui.js';

export async function render(params) {
  const content = document.getElementById('page-content');

  // Load modules index
  const modules = await modulesManager.getModules();
  const moduleId = params.id || modules[0].id;
  const currentModule = modules.find(m => m.id === moduleId);

  if (!currentModule) {
    content.innerHTML = '<div class="card"><h2>Módulo no encontrado</h2></div>';
    return;
  }

  // Load module content (try annotated first, fall back to original)
  let markdown = await loadModuleContent(currentModule.syllabusFile);
  let annotatedMarkdown = await loadAnnotatedModuleContent(currentModule.syllabusFile);
  if (!annotatedMarkdown) {
    annotatedMarkdown = markdown;
  }
  const toc = extractTOC(markdown);
  const html = renderMarkdown(markdown);

  content.innerHTML = `
    <div class="syllabus-container">
      <!-- Sidebar -->
      <aside class="sidebar-modules">
        <div class="sidebar-header">Módulos</div>
        <ul class="sidebar-modules-list">
          ${modules.map(module => `
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

        <!-- RSVP Reader Banner -->
        <div id="rsvp-banner-container"></div>

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
                  <a href="#/syllabus?id=${moduleId}#${item.id}" class="toc-link">${item.title}</a>
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

  // Initialize RSVP Reader
  initRSVPReader(moduleId, annotatedMarkdown);

  // Save reading progress
  saveReadingProgress(moduleId);

  // Handle anchor scrolling
  handleAnchorScroll();
}

async function loadModuleContent(filename) {
  try {
    const response = await fetch(`/modules/${filename}`); // Fixed path to root
    return await response.text();
  } catch (error) {
    console.error('Error loading module content:', error);
    return '# Error cargando contenido';
  }
}

async function loadAnnotatedModuleContent(filename) {
  try {
    const response = await fetch(`/modules-annotated/${filename}`); // Fixed path to root
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch (error) {
    console.log('No annotated content found, using original:', error.message);
    return null;
  }
}

function handleAnchorScroll() {
  const hash = window.location.hash;
  if (hash.includes('#')) {
    const parts = hash.split('#');
    if (parts.length > 2) {
      const anchorId = parts[parts.length - 1];
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Wait for content rendering
    }
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

async function initRSVPReader(moduleId, annotatedMarkdown) {
  try {
    const container = document.getElementById('rsvp-banner-container');
    if (!container) {
      console.error('RSVP banner container not found');
      return;
    }

    // Dynamic import of RSVPUI to avoid breaking page rendering
    const { RSVPUI } = await import('../../js/rsvp/ui.js');

    // Get initial WPM from localStorage if available
    let initialWPM = 300;
    const savedRSVP = localStorage.getItem(`rsvp_progress_${moduleId}`);
    if (savedRSVP) {
      try {
        const savedState = JSON.parse(savedRSVP);
        if (savedState.wpm) {
          initialWPM = savedState.wpm;
        }
      } catch (e) {
        console.warn('Failed to parse saved RSVP state:', e);
      }
    }

    // Initialize RSVPUI with module data
    const rsvpUI = new RSVPUI(container, {
      moduleId: moduleId,
      initialWPM: initialWPM
    });

    // Load the annotated content
    rsvpUI.loadModule(moduleId, annotatedMarkdown);

    // Set initial WPM
    rsvpUI.setWPM(initialWPM);

    // Store reference for cleanup (useful for SPA navigation)
    container._rsvpUI = rsvpUI;

  } catch (error) {
    console.error('Failed to initialize RSVP reader:', error);
    // Silently fail - the page should still work without RSVP
    const container = document.getElementById('rsvp-banner-container');
    if (container) {
      container.innerHTML = '';
    }
  }
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

  // Also save RSVP progress if RSVP reader is active
  try {
    const container = document.getElementById('rsvp-banner-container');
    if (container && container._rsvpUI) {
      container._rsvpUI.savePosition();
    }
  } catch (error) {
    console.warn('Failed to save RSVP progress:', error);
  }
}
