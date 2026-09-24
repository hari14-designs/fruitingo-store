import os

filepath = 'main.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('â‚¹', '₹')
content = content.replace('ðŸŸ¢', '🟢')
content = content.replace('ðŸŸ¡', '🟡')
content = content.replace('ðŸ”´', '🔴')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed main.js encoding')
