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
        # 1. Lists
        # Match list items (bullets or numbers)
        # ^(\s*)([-*+]|\d+\.)\s+
        # We want to insert {{PAUSE:LIST}} before the marker
        if re.match(r'^\s*([-*+]|\d+\.)\s+', line):
            line = re.sub(r'^(\s*)([-*+]|\d+\.)', r'\1{{PAUSE:LIST}}\2', line, count=1)
        
        # 2. Acronyms
        # Words with 3+ uppercase letters/numbers, allowing for some flexibility
        # Avoid matching if already annotated (though we do this first)
        # We use a lookahead to ensure we don't break things like URLs if possible, 
        # but simple regex for [A-Z]{3,} is usually safe in plain text.
        # \b([A-Z]{2,}[A-Z0-9]+)\b matches e.g. OACI, A320, but not A (too short)
        line = re.sub(r'\b([A-Z]{3,})\b', r'{{PAUSE:ACRONYM}}\1', line)
        
        # 3. OACI Docs (4 digits)
        # Matches "Doc. 4444", "Doc 4444", "Documento 4444"
        # Joins them (removes space) and adds pause marker
        # We do this before punctuation to prevent splitting "Doc." from the number
        line = re.sub(r'\b(Doc\.?|Documento)\s+(\d{4})\b', r'{{PAUSE:DOC}}\1\2', line, flags=re.IGNORECASE)
        
        # 4. Punctuation
        # Periods: Not preceded/followed by digit (3.5), not part of ellipsis (...)
        # Using negative lookbehind/ahead for digits and dots
        line = re.sub(r'(?<![\d\.])\.(?![\d\.])', r'.{{PAUSE:LONG}}', line)
        
        # Commas
        line = re.sub(r',', r',{{PAUSE:SHORT}}', line)
        
        # Colons
        line = re.sub(r':', r':{{PAUSE:LONG}}', line)
        
        # Semicolons
        line = re.sub(r';', r';{{PAUSE:LONG}}', line)
        
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
