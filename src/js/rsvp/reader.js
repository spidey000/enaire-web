import { renderWord } from './orp.js';

/**
 * RSVP (Rapid Serial Visual Presentation) Reader
 * Displays words one at a time at a specified speed (words per minute)
 */
export class RSVPReader {
  /**
   * Create an RSVP Reader instance
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Container element to display words
   * @param {number} [options.wpm=250] - Words per minute (default: 250)
   * @param {Function} [options.onWordChange] - Callback called when word changes (receives word, index)
   */
  constructor(options = {}) {
    if (!options.container) {
      throw new Error('RSVPReader requires a container element');
    }

    this._container = options.container;
    this._wpm = options.wpm || 250;
    this._onWordChange = options.onWordChange || null;

    // State
    this._isPlaying = false;
    this._currentWordIndex = 0;
    this._words = [];
    this._timeoutId = null;
  }

  /**
   * Get the array of words with metadata
   * @returns {Array} Array of word objects
   */
  get words() {
    return this._words;
  }

  /**
   * Get current words per minute setting
   * @returns {number} Current WPM
   */
  get wpm() {
    return this._wpm;
  }

  /**
   * Get current word index
   * @returns {number} Current word index
   */
  get currentWordIndex() {
    return this._currentWordIndex;
  }

  /**
   * Get current word index (position)
   * @returns {number} Current word index
   */
  getCurrentPosition() {
    return this._currentWordIndex;
  }

  /**
   * Get current word text
   * @returns {string|null} Current word text or null
   */
  getCurrentWord() {
    const word = this._words[this._currentWordIndex];
    return word ? word.text : null;
  }

  /**
   * Check if reader is currently playing
   * @returns {boolean} Playing state
   */
  get isPlaying() {
    return this._isPlaying;
  }

  /**
   * Load and process text content for RSVP playback
   * Splits text into words and detects pause markers
   * Pause marker format: {{PAUSE:TYPE}} where TYPE can be: ACRONYM, LIST, etc.
   * Adds +500ms delay to words for each pause marker found (except END)
   * @param {string} text - Text content to load
   */
  loadContent(text) {
    this._words = [];
    this._currentWordIndex = 0;

    // Split text into tokens (words and pause markers)
    const tokens = text.split(/\s+/);

    tokens.forEach((token) => {
      // Find all pause markers in this token
      const pauseRegex = /\{\{PAUSE:(\w+)\}\}/g;
      const matches = [...token.matchAll(pauseRegex)];
      
      if (matches.length > 0) {
        const cleanText = token.replace(/\{\{PAUSE:\w+\}\}/g, '').trim();
        let totalPauseDelay = 0;
        let lastPauseType = null;

        matches.forEach(match => {
          const type = match[1];
          if (type.toUpperCase() !== 'END') {
            totalPauseDelay += 500;
          }
          lastPauseType = type;
        });

        if (cleanText.length > 0) {
          // Word with pause marker(s)
          this._words.push({
            text: cleanText,
            hasPauseMarker: true,
            pauseType: lastPauseType, // Store last one for styling if needed
            pauseDelay: totalPauseDelay,
            delay: this._calculateWordDelay(cleanText) + totalPauseDelay
          });
        } else if (totalPauseDelay > 0) {
          // Pure pause markers - use as a delay entry with empty text
          this._words.push({
            text: '',
            hasPauseMarker: true,
            pauseType: lastPauseType,
            pauseDelay: totalPauseDelay,
            delay: totalPauseDelay
          });
        }
      } else if (token.trim().length > 0) {
        // Regular word
        this._words.push({
          text: token,
          hasPauseMarker: false,
          pauseType: null,
          delay: this._calculateWordDelay(token)
        });
      }
    });
  }

  /**
   * Start word-by-word playback
   */
  start() {
    if (this._words.length === 0) {
      throw new Error('No content loaded. Call loadContent() first.');
    }

    if (this._isPlaying) {
      return; // Already playing
    }

    this._isPlaying = true;

    // Display first word if at beginning
    if (this._currentWordIndex === 0) {
      this._displayCurrentWord();
    }

    this._scheduleNextWord();
  }

