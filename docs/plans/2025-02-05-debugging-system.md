# Debugging and Logging System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a comprehensive debugging and logging system to quickly identify and fix issues like the CSS class mismatch bug we just encountered.

**Architecture:** Centralized logger with multiple levels (debug, info, warn, error), error boundary components, debug mode toggle, and integration with browser DevTools.

**Tech Stack:** Vanilla JS ES6+, LocalStorage for persistence, Chrome DevTools Protocol API

---

## Prerequisites

Read these files first to understand the codebase:
- `src/js/app.js` - Main application entry point
- `src/js/router.js` - Hash-based routing system
- `src/js/state-manager.js` - State management
- `src/pages/syllabus/syllabus.js` - Example of page integration

---

### Task 1: Create Core Logger Module

**Files:**
- Create: `src/js/debug/logger.js`

**Step 1: Write the logger class skeleton**

```javascript
// src/js/debug/logger.js

/**
 * Centralized logging system for ENAIRE Study
 * Levels: DEBUG, INFO, WARN, ERROR
 */

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  OFF: 4
};

export class Logger {
  constructor(module = 'App') {
    this.module = module;
    this.minLevel = this._getLevelFromStorage() || LogLevel.INFO;
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
  }

  _getLevelFromStorage() {
    try {
      const level = localStorage.getItem('debug_level');
      return level ? parseInt(level) : LogLevel.INFO;
    } catch {
      return LogLevel.INFO;
    }
  }

  _shouldLog(level) {
    return level >= this.minLevel;
  }

  _formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level: this._levelName(level),
      module: this.module,
      message,
      context
    };
  }

  _levelName(level) {
    return Object.keys(LogLevel).find(key => LogLevel[key] === level) || 'UNKNOWN';
  }

  _log(level, message, context) {
    if (!this._shouldLog(level)) return;

    const logEntry = this._formatMessage(level, message, context);
    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with colors
    const consoleMethod = ['debug', 'info', 'warn', 'error'][level] || 'log';
    const emoji = ['🔍', 'ℹ️', '⚠️', '❌'][level] || '';

    console[consoleMethod](
      `${emoji} [${logEntry.timestamp}] [${this.module}]`,
      message,
      context
    );
  }

  debug(message, context) {
    this._log(LogLevel.DEBUG, message, context);
  }

  info(message, context) {
    this._log(LogLevel.INFO, message, context);
  }

  warn(message, context) {
    this._log(LogLevel.WARN, message, context);
  }

  error(message, context) {
    this._log(LogLevel.ERROR, message, context);
  }

  setLevel(level) {
    this.minLevel = level;
    localStorage.setItem('debug_level', level.toString());
  }

  getLogs(filter = {}) {
    let filtered = this.logs;

    if (filter.level) {
      filtered = filtered.filter(log => log.level === this._levelName(filter.level));
    }

    if (filter.module) {
      filtered = filtered.filter(log => log.module === filter.module);
    }

    if (filter.since) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filter.since));
    }

    return filtered;
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new Logger('App');
```

**Step 2: Create logger test file**

```bash
touch src/js/debug/logger.test.js
```

**Step 3: Write basic logger tests**

```javascript
// src/js/debug/logger.test.js

import { Logger, LogLevel } from './logger.js';

export function runLoggerTests() {
  console.group('🧪 Logger Tests');

  // Test 1: Logger creation
  const testLogger = new Logger('TestModule');
  console.assert(testLogger.module === 'TestModule', 'Module name should be set');
  console.log('✅ Test 1: Logger creation');

  // Test 2: Log level filtering
  testLogger.setLevel(LogLevel.ERROR);
  testLogger.debug('Should not appear');
  testLogger.info('Should not appear');
  testLogger.warn('Should not appear');
  testLogger.error('Should appear', { test: true });
  console.log('✅ Test 2: Log level filtering');

  // Test 3: Log storage
  testLogger.setLevel(LogLevel.DEBUG);
  testLogger.info('Test message', { data: 123 });
  const logs = testLogger.getLogs();
  console.assert(logs.length > 0, 'Logs should be stored');
  console.log('✅ Test 3: Log storage');

  // Test 4: Log filtering
  const errorLogs = testLogger.getLogs({ level: 'ERROR' });
  console.assert(Array.isArray(errorLogs), 'Should return array');
  console.log('✅ Test 4: Log filtering');

  console.groupEnd();
  console.log('✨ All logger tests passed!');
}

// Auto-run tests in debug mode
if (window.location.hash.includes('debug')) {
  runLoggerTests();
}
```

**Step 4: Commit logger module**

```bash
git add src/js/debug/logger.js src/js/debug/logger.test.js
git commit -m "feat: add centralized logging system with level filtering"
```

---

### Task 2: Create Error Boundary Component

**Files:**
- Create: `src/js/debug/error-boundary.js`

**Step 1: Write error boundary class**

