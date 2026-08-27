import os
import re
import yaml
import glob
from pathlib import Path

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split frontmatter
    parts = re.split(r'^---\s*$', content, flags=re.MULTILINE)
    if len(parts) < 3:
        return
    
    fm_text = parts[1]
    body = parts[2]
    
    # fix quotes
    fm_text = fm_text.replace('\\"', '"')
    try:
        fm = yaml.safe_load(fm_text)
    except Exception as e:
        print(f"Error parsing YAML in {filepath}: {e}")
        return
        
    if not isinstance(fm, dict):
        fm = {}

    # Extract legacy footnotes
    footnotes = {}
    footnote_matches = re.finditer(r'^\[\^([^\]]+)\]:\s*(.+)$', body, flags=re.MULTILINE)
    for m in footnote_matches:
        footnotes[m.group(1)] = m.group(2).strip()
        
    # Remove legacy definitions
    body = re.sub(r'^\[\^([^\]]+)\]:\s*(.+)$\n?', '', body, flags=re.MULTILINE).strip()
    
    references = fm.get('references', [])
    if not isinstance(references, list):
        references = []
        
    # Clean passages from references
    for ref in references:
        if 'title' in ref and isinstance(ref['title'], str):
            ref['title'] = re.sub(r'\s*\(passage.*?\)', '', ref['title'], flags=re.IGNORECASE)

    # Process footnotes in text
    linked_articles = []
    
    def repl_footnote(m):
        fn_id = m.group(1)
        # if it's already a ref_
        if fn_id.startswith('ref_'):
            return m.group(0)
            
        if fn_id in footnotes:
            text = footnotes[fn_id]
            # Case A: .md file
            if '.md' in text:
                match = re.search(r'\[(.*?)\]\((.*?\.md)\)', text)
                if match:
                    title, link = match.groups()
                    linked_articles.append(f"* **{title}** — (см. [{title}]({link}))")
                    return f" (см. статью [«{title}»]({link}) в настоящей энциклопедии)"
                match2 = re.search(r'(.*?\.md)', text)
                if match2:
                    link = match2.group(1)
                    title = link.replace('.md', '').replace('-', ' ').title()
                    linked_articles.append(f"* **{title}** — (см. [{title}]({link}))")
                    return f" (см. статью [«{title}»]({link}) в настоящей энциклопедии)"
            
            # Case B: PDF file
            if '.pdf' in text.lower():
                pdf_match = re.search(r'([a-zA-Z0-9_]+)\-(\d{4})\-(.*?)\.pdf', text)
                ref_id = f"ref_{fn_id}"
                if pdf_match:
                    author = pdf_match.group(1).replace('_', ' ')
                    year = pdf_match.group(2)
                    title = pdf_match.group(3).replace('_', ' ')
                    references.append({"id": ref_id, "title": title, "authors": author, "year": int(year)})
                else:
                    references.append({"id": ref_id, "title": text})
                return f"[^{ref_id}]"
                
            # Case C: Traditional source
            ref_id = f"ref_{fn_id}"
            # Check if it matches existing
            matched = False
            for ref in references:
                if 'title' in ref and ref['title'][:10].lower() in text.lower():
                    ref_id = ref.get('id', ref_id)
                    matched = True
                    break
            if not matched:
                references.append({"id": ref_id, "title": text})
            return f"[^{ref_id}]"
            
        return m.group(0)

    body = re.sub(r'\[\^([^\]]+)\]', repl_footnote, body)
    
    if references:
        fm['references'] = references

    # Standardize Headings
    # 1. Evidence Badges
    body = re.sub(r'^(#+.*?)\[(ESTABLISHED|CLINICAL GUIDANCE|MODERATE EVIDENCE|HYPOTHESIS|UNDER RESEARCH)\](.*)$', 
                  r'\1\3\n> **Уровень доказательности:** [\2]', body, flags=re.MULTILINE)
                  
    # 2. Key indicators
    if '## 📊 Ключевые показатели' in body:
        # Check if table exists
        section_match = re.search(r'## 📊 Ключевые показатели\n(.*?)(?=\n## |\Z)', body, flags=re.DOTALL)
        if section_match:
            if '|' not in section_match.group(1):
                body = body.replace(section_match.group(0), '')
                
    # 3. Headings replacements
    body = re.sub(r'^## (Источники|Первоисточники.*|Библиография|Сноски.*)$', '## 📚 Литература', body, flags=re.MULTILINE|re.IGNORECASE)
    
    # 4. Fill Lead if empty
    lead_match = re.search(r'## 📌 Кратко \(Lead\)\n(.*?)(?=\n## |\Z)', body, flags=re.DOTALL)
    if lead_match:
        content_lead = lead_match.group(1).strip()
        if not content_lead or 'Вставьте краткую' in content_lead or '<!--' in content_lead:
            desc = fm.get('description', '')
            if desc:
                body = body.replace(lead_match.group(0), f"## 📌 Кратко (Lead)\n{desc}\n")

    # Linked knowledge
    if linked_articles:
        if '## 🔗 Связанные знания' not in body:
            body = re.sub(r'(## 📚 Литература)', r'## 🔗 Связанные знания\n' + '\n'.join(linked_articles) + r'\n\n\1', body)
        else:
            body = re.sub(r'(## 🔗 Связанные знания\n)', r'\1' + '\n'.join(linked_articles) + '\n', body)

    # Reconstruct
    new_fm_text = yaml.dump(fm, allow_unicode=True, default_flow_style=False, sort_keys=False)
    new_content = f"---\n{new_fm_text}---\n\n{body}\n"
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

for root, _, files in os.walk('docs'):
    for file in files:
        if file.endswith('.md'):
            process_file(os.path.join(root, file))

