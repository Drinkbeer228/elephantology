import os
import re

emoji_pattern = re.compile(
    r"[\U00010000-\U0010ffff]"
    r"|[\u2600-\u27bf]"
    r"|[\u2b50-\u2b55]"
    r"|[\u2300-\u23ff]",
    flags=re.UNICODE
)

def strip_emojis_from_headers():
    for root, _, files in os.walk('docs'):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                changed = False
                for i, line in enumerate(lines):
                    if line.startswith('## '):
                        # Strip emojis
                        new_line = emoji_pattern.sub('', line)
                        # Fix up multiple spaces that might remain
                        new_line = ' '.join(new_line.split()) + '\n'
                        if new_line != line:
                            # if it started with '## ' but now is just '## ', fix it
                            if new_line.startswith('##') and not new_line.startswith('## '):
                                new_line = new_line.replace('##', '## ', 1)
                            lines[i] = new_line
                            changed = True
                            
                if changed:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.writelines(lines)

strip_emojis_from_headers()
