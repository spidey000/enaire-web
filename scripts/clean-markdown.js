import fs from 'fs';
import path from 'path';

const DATA_DIR = './src/data/modules';
const ANNOTATED_DIR = './src/data/modules-annotated';

const cleanFile = (filePath) => {
    console.log(`Cleaning ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove everything before the first "## 1. INTRODUCCIÓN" or similar
    // We look for "## 1. " and ensure it's NOT an index entry (no trailing underscores/numbers)
    const lines = content.split('\n');
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Match "## 1. INTRODUCCIÓN" or "## 1. Introducción" but NOT with underscores
        if (/^## 1\.\s+Introducci[oó]n/i.test(line) && !/_{3,}/.test(line)) {
            startIndex = i;
            break;
        }
    }
    if (startIndex > 0) {
        content = lines.slice(startIndex).join('\n');
    }

    // 2. Remove artificial lines like ____________________
    content = content.replace(/_{5,}/g, '');

    // 3. Remove page headers/footers
    // Pattern: 
    // ## Elaborado: ...
    // Página: ...
    // Title
    content = content.replace(/## Elaborado: [^\n]+/gi, '');
    content = content.replace(/Página: \d+ de \d+/gi, '');
    
    // This is a bit tricky, it might remove legitimate text if not careful.
    // But in these files, titles appear on their own lines.
    const titles = [
        'Instituciones y Legislación Aeronáutica',
        'Aerodinámica',
        'Navegación',
        'Plan de Vuelo y ATFCM',
        'Códigos y Abreviaturas',
        'Cartografía y Radionavegación'
    ];
    
    titles.forEach(title => {
        const regex = new RegExp(`^\s*${title}\s*$`, 'gm');
        content = content.replace(regex, '');
    });

    // 4. Clean up multiple newlines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 5. Trim whitespace
    content = content.trim();

    fs.writeFileSync(filePath, content);
};

const processDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    files.forEach(file => {
        cleanFile(path.join(dir, file));
    });
};

processDir(DATA_DIR);
processDir(ANNOTATED_DIR);

console.log('Markdown cleaning complete.');
