import os
import re

directory = '.'
html_files = [f for f in os.listdir(directory) if f.endswith('.html')]

for file in html_files:
    filepath = os.path.join(directory, file)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the announcement bar and header block
    # We'll use regex to match the announcement bar and header start tag
    pattern = re.compile(r'(<!-- Premium Announcement Bar -->\s*<div class="announcement-bar">.*?</div>\s*)<!-- Header Navigation -->\s*<header[^>]*>', re.DOTALL)
    
    def replacement(match):
        announcement_html = match.group(1)
        header_tag = match.group(0).replace(announcement_html, '')
        
        # fix the emoji
        announcement_html = announcement_html.replace('<div class="announcement-text active" data-index="0"> 100%', '<div class="announcement-text active" data-index="0">🍌 100%')
        announcement_html = announcement_html.replace('<div class="announcement-text active" data-index="0"> 100%', '<div class="announcement-text active" data-index="0">🍌 100%')
        
        return header_tag + '\n    ' + announcement_html.strip() + '\n'

    new_content = pattern.sub(replacement, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")

# Update CSS
css_path = 'styles.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Fix announcement bar colors
css = css.replace('background-color: #0B5D3B;', 'background-color: #184C3A;')
css = css.replace('color: #F8FAF8;', 'color: #FFF7E8;')

# Remove body > .announcement-bar + header block
css = re.sub(r'/\* Add announcement bar to all pages \*/\s*body > \.announcement-bar \+ header \{\s*top: 50px;\s*\}', '', css)

# Fix body > header
css = re.sub(r'(body > header \{.*?)(display:\s*flex;)(\s*)(align-items:\s*center;)', r'\1display: flex;\3flex-direction: column;', css, flags=re.DOTALL)
css = re.sub(r'backdrop-filter:\s*blur\(20px\);\s*', '', css)
css = re.sub(r'-webkit-backdrop-filter:\s*blur\(20px\);\s*', '', css)
css = css.replace('height: 60px; /* Increased for logo image */', '')
css = css.replace('height: 60px;', '') # For media query

# Ensure header-container has height 60px and white bg
css = re.sub(r'(\.header-container \{.*?)(height:\s*100%;)', r'\1height: 60px;\n    background-color: var(--white);', css, flags=re.DOTALL)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated styles.css")

# Update JS
js_path = 'main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

new_js = js.replace('''    function showNextMessage() {
        if (isPaused) {
            animationTimeout = setTimeout(showNextMessage, 100);
            return;
        }

        // Hide current message
        messages.forEach(msg => msg.classList.remove('active'));

        // Show next message
        messages[currentIndex].classList.add('active');

        // Move to next index
        currentIndex = (currentIndex + 1) % messages.length;

        // Schedule next message (2.7 seconds total per message: 0.6s slide + 2.3s pause + 0.4s fade)
        animationTimeout = setTimeout(showNextMessage, 2700);
    }

    // Start the animation
    showNextMessage();''', '''    function handleAnimationEnd(e) {
        if (e.animationName === 'fadeOut') {
            messages[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % messages.length;
            messages[currentIndex].classList.add('active');
        }
    }

    messages.forEach(msg => {
        msg.addEventListener('animationend', handleAnimationEnd);
    });''')
new_js = re.sub(r'    let isPaused = false;\n    let animationTimeout;\n\n', '', new_js)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(new_js)
print("Updated main.js")
