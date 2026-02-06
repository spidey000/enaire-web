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
 * reading speed and comprehension.
 * Standard rapid reading rule: (length + 1) * 0.35
 *
 * @param {string} word - The word to calculate ORP for (clean word)
 * @returns {number} The zero-based index of the ORP character
 */
export function calculateORP(word) {
  if (typeof word !== 'string') throw new Error('Word must be a string');
  const trimmedWord = word.trim();
  if (trimmedWord.length === 0) throw new Error('Word cannot be empty');
  if (trimmedWord.length === 1) return 0;

  // Apply the 35% rule: (L + 1) * 0.35
  const index = Math.floor((trimmedWord.length + 1) * 0.35);
  
  // Ensure index is within bounds
  return Math.min(index, trimmedWord.length - 1);
}

/**
 * Renders a word with the ORP letter highlighted in red.
 *
 * Creates a structured HTML string where the word is split into three parts:
 * 1. spritz-word-left: The part before the ORP (right-aligned)
 * 2. spritz-word-orp: The ORP character itself (red)
 * 3. spritz-word-right: The part after the ORP (left-aligned)
 *
 * Signos de puntuación are ignored for ORP calculation but preserved in display.
 *
 * @param {string} word - The word to render
 * @returns {string} HTML string with structured word parts
 */
export function renderWord(word) {
  if (typeof word !== 'string') throw new Error('Word must be a string');
  if (word.trim().length === 0) return '';

  // Extract core word (ignoring leading/trailing punctuation for ORP calculation)
  const punctuationRegex = /^[^\w\dáéíóúÁÉÍÓÚñÑ]*(.*?)[^\w\dáéíóúÁÉÍÓÚñÑ]*$/;
  const match = word.match(punctuationRegex);
  const coreWord = (match && match[1]) ? match[1] : word;
  
  // Find where coreWord starts in the original word
  const coreStartIndex = word.indexOf(coreWord);
  
  // Calculate ORP based on core word
  const coreOrpIndex = calculateORP(coreWord);
  const actualOrpIndex = coreStartIndex + coreOrpIndex;

  // Split original word into parts based on actual ORP index
  const beforeORP = word.substring(0, actualOrpIndex);
  const orpChar = word[actualOrpIndex];
  const afterORP = word.substring(actualOrpIndex + 1);

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
