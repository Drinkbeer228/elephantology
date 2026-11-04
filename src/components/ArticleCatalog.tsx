import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { ArticleItem } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';

type ClusterDef = {
  id: string;
  title: string;
  titleEn: string;
  keywords: string[];
};

type CategoryDef = {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  clusters: ClusterDef[];
};

export const ACADEMIC_CATEGORIES: CategoryDef[] = [
  { 
    id: 'anatomy', 
    name: 'Анатомия и Физиология', 
    nameEn: 'Anatomy and Physiology',
    icon: '🫀',
    description: 'Морфология хобота, бивней, зубной системы, опорно-двигательный аппарат и терморегуляция.', 
    descriptionEn: 'Morphology of trunk, tusks, dentition, musculoskeletal system, and thermoregulation.',
    clusters: [
      { id: 'trunk', title: 'Морфология хобота', titleEn: 'Trunk Morphology', keywords: ['muscular', 'sensory', 'respiratory', 'integumentary'] },
      { id: 'internal', title: 'Внутренние системы', titleEn: 'Internal Systems', keywords: ['cardiovascular', 'digestive', 'microbiome', 'urogenital'] },
      { id: 'skeletal', title: 'Остеология', titleEn: 'Osteology', keywords: ['skeletal', 'index'] }
    ]
  },
  { 
    id: 'ethogram', 
    name: 'Этология и Поведение', 
    nameEn: 'Ethology and Behavior',
    icon: '🐘',
    description: 'Матриархальная структура, инфразвуковая коммуникация, ритуалы и социальная иерархия.', 
    descriptionEn: 'Matriarchal structure, infrasonic communication, rituals, and social hierarchy.',
    clusters: [
      { id: 'social', title: 'Социальная структура', titleEn: 'Social Structure', keywords: ['fission', 'trauma', 'aggression', 'comprehensive'] },
      { id: 'communication', title: 'Коммуникация', titleEn: 'Communication', keywords: ['seismic', 'chemosensory'] },
      { id: 'reproduction', title: 'Размножение', titleEn: 'Reproduction', keywords: ['musth', 'inbreeding', 'index'] }
    ]
  },
  { 
    id: 'taxonomy', 
    name: 'Таксономия и Эволюция', 
    nameEn: 'Taxonomy and Evolution',
    icon: '🌳',
    description: 'Систематика хоботных, филогения, классификация видов и эволюционные ветви.', 
    descriptionEn: 'Systematics of Proboscidea, phylogeny, species classification, and evolutionary branches.',
    clusters: [
      { id: 'evolution', title: 'Эволюция Proboscidea', titleEn: 'Evolution of Proboscidea', keywords: ['proboscidea-evolution', 'proboscidea-early', 'proboscidea-paleontology', 'index'] },
      { id: 'extinct', title: 'Вымершие семейства', titleEn: 'Extinct Families', keywords: ['mammuthus', 'mammutidae', 'deinotheriidae', 'gomphotheriidae', 'palaeoloxodon'] }
    ]
  },
  { 
    id: 'veterinary', 
    name: 'Ветеринария и Патологии', 
    nameEn: 'Veterinary and Pathologies',
    icon: '🩺',
    description: 'Эндотелиотропный герпесвирус (EEHV), пододерматиты, анестезиология и превентивная медицина.', 
    descriptionEn: 'Endotheliotropic herpesvirus (EEHV), pododermatitis, anesthesiology, and preventive medicine.',
    clusters: [
      { id: 'clinical', title: 'Клиническая медицина', titleEn: 'Clinical Medicine', keywords: ['eehv', 'colic', 'immobilization', 'index'] },
      { id: 'care', title: 'Содержание и уход', titleEn: 'Care and Welfare', keywords: ['welfare', 'foot-care', 'neonatology'] }
    ]
  },
  { 
    id: 'ecology', 
    name: 'Экология и Среда обитания', 
    nameEn: 'Ecology and Habitat',
    icon: '🌿',
    description: 'Средообразующая роль мегагербиворов, дисперсия семян, зоогенная гидрология и кормовой бюджет.', 
    descriptionEn: 'Habitat-forming role of megaherbivores, seed dispersal, zoogenic hydrology, and foraging budget.',
    clusters: [
      { id: 'ecosystem', title: 'Экосистемная роль', titleEn: 'Ecosystem Role', keywords: ['engineers', 'feeding', 'paleoecology', 'index'] },
      { id: 'climate', title: 'Климат и адаптация', titleEn: 'Climate & Adaptation', keywords: ['climate', 'thermoregulation', 'cancer-resistance', 'breakdown', 'ontogeny'] }
    ]
  },
  { 
    id: 'conservation', 
    name: 'Охрана и Сохранение видов', 
    nameEn: 'Conservation and Protection',
    icon: '🛡️',
    description: 'Борьба с браконьерством, фрагментация ареалов, коридоры миграции и мониторинг популяций.', 
    descriptionEn: 'Anti-poaching, habitat fragmentation, migration corridors, and population monitoring.',
    clusters: [
      { id: 'protection', title: 'Защита популяций', titleEn: 'Population Protection', keywords: ['cites', 'ivory', 'conflict'] },
      { id: 'genetics', title: 'Генетика и миграции', titleEn: 'Genetics & Migration', keywords: ['genetics', 'connectivity', 'climate', 'translocation'] }
    ]
  },
  { 
    id: 'cognition', 
    name: 'Когнитивистика и Память', 
    nameEn: 'Cognition and Memory',
    icon: '🧠',
    description: 'Зеркальный тест самосознания, долговременная топографическая память и орудийная деятельность.', 
    descriptionEn: 'Mirror self-recognition test, long-term topographic memory, and tool use.',
    clusters: [
      { id: 'neuroanatomy', title: 'Нейроанатомия', titleEn: 'Neuroanatomy', keywords: ['neuroanatomy', 'cognitive-architecture'] },
      { id: 'behavior', title: 'Поведение и эмпатия', titleEn: 'Behavior & Empathy', keywords: ['thanatology', 'empathy', 'cooperation', 'spatial'] }
    ]
  },
  { 
    id: 'culture', 
    name: 'Антропозоология и Культура', 
    nameEn: 'Anthrozoology and Culture',
    icon: '🏛️',
    description: 'Слоны в мифологии, религиях Востока, военном деле античности и этика сосуществования.', 
    descriptionEn: 'Elephants in mythology, Eastern religions, ancient warfare, and coexistence ethics.',
    clusters: [
      { id: 'heritage', title: 'Культурное наследие', titleEn: 'Cultural Heritage', keywords: ['china', 'historical', 'sacred', 'war'] }
    ]
  },
  { 
    id: 'paleontology', 
    name: 'Палеонтология и Ископаемые', 
    nameEn: 'Paleontology and Fossils',
    icon: '🦴',
    description: 'Мамонтовая фауна, мастодонты, гомфотерии, дейнотерии и островная карликовость.', 
    descriptionEn: 'Mammoth fauna, mastodons, gomphotheres, deinotheres, and island dwarfism.',
    clusters: [
      { id: 'fossils', title: 'Ископаемые находки', titleEn: 'Fossil Discoveries', keywords: ['isotopic', 'paleogenomics', 'paleopathology'] }
    ]
  },
  { 
    id: 'genomics', 
    name: 'Геномика и Молекулярная биология', 
    nameEn: 'Genomics and Molecular Biology',
    icon: '🔬',
    description: 'Парадокс Пето, ген TP53, древняя ДНК мамонтов и эпигенетические адаптации.', 
    descriptionEn: "Peto's paradox, TP53 duplication, ancient mammoth DNA, and epigenetic adaptations.",
    clusters: [
      { id: 'molecular', title: 'Молекулярная генетика', titleEn: 'Molecular Genetics', keywords: ['epigenetic', 'mhc'] }
    ]
  }
];

