/**
 * Parser for annotated markdown content used in RSVP reader.
 * Extracts metadata, sections, and handles pause markers.
 */

/**
 * Parses annotated markdown content and extracts metadata.
 *
 * @param {string} markdown - The annotated markdown string to parse
 * @returns {Object} Parsed metadata object containing:
 *   - headings: Array of heading objects with structure, pauses, and word counts
 *   - totalWords: Total word count across all content
 *   - sections: Array of section objects with heading and content
 */
export function parseAnnotatedMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return {
      headings: [],
      totalWords: 0,
      sections: []
    };
  }

  const trimmed = markdown.trim();

  if (trimmed.length === 0) {
    return {
      headings: [],
      totalWords: 0,
      sections: []
    };
  }

  // Extract all headings first
  const headings = extractHeadings(trimmed);

  // Split content into sections based on headings
  const sections = [];
  let currentWordIndex = 0;

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextHeading = headings[i + 1];

    // Extract section content (from this heading to next heading or end)
    const startPos = heading.position;
    const endPos = nextHeading ? nextHeading.position : trimmed.length;
    const sectionContent = trimmed.substring(startPos, endPos);

    // Count words in section (excluding heading markers)
    const headingText = heading.title;
    const { text: contentText, pauses } = extractPauseMarkers(sectionContent.replace(/^#{1,3}\s+.*$/m, ''));

    const headingWords = headingText.split(/\s+/).filter(w => w.length > 0).length;
    const contentWords = contentText.split(/\s+/).filter(w => w.length > 0).length;
    const sectionWords = headingWords + contentWords;

    // Update heading with word info
    heading.startWordIndex = currentWordIndex;
    heading.wordCount = sectionWords;
    heading.pauses = pauses;

    sections.push({
      headingId: heading.id,
      heading: headingText,
      content: contentText,
      fullText: sectionContent
    });

    currentWordIndex += sectionWords;
  }

  // If no headings exist, treat entire content as one section
  if (headings.length === 0) {
    const { text: contentWithoutMarkers } = extractPauseMarkers(trimmed);
    const wordCount = contentWithoutMarkers.split(/\s+/).filter(w => w.length > 0).length;

    return {
      headings: [],
      totalWords: wordCount,
      sections: [{
        headingId: null,
        heading: null,
        content: contentWithoutMarkers,
        fullText: trimmed
      }]
    };
  }

  return {
    headings,
    totalWords: currentWordIndex,
    sections
  };
}

/**
 * Loads the text content for a specific section by index.
 * Removes pause markers but preserves their position information.
 *
 * @param {Object} metadata - The metadata object returned by parseAnnotatedMarkdown
 * @param {number} sectionIndex - The index of the section to load (0-based)
 * @returns {Object} Section object with:
 *   - text: Clean text without pause markers
 *   - pauses: Array of pause marker positions in the clean text
 *   - heading: Heading text if applicable
 *   - wordCount: Number of words in this section
 */
export function loadSection(metadata, sectionIndex) {
  if (!metadata || !metadata.sections) {
    throw new Error('Invalid metadata object');
  }

  if (sectionIndex < 0 || sectionIndex >= metadata.sections.length) {
    throw new Error(`Section index ${sectionIndex} out of bounds (0-${metadata.sections.length - 1})`);
  }

  const section = metadata.sections[sectionIndex];
  const heading = metadata.headings.find(h => h.id === section.headingId);

  // Use the clean text and pauses from metadata
  const cleanText = section.content;
  const pauses = heading ? heading.pauses : [];

  return {
    text: cleanText,
    pauses,
    heading: section.heading,
    wordCount: heading ? heading.wordCount : 0,
    startWordIndex: heading ? heading.startWordIndex : 0
  };
}

/**
 * Extracts all headings from markdown content.
 * Supports ## (h2) and ### (h3) level headings.
 *
 * @param {string} markdown - The markdown content to parse
 * @returns {Array<Object>} Array of heading objects with:
 *   - id: Unique identifier (e.g., "h-1-2")
 *   - level: Heading level (2 or 3)
 *   - title: Heading text without markers
 *   - position: Character position in original markdown
 *   - index: Sequential index among same-level headings
 */
export function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split('\n');

  let h2Count = 0;
  let h3Count = 0;
  let currentPosition = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h2Match) {
      const title = h2Match[1].trim();
      const heading = {
        id: generateHeadingId(2, h2Count, title),
        level: 2,
        title,
        position: currentPosition,
        index: h2Count
      };
      headings.push(heading);
      h2Count++;
      h3Count = 0; // Reset h3 counter for new h2 section
    } else if (h3Match) {
      const title = h3Match[1].trim();
      const heading = {
        id: generateHeadingId(3, h3Count, title),
        level: 3,
        title,
        position: currentPosition,
        index: h3Count
      };
      headings.push(heading);
      h3Count++;
    }

    // Update position (including newline character)
    currentPosition += line.length + 1;
  }

  return headings;
}

/**
 * Generates a unique and consistent ID for a heading.
 * Format: h-{level}-{index} (e.g., "h-2-1", "h-3-0")
 *
 * @param {number} level - The heading level (2 or 3)
 * @param {number} index - The sequential index among headings of the same level
 * @param {string} title - The heading title (for future extensibility)
 * @returns {string} Unique heading identifier
 */
export function generateHeadingId(level, index, title) {
  return `h-${level}-${index}`;
}

/**
 * Extracts pause markers from text content.
 * Pause markers are in the format: {{PAUSE:TYPE}}
 *
 * @param {string} text - The text to search for pause markers
 * @returns {Array<Object>} Array of pause objects with:
 *   - type: The pause type (e.g., "SHORT", "LONG", "THEMATIC")
 *   - position: Character position in the original text
 */
/**
 * Extracts pause markers from text content and returns clean text plus marker info.
 * This function calculates the position of pauses relative to the text WITHOUT markers.
 *
 * @param {string} text - The text to search for pause markers
 * @returns {Object} { text: string, pauses: Array<Object> }
 */
function extractPauseMarkers(text) {
  const pauses = [];
  const pauseRegex = /{{pause[:\s]*(\w+)\s*}+/gi;
  let cleanText = '';
  let lastIndex = 0;
  let match;

  while ((match = pauseRegex.exec(text)) !== null) {
    // Add text since last match to cleanText
    cleanText += text.substring(lastIndex, match.index);
    
    pauses.push({
      type: match[1].toUpperCase(),
      position: cleanText.length // Position in the text WITHOUT markers
    });
    
    lastIndex = pauseRegex.lastIndex;
  }

  // Add remaining text
  cleanText += text.substring(lastIndex);

  return { text: cleanText.trim(), pauses };
}

/**
 * Counts words in a text string.
 * Filters out empty strings and whitespace-only strings.
 *
 * @param {string} text - The text to count words in
 * @returns {number} Number of words in the text
 */
export function countWords(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Validates if a string is a properly formatted pause marker.
 *
 * @param {string} marker - The marker string to validate
 * @returns {boolean} True if the marker is valid
 */
export function isValidPauseMarker(marker) {
  return /^{{pause[:\s]*\w+\s*}+$/i.test(marker);
}
