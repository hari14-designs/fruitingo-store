import os

directory = '.'
html_files = [f for f in os.listdir(directory) if f.endswith('.html')]

for file in html_files:
    filepath = os.path.join(directory, file)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace('🍌 100%', '🍌 100%')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
