import { ArticleItem } from './searchEngine';
import { parseFrontmatter } from './markdown';

export function getStaticArticles(): ArticleItem[] {
  const modules = import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
  
  return Object.entries(modules)
    .filter(([filePath]) => 
      !filePath.includes('/assets/') &&
      !filePath.endsWith('index.md') && 
      !filePath.endsWith('glossary.md') && 
      !filePath.endsWith('bibliography.md')
    )
    .map(([filePath, contentObj]) => {
    const textContent = typeof contentObj === 'string' ? contentObj : (contentObj as any).default || '';
    const { metadata, content: cleanContent } = parseFrontmatter(textContent);

    let category = metadata.category;
    if (!category) {
      const parts = filePath.split('/');
      if (parts.length >= 3) {
        category = parts[parts.length - 2];
      }
    }

    let title = metadata.title;
    if (!title) {
      const filename = filePath.split('/').pop() || '';
      title = filename.replace('.md', '').replace(/_/g, ' ');
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    const filename = filePath.split('/').pop() || '';
    const pathPart = category ? `${category}/${filename}` : filename;

    return {
      path: pathPart,
      filename,
      title,
      excerpt: metadata.excerpt || '',
      category: category || '',
      tags: metadata.tags || [],
      reading_time_min: metadata.readingTimeMin || 5,
      evidence_level: metadata.evidenceLevel || '',
      content: cleanContent
    };
  });
}
