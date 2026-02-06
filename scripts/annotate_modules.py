import os
import re

SOURCE_DIR = r'src/data/modules'
TARGET_DIR = r'src/data/modules-annotated'

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def annotate_text(text):
    lines = text.split('\n')
    annotated_lines = []
    
    for line in lines:
        # Step 1: Use temporary lowercase placeholders to avoid regex collisions
        
        # 1. OACI Docs (4 digits)
        # Matches "Doc. 4444", "Doc 4444", "Documento 4444"
        # Joins them (removes space) and adds pause marker
        line = re.sub(r'\b(Doc\.?|Documento)\s+(\d{4})\b', r'__pause_doc__\1\2', line, flags=re.IGNORECASE)
        
        # 2. Acronyms
        # Words with 3+ uppercase letters/numbers
        # We use a lookahead to ensure we don't break things like URLs if possible.
        # \b([A-Z]{2,}[A-Z0-9]+)\b matches e.g. OACI, A320, but not A (too short)
        # We replace with a placeholder to avoid being matched by subsequent steps or itself
        # Note: We must be careful not to match our own placeholders if we used uppercase, but we use lowercase now.
        line = re.sub(r'\b([A-Z]{3,})\b', r'__pause_acronym__\1', line)
        
        # 3. Lists
        # Match list items (bullets or numbers)
        # ^(\s*)([-*+]|\d+\.)\s+
        if re.match(r'^\s*([-*+]|\d+\.)\s+', line):
            line = re.sub(r'^(\s*)([-*+]|\d+\.)', r'\1__pause_list__\2', line, count=1)
            
        # 4. Punctuation Removal (as requested)
        # We replace them with empty string to remove them completely
        
        # Periods: Not preceded/followed by digit (3.5), not part of ellipsis (...)
        line = re.sub(r'(?<![\d\.])\.(?![\d\.])', r'', line)
        
        # Commas
        line = re.sub(r',', r'', line)
        
        # Colons
        line = re.sub(r':', r'', line)
        
        # Semicolons
        line = re.sub(r';', r'', line)
        
        # Step 2: Finalize placeholders to actual tags
        line = line.replace('__pause_doc__', '{{PAUSE:DOC}}')
        line = line.replace('__pause_acronym__', '{{PAUSE:ACRONYM}}')
        line = line.replace('__pause_list__', '{{PAUSE:LIST}}')
        # We don't need to replace punctuation placeholders anymore as we don't generate them
        # But for safety in case other logic adds them:
        line = line.replace('__pause_long__', '')
        line = line.replace('__pause_short__', '')
        
        annotated_lines.append(line)
    
    return '\n'.join(annotated_lines)

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
