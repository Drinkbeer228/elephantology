import re

with open('404.html', 'r', encoding='utf-8') as f:
    content = f.read()

# wait, 404.html doesn't have it. Let's try git log... wait no git.
