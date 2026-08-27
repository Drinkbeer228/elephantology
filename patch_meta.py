import re

with open('src/main.tsx', 'r') as f:
    code = f.read()

# Evidence level subtle
code = code.replace(
    'bg-kingdom-gold/15 text-kingdom-gold px-2 py-0.5 rounded border border-kingdom-gold/30 font-bold',
    'bg-[#242733] text-gray-400 px-2 py-0.5 rounded border border-[#34384a] font-medium'
)

# Breadcrumbs
breadcrumb_logic = """    const catMapTitle: any = { ecology: 'Экология', anatomy: 'Анатомия', ethogram: 'Этология', veterinary: 'Ветеринария', taxonomy: 'Таксономия', conservation: 'Охрана' };
    const breadcrumbCategory = catMapTitle[metadata.category] || 'Каталог';
    
    let breadcrumbHtml = `<nav class="flex items-center gap-2 mb-6 text-[11px] font-mono tracking-wider text-gray-500 uppercase flex-wrap">
        <a href="javascript:void(0)" onclick="window.showHome()" class="hover:text-kingdom-gold transition-colors">Главная</a>
        <span class="text-gray-700">/</span>
        <span class="text-gray-400">${breadcrumbCategory}</span>
        <span class="text-gray-700">/</span>
        <span class="text-gray-300 truncate max-w-[150px] sm:max-w-xs">${title}</span>
    </nav>`;
    
    html = breadcrumbHtml + html;
"""

code = code.replace('let html = await marked.parse(md);', 'let html = await marked.parse(md);\n' + breadcrumb_logic)

with open('src/main.tsx', 'w') as f:
    f.write(code)

print("Done meta patch")
