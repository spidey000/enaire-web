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
 * Creates an HTML string where the entire word is displayed in black,
 * except for the ORP letter which is displayed in red and slightly larger.
 * The red highlighting draws the reader's attention to the optimal
 * recognition point.
 *
 * @param {string} word - The word to render
 * @returns {string} HTML string with ORP letter styled in red
 * @throws {Error} If word is not a valid string
 *
 * @example
 * renderWord('hello')
 * // Returns: '<span style="color: #000000;">he<span style="color: #ff0000; font-size: 110%;">l</span>lo</span>'
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

  if (trimmedWord.length === 1) {
    return `<span style="color: #ff0000; font-size: 110%;">${trimmedWord}</span>`;
  }

  // Calculate ORP position
  const orpIndex = calculateORP(trimmedWord);

  // Split word into parts
  const beforeORP = trimmedWord.substring(0, orpIndex);
  const orpChar = trimmedWord[orpIndex];
  const afterORP = trimmedWord.substring(orpIndex + 1);

  // Build HTML with styling
  let html = '<span style="color: #000000;">';

  if (beforeORP.length > 0) {
    html += beforeORP;
  }

  html += `<span style="color: #ff0000; font-size: 110%;">${orpChar}</span>`;

  if (afterORP.length > 0) {
    html += afterORP;
  }

  html += '</span>';

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
