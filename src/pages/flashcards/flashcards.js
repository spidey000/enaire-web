import { storage } from '../../js/storage.js';

let currentFlashcards = [];
let currentIndex = 0;
let isFlipped = false;
let sessionResults = [];

export async function render(params) {
  const content = document.getElementById('page-content');

  // Load all flashcards (generated from MCQs)
  currentFlashcards = await loadFlashcards();

  if (currentFlashcards.length === 0) {
    content.innerHTML = `
      <div class="card text-center">
        <h2>🎴 Flashcards</h2>
        <p class="text-muted">Cargando flashcards...</p>
      </div>
    `;
    return;
  }

  // Get due flashcards
  const dueFlashcards = storage.getDueFlashcards(currentFlashcards);
  const cardsToStudy = dueFlashcards.length > 0 ? dueFlashcards : currentFlashcards.slice(0, 20);

  currentIndex = 0;
  isFlipped = false;
  sessionResults = [];

  // Render flashcard interface
  renderFlashcardInterface(content, cardsToStudy);
}

async function loadFlashcards() {
  try {
    // Load MCQ files and convert to flashcards
    const modulesData = await loadModulesIndex();
    const allFlashcards = [];

    for (const module of modulesData.modules) {
      if (!module.mcqFile) continue;

      try {
        const response = await fetch(`/src/data/mcq/${module.mcqFile}`);
        const data = await response.json();

        const flashcards = data.mcq_set.map(q => ({
          id: q.question_id,
          moduleId: module.id,
          moduleName: module.shortName,
          front: q.question_text,
          back: `**${q.correct_answer}**. ${q.explanation}`,
          hint: q.hint,
          difficulty: q.difficulty,
          tags: q.tags
        }));

        allFlashcards.push(...flashcards);
      } catch (error) {
        console.error(`Error loading flashcards for ${module.id}:`, error);
      }
    }

    return allFlashcards;
  } catch (error) {
    console.error('Error loading flashcards:', error);
    return [];
  }
}

