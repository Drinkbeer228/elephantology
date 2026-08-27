import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { searchArticles, ArticleItem } from '../lib/searchEngine';
import { CategoryDef } from './catalog/CategoryTile';
import { CategorySection } from './catalog/CategorySection';

const MONOGRAPH_CATEGORIES: CategoryDef[] = [
  { id: 'taxonomy', name: 'Таксономия и Эволюция', emoji: '🧬' },
  { id: 'anatomy', name: 'Анатомия и Физиология', emoji: '🐘' },
  { id: 'ethogram', name: 'Этология и Поведение', emoji: '🧠' },
  { id: 'veterinary', name: 'Ветеринария и Патологии', emoji: '🩺' },
  { id: 'ecology', name: 'Экология и Среда обитания', emoji: '🌍' },
  { id: 'conservation', name: 'Охрана и Сохранение видов', emoji: '🛡️' },
];

const SEMANTIC_QUESTIONS = [
  { intent: 'Как устроен слон?', link: 'anatomy/muscular-hydrostat-and-trunk-biomechanics.md' },
  { intent: 'Как он мыслит и помнит?', link: 'anatomy/neuroanatomy-brain-architecture-and-memory.md' },
  { intent: 'Как общается в стаде?', link: 'ethogram/seismic-and-infrasonic-communication.md' },
  { intent: 'Как и чем питается?', link: 'ecology/feeding-ecology-nutrition-and-geophagy.md' },
  { intent: 'Что такое период Musth?', link: 'ethogram/musth-ethology-and-endocrinology.md' },
  { intent: 'Какие болезни угрожают слонятам?', link: 'veterinary/eehv-endotheliotropic-herpesvirus-protocols.md' },
  { intent: 'Где жили предки слонов?', link: 'taxonomy/proboscidea-evolution-and-phylogeny.md' },
  { intent: 'Как слоны меняют экосистему?', link: 'ecology/ecosystem-engineers-and-keystone-ecology.md' }
];

