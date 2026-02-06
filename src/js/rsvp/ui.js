/**
 * RSVPUI - User Interface Component for Spritz-style RSVP Reader
 * Displays a banner with controls for rapid serial visual presentation reading
 */

import { RSVPReader } from './reader.js';

export class RSVPUI {
  /**
   * Creates a new RSVP UI instance
   * @param {HTMLElement} container - The DOM element to render the UI into
   * @param {Object} moduleData - Module metadata and configuration
   */
  constructor(container, moduleData) {
    this.container = container;
    this.moduleData = moduleData;

    // UI State
    this.isPlaying = false;
    this.currentWPM = 300;
    this.isStarted = false;
    this.bookmarks = [];
    this.wakeLock = null; // Screen Wake Lock for mobile fullscreen

    // Bind methods to maintain context
    this._handleKeyboard = this._handleKeyboard.bind(this);
    this._togglePlay = this._togglePlay.bind(this);
    this._handleWPMChange = this._handleWPMChange.bind(this);
    this._handleNavChange = this._handleNavChange.bind(this);
    this._toggleBookmark = this._toggleBookmark.bind(this);

    // Initialize UI first (creates DOM elements)
    this._initUI();
    this._initControls();

    // Create RSVPReader after UI is initialized
    const wordContainer = document.getElementById('spritzWord');
    this.reader = new RSVPReader({
      container: wordContainer,
      wpm: moduleData.initialWPM || 300,
      onWordChange: this._onWordChange.bind(this)
    });

    this.savePosition = this.savePosition.bind(this);
    this._debouncedSave = this._debounce(this.savePosition, 1000);

    this.restorePosition();
  }

  /**
   * Simple debounce helper
   * @private
   */
  _debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Callback when word changes
   * @private
   */
  _onWordChange(word, index) {
    // Update display (position, slider, time left)
    this._updateDisplay();

    // Debounced save position
    this._debouncedSave();
  }

