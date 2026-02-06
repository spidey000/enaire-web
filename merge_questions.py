import json
import os

original_file = 'src/data/mcq/mcq_modulo5_navegacion.json'
new_file = 'src/data/mcq/new_questions_mod5_part2.json'

with open(original_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(new_file, 'r', encoding='utf-8') as f:
    new_questions = json.load(f)

# Append new questions
data['mcq_set'].extend(new_questions)

# Save back to original file
with open(original_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(new_questions)} questions to {original_file}. Total questions: {len(data['mcq_set'])}")

# Clean up
os.remove(new_file)
