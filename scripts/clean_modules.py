import os
import re

DATA_DIR = r'C:\Users\hp\Documents\CODE\enaire-web\src\data\modules'

# Patterns to identify and remove
PATTERNS_TO_REMOVE = [
    r'^\s*Elaborado:\s*[a-zA-Z]+/?\d{4}',
    r'^\s*Página:?\s*\d+\s*(?:/|de)\s*\d+',
    r'^\s*##\s*Página:?\s*\d+\s*(?:/|de)\s*\d+',
    r'^\s*\d+/\d+\s*$', # Just numbers like 2/66
    r'^\s*©\s*\d+\s*ENAIRE',
    r'^\s*##\s*©\s*\d+\s*ENAIRE',
    r'^\s*La información aquí expuesta es propiedad de ENAIRE\.',
    r'^\s*No puede ser usada, reproducida y/o transmitida.*',
    r'^\s*[a-z]+\s*/\d{4}\s*$', # Month/Year like "noviembre /2024"
    r'^\s*_{3,}\s*$', # Underscore lines
    r'^\s*\.{5,}\s*$' # Dots lines
]

# Patterns for specific document titles repeating
REPEATING_TITLES = [
    r'^\s*Conceptos básicos de Meteorología Aeronáutica\s*$',
    r'^\s*Códigos OACI/IATA y Características de Aeronaves\s*$',
    r'^\s*Cartografía\s*$',
    r'^\s*Factores\s+Humanos\s+en\s+ATM\s*$',
    r'^\s*y Mecánica de\s*$', 
    r'^\s*Vuelo\s*$' 
]

def is_header_like(line):
    line = line.strip()
    # Markdown header
    if line.startswith('#'): return True
    # Numbered section: 1.1, 2.1.3, etc (but not just "1. " as that's a list)
    if re.match(r'^\d+(\.\d+)+\.?\s+', line): return True
    # Lettered list item: a) b)
    if re.match(r'^[a-z]\)\s+', line): return True
    # Bullet point
    if re.match(r'^[-*+]\s+', line): return True
    # All caps line (short) - likely a header
    if line.isupper() and len(line) < 100: return True
    return False

def clean_file(filepath):
    print(f"Cleaning {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    cleaned_lines = []
    
    # 1. First pass: Identify and remove garbage lines
    for line in lines:
        is_garbage = False
        
        for pattern in PATTERNS_TO_REMOVE:
            if re.search(pattern, line, re.IGNORECASE):
                is_garbage = True
                break
        
        if is_garbage: continue
            
        for pattern in REPEATING_TITLES:
            if re.match(pattern, line, re.IGNORECASE):
                is_garbage = True
                break
                
        if is_garbage: continue
            
        if re.match(r'^##\s*\d{4}-\d{4}$', line.strip()): continue
        if re.match(r'^##\s*\d{4}$', line.strip()): continue
        # Remove weird headers that are just "## -"
        if re.match(r'^##\s*-\s*$', line.strip()): continue
            
        cleaned_lines.append(line)

    # 2. Join lines that were split
    joined_lines = []
    i = 0
    while i < len(cleaned_lines):
        line = cleaned_lines[i]
        
        if i + 1 < len(cleaned_lines):
            next_line = cleaned_lines[i+1]
            
            # Don't join if current or next line looks like a header/list/structure
            if not is_header_like(line) and not is_header_like(next_line) and line.strip() and next_line.strip():
                # Check punctuation
                if not re.search(r'[.:?]\s*$', line):
                    # Join
                    if not line.endswith('-'):
                        line = line + " " + next_line.strip()
                    else:
                        line = line[:-1] + next_line.strip()
                    
                    cleaned_lines[i] = line
                    cleaned_lines.pop(i+1)
                    continue
        
        # 3. Enhance Headers: If line looks like "2.1.1 Title", make it "### 2.1.1 Title"
        # Only do this if it's not already a markdown header
        if not line.startswith('#'):
            match = re.match(r'^(\d+(\.\d+)+)\.?\s+(.+)', line.strip())
            if match:
                # Count dots to determine level. 2.1 -> 1 dot -> level 2? 
                # 2. -> level 1?
                # Usually:
                # 1. -> # (Level 1)
                # 1.1 -> ## (Level 2)
                # 1.1.1 -> ### (Level 3)
                numbering = match.group(1)
                level = numbering.count('.') + 1
                # Cap level at 6
                level = min(level, 6)
                line = '#' * level + ' ' + line.strip()
        
        joined_lines.append(line)
        i += 1

    final_content = '\n'.join(joined_lines)
    final_content = re.sub(r'\n{3,}', '\n\n', final_content)
    final_content = final_content.strip()
    
    # Remove TOC/Preamble if appropriate
    match = re.search(r'^(#+\s*1\.\s+Intro)', final_content, re.MULTILINE | re.IGNORECASE)
    if match:
        start_pos = match.start()
        if start_pos > 0:
            final_content = final_content[start_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)

def process_dir(directory):
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return
        
    for filename in os.listdir(directory):
        if filename.endswith(".md"):
            clean_file(os.path.join(directory, filename))

if __name__ == "__main__":
    process_dir(DATA_DIR)
