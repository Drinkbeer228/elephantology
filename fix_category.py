import os
import re

for file in os.listdir('docs/culture'):
    if file.endswith('.md'):
        filepath = os.path.join('docs/culture', file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = re.sub(r'category:\s*\w+', 'category: culture', content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

