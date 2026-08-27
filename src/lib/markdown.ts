export function parseFrontmatter(md: string) {
  let frontmatter = null;
  let content = typeof md === 'string' ? md : '';
  let metadata: any = {
    title: null,
    excerpt: null,
    evidenceLevel: null,
    difficulty: null,
    lastReviewed: null,
    referenceCount: 0,
    category: null,
    tags: [],
    related_knowledge: [],
    references: [],
    readingTimeMin: 5
  };

  if (typeof md === 'string' && md.startsWith('---')) {
    const parts = md.split('---');
    if (parts.length >= 3) {
      const fm = parts[1];
      
      const fmTitleMatch = fm.match(/^title:\s*["']?([^"'\n]+)["']?/m);
      if (fmTitleMatch) metadata.title = fmTitleMatch[1].trim();

      const fmExcerptMatch = fm.match(/^excerpt:\s*["']?([^"'\n]+)["']?/m) || fm.match(/^description:\s*["']?([^"'\n]+)["']?/m);
      if (fmExcerptMatch) metadata.excerpt = fmExcerptMatch[1].trim();
      
      metadata.category = fm.match(/^category:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
      
      const rtMatch = fm.match(/^reading_time_min:\s*(\d+)/m);
      if (rtMatch) metadata.readingTimeMin = parseInt(rtMatch[1], 10);

      metadata.evidenceLevel = fm.match(/^evidence_level:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
      metadata.difficulty = fm.match(/^difficulty:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
      metadata.lastReviewed = fm.match(/^last_reviewed:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
      
      const tagsMatch = fm.match(/^tags:\s*\[(.*?)\]/m) || fm.match(/^keywords:\s*\[(.*?)\]/m);
      if (tagsMatch) {
          metadata.tags = tagsMatch[1].split(',').map((t: string) => t.trim().replace(/['"]/g, ''));
      }

      const rkMatch = fm.match(/^related_knowledge:\s*([\s\S]*?)(?=^[a-z_]+:|\Z)/mi);
      if (rkMatch) {
          const block = rkMatch[1];
          const items = block.split(/\n\s*-\s*/).filter(Boolean);
          items.forEach(item => {
              const typeMatch = item.match(/type:\s*([a-zA-Z_]+)/);
              const targetMatch = item.match(/target:\s*["']?([^"'\n]+)["']?/);
              if (typeMatch && targetMatch) {
                  let target = targetMatch[1].trim();
                  if (target.startsWith('/')) target = target.substring(1);
                  metadata.related_knowledge.push({ type: typeMatch[1].trim(), target });
              }
          });
      }

      // Parse references block
      const refMatch = fm.match(/^references:\s*([\s\S]*?)(?=^[a-z_]+:|(?![\s\S]))/mi);
      if (refMatch) {
          const block = refMatch[1];
          // Check if references are in YAML dict format (- id: ...) or simple list (- Author, Year)
          if (block.includes('- id:')) {
              const refItems = block.split(/(?:^|\n)\s*-\s+id:\s*/).filter(Boolean);
              refItems.forEach(item => {
                 const lines = item.split('\n').map(l => l.trim()).filter(Boolean);
                 let refObj: any = { id: lines[0].trim() };
                 lines.slice(1).forEach(l => {
                     const kv = l.split(':');
                     if (kv.length >= 2) {
                         const key = kv[0].trim();
                         const val = kv.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
                         refObj[key] = val;
                     }
                 });
                 metadata.references.push(refObj);
              });
          } else {
              // Simple list format: - Author, Year or - Full Citation string
              const lines = block.split(/\n\s*-\s+/).filter(Boolean);
              lines.forEach((line, idx) => {
                 const clean = line.trim().replace(/^["']|["']$/g, '');
                 if (clean) {
                   metadata.references.push({
                     id: `ref-${idx + 1}`,
                     title: clean
                   });
                 }
              });
          }
          metadata.referenceCount = metadata.references.length;
      }
      content = parts.slice(2).join('---').trim();
    }
  }

  // Fallbacks
  if (!metadata.title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      metadata.title = h1Match[1].trim().replace(/^["']|["']$/g, '').replace(/\{.*?\}/g, '').replace(/[\*\_`#]/g, '').trim();
    }
  }

  if (!metadata.excerpt) {
    const pMatch = content.match(/^(?!#|>|-|\*)\s*([^\r\n]+)/m);
    if (pMatch && pMatch[1]) {
      metadata.excerpt = pMatch[1].trim().substring(0, 150) + '...';
    }
  }

  return { metadata, content };
}
