import os
import re

DATA_DIR = r'src/data/modules'

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Remove "Elaborado: agosto 2023" and similar
        if re.search(r'Elaborado:\s*[a-zA-Z]+\s*\d{4}', line, re.IGNORECASE):
            continue
            
        # Remove page numbers like "## 2/65" or "2/65"
        if re.match(r'^##\s*\d+/\d+\s*$', line.strip()):
            continue
        if re.match(r'^\d+/\d+\s*$', line.strip()):
            continue
            
        # Remove lines that are just ":" followed by date
        if re.match(r'^:\s*[a-zA-Z]+\s*\d{4}$', line.strip()):
            continue
            
        cleaned_lines.append(line)
        
    new_content = '\n'.join(cleaned_lines)
    
    # Remove multiple empty lines
    new_content = re.sub(r'\n{3,}', '\n\n', new_content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Cleaned {filepath}")

def process():
    files = ['8_factores_humanos.md', '9_aerodinamica.md']
    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            clean_file(filepath)

if __name__ == "__main__":
    process()
