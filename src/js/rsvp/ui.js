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
    this.reader = new RSVPReader();

    // UI State
    this.isPlaying = false;
    this.currentWPM = 300;
    this.isStarted = false;
    this.bookmarks = [];

    // Bind methods to maintain context
    this._handleKeyboard = this._handleKeyboard.bind(this);
    this._togglePlay = this._togglePlay.bind(this);
    this._handleWPMChange = this._handleWPMChange.bind(this);
    this._handleNavChange = this._handleNavChange.bind(this);
    this._toggleBookmark = this._toggleBookmark.bind(this);

    // Initialize UI
    this._initUI();
    this._initControls();
    this.restorePosition();
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
            <div class="spritz-display">
              <div class="spritz-word" id="spritzWord">Ready</div>
              <div class="spritz-progress">
                <span id="spritzPosition">0</span> / <span id="spritzTotal">0</span>
              </div>
            </div>

            <!-- Controls Panel -->
            <div class="spritz-controls">
              <!-- Playback Controls -->
              <div class="spritz-playback-controls">
                <button class="spritz-control-button" id="spritzBackBtn" title="Previous section (←)">
                  ◀◀
                </button>
                <button class="spritz-control-button primary" id="spritzPlayBtn" title="Play/Pause (Space)">
                  ▶
                </button>
                <button class="spritz-control-button" id="spritzForwardBtn" title="Next section (→)">
                  ▶▶
                </button>
              </div>

              <!-- WPM Slider -->
              <div class="spritz-wpm-control">
                <label class="spritz-wpm-label">
                  Speed: <span id="spritzWPMValue">300</span> WPM
                </label>
                <input
                  type="range"
                  class="spritz-wpm-slider"
                  id="spritzWPMSlider"
                  min="100"
                  max="1000"
                  step="25"
                  value="300"
                >
              </div>

              <!-- Navigation Slider -->
              <div class="spritz-nav-control">
                <input
                  type="range"
                  class="spritz-nav-slider"
                  id="spritzNavSlider"
                  min="0"
                  max="100"
                  step="1"
                  value="0"
                >
                <div class="spritz-nav-labels" id="spritzNavLabels"></div>
              </div>

              <!-- Action Buttons -->
              <div class="spritz-action-controls">
                <button class="spritz-control-button" id="spritzBookmarkBtn" title="Bookmark (Ctrl+B)">
                  🔖
                </button>
                <button class="spritz-control-button" id="spritzHelpBtn" title="Help (?)">
                  ?
                </button>
                <button class="spritz-control-button" id="spritzCloseBtn" title="Close (Esc)">
                  ✕
                </button>
              </div>
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
    document.getElementById('spritzBackBtn').addEventListener('click', () => this.reader.previousSection());
    document.getElementById('spritzForwardBtn').addEventListener('click', () => this.reader.nextSection());

    // WPM slider
    const wpmSlider = document.getElementById('spritzWPMSlider');
    wpmSlider.addEventListener('input', this._handleWPMChange);

    // Navigation slider
    const navSlider = document.getElementById('spritzNavSlider');
    navSlider.addEventListener('input', this._handleNavChange);

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

    // Reader update callbacks
    this.reader.onUpdate = () => this._updateDisplay();
    this.reader.onSectionChange = () => this._updateSlider();
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
      document.getElementById('spritzPlayBtn').textContent = '▶';
    } else {
      this.reader.play();
      this.isPlaying = true;
      document.getElementById('spritzPlayBtn').textContent = '⏸';
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
    this.reader.seekToPosition(position);
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

  /**
   * Update the display with current word and progress
   * @private
   */
  _updateDisplay() {
    const word = this.reader.getCurrentWord();
    const position = this.reader.getCurrentPosition();
    const total = this.reader.getTotalWords();

    document.getElementById('spritzWord').textContent = word || 'Ready';
    document.getElementById('spritzPosition').textContent = position;
    document.getElementById('spritzTotal').textContent = total;

    this._updateSlider();
  }

  /**
   * Update navigation slider to match current position
   * @private
   */
  _updateSlider() {
    const position = this.reader.getCurrentPosition();
    const total = this.reader.getTotalWords();
    const percentage = total > 0 ? (position / total) * 100 : 0;

    const slider = document.getElementById('spritzNavSlider');
    slider.value = percentage;
    slider.max = 100;
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
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this._togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.reader.previousSection();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.reader.nextSection();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.setWPM(Math.min(1000, this.currentWPM + 25));
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.setWPM(Math.max(100, this.currentWPM - 25));
        break;
      case 'KeyB':
        if (e.ctrlKey) {
          e.preventDefault();
          this._toggleBookmark();
        }
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
          <span class="spritz-bookmark-position">Pos: ${bookmark.position}</span>
          <span class="spritz-bookmark-word">"${bookmark.word}"</span>
          <span class="spritz-bookmark-time">${timeStr}</span>
          <button class="spritz-bookmark-delete" data-index="${index}">×</button>
        `;

        // Click on bookmark to jump to position
        li.addEventListener('click', (e) => {
          if (!e.target.classList.contains('spritz-bookmark-delete')) {
            this.reader.seekToPosition(bookmark.position);
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

    // Update total word count
    const total = this.reader.getTotalWords();
    document.getElementById('spritzTotal').textContent = total;
    document.getElementById('spritzWord').textContent = 'Ready';

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

    // Update slider and display
    document.getElementById('spritzWPMSlider').value = this.currentWPM;
    document.getElementById('spritzWPMValue').textContent = this.currentWPM;
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
          this.reader.seekToPosition(state.position);
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

    this.isStarted = false;
    document.getElementById('spritzStartScreen').style.display = 'block';
    document.getElementById('spritzReaderUI').style.display = 'none';
  }
}