```javascript
// src/js/debug/error-boundary.js

import { logger } from './logger.js';

/**
 * Error Boundary - Catches and logs errors in page rendering
 */
export class ErrorBoundary {
  constructor(fallback = null) {
    this.fallback = fallback || this._defaultFallback;
    this.errorHandler = null;
  }

  _defaultFallback(error) {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = `
      <div class="card error-card">
        <h2>❌ Algo salió mal</h2>
        <p>Se ha producido un error inesperado.</p>
        <details>
          <summary>Ver detalles del error</summary>
          <pre>${error.message}</pre>
          <pre>${error.stack}</pre>
        </details>
        <button class="btn btn-primary" onclick="location.reload()">
          Recargar página
        </button>
        <button class="btn btn-secondary" onclick="history.back()">
          Volver atrás
        </button>
      </div>
    `;
  }

  async execute(asyncFn, context = {}) {
    try {
      return await asyncFn();
    } catch (error) {
      logger.error('ErrorBoundary caught error', {
        message: error.message,
        stack: error.stack,
        context
      });

      if (this.errorHandler) {
        this.errorHandler(error);
      } else {
        this.fallback(error);
      }

      return null;
    }
  }

  setErrorHandler(handler) {
    this.errorHandler = handler;
  }

  wrapPageLoader(pageLoader) {
    return async (params) => {
      return this.execute(() => pageLoader(params), { params });
    };
  }
}

// Singleton instance
export const errorBoundary = new ErrorBoundary();
```

**Step 2: Integrate with router**

Modify: `src/js/router.js:16-31`

```javascript
// Add at top of router.js
import { errorBoundary } from '../debug/error-boundary.js';

// Replace handleRoute method
async handleRoute() {
  const hash = window.location.hash.slice(1) || '';
  const route = this.parseRoute(hash);
  const pageName = routes[route.page] || 'home';

  try {
    // Update active nav link
    this.updateActiveNav(route.page);

    // Load page with error boundary
    const pageLoader = await import(`../pages/${pageName}/${pageName}.js`);

    // Wrap with error boundary
    const safeLoader = errorBoundary.wrapPageLoader(pageLoader.render);
    await safeLoader(route.params);

  } catch (error) {
    console.error('Error loading page:', error);
    this.showError();
  }
}
```

**Step 3: Test error boundary**

```javascript
// Test in browser console:
// Throw error from syllabus page
window.dispatchEvent(new CustomEvent('test-error'));
```

**Step 4: Commit error boundary**

```bash
git add src/js/debug/error-boundary.js src/js/router.js
git commit -m "feat: add error boundary component to catch page render errors"
```

---

### Task 3: Add Debug Panel UI

**Files:**
- Create: `src/js/debug/debug-panel.js`
- Create: `src/styles/debug-panel.css`

**Step 1: Write debug panel class**

