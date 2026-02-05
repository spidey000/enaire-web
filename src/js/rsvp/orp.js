/**
 * ORP (Optimal Recognition Point) Calculation Module
 *
 * Implements the Spritz algorithm for finding the optimal recognition point
 * in words for rapid serial visual presentation (RSVP) reading.
 */

/**
 * Calculates the Optimal Recognition Point (ORP) for a given word.
 *
 * The ORP is the letter in a word where the eye should focus to maximize
 * reading speed and comprehension. Based on the Spritz algorithm:
 * - Words shorter than 8 characters: ORP is at 35% from the left
 * - Words 8 or more characters: ORP is at the center
 *
 * @param {string} word - The word to calculate ORP for
 * @returns {number} The zero-based index of the ORP character
 * @throws {Error} If word is not a valid string
 *
 * @example
 * calculateORP('hello')     // returns 2 (letter 'l')
 * calculateORP('Spritz')    // returns 2 (letter 'r')
 * calculateORP('beautiful') // returns 4 (letter 't')
 */
export function calculateORP(word) {
  // Validation
  if (typeof word !== 'string') {
    throw new Error('Word must be a string');
  }

  const trimmedWord = word.trim();

  if (trimmedWord.length === 0) {
    throw new Error('Word cannot be empty');
  }

  if (trimmedWord.length === 1) {
    return 0;
  }

  // Apply Spritz algorithm
  if (trimmedWord.length < 8) {
    // ORP at 35% from left for shorter words
    return Math.round(trimmedWord.length * 0.35);
  } else {
    // ORP at center for longer words
    return Math.floor(trimmedWord.length / 2);
  }
}

/**
 * Renders a word with the ORP letter highlighted in red.
 *
 * Creates a structured HTML string where the word is split into three parts:
 * 1. spritz-word-left: The part before the ORP (right-aligned)
 * 2. spritz-word-orp: The ORP character itself (red)
 * 3. spritz-word-right: The part after the ORP (left-aligned)
 *
 * This structure allows CSS to align the ORP character to a fixed position.
 *
 * @param {string} word - The word to render
 * @returns {string} HTML string with structured word parts
 * @throws {Error} If word is not a valid string
 */
export function renderWord(word) {
  // Validation
  if (typeof word !== 'string') {
    throw new Error('Word must be a string');
  }

  const trimmedWord = word.trim();

  if (trimmedWord.length === 0) {
    return '';
  }

  // Calculate ORP position
  const orpIndex = calculateORP(trimmedWord);

  // Split word into parts
  const beforeORP = trimmedWord.substring(0, orpIndex);
  const orpChar = trimmedWord[orpIndex];
  const afterORP = trimmedWord.substring(orpIndex + 1);

  // Build structured HTML
  let html = `<span class="spritz-word-left">${beforeORP}</span>`;
  html += `<span class="spritz-word-orp">${orpChar}</span>`;
  html += `<span class="spritz-word-right">${afterORP}</span>`;

  return html;
}

/**
 * Calculates the display delay (in milliseconds) for a word based on reading speed.
 *
 * The delay determines how long each word should be displayed during RSVP reading.
 * A higher WPM (words per minute) results in shorter delays, while pause markers
 * add extra time for comprehension (e.g., after punctuation).
 *
 * @param {string} word - The word being displayed (used for validation)
 * @param {number} wpm - Words per minute reading speed (typically 250-600)
 * @param {boolean} hasPauseMarker - Whether this word has a pause marker (e.g., comma, period)
 * @returns {number} Delay in milliseconds
 * @throws {Error} if wpm is not a positive number
 *
 * @example
 * getWordDelay('hello', 300, false)  // returns 200 (60000 / 300)
 * getWordDelay('end.', 300, true)     // returns 700 (200 + 500 pause)
 * getWordDelay('quick', 600, false)   // returns 100 (60000 / 600)
 */
export function getWordDelay(word, wpm, hasPauseMarker = false) {
  // Validation
  if (typeof word !== 'string' || word.trim().length === 0) {
    throw new Error('Word must be a non-empty string');
  }

  if (typeof wpm !== 'number' || wpm <= 0) {
    throw new Error('WPM must be a positive number');
  }

  // Calculate base delay from WPM
  const baseDelay = 60000 / wpm;

  // Add pause delay if marker present
  const totalDelay = hasPauseMarker ? baseDelay + 500 : baseDelay;

  return totalDelay;
}
