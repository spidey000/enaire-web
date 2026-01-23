import { router } from './router.js';
import { stateManager } from './state-manager.js';

// Initialize storage con el nuevo sistema completo
const { storage } = stateManager;

console.log('🚀 ENAIRE Study - Iniciando aplicación...');

// Initialize router
router.init();

// ==================== AUTO-GUARDADO ====================

// Guardar posición de scroll automáticamente
let scrollTimeout;
function saveScrollPosition() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    const currentPage = window.location.hash.slice(1) || 'home';
    const scrollPosition = window.scrollY;
    stateManager.saveScrollPosition(currentPage, scrollPosition);
  }, 500); // Guardar después de 500ms sin scroll
}

// Guardar visita de página
function recordPageVisit() {
  const currentPage = window.location.hash.slice(1) || 'home';
  stateManager.recordPageVisit(currentPage);
}

// Restaurar posición de scroll al cambiar de página
function restoreScrollPosition() {
  const currentPage = window.location.hash.slice(1) || 'home';
  const savedPosition = stateManager.getScrollPosition(currentPage);

  if (savedPosition > 0) {
    // Esperar a que el contenido se cargue
    setTimeout(() => {
      window.scrollTo(0, savedPosition);
    }, 100);
  }
}

// ==================== EVENTOS ====================

// Evento de scroll para guardar posición
window.addEventListener('scroll', saveScrollPosition, { passive: true });

// Evento antes de cerrar la pestaña
window.addEventListener('beforeunload', () => {
  // Guardar posición final
  const currentPage = window.location.hash.slice(1) || 'home';
  stateManager.saveScrollPosition(currentPage, window.scrollY);

  // Guardar timestamp de última visita
  stateManager.updateSettings({
    lastSessionEnd: new Date().toISOString()
  });
});

// ==================== ROUTER ENHANCED ====================

// Sobrescribir handleRoute para añadir funcionalidad
const originalHandleRoute = router.handleRoute.bind(router);
router.handleRoute = async function() {
  // Guardar estado anterior antes de cambiar
  const oldPage = window.location.hash.slice(1) || 'home';
  if (oldPage) {
    stateManager.saveScrollPosition(oldPage, window.scrollY);
  }

  // Cargar nueva página
  await originalHandleRoute();

  // Registrar visita
  recordPageVisit();

  // Restaurar scroll
  restoreScrollPosition();
};

// ==================== INICIALIZACIÓN ====================

// Handle initial route
window.addEventListener('load', () => {
  router.handleRoute();

  // Registrar tiempo de inicio de sesión
  stateManager.updateSettings({
    lastSessionStart: new Date().toISOString()
  });

  // Mensaje de bienvenida con info de progreso
  const progress = stateManager.getProgress();
  const stats = stateManager.getAllAnswers().stats;

  console.log('📚 Estado de la aplicación cargado:');
  console.log(`   - Preguntas vistas: ${progress.stats.totalQuestionsSeen}`);
  console.log(`   - Respuestas correctas: ${progress.stats.totalQuestionsCorrect}`);
  console.log(`   - Total respuestas guardadas: ${stats.totalAnswers}`);
  console.log(`   - Flashcards repasadas: ${progress.stats.totalFlashcardsReviewed}`);
  console.log(`   - Última sesión: ${stateManager.getSettings().lastSessionStart || 'Primera vez'}`);
});

// ==================== FUNCIONES GLOBALES ÚTILES ====================

// Exportar funciones globales para debugging y desarrollo
window.ENAIRE = {
  stateManager,
  storage,

  // Exportar todo el progreso
  exportProgress: () => {
    const data = stateManager.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enaire-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ Progreso exportado');
  },

  // Importar progreso
  importProgress: () => {
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
        alert('✅ Progreso importado. Recargando...');
        location.reload();
      } catch (error) {
        alert('❌ Error al importar: ' + error.message);
      }
    };
    input.click();
  },

  // Ver datos crudos
  getRawData: () => {
    return {
      progress: stateManager.getProgress(),
      answers: stateManager.getAllAnswers(),
      flashcards: stateManager._get('enaire_flashcards'),
      plan: stateManager.getPlanState(),
      navigation: stateManager._get('enaire_navigation')
    };
  },

  // Debug: ver todas las claves de localStorage
  debugStorage: () => {
    console.log('📦 Contenido de localStorage:');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('enaire_')) {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`${key}:`, data);
      }
    });
  },

  // Limpiar todos los datos (PELIGROSO)
  resetAll: () => {
    if (confirm('⚠️ ¿Estás seguro de que quieres BORRAR TODO el progreso?')) {
      if (confirm('🚨 Esta acción NO SE PUEDE DESHACER. ¿Continuar?')) {
        stateManager.clearAllData();
        alert('🗑️ Todos los datos han sido eliminados. Recargando...');
        location.reload();
      }
    }
  }
};

console.log('💡 Para debugging, usa: window.ENAIRE');
console.log('   - ENAIRE.exportProgress() - Exportar datos');
console.log('   - ENAIRE.importProgress() - Importar datos');
console.log('   - ENAIRE.getRawData() - Ver datos');
console.log('   - ENAIRE.debugStorage() - Ver localStorage');
console.log('   - ENAIRE.resetAll() - Borrar todo (peligroso)');