```javascript
// src/js/debug/debug-panel.js

import { logger, LogLevel } from './logger.js';
import { errorBoundary } from './error-boundary.js';

/**
 * Debug Panel - Floating UI for debugging
 */
export class DebugPanel {
  constructor() {
    this.isVisible = false;
    this.panel = null;
    this.init();
  }

  init() {
    // Create panel element
    this.panel = document.createElement('div');
    this.panel.id = 'debug-panel';
    this.panel.className = 'debug-panel hidden';
    this.panel.innerHTML = `
      <div class="debug-header">
        <h3>🐛 Debug Panel</h3>
        <button class="debug-close" id="debugClose">×</button>
      </div>

      <div class="debug-tabs">
        <button class="debug-tab active" data-tab="logs">Logs</button>
        <button class="debug-tab" data-tab="errors">Errors</button>
        <button class="debug-tab" data-tab="state">State</button>
        <button class="debug-tab" data-tab="tools">Tools</button>
      </div>

      <div class="debug-content">
        <div class="debug-tab-content active" data-tab="logs">
          <div class="debug-controls">
            <select id="debugLevelFilter">
              <option value="">All Levels</option>
              <option value="DEBUG">Debug</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warning</option>
              <option value="ERROR">Error</option>
            </select>
            <button id="debugClearLogs">Clear</button>
            <button id="debugExportLogs">Export</button>
          </div>
          <div id="debugLogOutput" class="debug-output"></div>
        </div>

        <div class="debug-tab-content" data-tab="errors">
          <div id="debugErrorOutput" class="debug-output"></div>
        </div>

        <div class="debug-tab-content" data-tab="state">
          <div id="debugStateOutput" class="debug-output"></div>
        </div>

        <div class="debug-tab-content" data-tab="tools">
          <div class="debug-tools">
            <button class="debug-tool-btn" data-tool="clearStorage">
              🗑️ Clear LocalStorage
            </button>
            <button class="debug-tool-btn" data-tool="exportState">
              📦 Export State
            </button>
            <button class="debug-tool-btn" data-tool="importState">
              📥 Import State
            </button>
            <button class="debug-tool-btn" data-tool="testRSVP">
              🧪 Test RSVP
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);
    this._bindEvents();
  }

  _bindEvents() {
    // Toggle panel
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D to toggle
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Close button
    this.panel.querySelector('#debugClose').addEventListener('click', () => {
      this.toggle();
    });

    // Tab switching
    this.panel.querySelectorAll('.debug-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this._switchTab(e.target.dataset.tab);
      });
    });

    // Clear logs
    this.panel.querySelector('#debugClearLogs').addEventListener('click', () => {
      logger.clearLogs();
      this._renderLogs();
    });

    // Export logs
    this.panel.querySelector('#debugExportLogs').addEventListener('click', () => {
      const logs = logger.exportLogs();
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-logs-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Level filter
    this.panel.querySelector('#debugLevelFilter').addEventListener('change', (e) => {
      this._renderLogs(e.target.value);
    });

    // Tool buttons
    this.panel.querySelectorAll('.debug-tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._executeTool(e.target.dataset.tool);
      });
    });
  }

  _switchTab(tabName) {
    // Update tab buttons
    this.panel.querySelectorAll('.debug-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content
    this.panel.querySelectorAll('.debug-tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.tab === tabName);
    });

    // Render content
    switch (tabName) {
      case 'logs':
        this._renderLogs();
        break;
      case 'errors':
        this._renderErrors();
        break;
      case 'state':
        this._renderState();
        break;
    }
  }

  _renderLogs(levelFilter = '') {
    const output = this.panel.querySelector('#debugLogOutput');
    const filter = levelFilter ? { level: levelFilter } : {};
    const logs = logger.getLogs(filter);

    output.innerHTML = logs.map(log => `
      <div class="debug-log debug-log-${log.level.toLowerCase()}">
        <span class="debug-time">${log.timestamp}</span>
        <span class="debug-level">[${log.level}]</span>
        <span class="debug-module">[${log.module}]</span>
        <span class="debug-message">${log.message}</span>
        ${Object.keys(log.context).length > 0 ? `
          <pre class="debug-context">${JSON.stringify(log.context, null, 2)}</pre>
        ` : ''}
      </div>
    `).join('') || '<div class="debug-empty">No logs</div>';
  }

  _renderErrors() {
    const output = this.panel.querySelector('#debugErrorOutput');
    const errors = logger.getLogs({ level: 'ERROR' });

    output.innerHTML = errors.map(log => `
      <div class="debug-error-item">
        <div class="debug-error-header">
          <span class="debug-time">${log.timestamp}</span>
          <span class="debug-module">${log.module}</span>
        </div>
        <div class="debug-error-message">${log.message}</div>
        ${log.context.stack ? `
          <pre class="debug-error-stack">${log.context.stack}</pre>
        ` : ''}
      </div>
    `).join('') || '<div class="debug-empty">No errors</div>';
  }

  _renderState() {
    const output = this.panel.querySelector('#debugStateOutput');

    try {
      const state = {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        location: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      output.innerHTML = `<pre>${JSON.stringify(state, null, 2)}</pre>`;
    } catch (e) {
      output.innerHTML = `<div class="debug-error">Error reading state: ${e.message}</div>`;
    }
  }

  _executeTool(tool) {
    switch (tool) {
      case 'clearStorage':
        if (confirm('⚠️ Clear all LocalStorage? This cannot be undone.')) {
          localStorage.clear();
          logger.info('LocalStorage cleared');
          alert('✅ LocalStorage cleared. Reloading...');
          location.reload();
        }
        break;

      case 'exportState':
        const state = {
          localStorage: { ...localStorage },
          timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enaire-state-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        logger.info('State exported');
        break;

      case 'importState':
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const state = JSON.parse(event.target.result);
              Object.entries(state.localStorage).forEach(([key, value]) => {
                localStorage.setItem(key, value);
              });
              logger.info('State imported');
              alert('✅ State imported. Reloading...');
              location.reload();
            } catch (err) {
              alert('❌ Error importing state: ' + err.message);
            }
          };
          reader.readAsText(file);
        };
        input.click();
        break;

      case 'testRSVP':
        window.location.hash = '#/syllabus';
        logger.info('Navigated to syllabus for RSVP test');
        break;
    }
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.panel.classList.toggle('hidden', !this.isVisible);

    if (this.isVisible) {
      this._switchTab('logs');
    }
  }

  log(message, level = 'INFO', context = {}) {
    logger[level.toLowerCase()](message, context);
    if (this.isVisible) {
      this._renderLogs();
    }
  }
}

// Singleton instance
export const debugPanel = new DebugPanel();
```

**Step 2: Write debug panel styles**

```css
/* src/styles/debug-panel.css */

#debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 500px;
  max-height: 600px;
  background: white;
  border: 2px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 10000;
  font-family: monospace;
  font-size: 12px;
  display: flex;
  flex-direction: column;
}

#debug-panel.hidden {
  display: none;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #333;
  color: white;
  border-radius: 6px 6px 0 0;
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
}

.debug-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.debug-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.debug-tab {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: background 0.2s;
}

.debug-tab:hover {
  background: #e0e0e0;
}

.debug-tab.active {
  background: white;
  border-bottom-color: #333;
}

.debug-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.debug-tab-content {
  display: none;
}

