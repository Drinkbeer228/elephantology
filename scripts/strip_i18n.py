#!/usr/bin/env python3
"""One-off codemod: remove i18n (RU/EN switching) support, keep site Russian-only."""
import re, pathlib

root = pathlib.Path('/workspace')

def read(p): return (root / p).read_text(encoding='utf8')
def write(p, s): (root / p).write_text(s, encoding='utf8')

files = [
    'src/App.tsx', 'src/main.tsx', 'src/lib/articles.ts',
    'src/components/Header.tsx', 'src/components/SearchModal.tsx',
    'src/components/ArticleCatalog.tsx', 'src/components/ArticleBlocks.tsx',
    'src/components/ArticleViewer.tsx', 'src/components/StepTabs.tsx',
    'src/components/GlossaryTooltip.tsx', 'src/components/CitationModal.tsx',
    'src/components/catalog/CategorySection.tsx', 'src/components/catalog/CategoryTile.tsx',
    'src/components/catalog/ArticleCard.tsx',
]

# 0) main.tsx — drop provider wrapper
s = read('src/main.tsx')
s = s.replace("import { LanguageProvider } from './i18n/LanguageContext';\n", '')
s = s.replace("      <LanguageProvider>\n", "")
s = s.replace("      </LanguageProvider>\n", "")
write('src/main.tsx', s)

for f in files:
    if f == 'src/main.tsx':
        continue
    s = read(f)

    # 1) remove imports of i18n / translation modules
    s = re.sub(r"^import \{[^}]*\} from '[^']*i18n/LanguageContext';\n", '', s, flags=re.M)
    s = re.sub(r"^import \{[^}]*\} from '[^']*(articleTranslations|translateMarkdown)';\n", '', s, flags=re.M)

    # 2) remove hook lines
    s = re.sub(r"^\s*const \{[^}]*\} = useLanguage\(\);\n", '', s, flags=re.M)

    # 3) ternaries: (isEn ? 'X' : 'Y') / (lang === 'en' ? "X" : "Y") -> Y ; reversed order -> X
    pat = re.compile(r"\(\s*(?:isEn|lang\s*===\s*'en')\s*\?\s*(?P<a>'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")\s*:\s*(?P<b>'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")\s*\)")
    def pick_tern(m):
        a = m.group('a')
        # heuristic: if a contains cyrillic and b doesn't -> keep b; else keep the RU side
        cyr_a = bool(re.search(r'[А-Яа-яЁё]', a))
        b = m.group('b'); cyr_b = bool(re.search(r'[А-Яа-яЁё]', b))
        if cyr_a and not cyr_b: return b
        if cyr_b and not cyr_a: return a
        return b  # default: last (russian) branch
    s, n1 = pat.subn(pick_tern, s)

    # also without surrounding parens: isEn ? 'X' : 'Y' inside JSX expressions
    pat2 = re.compile(r"\{\s*(?:isEn|lang\s*===\s*'en')\s*\?\s*(?P<a>'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")\s*:\s*(?P<b>'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")\s*\}")
    s, n2 = pat2.subn(pick_tern, s)

    # 4) boolean-guarded blocks: {isEn && ( ... )} or {(isEn && cond) && (...)} -> delete (balanced-paren scan)
    def strip_and_blocks(text):
        out = text
        guard = re.compile(r"\{\s*\(?(?:isEn|lang\s*===\s*'en')(?:\s*&&[^)]*)?\)\s*&&\s*\(")
        while True:
            m = guard.search(out)
            if not m: break
            start = m.start()
            # find matching close paren of the block opened at m.end()-1
            depth = 0
            i = m.end() - 1
            while i < len(out):
                c = out[i]
                if c == '(': depth += 1
                elif c == ')':
                    depth -= 1
                    if depth == 0: break
                i += 1
            end = i + 1  # includes ')'
            # include trailing '}' if immediately after
            j = end
            while j < len(out) and out[j] in ' \t': j += 1
            if j < len(out) and out[j] == '}': end = j + 1
            out = out[:start] + '@@REMOVED@@' + out[end:]
        return out.replace('\n@@REMOVED@@', '').replace('@@REMOVED@@', '')
    s = strip_and_blocks(s)

    # 5) conditionals with else: lang === 'en' ? ... : ... handled above; now standalone `if (isEn...) {...}` blocks
    s = re.sub(r"[ \t]*if \(isEn(?:\s*&&[^)]*)?\)\s*\{[^{}]*\}\n", '', s)

    # 6) t. -> ru.
    s = re.sub(r"\bt\.", 'ru.', s)
    s = re.sub(r"\bru\.(a11y)\?", r'ru.\1', s)  # optional chaining no longer needed
    s = s.replace("{ru.a11y.skipToContent || 'Перейти к основному содержимому'}", "{ru.a11y.skipToContent}")

    write(f, s)
    print(f"{f}: tern={n1+n2}")

print("codemod done")
