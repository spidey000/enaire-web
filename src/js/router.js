// Simple hash-based router
const routes = {
  '': 'home',
  'syllabus': 'syllabus',
  'quiz': 'quiz',
  'flashcards': 'flashcards',
  'progress': 'progress',
  'plan': 'plan'
};

export const router = {
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  async handleRoute() {
    const hash = window.location.hash.slice(1) || '';
    const route = this.parseRoute(hash);
    const pageName = routes[route.page] || 'home';

    try {
      // Update active nav link
      this.updateActiveNav(route.page);

      // Load page
      const pageLoader = await import(`../pages/${pageName}/${pageName}.js`);
      await pageLoader.render(route.params);
    } catch (error) {
      console.error('Error loading page:', error);
      this.showError();
    }
  },

  parseRoute(hash) {
    const [page, paramString] = hash.split('?');
    const params = new URLSearchParams(paramString || '');
    return {
      page: page || '',
      params: Object.fromEntries(params.entries())
    };
  },

  updateActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#/${page}` ||
          (page === '' && link.getAttribute('href') === '#/')) {
        link.classList.add('active');
      }
    });
  },

  showError() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="card">
        <h2>❌ Página no encontrada</h2>
        <p>La página que buscas no existe.</p>
        <a href="#/" class="btn btn-primary">Volver al inicio</a>
      </div>
    `;
  },

  navigate(page, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const hash = queryString ? `#/${page}?${queryString}` : `#/${page}`;
    window.location.hash = hash;
  }
};