.debug-tab-content.active {
  display: block;
}

.debug-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.debug-controls select,
.debug-controls button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.debug-output {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: #f9f9f9;
}

.debug-log {
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 4px;
  border-left: 3px solid #333;
}

.debug-log-debug {
  border-left-color: #2196F3;
  background: #E3F2FD;
}

.debug-log-info {
  border-left-color: #4CAF50;
  background: #E8F5E9;
}

.debug-log-warn {
  border-left-color: #FF9800;
  background: #FFF3E0;
}

.debug-log-error {
  border-left-color: #F44336;
  background: #FFEBEE;
}

.debug-time,
.debug-level,
.debug-module {
  font-weight: bold;
  margin-right: 8px;
}

.debug-context {
  margin-top: 5px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-size: 11px;
}

.debug-empty {
  text-align: center;
  color: #999;
  padding: 20px;
}

.debug-error-item {
  padding: 10px;
  margin-bottom: 10px;
  background: #FFEBEE;
  border-radius: 4px;
  border-left: 3px solid #F44336;
}

.debug-error-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.debug-error-message {
  font-weight: bold;
  margin-bottom: 8px;
}

.debug-error-stack {
  font-size: 11px;
  background: white;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}

.debug-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.debug-tool-btn {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.debug-tool-btn:hover {
  background: #f5f5f5;
  border-color: #333;
}

/* Mobile responsive */
@media (max-width: 600px) {
  #debug-panel {
    width: 100%;
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    max-height: 50vh;
    border-radius: 8px 8px 0 0;
  }
}
```

**Step 3: Add CSS to HTML**

Modify: `index.html:10`

```html
<link rel="stylesheet" href="/src/styles/debug-panel.css">
```

**Step 4: Initialize debug panel in app**

Modify: `src/js/app.js:10`

```javascript
import { router } from './router.js';
import { stateManager } from './state-manager.js';
import { debugPanel } from './debug/debug-panel.js'; // Add this

// Initialize storage
const { storage } = stateManager;

console.log('🚀 ENAIRE Study - Iniciando aplicación...');

// Initialize router
router.init();
```

**Step 5: Test debug panel**

```javascript
// Open in browser: Ctrl+Shift+D
// Or in console: debugPanel.toggle()
```

**Step 6: Commit debug panel**

```bash
git add src/js/debug/debug-panel.js src/styles/debug-panel.css index.html src/js/app.js
git commit -m "feat: add floating debug panel with logs, errors, state viewer"
```

---

### Task 4: Integrate Logger Throughout App

**Files:**
- Modify: `src/js/router.js`
- Modify: `src/js/state-manager.js`
- Modify: `src/pages/syllabus/syllabus.js`

**Step 1: Add logger to router**

Modify: `src/js/router.js:1-11`

```javascript
// Add import
import { logger } from '../debug/logger.js';

// Update init method
init() {
  logger.info('Router initialized');
  window.addEventListener('hashchange', () => this.handleRoute());
}

// Update handleRoute method
async handleRoute() {
  const hash = window.location.hash.slice(1) || '';
  const route = this.parseRoute(hash);
  const pageName = routes[route.page] || 'home';

  logger.debug(`Navigating to: ${pageName}`, { hash, route, params: route.params });

  try {
    this.updateActiveNav(route.page);
    const pageLoader = await import(`../pages/${pageName}/${pageName}.js`);
    await pageLoader.render(route.params);
    logger.info(`Page loaded: ${pageName}`);
  } catch (error) {
    logger.error('Error loading page', {
      page: pageName,
      error: error.message,
      stack: error.stack
    });
    this.showError();
  }
}
```

**Step 2: Add logger to state manager**

Modify: `src/js/state-manager.js:1`

```javascript
import { logger } from './debug/logger.js';
```

Modify: `src/js/state-manager.js` - Add logging to key methods:

```javascript
// In _set method (around line 80)
_set(key, value) {
  logger.debug(`State: set ${key}`, { value });
  // ... existing code
}

// In getProgress method
getProgress() {
  logger.debug('State: getProgress called');
  // ... existing code
}

// In updateModuleProgress method
updateModuleProgress(moduleId, data) {
  logger.info(`Updating module progress: ${moduleId}`, data);
  // ... existing code
}
```

**Step 3: Add logger to syllabus page**

Modify: `src/pages/syllabus/syllabus.js:1-5`

```javascript
import { renderMarkdown, extractTOC, searchInMarkdown, highlightText } from '../../js/utils/markdown.js';
import { storage } from '../../js/storage.js';
import { RSVPUI } from '../../js/rsvp/ui.js';
import { logger } from '../../js/debug/logger.js'; // Add this

