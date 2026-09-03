import os
import re

directory = '.'
html_files = [f for f in os.listdir(directory) if f.endswith('.html')]

for file in html_files:
    filepath = os.path.join(directory, file)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace anything before the banana inside the div
    new_content = re.sub(r'<div class="announcement-text active" data-index="0">[^<]*?🍌 100%', '<div class="announcement-text active" data-index="0">🍌 100%', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
