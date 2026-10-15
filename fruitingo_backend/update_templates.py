import os
import re

def update_template_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add Django template load tag at the beginning
    if not content.startswith('{% load static %}'):
        content = '{% load static %}\n' + content
    
    # Replace static file references
    content = re.sub(r'href="styles.css"', 'href="{% static \'styles.css\' %}"', content)
    content = re.sub(r'href="main.js"', 'src="{% static \'main.js\' %}"', content)
    content = re.sub(r'src="main.js"', 'src="{% static \'main.js\' %}"', content)
    content = re.sub(r'src="assets/', 'src="{% static \'assets/', content)
    content = re.sub(r'href="assets/', 'href="{% static \'assets/', content)
    
    # Replace URL references with Django URL tags
    url_mappings = {
        'index.html': '{% url \'index\' %}',
        'about.html': '{% url \'about\' %}',
        'product.html': '{% url \'product\' %}',
        'contact.html': '{% url \'contact\' %}',
        'checkout.html': '{% url \'checkout\' %}',
        'AdminHomepage.html': '{% url \'admin_homepage\' %}',
        'my-account.html': '{% url \'my_account\' %}'
    }
    
    for old_url, new_url in url_mappings.items():
        content = re.sub(rf'href="{old_url}"', f'href="{new_url}"', content)
        content = re.sub(rf'href="{old_url}" class="active"', f'href="{new_url}" class="active"', content)
    
    # Add API script reference before the closing body tag
    api_script = '\n    <script src="{% static \'api.js\' %}"></script>\n'
    if '<script src="main.js"></script>' in content:
        new_script = '<script src="{% static \'api.js\' %}"></script>\n    <script src="{% static \'main.js\' %}"></script>'
        content = content.replace('<script src="main.js"></script>', new_script)
    else:
        content = content.replace('</body>', f'{api_script}</body>')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated: {file_path}")

# Update all template files
template_dir = 'templates'
for filename in os.listdir(template_dir):
    if filename.endswith('.html'):
        file_path = os.path.join(template_dir, filename)
        update_template_file(file_path)

print("All templates updated successfully!")