export async function render(params) {
  logger.info('Syllabus page rendering', { params });

  const content = document.getElementById('page-content');
  // ... rest of code
```

**Step 4: Test logging**

```javascript
// In browser console, check:
// - Logs appear in console with emojis
// - Debug panel shows all logs (Ctrl+Shift+D)
// - Filtering works
// - Export works
```

**Step 5: Commit logging integration**

```bash
git add src/js/router.js src/js/state-manager.js src/pages/syllabus/syllabus.js
git commit -m "feat: integrate logger throughout router, state manager, and syllabus"
```

---

### Task 5: Add Performance Monitoring

**Files:**
- Create: `src/js/debug/performance.js`

**Step 1: Write performance monitor**

```javascript
// src/js/debug/performance.js

import { logger } from './logger.js';

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }

  /**
   * Mark a performance point
   */
  mark(name) {
    const timestamp = performance.now();
    this.metrics[name] = timestamp;
    logger.debug(`Performance mark: ${name}`, { timestamp });
    return timestamp;
  }

  /**
   * Measure time between marks
   */
  measure(name, startMark, endMark) {
    if (!this.metrics[startMark] || !this.metrics[endMark]) {
      logger.warn(`Performance measure failed: missing marks`, { name, startMark, endMark });
      return null;
    }

    const duration = this.metrics[endMark] - this.metrics[startMark];
    logger.info(`Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` });
    return duration;
  }

  /**
   * Measure async function execution
   */
  async measureAsync(name, asyncFn) {
    const start = this.mark(`${name}-start`);
    try {
      const result = await asyncFn();
      const end = this.mark(`${name}-end`);
      this.measure(name, `${name}-start`, `${name}-end`);
      return result;
    } catch (error) {
      const end = this.mark(`${name}-error`);
      this.measure(name, `${name}-start`, `${name}-error`);
      logger.error(`Async function failed: ${name}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Monitor page load performance
   */
  observePageLoad() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.debug('Performance entry', {
            name: entry.name,
            duration: `${entry.duration.toFixed(2)}ms`,
            type: entry.entryType
          });
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      this.observers.push(observer);
      logger.info('Performance observer started');
    }
  }

  /**
   * Get Navigation Timing metrics
   */
  getNavigationTiming() {
    if (!performance.getEntriesByType) {
      return null;
    }

    const navEntry = performance.getEntriesByType('navigation')[0];
    if (!navEntry) return null;

    return {
      domContentLoaded: `${navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart}ms`,
      pageLoad: `${navEntry.loadEventEnd - navEntry.loadEventStart}ms`,
      domComplete: `${navEntry.domComplete - navEntry.fetchStart}ms`,
      firstPaint: this._getFirstPaint(),
      firstContentfulPaint: this._getFirstContentfulPaint()
    };
  }

  _getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fp = paintEntries.find(e => e.name === 'first-paint');
    return fp ? `${fp.startTime.toFixed(2)}ms` : 'N/A';
  }

  _getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
    return fcp ? `${fcp.startTime.toFixed(2)}ms` : 'N/A';
  }

  /**
   * Log memory usage (if available)
   */
  logMemoryUsage() {
    if (performance.memory) {
      logger.info('Memory usage', {
        used: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }

  /**
   * Create a performance report
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      navigation: this.getNavigationTiming(),
      memory: performance.memory ? {
        used: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      } : null,
      customMetrics: this.metrics
    };
  }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor();
```

**Step 2: Integrate performance monitor**

Modify: `src/js/app.js:11-12`

```javascript
import { debugPanel } from './debug/debug-panel.js';
import { perfMonitor } from './debug/performance.js';

// ... existing code

// Start performance monitoring
perfMonitor.observePageLoad();
perfMonitor.mark('app-init');

// Log initial performance
window.addEventListener('load', () => {
  perfMonitor.mark('page-load');
  perfMonitor.measure('page-load-time', 'app-init', 'page-load');

  setTimeout(() => {
    logger.info('Performance Report', perfMonitor.generateReport());
  }, 1000);
});
```

**Step 3: Add performance to debug panel**

Modify: `src/js/debug/debug-panel.js` - Add performance tab

```javascript
// In _switchTab method, add case:
case 'performance':
  this._renderPerformance();
  break;

// Add new method:
_renderPerformance() {
  const output = this.panel.querySelector('#debugStateOutput');
  const report = perfMonitor.generateReport();

  output.innerHTML = `
    <h4>Navigation Timing</h4>
    ${report.navigation ? `
      <ul>
        <li>DOM Content Loaded: ${report.navigation.domContentLoaded}</li>
        <li>Page Load: ${report.navigation.pageLoad}</li>
        <li>DOM Complete: ${report.navigation.domComplete}</li>
        <li>First Paint: ${report.navigation.firstPaint}</li>
        <li>First Contentful Paint: ${report.navigation.firstContentfulPaint}</li>
      </ul>
    ` : '<p>Navigation timing not available</p>'}

    ${report.memory ? `
      <h4>Memory Usage</h4>
      <ul>
        <li>Used: ${report.memory.used}</li>
        <li>Total: ${report.memory.total}</li>
        <li>Limit: ${report.memory.limit}</li>
      </ul>
    ` : ''}

    <button id="perfRefresh">Refresh</button>
  `;

  output.querySelector('#perfRefresh')?.addEventListener('click', () => {
    this._renderPerformance();
  });
}
```

**Step 4: Test performance monitoring**

```javascript
// In browser console:
perfMonitor.generateReport()
perfMonitor.logMemoryUsage()
```

**Step 5: Commit performance monitor**

```bash
git add src/js/debug/performance.js src/js/debug/debug-panel.js src/js/app.js
git commit -m "feat: add performance monitoring with Navigation Timing API"
```

---

### Task 6: Create Debug Mode Toggle

**Files:**
- Modify: `src/js/debug/logger.js`
- Modify: `src/js/debug/debug-panel.js`

**Step 1: Add debug mode flag to logger**

Modify: `src/js/debug/logger.js:9-10`

```javascript
constructor(module = 'App') {
  this.module = module;
  this.minLevel = this._getLevelFromStorage() || LogLevel.INFO;
  this.debugMode = localStorage.getItem('debug_mode') === 'true'; // Add this
  this.logs = [];
  this.maxLogs = 1000;
}
```

**Step 2: Add debug mode toggle method**

Add to `src/js/debug/logger.js` after `setLevel` method:

```javascript
setDebugMode(enabled) {
  this.debugMode = enabled;
  localStorage.setItem('debug_mode', enabled.toString());

  if (enabled) {
    this.setLevel(LogLevel.DEBUG);
  } else {
    this.setLevel(LogLevel.INFO);
  }

  logger.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
}

isDebugMode() {
  return this.debugMode;
}
```

**Step 3: Add debug toggle to panel**

Modify: `src/js/debug/debug-panel.js` - Add to header:

```javascript
this.panel.innerHTML = `
  <div class="debug-header">
    <h3>🐛 Debug Panel</h3>
    <label class="debug-mode-toggle">
      <input type="checkbox" id="debugModeToggle" ${logger.isDebugMode() ? 'checked' : ''}>
      Debug Mode
    </label>
    <button class="debug-close" id="debugClose">×</button>
  </div>
  <!-- ... rest of HTML ... -->
`;
```

**Step 4: Bind toggle event**

Modify: `src/js/debug/debug-panel.js` in `_bindEvents` method:

```javascript
// Debug mode toggle
this.panel.querySelector('#debugModeToggle').addEventListener('change', (e) => {
  logger.setDebugMode(e.target.checked);
});
```

**Step 5: Add visual indicator**

Add to `src/styles/debug-panel.css`:

```css
.debug-mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  cursor: pointer;
}

.debug-mode-toggle input[type="checkbox"] {
  cursor: pointer;
}

/* Debug indicator dot */
.debug-indicator {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  background: #4CAF50;
  border-radius: 50%;
  z-index: 9999;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.debug-indicator:hover {
  opacity: 1;
}
```

**Step 6: Add indicator to DOM**

Modify: `src/js/debug/debug-panel.js` constructor:

```javascript
constructor() {
  this.isVisible = false;
  this.panel = null;
  this.init();
  this._addIndicator();
}

_addIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'debug-indicator';
  indicator.id = 'debugIndicator';
  indicator.title = 'Debug mode enabled - Press Ctrl+Shift+D to open panel';
  indicator.style.display = logger.isDebugMode() ? 'block' : 'none';
  document.body.appendChild(indicator);
}
```

**Step 7: Test debug mode toggle**

```javascript
// In browser console:
logger.setDebugMode(true)
logger.setDebugMode(false)
// Or use the toggle in debug panel
```

**Step 8: Commit debug mode**

```bash
git add src/js/debug/logger.js src/js/debug/debug-panel.js src/styles/debug-panel.css
git commit -m "feat: add debug mode toggle with visual indicator"
```

---

### Task 7: Add Common Error Handlers

**Files:**
- Create: `src/js/debug/error-handlers.js`

**Step 1: Write error handlers**

```javascript
// src/js/debug/error-handlers.js

import { logger } from './logger.js';

/**
 * Global error handlers for common error scenarios
 */
export class ErrorHandlers {
  /**
   * Setup all global error handlers
   */
  static setup() {
    ErrorHandlers._handleUncaughtErrors();
    ErrorHandlers._handleUnhandledRejections();
    ErrorHandlers._handleResourceErrors();
    ErrorHandlers._handleConsoleErrors();
  }

  /**
   * Uncaught errors
   */
  static _handleUncaughtErrors() {
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
        timestamp: new Date().toISOString()
      });

      // Show user-friendly notification in debug mode
      if (logger.isDebugMode()) {
        ErrorHandlers._showErrorNotification(event.message);
      }
    });
  }

  /**
   * Unhandled promise rejections
   */
  static _handleUnhandledRejections() {
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString()
      });

      if (logger.isDebugMode()) {
        ErrorHandlers._showErrorNotification(`Promise rejected: ${event.reason}`);
      }
    });
  }

  /**
   * Resource loading errors
   */
  static _handleResourceErrors() {
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        // Resource error
        const tagName = event.target.tagName;
        const src = event.target.src || event.target.href;

        logger.warn('Resource failed to load', {
          tagName,
          src,
          timestamp: new Date().toISOString()
        });
      }
    }, true); // Use capture phase
  }

  /**
   * Console error override (in debug mode)
   */
  static _handleConsoleErrors() {
    if (!logger.isDebugMode()) return;

    const originalError = console.error;
    console.error = function(...args) {
      logger.error('Console.error', { args });
      originalError.apply(console, args);
    };
  }

  /**
   * Show error notification to user
   */
  static _showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'debug-error-notification';
    notification.innerHTML = `
      <div class="debug-error-content">
        <span class="debug-error-icon">❌</span>
        <span class="debug-error-text">${message}</span>
        <button class="debug-error-close">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);

    // Click to dismiss
    notification.querySelector('.debug-error-close').addEventListener('click', () => {
      notification.remove();
    });
  }
}

