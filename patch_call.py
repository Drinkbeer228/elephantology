import re

with open('src/main.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'showFootnoteModal(footnoteLi.innerHTML);',
    'showFootnotePopover(footnoteLi.innerHTML, link as HTMLElement);'
)

with open('src/main.tsx', 'w') as f:
    f.write(code)

print("Done call replace")