  /**
   * Initialize the UI banner structure
   * @private
   */
  _initUI() {
    this.container.innerHTML = `
      <div class="spritz-banner" id="spritzBanner">
        <div class="spritz-container">
          <!-- Start Screen -->
          <div class="spritz-start-screen" id="spritzStartScreen">
            <div class="spritz-title">Speed Reading Mode</div>
            <button class="spritz-start-btn" id="spritzStartBtn">
              START
            </button>
            <div class="spritz-info">
              Read through content quickly using Spritz-style presentation
            </div>
          </div>

          <!-- Main Reader UI (hidden initially) -->
          <div class="spritz-reader-ui" id="spritzReaderUI" style="display: none;">
            <!-- Spritz Display Area -->
            <div class="spritz-display-area">
              <div class="spritz-display">
                <div class="spritz-word" id="spritzWord">Ready</div>
              </div>
              <div class="spritz-progress">
                <span id="spritzPosition">0</span> / <span id="spritzTotal">0</span>
                <span id="spritzTimeLeft" class="spritz-time-left"></span>
              </div>
            </div>

            <!-- Compact Toolbar -->
            <div class="spritz-toolbar">
              <div class="spritz-nav-group">
                <button class="spritz-btn-compact" id="spritzBackBtn" title="Atrás (←)">⏪</button>
                <button class="spritz-btn-compact" id="spritzPlayBtn" title="Play/Pausa (Space)">▶️</button>
                <button class="spritz-btn-compact" id="spritzForwardBtn" title="Delante (→)">⏩</button>
              </div>

              <div class="spritz-divider"></div>

              <select class="spritz-wpm-select" id="spritzWPMSelect">
                <option value="100">100 WPM</option>
                <option value="200">200 WPM</option>
                <option value="250">250 WPM</option>
                <option value="300" selected>300 WPM</option>
                <option value="350">350 WPM</option>
                <option value="400">400 WPM</option>
                <option value="500">500 WPM</option>
                <option value="600">600 WPM</option>
                <option value="700">700 WPM</option>
                <option value="800">800 WPM</option>
                <option value="900">900 WPM</option>
                <option value="1000">1000 WPM</option>
              </select>

              <div class="spritz-divider"></div>

              <div class="spritz-action-group">
                <button class="spritz-btn-compact" id="spritzFullscreenBtn" title="Pantalla completa (F)">⛶</button>
                <button class="spritz-btn-compact" id="spritzBookmarkBtn" title="Marcador (Ctrl+B)">🔖</button>
                <button class="spritz-btn-compact" id="spritzHelpBtn" title="Ayuda (?)">❓</button>
                <button class="spritz-btn-compact" id="spritzCloseBtn" title="Cerrar (Esc)">✕</button>
              </div>
            </div>

            <!-- Navigation Slider (Full Width) -->
            <div class="spritz-nav-container">
              <input
                type="range"
                class="spritz-nav-slider"
                id="spritzNavSlider"
                min="0"
                max="100"
                step="1"
                value="0"
              >
            </div>
          </div>
        </div>

        <!-- Help Modal -->
        <div class="spritz-modal" id="spritzHelpModal" style="display: none;">
          <div class="spritz-modal-content">
            <div class="spritz-modal-header">
              <h3>Keyboard Shortcuts</h3>
              <button class="spritz-modal-close" id="spritzCloseHelp">×</button>
            </div>
            <div class="spritz-modal-body">
              <table class="spritz-shortcuts-table">
                <tr><td><kbd>Space</kbd></td><td>Play / Pause</td></tr>
                <tr><td><kbd>←</kbd></td><td>Previous section</td></tr>
                <tr><td><kbd>→</kbd></td><td>Next section</td></tr>
                <tr><td><kbd>Ctrl</kbd> + <kbd>B</kbd></td><td>Add bookmark</td></tr>
                <tr><td><kbd>Esc</kbd></td><td>Close reader</td></tr>
                <tr><td><kbd>?</kbd></td><td>Show this help</td></tr>
                <tr><td><kbd>↑</kbd></td><td>Increase speed</td></tr>
                <tr><td><kbd>↓</kbd></td><td>Decrease speed</td></tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Bookmark Dropdown -->
        <div class="spritz-dropdown" id="spritzBookmarkDropdown" style="display: none;">
          <div class="spritz-dropdown-content">
            <h4>Bookmarks</h4>
            <ul class="spritz-bookmark-list" id="spritzBookmarkList"></ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize event listeners for all UI controls
   * @private
   */
  _initControls() {
    // Start button
    const startBtn = document.getElementById('spritzStartBtn');
    startBtn.addEventListener('click', () => this._startReading());

    // Play/Pause button
    const playBtn = document.getElementById('spritzPlayBtn');
    playBtn.addEventListener('click', this._togglePlay);

    // Navigation buttons
    document.getElementById('spritzBackBtn').addEventListener('click', () => this.reader.previousWord());
    document.getElementById('spritzForwardBtn').addEventListener('click', () => this.reader.nextWord());

    // WPM dropdown
    const wpmSelect = document.getElementById('spritzWPMSelect');
    wpmSelect.addEventListener('change', this._handleWPMChange);

    // Navigation slider
    const navSlider = document.getElementById('spritzNavSlider');
    navSlider.addEventListener('input', this._handleNavChange);

    // Fullscreen button
    document.getElementById('spritzFullscreenBtn').addEventListener('click', () => this._toggleFullscreen());

    // Bookmark button
    document.getElementById('spritzBookmarkBtn').addEventListener('click', this._toggleBookmark);

    // Help button
    document.getElementById('spritzHelpBtn').addEventListener('click', () => this._showHelpModal());

    // Close button
    document.getElementById('spritzCloseBtn').addEventListener('click', () => this.close());

    // Help modal close
    document.getElementById('spritzCloseHelp').addEventListener('click', () => {
      document.getElementById('spritzHelpModal').style.display = 'none';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', this._handleKeyboard);

    // Fullscreen change listener
    document.addEventListener('fullscreenchange', () => {
      const banner = document.getElementById('spritzBanner');
      if (document.fullscreenElement === banner) {
        banner.classList.add('fullscreen');
        // Acquire wake lock to keep screen on during fullscreen reading
        this._acquireWakeLock();
      } else if (!document.fullscreenElement) {
        banner.classList.remove('fullscreen');
        // Release wake lock when exiting fullscreen
        this._releaseWakeLock();
      }
    });

    // Re-acquire wake lock if released due to visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && document.fullscreenElement) {
        this._acquireWakeLock();
      }
    });
  }

  /**
   * Start reading - switch from start screen to reader UI
   * @private
   */
  _startReading() {
    this.isStarted = true;
    document.getElementById('spritzStartScreen').style.display = 'none';
    document.getElementById('spritzReaderUI').style.display = 'block';

    // Start playback
    this._togglePlay();
  }

  /**
   * Toggle play/pause state
   * @private
   */
  _togglePlay() {
    if (this.isPlaying) {
      this.reader.pause();
      this.isPlaying = false;
      document.getElementById('spritzPlayBtn').textContent = '▶️';
    } else {
      this.reader.start();
      this.isPlaying = true;
      document.getElementById('spritzPlayBtn').textContent = '⏸️';
    }
  }

  /**
   * Toggle fullscreen mode for the reader
   * @private
   */
  _toggleFullscreen() {
    const banner = document.getElementById('spritzBanner');
    if (!document.fullscreenElement) {
      banner.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Acquire a screen wake lock to prevent the screen from turning off
   * Used during fullscreen reading on mobile devices
   * @private
   */
  async _acquireWakeLock() {
    // Check if Wake Lock API is supported
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired - screen will stay on');
        
        // Listen for wake lock release
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
      } catch (err) {
        // Wake lock request failed - usually due to low battery or system policy
        console.warn(`Wake Lock request failed: ${err.message}`);
      }
    } else {
      console.log('Wake Lock API not supported on this browser');
    }
  }

  /**
   * Release the screen wake lock
   * @private
   */
  async _releaseWakeLock() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Wake Lock released manually');
      } catch (err) {
        console.warn(`Error releasing Wake Lock: ${err.message}`);
      }
    }
  }

  /**
   * Handle WPM slider changes
   * @private
   */
  _handleWPMChange(e) {
    const wpm = parseInt(e.target.value);
    this.setWPM(wpm);
  }

  /**
   * Handle navigation slider changes
   * @private
   */
  _handleNavChange(e) {
    const position = parseInt(e.target.value);
    this.reader.seekToWord(position);
  }

  /**
   * Toggle bookmark at current position
   * @private
   */
  _toggleBookmark() {
    const currentPos = this.reader.getCurrentPosition();
    const currentWord = this.reader.getCurrentWord();
    const bookmark = {
      position: currentPos,
      word: currentWord,
      timestamp: Date.now()
    };

    // Check if bookmark already exists at this position
    const existingIndex = this.bookmarks.findIndex(b =>
      Math.abs(b.position - currentPos) < 10
    );

    if (existingIndex >= 0) {
      // Remove existing bookmark
      this.bookmarks.splice(existingIndex, 1);
    } else {
      // Add new bookmark
      this.bookmarks.push(bookmark);
    }

    this.savePosition();
    this._showBookmarkDropdown();
  }

  _updateDisplay() {
    const position = this.reader.getCurrentPosition();
    const total = this.reader.words.length;

    // Word content is handled by RSVPReader._displayCurrentWord
    // but we can handle the initial state here
    if (total === 0) {
      const wordEl = document.getElementById('spritzWord');
      if (wordEl) wordEl.textContent = 'Ready';
    }
    
    document.getElementById('spritzPosition').textContent = total > 0 ? position + 1 : 0;
    document.getElementById('spritzTotal').textContent = total;

    // Update Time Left
    const timeEl = document.getElementById('spritzTimeLeft');
    if (timeEl && total > 0) {
      const remainingWords = total - (position + 1);
      if (remainingWords > 0) {
        const secondsLeft = Math.ceil((remainingWords / this.currentWPM) * 60);
        timeEl.textContent = `(${this._formatTime(secondsLeft)})`;
      } else {
        timeEl.textContent = '';
      }
    } else if (timeEl) {
      timeEl.textContent = '';
    }

    this._updateSlider();
  }

  /**
   * Format seconds into MM:SS
   * @private
   */
  _formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    return `${minutes}:${remSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Update navigation slider to match current position
   * @private
   */
  _updateSlider() {
    const position = this.reader.getCurrentPosition();
    const total = this.reader.words.length;

    const slider = document.getElementById('spritzNavSlider');
    if (slider) {
      slider.max = total - 1;
      slider.value = position;
    }
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   * @private
   */
  _handleKeyboard(e) {
    // Ignore if modal is open or not in reader mode
    if (!this.isStarted) return;

    // Ignore if typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this._togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.reader.previousWord();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.reader.nextWord();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.setWPM(this._getNextWPM(25));
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.setWPM(this._getNextWPM(-25));
        break;
      case 'KeyB':
        if (e.ctrlKey) {
          e.preventDefault();
          this._toggleBookmark();
        }
        break;
      case 'KeyF':
        e.preventDefault();
        this._toggleFullscreen();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Slash':
        if (e.shiftKey) {
          e.preventDefault();
          this._showHelpModal();
        }
        break;
    }
  }

  /**
   * Helper to find next valid WPM from list or range
   * @private
   */
  _getNextWPM(delta) {
    const current = this.currentWPM;
    const target = Math.max(100, Math.min(1000, current + delta));
    return target;
  }

  /**
   * Show help modal with keyboard shortcuts
   * @private
   */
  _showHelpModal() {
    document.getElementById('spritzHelpModal').style.display = 'block';
  }

  /**
   * Show bookmark dropdown with list of saved bookmarks
   * @private
   */
  _showBookmarkDropdown() {
    const dropdown = document.getElementById('spritzBookmarkDropdown');
    const list = document.getElementById('spritzBookmarkList');

    // Clear existing list
    list.innerHTML = '';

    if (this.bookmarks.length === 0) {
      list.innerHTML = '<li class="spritz-bookmark-empty">No bookmarks saved</li>';
    } else {
      this.bookmarks.forEach((bookmark, index) => {
        const li = document.createElement('li');
        li.className = 'spritz-bookmark-item';

        const date = new Date(bookmark.timestamp);
        const timeStr = date.toLocaleTimeString();

        li.innerHTML = `
          <span class="spritz-bookmark-position">Pos: ${bookmark.position + 1}</span>
          <span class="spritz-bookmark-word">"${bookmark.word}"</span>
          <span class="spritz-bookmark-time">${timeStr}</span>
          <button class="spritz-bookmark-delete" data-index="${index}">×</button>
        `;

        // Click on bookmark to jump to position
        li.addEventListener('click', (e) => {
          if (!e.target.classList.contains('spritz-bookmark-delete')) {
            this.reader.seekToWord(bookmark.position);
            dropdown.style.display = 'none';
          }
        });

        // Delete bookmark
        li.querySelector('.spritz-bookmark-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          this.bookmarks.splice(index, 1);
          this.savePosition();
          this._showBookmarkDropdown();
        });

        list.appendChild(li);
      });
    }

    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }

  /**
   * Render the UI (public method for initial render)
   */
  render() {
    // UI is already rendered in constructor
    return this.container;
  }

  /**
   * Load module content for reading
   * @param {string} moduleId - Module identifier
   * @param {string} annotatedContent - Content with reading annotations
   */
  loadModule(moduleId, annotatedContent) {
    this.reader.loadContent(annotatedContent);
    this.currentModuleId = moduleId;

    // Reset UI state
    this.isPlaying = false;
    this.isStarted = false;
    document.getElementById('spritzPlayBtn').textContent = '▶️';

    // Update total word count
    const total = this.reader.words.length;
    document.getElementById('spritzTotal').textContent = total;
    document.getElementById('spritzWord').textContent = 'Ready';

    // Update slider max value to match total words
    const navSlider = document.getElementById('spritzNavSlider');
    if (navSlider) {
      navSlider.max = total - 1;
    }

    // Show start screen
    document.getElementById('spritzStartScreen').style.display = 'block';
    document.getElementById('spritzReaderUI').style.display = 'none';

    // Restore position if available
    this.restorePosition();
  }

  /**
   * Set the reading speed in words per minute
   * @param {number} wpm - Words per minute (100-1000)
   */
  setWPM(wpm) {
    this.currentWPM = Math.max(100, Math.min(1000, wpm));
    this.reader.setWPM(this.currentWPM);

    // Update dropdown and display
    const select = document.getElementById('spritzWPMSelect');
    if (select) {
      // Find nearest value if exact doesn't exist
      const options = Array.from(select.options);
      const nearest = options.reduce((prev, curr) => {
        return (Math.abs(curr.value - this.currentWPM) < Math.abs(prev.value - this.currentWPM) ? curr : prev);
      });
      select.value = nearest.value;
    }

    // Update display to reflect new time estimate
    this._updateDisplay();
  }

  /**
   * Save current reading position and bookmarks to LocalStorage
   */
  savePosition() {
    const state = {
      moduleId: this.currentModuleId,
      position: this.reader.getCurrentPosition(),
      wpm: this.currentWPM,
      bookmarks: this.bookmarks,
      timestamp: Date.now()
    };

    localStorage.setItem(`spritz_progress_${this.currentModuleId}`, JSON.stringify(state));
  }

  /**
   * Restore last reading position from LocalStorage
   */
  restorePosition() {
    if (!this.currentModuleId) return;

    const saved = localStorage.getItem(`spritz_progress_${this.currentModuleId}`);

    if (saved) {
      try {
        const state = JSON.parse(saved);

        if (state.position !== undefined) {
          this.reader.seekToWord(state.position);
        }

        if (state.wpm) {
          this.setWPM(state.wpm);
        }

        if (state.bookmarks) {
          this.bookmarks = state.bookmarks;
        }

        this._updateDisplay();
      } catch (e) {
        console.error('Failed to restore position:', e);
      }
    }
  }

  /**
   * Close the RSVP reader and save progress
   */
  close() {
    this.savePosition();

    if (this.isPlaying) {
      this._togglePlay();
    }

    // Release wake lock when closing
    this._releaseWakeLock();

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    this.isStarted = false;
    document.getElementById('spritzStartScreen').style.display = 'block';
    document.getElementById('spritzReaderUI').style.display = 'none';
  }
}
