with open('src/main.tsx', 'r') as f:
    code = f.read()

# Replace actual newlines within the regex literals
code = code.replace(r'([^"\'\n]+)', r'([^"\'\\n]+)')

code = code.replace("""const fmTitleMatch = fm.match(/^title:\\s*["']?([^"'
]+)["']?/m);""", """const fmTitleMatch = fm.match(/^title:\\s*["']?([^"'\\\\n]+)["']?/m);""")

code = code.replace("""metadata.evidenceLevel = fm.match(/^evidence_level:\\s*["']?([^"'
]+)["']?/m)?.[1]?.trim() || null;""", """metadata.evidenceLevel = fm.match(/^evidence_level:\\s*["']?([^"'\\\\n]+)["']?/m)?.[1]?.trim() || null;""")

code = code.replace("""metadata.difficulty = fm.match(/^difficulty:\\s*["']?([^"'
]+)["']?/m)?.[1]?.trim() || null;""", """metadata.difficulty = fm.match(/^difficulty:\\s*["']?([^"'\\\\n]+)["']?/m)?.[1]?.trim() || null;""")

code = code.replace("""metadata.lastReviewed = fm.match(/^last_reviewed:\\s*["']?([^"'
]+)["']?/m)?.[1]?.trim() || null;""", """metadata.lastReviewed = fm.match(/^last_reviewed:\\s*["']?([^"'\\\\n]+)["']?/m)?.[1]?.trim() || null;""")

with open('src/main.tsx', 'w') as f:
    f.write(code)

print("Done")
