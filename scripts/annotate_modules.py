import os
import re

SOURCE_DIR = r'src/data/modules'
TARGET_DIR = r'src/data/modules-annotated'

# Regex patterns for protection (multi-line)
PROTECTED_PATTERNS = [
    (r'(```[\s\S]*?```)', 'FORMULA'),      # Code blocks
    (r'(\$\$[\s\S]*?\$\$)', 'FORMULA'),    # Display math
    (r'(\$[^$]+\$)', 'FORMULA'),           # Inline math
    (r'(!\[([^\]]*)\]\([^)]+\))', 'IMAGE'), # Images
]

# Table pattern (heuristic: consecutive lines starting with |)
TABLE_PATTERN = r'(^\|.*\|$(\n^\|.*\|$)*)'

# Acronym exclusions
ACRONYM_EXCLUSIONS = {
    'EL', 'LA', 'LO', 'LOS', 'LAS', 'UN', 'UNA', 'UNOS', 'UNAS',
    'DE', 'DEL', 'EN', 'POR', 'PARA', 'CON', 'SIN', 'SOBRE',
    'ES', 'SON', 'ESTA', 'ESTO', 'ESTE', 'ESTOS', 'ESTAS',
    'QUE', 'QUIEN', 'CUANDO', 'DONDE', 'COMO',
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'GET', 'HAS', 'HIS', 'HIM', 'HOW', 'ITS', 'NOW', 'SEE', 'SHE', 'TWO', 'USE', 'WAS', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'DAD', 'MOM', 'SUN'
}

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def annotate_text(text):
    # 0. Robust Cleanup of any existing or malformed pause markers
    # Matches {{pause:type}}, {{pause type}}, {{pause:type}, {{pause type}, etc.
    # Also handles broken nesting and case-insensitive PAUSE
    text = re.sub(r'{{+pause[:\s]*\w*\s*}+', '', text, flags=re.IGNORECASE)

    # 1. Protect specific blocks by wrapping them with pause markers
    # We do this first so we don't mess up their internals with other replacements
    
    # Code, Math, Images
    for pattern, p_type in PROTECTED_PATTERNS:
        # Use a lambda to construct replacement to avoid backslash issues
        text = re.sub(pattern, lambda m: f'{{{{pause:{p_type.lower()}}}}}{m.group(0)}{{{{pause:end}}}}', text)

    # Tables (handled separately due to complexity)
    text = re.sub(TABLE_PATTERN, r'{{pause:table}}\1{{pause:end}}', text, flags=re.MULTILINE)

    # 2. Split into parts to process unprotected text safely
    parts = re.split(r'({{pause:(?:formula|image|table)}}[\s\S]*?{{pause:end}})', text)
    
    processed_parts = []
    
    for part in parts:
        # If it's a protected block, keep it as is
        if re.match(r'^{{pause:(?:formula|image|table)}}', part):
            processed_parts.append(part)
            continue
            
        # Process unprotected text
        lines = part.split('\n')
        processed_lines = []
        
        for line in lines:
            # 3. Punctuation Removal
            # Remove periods (not between digits)
            line = re.sub(r'(?<!\d)\.(?!\d)', '', line)
            # Remove commas and semicolons (EXCLUDING colons as requested)
            line = re.sub(r'[,;]', '', line)

            # 4. OACI Docs (4 digits)
            line = re.sub(r'\b(Doc\.?|Documento)\s+(\d{4})\b', r'\1 \2{{pause:doc}}', line, flags=re.IGNORECASE)
            
            # 5. Lists (at start of line)
            if re.match(r'^\s*([-*+]|\d+\.)\s+', line):
                line = re.sub(r'^(\s*)([-*+]|\d+\.)', r'\1\2{{pause:list}}', line, count=1)
                
            # 6. Acronyms
            def replace_acronym(match):
                word = match.group(1)
                if word not in ACRONYM_EXCLUSIONS:
                    return f'{word}{{{{pause:acronym}}}}'
                return word

            # Match 2-5 uppercase letters, strict word boundary
            line = re.sub(r'\b([A-Z]{2,5})\b', replace_acronym, line)
            
            processed_lines.append(line)
            
        processed_parts.append('\n'.join(processed_lines))
        
    return ''.join(processed_parts)

def process_files():
    ensure_dir(TARGET_DIR)
    
    files = [f for f in os.listdir(SOURCE_DIR) if f.endswith('.md')]
    
    print(f"Found {len(files)} files to annotate.")
    
    for filename in files:
        source_path = os.path.join(SOURCE_DIR, filename)
        target_path = os.path.join(TARGET_DIR, filename)
        
        print(f"Processing {filename}...")
        
        try:
            with open(source_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            annotated_content = annotate_text(content)
            
            with open(target_path, 'w', encoding='utf-8') as f:
                f.write(annotated_content)
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    process_files()