function assignToCluster(filename: string, clusters: ClusterDef[]): string {
  if (!clusters || clusters.length === 0) return 'general';
  for (const c of clusters) {
    if (c.keywords.some(kw => filename.includes(kw))) {
      return c.id;
    }
  }
  return clusters[0].id;
}

interface CatalogArticleCardProps {
  article: ArticleItem;
  onClick: () => void;
}

const CatalogArticleCard = React.memo(function CatalogArticleCard({ article, onClick }: CatalogArticleCardProps) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="group flex flex-col justify-between py-5 border-b border-[#DFDCD4] bg-transparent hover:bg-[#EFECE6]/50 px-3 transition-colors duration-150 text-left cursor-pointer w-full"
    >
      <div className="space-y-1.5 w-full">
        <h4 className="text-lg font-medium text-[#141413] group-hover:text-[#1E4631] transition-colors leading-snug font-serif">
          {article.title}
        </h4>
        {article.excerpt && (
          <p className="text-sm text-[#6E6B64] leading-relaxed line-clamp-2 font-normal">
            {article.excerpt}
          </p>
        )}
      </div>
    </motion.button>
  );
});

export function ArticleCatalog({ onArticleClick }: { onArticleClick?: (path: string) => void }) {
  const { lang } = useLanguage();
  const articles = useMemo(() => getStaticArticles(lang), [lang]);

  const [activeDiscipline, setActiveDiscipline] = useState<string>(ACADEMIC_CATEGORIES[0].id);
  const [activeCluster, setActiveCluster] = useState<string>('all');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const openArticle = useCallback((path: string) => {
    setMobileDrawerOpen(false);
    if (onArticleClick) {
      onArticleClick(path);
      return;
    }
    const win = window as any;
    if (win.loadArticle) win.loadArticle(path);
  }, [onArticleClick]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  const activeCategory = useMemo(() => {
    return ACADEMIC_CATEGORIES.find(c => c.id === activeDiscipline) || ACADEMIC_CATEGORIES[0];
  }, [activeDiscipline]);

  const disciplineArticles = useMemo(() => {
    return articles.filter(a => a.category === activeCategory.id);
  }, [articles, activeCategory.id]);

  const displayedArticles = useMemo(() => {
    if (activeCluster === 'all') {
      return disciplineArticles;
    }
    return disciplineArticles.filter(a => {
      const assigned = assignToCluster(a.filename, activeCategory.clusters);
      return assigned === activeCluster;
    });
  }, [disciplineArticles, activeCluster, activeCategory.clusters]);

  const handleDisciplineSelect = (id: string, isMobile = false) => {
    setActiveDiscipline(id);
    setActiveCluster('all');
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const activeCategoryTitle = lang === 'en' && activeCategory.nameEn ? activeCategory.nameEn : activeCategory.name;
  const activeCategoryDesc = lang === 'en' && activeCategory.descriptionEn ? activeCategory.descriptionEn : activeCategory.description;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-6 px-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: Disciplines list */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
          <div className="border-b border-[#DFDCD4] pb-3 mb-4">
            <span className="text-xs font-semibold text-[#6E6B64] uppercase tracking-wider font-mono">
              ДИСЦИПЛИНЫ
            </span>
          </div>

          <div className="space-y-1">
            {ACADEMIC_CATEGORIES.map((disc) => {
              const isActive = activeDiscipline === disc.id;
              const discTitle = lang === 'en' && disc.nameEn ? disc.nameEn : disc.name;

              return (
                <button
                  key={disc.id}
                  onClick={() => {
                    const isMobile = window.innerWidth < 1024;
                    handleDisciplineSelect(disc.id, isMobile);
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-none border transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#EFECE6] border-[#141413] text-[#141413] font-bold font-serif'
                      : 'bg-transparent border-transparent text-[#6E6B64] hover:text-[#141413] hover:bg-[#EFECE6]/50'
                  }`}
                >
                  <span className="text-sm tracking-tight">{discTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Articles Journal List */}
        <div className="hidden lg:block lg:col-span-8 xl:col-span-8">
          <div className="flex flex-col min-h-[640px]">
            
            {/* Category Header */}
            <div className="pb-6 border-b border-[#DFDCD4]">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight mb-2 font-serif">
                {activeCategoryTitle}
              </h3>
              <p className="text-sm text-[#6E6B64] leading-relaxed max-w-xl">
                {activeCategoryDesc}
              </p>
            </div>

            {/* Sub-theme Filter Tabs */}
            {activeCategory.clusters && activeCategory.clusters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-6 pb-6 border-b border-[#DFDCD4] mb-6">
                <button
                  onClick={() => setActiveCluster('all')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-none border transition-colors cursor-pointer ${
                    activeCluster === 'all'
                      ? 'bg-[#141413] text-[#F6F5F0] border-[#141413] font-semibold'
                      : 'bg-[#F6F5F0] text-[#6E6B64] hover:text-[#141413] border-[#DFDCD4]'
                  }`}
                >
                  Все разделы
                </button>
                {activeCategory.clusters.map((cluster) => {
                  const isClusterActive = activeCluster === cluster.id;
                  const clusterTitle = lang === 'en' && cluster.titleEn ? cluster.titleEn : cluster.title;

                  return (
                    <button
                      key={cluster.id}
                      onClick={() => setActiveCluster(cluster.id)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-none border transition-colors cursor-pointer ${
                        isClusterActive
                          ? 'bg-[#141413] text-[#F6F5F0] border-[#141413] font-semibold'
                          : 'bg-[#F6F5F0] text-[#6E6B64] hover:text-[#141413] border-[#DFDCD4]'
                      }`}
                    >
                      {clusterTitle}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Articles Journal Grid / List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {displayedArticles.length === 0 ? (
                <div className="p-12 text-center text-[#6E6B64] text-sm border border-[#DFDCD4] my-8 rounded-none">
                  В этом разделе пока нет материалов.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-2">
                  {displayedArticles.map((article) => (
                    <CatalogArticleCard
                      key={article.path}
                      article={article}
                      onClick={() => openArticle(article.path)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET DRAWER (< lg) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-h-[85vh] bg-[#F6F5F0] border-t border-[#DFDCD4] shadow-2xl flex flex-col rounded-none overflow-hidden"
            >
              <div className="w-12 h-1 bg-[#DFDCD4] mx-auto my-3 shrink-0" />

              <div className="px-5 pb-3 border-b border-[#DFDCD4] flex items-center justify-between gap-3 shrink-0">
                <h3 className="font-bold text-base text-[#141413] truncate font-serif">
                  {activeCategoryTitle}
                </h3>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-none bg-[#EFECE6] hover:bg-[#DFDCD4] text-[#141413] transition-colors cursor-pointer"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
                {displayedArticles.length === 0 ? (
                  <div className="p-8 text-center text-[#6E6B64] text-xs border border-[#DFDCD4] rounded-none">
                    Нет статей в этом разделе.
                  </div>
                ) : (
                  displayedArticles.map((article) => (
                    <CatalogArticleCard
                      key={article.path}
                      article={article}
                      onClick={() => openArticle(article.path)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
