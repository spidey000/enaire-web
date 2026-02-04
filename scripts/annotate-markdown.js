#!/usr/bin/env node

/**
 * annotate-markdown.js
 *
 * Build-time script to add pause markers to markdown files for RSVP reader.
 * Detects technical content (formulas, acronyms, lists, tables, images)
 * and adds {{PAUSE:TYPE}} markers for automatic +500ms delays during RSVP playback.
 *
 * Usage: node scripts/annotate-markdown.js
 * Output: src/data/modules-annotated/ directory with annotated markdown files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MODULES_DIR = path.resolve(__dirname, '../src/data/modules');
const OUTPUT_DIR = path.resolve(__dirname, '../src/data/modules-annotated');

// Patterns to detect and annotate
const PAUSE_PATTERNS = [
  {
    name: 'Code blocks',
    regex: /```[\s\S]*?```/g,
    type: 'FORMULA',
    description: 'Fenced code blocks'
  },
  {
    name: 'LaTeX display math',
    regex: /\$\$[\s\S]*?\$\$/g,
    type: 'FORMULA',
    description: 'Display math $$...$$'
  },
  {
    name: 'LaTeX inline math',
    regex: /\$[^$]+\$/g,
    type: 'FORMULA',
    description: 'Inline math $...$'
  },
  {
    name: 'Images',
    regex: /!\[([^\]]*)\]\([^)]+\)/g,
    type: 'IMAGE',
    description: 'Markdown images'
  },
  {
    name: 'Tables',
    regex: /^(?![^\n]*\|)(?:\|?[^\n]+\|)+$/gm,
    type: 'TABLE',
    description: 'Markdown tables'
  },
  {
    name: 'Bullet lists',
    regex: /^(\s{0,3}[-*+]\s)/gm,
    type: 'LIST',
    description: 'Unordered lists'
  },
  {
    name: 'Numbered lists',
    regex: /^(\s{0,3}\d+\.\s)/gm,
    type: 'LIST',
    description: 'Ordered lists'
  }
];

// Acronym regex - 2-5 uppercase letters
const ACRONYM_REGEX = /\b[A-Z]{2,5}\b/g;

// Common Spanish/English words to exclude from acronym detection
const ACRONYM_EXCLUSIONS = new Set([
  'EL', 'LA', 'LO', 'LOS', 'LAS', 'UN', 'UNA', 'UNOS', 'UNAS',
  'DE', 'DEL', 'EN', 'POR', 'PARA', 'CON', 'SIN', 'SOBRE',
  'ES', 'SON', 'ESTA', 'ESTO', 'ESTE', 'ESTOS', 'ESTAS',
  'QUE', 'QUIEN', 'CUANDO', 'DONDE', 'COMO',
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'GET', 'HAS', 'HIS', 'HIM', 'HOW', 'ITS', 'NOW', 'SEE', 'SHE', 'TWO', 'USE', 'WAS', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'DAD', 'MOM', 'SUN'
]);

/**
 * Check if a word should be excluded from acronym detection
 */
function isExcludedAcronym(word) {
  return ACRONYM_EXCLUSIONS.has(word);
}

/**
 * Annotate markdown content with pause markers
 */
function annotateMarkdown(content, filename) {
  let annotated = content;
  let stats = {
    formulas: 0,
    images: 0,
    tables: 0,
    lists: 0,
    acronyms: 0
  };

  // Annotate patterns (code blocks, formulas, images, tables, lists)
  PAUSE_PATTERNS.forEach(({ name, regex, type }) => {
    const matches = content.match(regex);
    if (matches) {
      if (type === 'FORMULA') stats.formulas += matches.length;
      else if (type === 'IMAGE') stats.images += matches.length;
      else if (type === 'TABLE') stats.tables += matches.length;
      else if (type === 'LIST') stats.lists += matches.length;

      annotated = annotated.replace(regex, (match) => {
        return `{{PAUSE:${type}}}${match}{{PAUSE:END}}`;
      });
    }
  });

  // Annotate acronyms (more careful - need to avoid already annotated parts)
  // We'll process line by line and skip lines with existing markers
  const lines = annotated.split('\n');
  const processedLines = lines.map(line => {
    // Skip lines that already have pause markers (from patterns above)
    if (line.includes('{{PAUSE:')) {
      return line;
    }

    // Find and annotate acronyms
    return line.replace(ACRONYM_REGEX, (match) => {
      if (!isExcludedAcronym(match)) {
        stats.acronyms++;
        return `{{PAUSE:ACRONYM}}${match}`;
      }
      return match;
    });
  });

  annotated = processedLines.join('\n');

  console.log(`  📊 ${filename}:`);
  if (stats.formulas > 0) console.log(`     • Formulas: ${stats.formulas}`);
  if (stats.images > 0) console.log(`     • Images: ${stats.images}`);
  if (stats.tables > 0) console.log(`     • Tables: ${stats.tables}`);
  if (stats.lists > 0) console.log(`     • Lists: ${stats.lists}`);
  if (stats.acronyms > 0) console.log(`     • Acronyms: ${stats.acronyms}`);

  return annotated;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting markdown annotation for RSVP reader...\n');

  // Check if modules directory exists
  if (!fs.existsSync(MODULES_DIR)) {
    console.error(`❌ Error: Modules directory not found: ${MODULES_DIR}`);
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Process all markdown files
  const files = fs.readdirSync(MODULES_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('⚠️  No markdown files found in modules directory.');
    process.exit(0);
  }

  console.log(`📝 Found ${files.length} markdown file(s) to process.\n`);

  let totalProcessed = 0;
  let totalSkipped = 0;

  files.forEach(file => {
    const inputPath = path.join(MODULES_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    try {
      const content = fs.readFileSync(inputPath, 'utf-8');
      const annotated = annotateMarkdown(content, file);
      fs.writeFileSync(outputPath, annotated);

      const sizeOriginal = content.length;
      const sizeAnnotated = annotated.length;
      const increase = ((sizeAnnotated - sizeOriginal) / sizeOriginal * 100).toFixed(1);

      console.log(`  ✅ ${file} (+${increase}% size)\n`);
      totalProcessed++;

    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
      totalSkipped++;
    }
  });

  console.log('─'.repeat(60));
  console.log(`\n✨ Annotation complete!`);
  console.log(`   ✅ Processed: ${totalProcessed} file(s)`);
  if (totalSkipped > 0) {
    console.log(`   ⚠️  Skipped: ${totalSkipped} file(s)`);
  }
  console.log(`   📁 Output: ${OUTPUT_DIR}\n`);
}

// Run
main();
