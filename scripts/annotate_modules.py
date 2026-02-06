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
    # 1. Protect specific blocks by wrapping them with PAUSE markers
    # We do this first so we don't mess up their internals with other replacements
    
    # Code, Math, Images
    for pattern, p_type in PROTECTED_PATTERNS:
        # Use a lambda to construct replacement to avoid backslash issues in f-strings with groups
        text = re.sub(pattern, lambda m: f'{{{{PAUSE:{p_type}}}}}{m.group(0)}{{{{PAUSE:END}}}}', text)

    # Tables (handled separately due to complexity)
    # We use a simple multiline match for lines starting/ending with |
    text = re.sub(TABLE_PATTERN, r'{{PAUSE:TABLE}}\1{{PAUSE:END}}', text, flags=re.MULTILINE)

    # 2. Split into parts to process unprotected text safely
    # We split by the PAUSE blocks we just added
    # Regex captures the delimiter so we keep the protected parts
    parts = re.split(r'({{PAUSE:(?:FORMULA|IMAGE|TABLE)}}[\s\S]*?{{PAUSE:END}})', text)
    
    processed_parts = []
    
    for part in parts:
        # If it's a protected block, keep it as is
        if re.match(r'^{{PAUSE:(?:FORMULA|IMAGE|TABLE)}}', part):
            processed_parts.append(part)
            continue
            
        # Process unprotected text (line by line for lists/acronyms/punctuation)
        lines = part.split('\n')
        processed_lines = []
        
        for line in lines:
            # 3. OACI Docs (4 digits)
            line = re.sub(r'\b(Doc\.?|Documento)\s+(\d{4})\b', r'{{PAUSE:DOC}}\1\2', line, flags=re.IGNORECASE)
            
            # 4. Lists (at start of line)
            # Match list items (bullets or numbers)
            if re.match(r'^\s*([-*+]|\d+\.)\s+', line):
                line = re.sub(r'^(\s*)([-*+]|\d+\.)', r'\1{{PAUSE:LIST}}\2', line, count=1)
                
            # 5. Acronyms (careful not to break existing tags)
            # We use a function to check exclusions
            def replace_acronym(match):
                word = match.group(1)
                if word not in ACRONYM_EXCLUSIONS:
                    return f'{{{{PAUSE:ACRONYM}}}}{word}'
                return word

            # Match 2-5 uppercase letters, strict word boundary
            line = re.sub(r'\b([A-Z]{2,5})\b', replace_acronym, line)
            
            # 6. Punctuation Removal (as requested)
            # Remove punctuation characters that cause pauses or distractions
            # Commas, periods, colons, semicolons, etc.
            # We use a safe regex that respects digits (like 3.5) if possible, or just strip
            # The prompt requested "remove punctuation like commas or points"
            
            # Remove periods (not between digits)
            line = re.sub(r'(?<!\d)\.(?!\d)', '', line)
            # Remove commas
            line = re.sub(r',', '', line)
            # Remove colons
            line = re.sub(r':', '', line)
            # Remove semicolons
            line = re.sub(r';', '', line)
            
            # 7. Cleanup any explicit pause markers that might have been added by legacy logic
            # (Just in case, though we don't add them above anymore)
            line = re.sub(r'{{PAUSE:(?:SHORT|LONG|MEDIUM|COMMA|SEMICOLON|POINT)}}', '', line)
            
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