function renderFlashcardInterface(content, flashcards) {
  const card = flashcards[currentIndex];
  const total = flashcards.length;
  const progress = storage.getFlashcardProgress(card.id);

  content.innerHTML = `
    <div class="flashcards-container">
      <header class="page-header text-center mb-4">
        <h1>🎴 Flashcards</h1>
        <p class="text-muted">Repaso espaciado - Tarjeta ${currentIndex + 1} de ${total}</p>
      </header>

      <!-- Stats -->
      <div class="flashcard-stats">
        <div class="flashcard-stat">
          <div class="flashcard-stat-value">${total}</div>
          <div class="flashcard-stat-label">Tarjetas para repasar</div>
        </div>
        <div class="flashcard-stat">
          <div class="flashcard-stat-value">${progress.box}</div>
          <div class="flashcard-stat-label">Nivel actual</div>
        </div>
        <div class="flashcard-stat">
          <div class="flashcard-stat-value">${sessionResults.filter(r => r.known).length}/${sessionResults.length}</div>
          <div class="flashcard-stat-label">Conocidas esta sesión</div>
        </div>
      </div>

      <!-- Flashcard -->
      <div class="flashcard ${isFlipped ? 'flipped' : ''}" id="flashcard">
        ${!isFlipped ? `
          <div class="flashcard-content">
            <div class="flashcard-badge mb-2">${card.moduleName}</div>
            ${card.front}
          </div>
          ${card.hint ? `<div class="flashcard-hint">💡 ${card.hint}</div>` : ''}
        ` : `
          <div class="flashcard-content">
            ${card.back}
          </div>
        `}
      </div>

      <p class="text-center text-muted mb-4">
        ${!isFlipped ? 'Haz clic en la tarjeta para ver la respuesta' : '¿Qué tan bien la conoces?'}
      </p>

      <!-- Actions -->
      <div class="flashcard-actions">
        ${!isFlipped ? `
          <button class="btn btn-primary" id="flip-card">🔄 Ver Respuesta</button>
        ` : `
          <button class="btn btn-error" id="dont-know">❌ No lo sé</button>
          <button class="btn btn-warning" id="kinda-know">🤔 Difícil</button>
          <button class="btn btn-success" id="know-it">✅ Lo sé</button>
        `}
      </div>

      <!-- Progress Bar -->
      <div class="mt-4">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${((currentIndex + 1) / total) * 100}%"></div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const flashcard = document.getElementById('flashcard');
  flashcard.addEventListener('click', (e) => {
    if (!e.target.closest('button')) {
      flipCard(flashcards);
    }
  });

  const flipBtn = document.getElementById('flip-card');
  if (flipBtn) {
    flipBtn.addEventListener('click', () => flipCard(flashcards));
  }

  const dontKnowBtn = document.getElementById('dont-know');
  if (dontKnowBtn) {
    dontKnowBtn.addEventListener('click', () => rateCard(1, flashcards));
  }

  const kindaKnowBtn = document.getElementById('kinda-know');
  if (kindaKnowBtn) {
    kindaKnowBtn.addEventListener('click', () => rateCard(3, flashcards));
  }

  const knowItBtn = document.getElementById('know-it');
  if (knowItBtn) {
    knowItBtn.addEventListener('click', () => rateCard(5, flashcards));
  }
}

function flipCard(flashcards) {
  isFlipped = !isFlipped;
  const content = document.getElementById('page-content');
  renderFlashcardInterface(content, flashcards);
}

function rateCard(quality, flashcards) {
  const card = flashcards[currentIndex];
  const progress = storage.getFlashcardProgress(card.id);

  // Calculate next review time based on SM-2 algorithm
  let newBox = progress.box || 1;
  let daysUntilNext;

  if (quality < 3) {
    // Failed - reset to box 1
    newBox = 1;
    daysUntilNext = 1;
  } else {
    // Success - advance to next box
    newBox = Math.min(newBox + 1, 3);
    daysUntilNext = newBox === 2 ? 3 : 7;
  }

  const nextReview = Date.now() + (daysUntilNext * 24 * 60 * 60 * 1000);

  // Save progress
  storage.updateFlashcardProgress(card.id, {
    box: newBox,
    nextReview,
    lastReviewed: new Date().toISOString()
  });

  // Track session result
  sessionResults.push({
    cardId: card.id,
    quality,
    known: quality >= 3,
    previousBox: progress.box || 1,
    newBox
  });

  // Move to next card
  currentIndex++;

  if (currentIndex >= flashcards.length) {
    // Session complete
    showSessionResults(flashcards);
  } else {
    // Show next card
    isFlipped = false;
    const content = document.getElementById('page-content');
    renderFlashcardInterface(content, flashcards);
  }
}

function showSessionResults(flashcards) {
  const total = sessionResults.length;
  const known = sessionResults.filter(r => r.known).length;
  const percentage = Math.round((known / total) * 100);

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="flashcards-container text-center">
      <h1>🎉 Sesión Completada</h1>
      <div class="results-score mt-4">${percentage}%</div>
      <p class="text-muted">${known} de ${total} tarjetas conocidas</p>

      <div class="card mt-4">
        <h3>Estadísticas de la Sesión</h3>
        <div class="grid grid-3 mt-4">
          <div>
            <div class="stat-value">${sessionResults.filter(r => r.quality === 5).length}</div>
            <div class="stat-label">Fáciles (5)</div>
          </div>
          <div>
            <div class="stat-value">${sessionResults.filter(r => r.quality === 3 || r.quality === 4).length}</div>
            <div class="stat-label">Difíciles (3-4)</div>
          </div>
          <div>
            <div class="stat-value">${sessionResults.filter(r => r.quality < 3).length}</div>
            <div class="stat-label">Fallidas (1-2)</div>
          </div>
        </div>
      </div>

      <div class="flashcard-actions mt-4">
        <a href="#/flashcards" class="btn btn-primary">🔄 Nueva Sesión</a>
        <a href="#/" class="btn btn-outline">🏠 Inicio</a>
      </div>
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