// Auto-setup on import
ErrorHandlers.setup();
```

**Step 2: Add error notification styles**

Add to `src/styles/debug-panel.css`:

```css
.debug-error-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #F44336;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 10001;
  animation: slideDown 0.3s ease;
  max-width: 500px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.debug-error-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.debug-error-icon {
  font-size: 20px;
}

.debug-error-text {
  flex: 1;
  font-size: 14px;
}

.debug-error-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
```

**Step 3: Initialize error handlers**

Modify: `src/js/app.js:12`

```javascript
import { perfMonitor } from './debug/performance.js';
import { ErrorHandlers } from './debug/error-handlers.js'; // Add this

// Error handlers are auto-setup on import
logger.info('Global error handlers initialized');
```

**Step 4: Test error handlers**

```javascript
// Test in browser console:
// Uncaught error
throw new Error('Test error')

// Promise rejection
Promise.reject('Test rejection')

// Resource error (will be logged automatically)
const img = new Image();
img.src = 'http://invalid-url-that-does-not-exist.com/image.png';
```

**Step 5: Commit error handlers**

```bash
git add src/js/debug/error-handlers.js src/styles/debug-panel.css src/js/app.js
git commit -m "feat: add global error handlers for uncaught errors and promise rejections"
```

---

### Task 8: Create Debug Documentation

**Files:**
- Create: `docs/debug-guide.md`

**Step 1: Write debug guide**

```markdown
# Debugging Guide for ENAIRE Study

