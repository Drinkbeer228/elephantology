import { load } from 'js-yaml';
import { ArticleMetadata, ReferenceItem, RelatedKnowledgeItem } from '../types';

export function parseFrontmatter(md: string): { metadata: ArticleMetadata; content: string } {
  let content = typeof md === 'string' ? md : '';
  const metadata: ArticleMetadata = {
    title: undefined,
    excerpt: undefined,
    evidenceLevel: undefined,
    evidenceBasis: undefined,
    difficulty: undefined,
    datePublished: undefined,
    lastReviewed: undefined,
    authors: undefined,
    referenceCount: 0,
    category: undefined,
    tags: [],
    related_knowledge: [],
    references: [],
    readingTimeMin: 5
  };

  if (typeof md === 'string' && md.startsWith('---')) {
    const parts = md.split(/^---\s*$/m);
    if (parts.length >= 3) {
      const fmText = parts[1];
      content = parts.slice(2).join('---').trim();

      try {
        const parsedFm = (load(fmText) || {}) as Record<string, any>;
        
        if (parsedFm.title) metadata.title = String(parsedFm.title).trim();
        if (parsedFm.description || parsedFm.excerpt) {
          metadata.excerpt = String(parsedFm.description || parsedFm.excerpt).trim();
        }
        if (parsedFm.category) metadata.category = String(parsedFm.category).trim();
        if (parsedFm.difficulty) metadata.difficulty = String(parsedFm.difficulty).trim();
        
        if (parsedFm.evidence_level || parsedFm.evidenceLevel) {
          metadata.evidenceLevel = String(parsedFm.evidence_level || parsedFm.evidenceLevel).trim();
        }

        if (Array.isArray(parsedFm.evidence_basis || parsedFm.evidenceBasis)) {
          metadata.evidenceBasis = (parsedFm.evidence_basis || parsedFm.evidenceBasis).map((b: any) => String(b).trim()).filter(Boolean);
        }

        // Strict separation of publication date vs last reviewed date
        if (parsedFm.date_published || parsedFm.datePublished) {
          metadata.datePublished = String(parsedFm.date_published || parsedFm.datePublished).trim();
        }
        if (parsedFm.last_reviewed || parsedFm.lastReviewed) {
          metadata.lastReviewed = String(parsedFm.last_reviewed || parsedFm.lastReviewed).trim();
        }
        if (parsedFm.authors || parsedFm.author) {
          metadata.authors = String(parsedFm.authors || parsedFm.author).trim();
        }
        if (parsedFm.reading_time_min || parsedFm.readingTimeMin) {
          metadata.readingTimeMin = parseInt(parsedFm.reading_time_min || parsedFm.readingTimeMin, 10) || 5;
        }

        // Tags parsing
        if (Array.isArray(parsedFm.tags)) {
          metadata.tags = parsedFm.tags.map((t: any) => String(t).trim()).filter(Boolean);
        } else if (typeof parsedFm.tags === 'string') {
          metadata.tags = parsedFm.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        } else if (Array.isArray(parsedFm.keywords)) {
          metadata.tags = parsedFm.keywords.map((t: any) => String(t).trim()).filter(Boolean);
        }

        // Related knowledge parsing
        if (Array.isArray(parsedFm.related_knowledge)) {
          parsedFm.related_knowledge.forEach((item: any) => {
            if (typeof item === 'string') {
              const target = item.trim().replace(/^\//, '');
              metadata.related_knowledge?.push({ type: 'article', target });
            } else if (item && typeof item === 'object') {
              const target = (item.target || item.path || item.link || '').trim().replace(/^\//, '');
              const type = item.type || 'article';
              if (target) metadata.related_knowledge?.push({ type, target });
            }
          });
        }

        // References parsing
        if (Array.isArray(parsedFm.references)) {
          const refs: ReferenceItem[] = [];
          parsedFm.references.forEach((ref: any, idx: number) => {
            if (typeof ref === 'string') {
              refs.push({
                id: `ref_${idx + 1}`,
                title: ref.trim()
              });
            } else if (ref && typeof ref === 'object') {
              const cleanTitle = ref.title ? String(ref.title).replace(/\s*\(passage.*?\)/gi, '').trim() : '';
              refs.push({
                id: ref.id ? String(ref.id) : `ref_${idx + 1}`,
                title: cleanTitle,
                authors: ref.authors ? String(ref.authors).trim() : undefined,
                year: ref.year ? String(ref.year).trim() : undefined,
                doi: ref.doi ? String(ref.doi).trim() : undefined,
                isbn: ref.isbn ? String(ref.isbn).trim() : undefined,
                journal: ref.journal ? String(ref.journal).trim() : undefined,
                book: ref.book ? String(ref.book).trim() : undefined,
                url: ref.url ? String(ref.url).trim() : undefined
              });
            }
          });
          metadata.references = refs;
          metadata.referenceCount = refs.length;
        }
      } catch (err) {
        console.warn('YAML parsing fallback for markdown frontmatter:', err);
      }
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
    const leadMatch = content.match(/##\s*📌\s*Кратко\s*\(Lead\)\s*\n([\s\S]*?)(?=\n##|\Z)/i);
    if (leadMatch && leadMatch[1].trim()) {
      metadata.excerpt = leadMatch[1].trim().substring(0, 200).replace(/[\*\_`#]/g, '');
    } else {
      const pMatch = content.match(/^(?!#|>|-|\*)\s*([^\r\n]+)/m);
      if (pMatch && pMatch[1]) {
        metadata.excerpt = pMatch[1].trim().substring(0, 150) + '...';
      }
    }
  }

  return { metadata, content };
}