  /**
   * Pause playback
   */
  pause() {
    this._isPlaying = false;
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  /**
   * Stop playback and reset to beginning
   */
  stop() {
    this.pause();
    this._currentWordIndex = 0;
    this._container.innerHTML = '';
  }

  /**
   * Seek to a specific word index
   * @param {number} index - Word index to jump to
   */
  seekToWord(index) {
    if (index < 0 || index >= this._words.length) {
      throw new Error(`Index ${index} out of bounds (0-${this._words.length - 1})`);
    }

    // Clear any scheduled word
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }

    this._currentWordIndex = index;
    this._displayCurrentWord();

    // Continue playing if was playing
    if (this._isPlaying) {
      this._scheduleNextWord();
    }
  }

  /**
   * Update words per minute speed
   * @param {number} wpm - New words per minute setting
   */
  setWPM(wpm) {
    if (wpm <= 0) {
      throw new Error('WPM must be greater than 0');
    }

    this._wpm = wpm;

    // Recalculate delays for all words
    this._words.forEach((word) => {
      const pauseDelay = word.pauseDelay || 0;
      
      if (word.text && word.text.length > 0) {
        word.delay = this._calculateWordDelay(word.text) + pauseDelay;
      } else {
        word.delay = pauseDelay;
      }
    });
  }

  /**
   * Advance to the next word (manual navigation)
   */
  nextWord() {
    if (this._currentWordIndex < this._words.length - 1) {
      // Clear any scheduled word
      if (this._timeoutId) {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
      }

      this._currentWordIndex++;
      this._displayCurrentWord();

      // Continue playing if was playing
      if (this._isPlaying) {
        this._scheduleNextWord();
      }
    }
  }

  /**
   * Go back to the previous word (manual navigation)
   */
  previousWord() {
    if (this._currentWordIndex > 0) {
      // Clear any scheduled word
      if (this._timeoutId) {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
      }

      this._currentWordIndex--;
      this._displayCurrentWord();

      // Continue playing if was playing
      if (this._isPlaying) {
        this._scheduleNextWord();
      }
    }
  }

  /**
   * Calculate display delay for a word based on length and WPM
   * @private
   * @param {string} word - Word to calculate delay for
   * @returns {number} Delay in milliseconds
   */
  _calculateWordDelay(word) {
    const baseDelay = 60000 / this._wpm;
    const wordLength = word.length;

    // Adjust delay based on word length
    // Short words (< 4 chars): 80% of base delay
    // Medium words (4-7 chars): 100% of base delay
    // Long words (8-10 chars): 120% of base delay
    // Very long words (> 10 chars): 140% of base delay

    let multiplier = 1.0;

    if (wordLength < 4) {
      multiplier = 0.8;
    } else if (wordLength <= 7) {
      multiplier = 1.0;
    } else if (wordLength <= 10) {
      multiplier = 1.2;
    } else {
      multiplier = 1.4;
    }

    return baseDelay * multiplier;
  }

  /**
   * Render a word using ORP (Optimal Recognition Point) highlighting
   * @private
   * @param {string} word - Word to render
   * @returns {string} HTML string with ORP highlighting
   */
  _renderWord(word) {
    return renderWord(word);
  }

  /**
   * Display the current word in the container
   * @private
   */
  _displayCurrentWord() {
    const word = this._words[this._currentWordIndex];

    if (!word) return;

    if (word.text && word.text.length > 0) {
      // Render word with ORP highlighting (even if it has a pause marker)
      let html = this._renderWord(word.text);
      
      if (word.hasPauseMarker) {
        html = `<span class="rsvp-pause rsvp-pause-${word.pauseType.toLowerCase()}">${html}</span>`;
      }
      
      this._container.innerHTML = html;
    } else {
      // Empty word (pure pause) - keep blank
      this._container.innerHTML = '';
    }

    // Trigger callback if provided
    if (this._onWordChange) {
      this._onWordChange(word, this._currentWordIndex);
    }
  }

  /**
   * Schedule the next word for display
   * @private
   */
  _scheduleNextWord() {
    if (!this._isPlaying) {
      return;
    }

    // Check if we've reached the end
    if (this._currentWordIndex >= this._words.length - 1) {
      this.pause();
      return;
    }

    const currentWord = this._words[this._currentWordIndex];
    const delay = currentWord.delay;

    this._timeoutId = setTimeout(() => {
      this._currentWordIndex++;
      this._displayCurrentWord();
      this._scheduleNextWord();
    }, delay);
  }
}