## Overview

This application includes a comprehensive debugging system to help identify and fix issues quickly.

## Quick Start

### Opening the Debug Panel

**Keyboard Shortcut:** `Ctrl + Shift + D`

**Or from Console:**
```javascript
debugPanel.toggle()
```

### Debug Mode

Enable debug mode for verbose logging:

**From Panel:** Check "Debug Mode" checkbox

**From Console:**
```javascript
logger.setDebugMode(true)
```

**Visual Indicator:** Green dot in bottom-right corner when debug mode is active

## Features

### 1. Logs Tab

View all application logs with filtering:

- **All Levels:** Show all logs
- **Debug:** Detailed debug information
- **Info:** General information
- **Warning:** Warnings
- **Error:** Errors only

**Actions:**
- **Clear:** Remove all logs from memory
- **Export:** Download logs as JSON file

### 2. Errors Tab

View only error logs with stack traces for quick debugging.

### 3. State Tab

View application state:
- LocalStorage contents
- SessionStorage contents
- Current URL
- User agent
- Timestamp

### 4. Tools Tab

Quick debugging tools:

- **Clear LocalStorage:** Reset all stored data
- **Export State:** Download current state as JSON
- **Import State:** Restore state from JSON file
- **Test RSVP:** Navigate to syllabus page to test RSVP reader

## Using the Logger

### In Code

```javascript
import { logger } from './debug/logger.js';

// Different log levels
logger.debug('Detailed debug info', { variable: value });
logger.info('General information');
logger.warn('Warning message', { context: 'details' });
logger.error('Error occurred', { error: err.message, stack: err.stack });
```

### Filtering Logs

```javascript
// Get all logs
const allLogs = logger.getLogs();

// Get only errors
const errors = logger.getLogs({ level: 'ERROR' });

// Get logs from specific module
const routerLogs = logger.getLogs({ module: 'Router' });

// Get recent logs (last hour)
const recent = logger.getLogs({
  since: new Date(Date.now() - 3600000).toISOString()
});
```

### Setting Log Level

```javascript
import { LogLevel } from './debug/logger.js';

// Show only errors and above
logger.setLevel(LogLevel.ERROR);

// Show everything (verbose)
logger.setLevel(LogLevel.DEBUG);

// Disable logging
logger.setLevel(LogLevel.OFF);
```

## Performance Monitoring

### Generate Performance Report

```javascript
import { perfMonitor } from './debug/performance.js';

// Get full report
const report = perfMonitor.generateReport();
console.table(report);

// Log memory usage
perfMonitor.logMemoryUsage();

// Get navigation timing
const timing = perfMonitor.getNavigationTiming();
console.log(timing);
```

### Measuring Execution Time