// Парсер Markdown Frontmatter для статической загрузки
function parseArticleMarkdown(fullPath: string, rawContent: string): ArticleItem {
  const cleanPath = fullPath.replace(/^.*\/docs\//, '');
  const pathParts = cleanPath.split('/');
  const defaultCategory = pathParts.length > 1 ? pathParts[0] : 'taxonomy';
  const filename = pathParts[pathParts.length - 1];

  let title = filename.replace('.md', '');
  let category = defaultCategory;
  let excerpt = '';
  let tags: string[] = [];
  let readingTime = '12 мин';
  let evidenceLevel = 'established';

  const fmMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    
    const titleMatch = fm.match(/title:\s*["']?([^"'\n\r]+)["']?/);
    if (titleMatch) title = titleMatch[1].trim();

    const descMatch = fm.match(/description:\s*["']?([^"'\n\r]+)["']?/);
    if (descMatch) excerpt = descMatch[1].trim();

    const catMatch = fm.match(/category:\s*["']?([^"'\n\r]+)["']?/);
    if (catMatch) category = catMatch[1].trim();

    const tagsMatch = fm.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      tags = tagsMatch[1].split(',').map(t => t.trim().replace(/["']/g, '')).filter(Boolean);
    }

    const timeMatch = fm.match(/reading_time_min:\s*(\d+)/);
    if (timeMatch) readingTime = `${timeMatch[1]} мин`;

    const evMatch = fm.match(/evidence_level:\s*["']?([^"'\n\r]+)["']?/);
    if (evMatch) evidenceLevel = evMatch[1].trim();
  }

  return {
    path: cleanPath,
    filename,
    title,
    category,
    excerpt,
    tags,
    readingTime,
    evidenceLevel,
    content: rawContent
  };
}

// Статический импорт всех Markdown файлов из папки docs/
function loadStaticArticles(): ArticleItem[] {
  const mdModules = import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
  
  return Object.entries(mdModules)
    .filter(([path]) => !path.endsWith('/index.md'))
    .map(([path, content]) => parseArticleMarkdown(path, content));
}

export function ArticleCatalog({ onArticleClick }: { onArticleClick?: (path: string) => void }) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    try {
      // 1. Моментальная статическая загрузка из бандла Vite
      const staticData = loadStaticArticles();
      if (staticData.length > 0) {
        setArticles(staticData);
      }
    } catch (e) {
      console.error('Ошибка загрузки статических статей:', e);
    } finally {
      // Экран загрузки гарантированно снимается
      setLoading(false);
    }
      
    const savedFilter = sessionStorage.getItem("react_active_category");
    if (savedFilter) setActiveCategory(savedFilter);
  }, []);

  const openArticle = useCallback((path: string) => {
    if (onArticleClick) {
      onArticleClick(path);
      return;
    }
    const win = window as any;
    if (win.loadArticle) win.loadArticle(path);
  }, [onArticleClick]);
  
  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    sessionStorage.setItem("react_active_category", cat);
    setTimeout(() => {
      const articlesList = document.getElementById('articles-list-container');
      if (articlesList) {
        const y = articlesList.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (activeCategory !== 'all') {
      result = result.filter(a => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      result = searchArticles(result, searchQuery);
    }
    return result;
  }, [articles, searchQuery, activeCategory]);

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-kingdom-muted space-y-4">
        <div className="w-8 h-8 border-2 border-kingdom-gold border-t-transparent animate-spin rounded-full"></div>
        <p className="text-sm tracking-wider">Подготовка базы знаний...</p>
      </div>
    );
  }

  const categoriesToRender = activeCategory === 'all' 
    ? MONOGRAPH_CATEGORIES 
    : MONOGRAPH_CATEGORIES.filter(c => c.id === activeCategory);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-12 pb-16 pt-6">
      
      {/* Semantic Navigation Block */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Слонология</h2>
          <p className="text-gray-400">Научная энциклопедия. Что вы хотите узнать о слоне?</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {SEMANTIC_QUESTIONS.map((q, idx) => (
            <button 
              key={idx}
              onClick={() => openArticle(q.link)}
              className="flex items-center justify-between text-left p-4 rounded-xl border border-[#34384a] bg-[#181a22] hover:border-kingdom-gold hover:bg-[#242733] transition-all group cursor-pointer"
            >
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                {q.intent}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-kingdom-gold transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="space-y-6 border-t border-[#34384a] pt-10">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Каталог монографий</h2>
          <p className="text-sm text-gray-400">Исследуйте систематизированные статьи по дисциплинам.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button 
            onClick={() => handleCategoryChange('all')} 
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${activeCategory === 'all' ? 'bg-kingdom-gold text-black border-kingdom-gold shadow-[0_0_15px_rgba(255,209,102,0.2)]' : 'bg-[#181a22] border-[#34384a] text-gray-300 hover:border-kingdom-gold/50'}`}
          >
            <div className="text-xl mb-1 filter drop-shadow-md">🐘</div>
            <h3 className="font-bold text-xs">Все разделы</h3>
          </button>
          
          {MONOGRAPH_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button 
                key={cat.id} 
                onClick={() => handleCategoryChange(cat.id)} 
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isActive ? 'bg-kingdom-gold text-black border-kingdom-gold shadow-[0_0_15px_rgba(255,209,102,0.2)]' : 'bg-[#181a22] border-[#34384a] text-gray-300 hover:border-kingdom-gold/50'}`}
              >
                <div className="text-xl mb-1 filter drop-shadow-md">{cat.emoji}</div>
                <h3 className="font-bold text-xs">{cat.name.split(' и ')[0]}</h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Display */}
      <div id="articles-list-container" className="pt-2">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-[#181a22] rounded-2xl border border-[#34384a] p-8 shadow-inner">
             <div className="text-3xl text-gray-500">🐘</div>
             <p className="text-sm text-gray-300">Ничего не найдено по вашему запросу.</p>
             <button 
               onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} 
               className="px-4 py-2 bg-[#242733] text-kingdom-gold hover:text-white border border-[#34384a] rounded-xl text-xs font-bold transition-all cursor-pointer"
             >
               Сбросить фильтры
             </button>
          </div>
        ) : (
          <div className="space-y-10">
            {categoriesToRender.map(category => (
              <CategorySection 
                key={category.id}
                category={category}
                articles={filteredArticles.filter(a => a.category === category.id)}
                onArticleClick={openArticle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
