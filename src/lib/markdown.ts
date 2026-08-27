export function parseFrontmatter(md: string) {
  let frontmatter = null;
  let content = md;
  let metadata: any = {
    evidenceLevel: null,
    difficulty: null,
    lastReviewed: null,
    referenceCount: 0,
    category: null,
    tags: [],
    related_knowledge: [],
    references: []
  };

  if (md.startsWith('---')) {
    const parts = md.split('---');
    if (parts.length >= 3) {
      const fm = parts[1];
      
      const fmTitleMatch = fm.match(/^title:\s*["']?([^"'\n]+)["']?/m);
      if (fmTitleMatch) metadata.title = fmTitleMatch[1].trim();

      metadata.evidenceLevel = fm.match(/^evidence_level:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
      metadata.difficulty = fm.match(/^difficulty:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
      metadata.lastReviewed = fm.match(/^last_reviewed:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
      
      const tagsMatch = fm.match(/^tags:\s*\[(.*?)\]/m);
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
      const refMatch = fm.match(/^references:\s*([\s\S]*?)(?=^[a-z_]+:|\Z)/mi);
      if (refMatch) {
          const block = refMatch[1];
          // Each reference starts with "- id:"
          const refItems = block.split(/\n\s*-\s+id:\s*/).filter(Boolean);
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
          metadata.referenceCount = metadata.references.length;
      }

      content = parts.slice(2).join('---').trim();
    }
  }

  return { metadata, content };
}