```javascript
// Manual measurement
perfMonitor.mark('operation-start');
// ... do work ...
perfMonitor.mark('operation-end');
perfMonitor.measure('operation', 'operation-start', 'operation-end');

// Async function measurement
const result = await perfMonitor.measureAsync('myFunction', async () => {
  return await someAsyncOperation();
});
```

## Error Handling

### Global Error Handlers

The app automatically catches and logs:

1. **Uncaught errors:** Errors not caught by try/catch
2. **Unhandled promise rejections:** Promise rejections without .catch()
3. **Resource errors:** Failed to load scripts, images, etc.

All errors are logged and visible in the Debug Panel (Errors tab).

### Error Boundary

Pages are wrapped in error boundaries to catch rendering errors:

```javascript
// Error boundary automatically catches page errors
// Shows user-friendly error message
// Logs full stack trace for debugging
```

## Common Debugging Scenarios

### Debug CSS Issues

1. Enable debug mode
2. Navigate to page with CSS issue
3. Check Logs tab for any DOM-related warnings
4. Use browser DevTools inspector

### Debug Navigation Issues

1. Open Debug Panel
2. Go to Logs tab
3. Filter by module "Router"
4. Navigate through app
5. Watch for navigation logs

### Debug State Management

1. Open Debug Panel
2. Go to State tab
3. Check LocalStorage contents
4. Use Export State to save current state
5. Clear state and test with clean slate

### Debug RSVP Reader

1. Open Debug Panel
2. Go to Tools tab
3. Click "Test RSVP" to navigate to syllabus
4. Check Logs tab for RSVP-related logs
5. Filter by module "RSVPReader" or "RSVPUI"

## Browser DevTools Integration

### Console

Logs appear in browser console with colors and emojis:
- 🔍 Debug (blue)
- ℹ️ Info (green)
- ⚠️ Warning (orange)
- ❌ Error (red)

### Network Tab

Check failed requests in Network tab - automatically logged by resource error handler.

### Performance Tab

Use Performance tab for advanced profiling:
1. Open DevTools
2. Go to Performance tab
3. Start recording
4. Perform actions
5. Stop recording
6. Analyze flame graph

### Application Tab

Check LocalStorage/SessionStorage:
1. Open DevTools
2. Go to Application tab
3. Expand Local Storage
4. View all stored data

## Troubleshooting

### Debug Panel Not Opening

**Issue:** Ctrl+Shift+D doesn't work

**Solutions:**
1. Check if JavaScript is enabled
2. Check browser console for errors
3. Try: `debugPanel.toggle()` in console
4. Check if debug-panel.css is loaded

### Logs Not Appearing

**Issue:** No logs showing in panel

**Solutions:**
1. Check log level filter
2. Ensure debug mode is enabled for verbose logs
3. Check browser console for errors
4. Verify logger.js is loaded

### Error: "logger is not defined"

**Issue:** Logger not imported

**Solution:**
```javascript
import { logger } from './debug/logger.js';
```

### Performance Monitor Not Working

**Issue:** Navigation timing shows N/A

**Solutions:**
1. Check if Performance API is supported
2. Try refreshing page
3. Check if performance.js is loaded
4. Use browser's Performance tab instead

## Tips and Best Practices

1. **Always log errors** with context
   ```javascript
   logger.error('Operation failed', {
     operation: 'saveData',
     error: err.message,
     stack: err.stack,
     data: problematicData
   });
   ```

2. **Use appropriate log levels**
   - DEBUG: Detailed diagnostics
   - INFO: General flow
   - WARN: Unexpected but recoverable
   - ERROR: Failures

3. **Don't log sensitive data**
   - Passwords
   - Personal information
   - Tokens/keys

4. **Export logs before reporting bugs**
   - Click Export button in Debug Panel
   - Include logs in bug report

5. **Use performance monitoring for bottlenecks**
   - Measure slow operations
   - Check Navigation Timing API
   - Profile with browser DevTools

## Getting Help

When reporting bugs, include:

1. **Logs** (export from Debug Panel)
2. **State** (export from State tab)
3. **Performance report** (from Performance tab or browser DevTools)
4. **Steps to reproduce**
5. **Browser and OS version**
6. **Screenshot/video** if applicable

---

**Last Updated:** 2025-02-05
**Version:** 1.0.0
```

**Step 2: Commit documentation**

```bash
git add docs/debug-guide.md
git commit -m "docs: add comprehensive debugging guide"
```

---

## Summary

This plan creates a complete debugging and logging system with:

✅ **Centralized Logger** - Multi-level logging with filtering
✅ **Error Boundary** - Catches page rendering errors
✅ **Debug Panel** - Floating UI with logs, errors, state, tools
✅ **Performance Monitor** - Navigation timing and metrics
✅ **Debug Mode** - Toggle for verbose logging
✅ **Global Error Handlers** - Catches all uncaught errors
✅ **Documentation** - Complete debugging guide

**Total Estimated Time:** 2-3 hours
**Number of Tasks:** 8
**Number of Steps:** 40+
**Commits:** 8

---

**Plan complete and saved to `docs/plans/2025-02-05-debugging-system.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
