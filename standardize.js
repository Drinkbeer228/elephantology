const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // Assuming js-yaml is installed

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let parts = content.split(/^---\s*$/m);
    if (parts.length < 3) return;
    
    let fmText = parts[1];
    let body = parts.slice(2).join('---');
    
    fmText = fmText.replace(/\\"/g, '"');
    
    let fm;
    try {
        fm = yaml.load(fmText) || {};
    } catch (e) {
        console.log(`Error parsing YAML in ${filePath}: ${e}`);
        return;
    }
    
    let footnotes = {};
    let fnRegex = /^\[\^([^\]]+)\]:\s*(.+)$/gm;
    let match;
    while ((match = fnRegex.exec(body)) !== null) {
        footnotes[match[1]] = match[2].trim();
    }
    
    body = body.replace(/^\[\^([^\]]+)\]:\s*(.+)$\n?/gm, '').trim();
    
    let references = fm.references || [];
    if (!Array.isArray(references)) references = [];
    
    for (let ref of references) {
        if (ref.title && typeof ref.title === 'string') {
            ref.title = ref.title.replace(/\s*\(passage.*?\)/gi, '');
        }
    }
    
    let linkedArticles = [];
    
    body = body.replace(/\[\^([^\]]+)\]/g, (match, fn_id) => {
        if (fn_id.startsWith('ref_')) return match;
        
        if (footnotes[fn_id]) {
            let text = footnotes[fn_id];
            
            if (text.includes('.md')) {
                let m1 = text.match(/\[(.*?)\]\((.*?\.md)\)/);
                if (m1) {
                    linkedArticles.push(`* **${m1[1]}** — (см. [${m1[1]}](${m1[2]}))`);
                    return ` (см. статью [«${m1[1]}»](${m1[2]}) в настоящей энциклопедии)`;
                }
                let m2 = text.match(/(.*?\.md)/);
                if (m2) {
                    let link = m2[1];
                    let title = link.replace('.md', '').replace(/-/g, ' ');
                    linkedArticles.push(`* **${title}** — (см. [${title}](${link}))`);
                    return ` (см. статью [«${title}»](${link}) в настоящей энциклопедии)`;
                }
            }
            
            if (text.toLowerCase().includes('.pdf')) {
                let pdfMatch = text.match(/([a-zA-Z0-9_]+)\-(\d{4})\-(.*?)\.pdf/);
                let ref_id = `ref_${fn_id}`;
                if (pdfMatch) {
                    let author = pdfMatch[1].replace(/_/g, ' ');
                    let year = parseInt(pdfMatch[2], 10);
                    let title = pdfMatch[3].replace(/_/g, ' ');
                    references.push({ id: ref_id, title, authors: author, year });
                } else {
                    references.push({ id: ref_id, title: text });
                }
                return `[^${ref_id}]`;
            }
            
            let ref_id = `ref_${fn_id}`;
            let matched = false;
            for (let ref of references) {
                if (ref.title && ref.title.toLowerCase().substring(0,10) === text.toLowerCase().substring(0,10)) {
                    ref_id = ref.id || ref_id;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                references.push({ id: ref_id, title: text });
            }
            return `[^${ref_id}]`;
        }
        return match;
    });
    
    if (references.length > 0) fm.references = references;
    
    body = body.replace(/^(#+.*?)\[(ESTABLISHED|CLINICAL GUIDANCE|MODERATE EVIDENCE|HYPOTHESIS|UNDER RESEARCH)\](.*)$/gm, 
        '$1$3\n> **Уровень доказательности:** [$2]');
        
    let kpiMatch = body.match(/## 📊 Ключевые показатели\n([\s\S]*?)(?=\n## |\Z)/);
    if (kpiMatch && !kpiMatch[1].includes('|')) {
        body = body.replace(kpiMatch[0], '');
    }
    
    body = body.replace(/^## (Источники|Первоисточники.*|Библиография|Сноски.*)$/gim, '## 📚 Литература');
    
    let leadMatch = body.match(/## 📌 Кратко \(Lead\)\n([\s\S]*?)(?=\n## |\Z)/);
    if (leadMatch) {
        let contentLead = leadMatch[1].trim();
        if (!contentLead || contentLead.includes('Вставьте краткую') || contentLead.includes('<!--')) {
            let desc = fm.description || '';
            if (desc) {
                body = body.replace(leadMatch[0], `## 📌 Кратко (Lead)\n${desc}\n`);
            }
        }
    }
    
    if (linkedArticles.length > 0) {
        let linksStr = linkedArticles.join('\n');
        if (body.includes('## 🔗 Связанные знания')) {
            body = body.replace(/(## 🔗 Связанные знания\n)/, `$1${linksStr}\n`);
        } else {
            body = body.replace(/(## 📚 Литература)/, `## 🔗 Связанные знания\n${linksStr}\n\n$1`);
        }
    }
    
    let newFmText = yaml.dump(fm, { lineWidth: -1 });
    let newContent = `---\n${newFmText}---\n\n${body}\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
}

function walkDir(dir) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.md')) {
            processFile(fullPath);
        }
    }
}

walkDir('docs');
