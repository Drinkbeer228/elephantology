import re

with open('src/main.tsx', 'r') as f:
    code = f.read()

# Add metadata.tags definition
code = code.replace(
    'category: safePath.split(\'/\')[0] || null',
    'category: safePath.split(\'/\')[0] || null,\n      tags: []'
)

# Parse tags from frontmatter
tags_parsing = """
        const tagsMatch = fm.match(/^tags:\s*\[(.*?)\]/m);
        if (tagsMatch) {
            metadata.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
        }
"""
code = code.replace(
    'md = parts.slice(2).join(\'---\').trim();',
    tags_parsing + '\n        md = parts.slice(2).join(\'---\').trim();'
)

# Insert related articles fetching before marked.parse
related_articles_code = """
    // Add related articles block
    try {
        const articlesRes = await fetch('/api/articles');
        if (articlesRes.ok) {
            const allArticles = await articlesRes.json();
            const currentTags = metadata.tags || [];
            
            const related = allArticles
                .filter((a: any) => a.path !== safePath && a.tags)
                .map((a: any) => {
                    const intersection = a.tags.filter((t: string) => currentTags.includes(t)).length;
                    return { ...a, matchCount: intersection };
                })
                .filter((a: any) => a.matchCount > 0)
                .sort((a: any, b: any) => b.matchCount - a.matchCount)
                .slice(0, 3);
                
            if (related.length > 0) {
                let relatedHtml = `<div class="mt-16 pt-8 border-t border-[#34384a]">`;
                relatedHtml += `<h3 class="text-lg font-bold text-white mb-4">С этим связано:</h3>`;
                relatedHtml += `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">`;
                related.forEach((a: any) => {
                    // Extract emoji from the UI category if possible, or fallback
                    const catMapEmoji: any = { ecology: '🌍', anatomy: '🐘', ethogram: '🧠', veterinary: '🩺', taxonomy: '🧬', conservation: '🛡️' };
                    const emoji = catMapEmoji[a.category] || '📖';
                    
                    relatedHtml += `
                      <a href="javascript:void(0)" onclick="window.loadArticle('${a.path}')" class="block p-4 rounded-xl border border-[#34384a] bg-[#181a22] hover:border-kingdom-gold hover:bg-[#242733] transition-all group">
                        <div class="text-2xl mb-2 filter drop-shadow-md">${emoji}</div>
                        <h4 class="font-bold text-sm text-gray-300 group-hover:text-white mb-1 line-clamp-2">${a.title}</h4>
                      </a>`;
                });
                relatedHtml += `</div></div>`;
                html += relatedHtml;
            }
        }
    } catch (e) {
        console.error("Could not fetch related articles", e);
    }
"""

code = code.replace(
    'const contentEl = document.getElementById(\'article-prose-content\');',
    related_articles_code + '\n    const contentEl = document.getElementById(\'article-prose-content\');'
)

with open('src/main.tsx', 'w') as f:
    f.write(code)

print("Done patching related")
