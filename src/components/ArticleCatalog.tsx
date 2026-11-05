import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpRight, Search, BookOpen, FileText } from 'lucide-react';
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
  code: string;
  name: string;
  nameEn: string;
  latinSubtitle: string;
  description: string;
  descriptionEn: string;
  clusters: ClusterDef[];
};

export const ACADEMIC_CATEGORIES: CategoryDef[] = [
  { 
    id: 'anatomy',
    code: '01',
    name: 'Анатомия и Физиология', 
    nameEn: 'Anatomy & Physiology',
    latinSubtitle: 'Morphologia & Biomechanica',
    description: 'Биомеханика мышечного гидростата хобота, остеология черепа, полифиодонтия, кардиодинамика и терморегуляция.', 
    descriptionEn: 'Biomechanics of the trunk muscular hydrostat, cranial osteology, polyphyodonty, cardiodynamics, and thermoregulation.',
    clusters: [
      { id: 'trunk', title: 'Морфология хобота и сенсорика', titleEn: 'Trunk & Sensory', keywords: ['muscular', 'sensory', 'respiratory', 'integumentary'] },
      { id: 'internal', title: 'Висцеральные системы', titleEn: 'Visceral Systems', keywords: ['cardiovascular', 'digestive', 'microbiome', 'urogenital'] },
      { id: 'skeletal', title: 'Остеология и дентиция', titleEn: 'Osteology & Dentition', keywords: ['skeletal', 'index'] }
    ]
  },
  { 
    id: 'ethogram',
    code: '02',
    name: 'Этология и Поведение', 
    nameEn: 'Ethology & Behavior',
    latinSubtitle: 'Ethologia & Sociobiologia',
    description: 'Матриархальная динамика fission-fusion, инфразвуковая и сейсмическая коммуникация, эндокринология муста и социальное обучение.', 
    descriptionEn: 'Fission-fusion matriarchal dynamics, infrasonic and seismic communication, musth endocrinology, and social learning.',
    clusters: [
      { id: 'social', title: 'Социальная структура', titleEn: 'Social Structure', keywords: ['fission', 'trauma', 'aggression', 'comprehensive'] },
      { id: 'communication', title: 'Сейсмика и хемосенсорика', titleEn: 'Communication', keywords: ['seismic', 'chemosensory'] },
      { id: 'reproduction', title: 'Репродуктивная этология', titleEn: 'Reproductive Ethology', keywords: ['musth', 'inbreeding', 'index'] }
    ]
  },
  { 
    id: 'taxonomy',
    code: '03',
    name: 'Таксономия и Эволюция', 
    nameEn: 'Taxonomy & Evolution',
    latinSubtitle: 'Systematica Proboscidea',
    description: 'Филогения отряда Proboscidea от палеоценовых базальных форм до плейстоценовой радиации, островной карликовости и гигантизма.', 
    descriptionEn: 'Phylogeny of Order Proboscidea from Paleocene stem groups to Pleistocene radiation, insular dwarfism, and gigantism.',
    clusters: [
      { id: 'evolution', title: 'Филогения Proboscidea', titleEn: 'Proboscidea Phylogeny', keywords: ['proboscidea-evolution', 'proboscidea-early', 'proboscidea-paleontology', 'index'] },
      { id: 'extinct', title: 'Вымершие клады', titleEn: 'Extinct Clades', keywords: ['mammuthus', 'mammutidae', 'deinotheriidae', 'gomphotheriidae', 'palaeoloxodon'] }
    ]
  },
  { 
    id: 'veterinary',
    code: '04',
    name: 'Ветеринария и Патологии', 
    nameEn: 'Veterinary Medicine',
    latinSubtitle: 'Medicina Veterinaria',
    description: 'Протоколы терапии эндотелиотропного герпесвируса (EEHV), ортопедическая подиатрия, химическая иммобилизация и неонатология.', 
    descriptionEn: 'Endotheliotropic herpesvirus (EEHV) treatment protocols, clinical podiatry, chemical immobilization, and neonatology.',
    clusters: [
      { id: 'clinical', title: 'Интенсивная терапия и анестезия', titleEn: 'Clinical Protocols', keywords: ['eehv', 'colic', 'immobilization', 'index'] },
      { id: 'care', title: 'Подиатрия и благополучие', titleEn: 'Podiatry & Welfare', keywords: ['welfare', 'foot-care', 'neonatology'] }
    ]
  },
  { 
    id: 'ecology',
    code: '05',
    name: 'Экология и Биоценозы', 
    nameEn: 'Ecology & Biomes',
    latinSubtitle: 'Oecologia Megafaunae',
    description: 'Средообразующая инженерия мегагербиворов, трофические каскады, минеральная геофагия и биофизика теплового стресса.', 
    descriptionEn: 'Keystone ecosystem engineering by megaherbivores, trophic cascades, mineral geophagy, and thermal stress biophysics.',
    clusters: [
      { id: 'ecosystem', title: 'Экосистемная инженерия', titleEn: 'Ecosystem Engineering', keywords: ['engineers', 'feeding', 'paleoecology', 'index'] },
      { id: 'climate', title: 'Адаптация и демография', titleEn: 'Adaptation & Life History', keywords: ['climate', 'thermoregulation', 'cancer-resistance', 'breakdown', 'ontogeny'] }
    ]
  },
  { 
    id: 'conservation',
    code: '06',
    name: 'Охрана и Криминалистика', 
    nameEn: 'Conservation & Forensics',
    latinSubtitle: 'Conservatio & Genetica Forensis',
    description: 'Мониторинг CITES MIKE/ETIS, изотопная и ДНК-криминалистика бивней, разрешение конфликтов (HEC) и экологические коридоры.', 
    descriptionEn: 'CITES MIKE/ETIS monitoring, isotopic and DNA ivory forensics, human-elephant conflict mitigation, and connectivity corridors.',
    clusters: [
      { id: 'protection', title: 'Мониторинг и антибраконьерство', titleEn: 'Anti-Poaching & Forensics', keywords: ['cites', 'ivory', 'conflict'] },
      { id: 'genetics', title: 'Филогеография и коридоры', titleEn: 'Phylogeography & Corridors', keywords: ['genetics', 'connectivity', 'climate', 'translocation'] }
    ]
  },
  { 
    id: 'cognition',
    code: '07',
    name: 'Когнитивистика и Нейробиология', 
    nameEn: 'Cognition & Neurobiology',
    latinSubtitle: 'Neuroanatomia & Cognitio',
    description: 'Цитоархитектоника мозга (257 млрд нейронов), зеркальная самоидентификация, когнитивная танатология и пространственная память.', 
    descriptionEn: 'Brain cytoarchitectonics (257B neurons), mirror self-recognition, cognitive thanatology, and long-term spatial memory.',
    clusters: [
      { id: 'neuroanatomy', title: 'Нейроанатомия и самосознание', titleEn: 'Neuroanatomy & Self', keywords: ['neuroanatomy', 'cognitive-architecture'] },
      { id: 'behavior', title: 'Кооперация и танатология', titleEn: 'Cooperation & Thanatology', keywords: ['thanatology', 'empathy', 'cooperation', 'spatial'] }
    ]
  },
  { 
    id: 'culture',
    code: '08',
    name: 'Антропозоология и История', 
    nameEn: 'Anthrozoology & History',
    latinSubtitle: 'Historia & Anthropozoologia',
    description: 'Боевые слоны античности, культура махаутов (Матангалила), историческое отступление ареала в Китае и генетика священных слонов.', 
    descriptionEn: 'War elephants of antiquity, mahout traditions (Matangalila), historical range retreat in China, and sacred elephant genetics.',
    clusters: [
      { id: 'heritage', title: 'Историческая антропология', titleEn: 'Historical Anthropology', keywords: ['china', 'historical', 'sacred', 'war'] }
    ]
  },
  { 
    id: 'paleontology',
    code: '09',
    name: 'Палеонтология и Палеопротеомика', 
    nameEn: 'Paleontology & Proteomics',
    latinSubtitle: 'Palaeontologia Vertebratorum',
    description: 'Стабильные изотопы плейстоценовой мегафауны, секвенирование древнего коллагена и остеопатологии ископаемых хоботных.', 
    descriptionEn: 'Stable isotopes of Pleistocene megafauna, ancient collagen proteomics, and skeletal paleopathology of proboscideans.',
    clusters: [
      { id: 'fossils', title: 'Изотопия и палеопатология', titleEn: 'Isotopes & Paleopathology', keywords: ['isotopic', 'paleogenomics', 'paleopathology'] }
    ]
  },
  { 
    id: 'genomics',
    code: '10',
    name: 'Геномика и Иммуногенетика', 
    nameEn: 'Genomics & Immunogenetics',
    latinSubtitle: 'Genomica & Epigenetica',
    description: 'Парадокс Пето, мультикопийная амплификация TP53/LIF6, эпигенетические часы метилирования ДНК и полиморфизм MHC.', 
    descriptionEn: "Peto's paradox, multicopy TP53/LIF6 amplification, DNA methylation epigenetic clocks, and MHC immunogenomics.",
    clusters: [
      { id: 'molecular', title: 'Молекулярная онкогенетика', titleEn: 'Molecular Oncogenetics', keywords: ['epigenetic', 'mhc'] }
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

function getEvidenceLabel(level: string | undefined, isEn: boolean): string | null {
  if (!level) return null;
  const norm = level.toLowerCase();
  if (norm === 'established' || norm === 'high') return isEn ? 'Established Consensus' : 'Консенсус A1';
  if (norm === 'moderate') return isEn ? 'Empirical Base A2' : 'Доказательная база A2';
  if (norm === 'limited') return isEn ? 'Cohort Data B' : 'Ограниченные данные B';
  if (norm === 'hypothesis') return isEn ? 'Theoretical Model C' : 'Гипотеза C';
  return isEn ? 'Peer-Reviewed' : 'Рецензировано';
}

function getDifficultyLabel(diff: string | undefined, isEn: boolean): string | null {
  if (!diff) return null;
  if (diff === 'advanced') return isEn ? 'Monograph' : 'Монография';
  if (diff === 'intermediate') return isEn ? 'Analytical Review' : 'Обзор';
  return isEn ? 'Foundational' : 'Базовый курс';
}

interface CatalogArticleCardProps {
  article: ArticleItem;
  index: number;
  isEn: boolean;
  onClick: () => void;
}

const CatalogArticleCard = React.memo(function CatalogArticleCard({ article, index, isEn, onClick }: CatalogArticleCardProps) {
  const evidenceText = getEvidenceLabel(article.evidenceLevel || article.evidence_level, isEn);
  const difficultyText = getDifficultyLabel(article.difficulty, isEn);
  const readingTime = article.readingTime || (isEn ? '8 min' : '8 мин');

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="group flex flex-col justify-between py-6 px-4 border-b border-[#DED8CD] bg-transparent hover:bg-[#F2EFE9]/75 transition-colors duration-150 text-left cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D]"
    >
      <div className="space-y-2.5 w-full">
        {/* Unboxed editorial metadata line (Zero-Pill discipline) */}
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#78716C] font-mono tabular-nums">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#14532D] font-semibold">
              {String(index + 1).padStart(2, '0')}
            </span>
            {evidenceText && (
              <>
                <span aria-hidden="true">·</span>
                <span>{evidenceText}</span>
              </>
            )}
            {difficultyText && (
              <>
                <span aria-hidden="true">·</span>
                <span>{difficultyText}</span>
              </>
            )}
          </div>
          <span className="shrink-0">{readingTime}</span>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <h4 className="text-xl sm:text-[22px] font-semibold text-[#1C1917] group-hover:text-[#14532D] transition-colors leading-[1.28] font-serif text-balance">
            {article.title}
          </h4>
          <ArrowUpRight className="w-4 h-4 text-[#78716C] group-hover:text-[#14532D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 mt-1.5" />
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-[#44403C] leading-relaxed line-clamp-2 font-normal pt-0.5">
            {article.excerpt}
          </p>
        )}
      </div>
    </motion.button>
  );
});

export function ArticleCatalog({ onArticleClick }: { onArticleClick?: (path: string) => void }) {
  const { lang, isEn, setLang } = useLanguage();
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of ACADEMIC_CATEGORIES) {
      counts[c.id] = articles.filter(a => a.category === c.id).length;
    }
    return counts;
  }, [articles]);

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

  // Curated Featured Monographs (3-Tier Editorial Salience)
  const featuredMonographs = useMemo(() => {
    const findBySlug = (slug: string) =>
      articles.find(a => a.path.includes(slug)) || articles[0];

    return {
      lead: findBySlug('muscular-hydrostat-and-trunk-biomechanics'),
      secondary: [
        findBySlug('seismic-and-infrasonic-communication'),
        findBySlug('eehv-endotheliotropic-herpesvirus-protocols'),
        findBySlug('deinotheriidae-evolution-and-functional-morphology'),
      ].filter(Boolean) as ArticleItem[],
    };
  }, [articles]);

  const handleDisciplineSelect = (id: string, isMobile = false) => {
    setActiveDiscipline(id);
    setActiveCluster('all');
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const activeCategoryTitle = isEn ? activeCategory.nameEn : activeCategory.name;
  const activeCategoryDesc = isEn ? activeCategory.descriptionEn : activeCategory.description;

  return (
    <div className="w-full space-y-16 pb-20">
      
      {/* =====================================================================
          TIER 1: INSTITUTIONAL HERO & OPERATIONAL ARCHIVE RIBBON
         ===================================================================== */}
      <section className="border-b border-[#DED8CD] pb-12 pt-4">
        
        {/* Operational Utility & Language Strip (Clean unboxed metadata + segmented language switch) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#DED8CD] text-xs text-[#78716C]">
          <div className="flex items-center gap-2.5 flex-wrap font-mono tabular-nums">
            <span className="text-[#1C1917] font-semibold tracking-wider uppercase">
              {isEn ? 'PROBOSCIDEA DIGITAL COMPENDIUM' : 'НАУЧНЫЙ АРХИВ PROBOSCIDEA'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{articles.length} {isEn ? 'peer-reviewed monographs' : 'научных монографий'}</span>
            <span aria-hidden="true">·</span>
            <span>10 {isEn ? 'disciplines' : 'дисциплин'}</span>
            <span aria-hidden="true">·</span>
            <span>17 {isEn ? 'archival PDF volumes' : 'первоисточников PDF'}</span>
          </div>

          {/* Interactive Language & Reference Controls */}
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <div
              role="group"
              aria-label={isEn ? 'Language selection' : 'Выбор языка издания'}
              className="inline-flex items-center p-0.5 bg-[#F2EFE9] border border-[#DED8CD]"
            >
              <button
                type="button"
                onClick={() => setLang('ru')}
                className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  !isEn
                    ? 'bg-[#1C1917] text-[#FBF9F5] font-semibold'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                RU · Русский
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isEn
                    ? 'bg-[#1C1917] text-[#FBF9F5] font-semibold'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                EN · English
              </button>
            </div>
          </div>
        </div>

        {/* Hero Split Grid (7 cols Editorial Lead + 5 cols Anatomical Specimen Plate) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          
          {/* Left: Institutional Title, Thesis, and Search/Explore Bar */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#14532D] font-semibold">
                {isEn
                  ? 'SYSTEMATIC ZOOLOGY · COMPARATIVE ANATOMY · VETERINARY MEDICINE'
                  : 'СИСТЕМАТИЧЕСКАЯ ЗООЛОГИЯ · СРАВНИТЕЛЬНАЯ АНАТОМИЯ · ВЕТЕРИНАРИЯ'}
              </div>

              <h1
                className="font-serif font-semibold text-[#1C1917] tracking-tight leading-[1.08] text-balance"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.85rem)' }}
              >
                {isEn
                  ? 'Encyclopedia of Proboscidea Biology, Morphology & Evolution'
                  : 'Академическая энциклопедия биологии, морфологии и эволюции хоботных'}
              </h1>

              <p className="text-base sm:text-lg text-[#44403C] leading-relaxed max-w-2xl font-normal">
                {isEn
                  ? 'A comprehensive synthesis of primary zoological research, cranial and muscular biomechanics, clinical veterinary protocols (EEHV, podiatry, anesthesia), and Pleistocene paleobiology of Order Proboscidea.'
                  : 'Фундаментальный свод рецензируемых исследований по анатомии мышечного гидростата, нейробиологии, клиническим протоколам терапии EEHV, акустической этологии и палеогеномике отряда Proboscidea.'}
              </p>
            </div>

            {/* Primary Search & Quick Access Bar */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true } }))}
                  className="flex-1 flex items-center justify-between gap-3 px-4 py-3.5 bg-[#F2EFE9] hover:bg-[#EAE5DC] border border-[#C5BDB0] text-left transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-3 text-sm text-[#44403C] group-hover:text-[#1C1917] truncate">
                    <Search className="w-4 h-4 text-[#14532D] shrink-0" />
                    <span className="truncate">
                      {isEn
                        ? 'Search by taxon, anatomical structure, pathology, or DOI...'
                        : 'Поиск по таксонам, анатомическим структурам, патологиям или DOI...'}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono text-[#78716C] border border-[#DED8CD] bg-[#FBF9F5] px-2 py-0.5 shrink-0">
                    ⌘K
                  </span>
                </button>
              </div>

              {/* Popular Curatorial Queries (Functional filter buttons) */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-[#78716C]">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C]">
                  {isEn ? 'Index terms:' : 'Индекс:'}
                </span>
                {[
                  { label: isEn ? 'Muscular hydrostat' : 'Мышечный гидростат', q: 'гидростат' },
                  { label: 'EEHV', q: 'eehv' },
                  { label: isEn ? 'Seismic communication' : 'Сейсмическая связь', q: 'инфразвук' },
                  { label: 'Palaeoloxodon', q: 'palaeoloxodon' },
                  { label: 'TP53 / LIF6', q: 'tp53' },
                ].map((item) => (
                  <button
                    key={item.q}
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('toggle-search', { detail: { force: true, query: item.q } })
                      )
                    }
                    className="text-xs text-[#44403C] hover:text-[#14532D] underline decoration-[#DED8CD] hover:decoration-[#14532D] underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Archival Anatomical Plate Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#F2EFE9] border border-[#DED8CD] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#DED8CD] text-[11px] font-mono text-[#78716C] tabular-nums">
              <span>FIG. 01 · ANATOMIA PROBOSCIDIS</span>
              <span>CN VII / CN V2</span>
            </div>

            <button
              type="button"
              onClick={() =>
                featuredMonographs.lead && openArticle(featuredMonographs.lead.path)
              }
              className="group relative overflow-hidden border border-[#DED8CD] bg-[#EAE5DC] cursor-pointer text-left block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D]"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/anatomy/proboscis-muscular-hydrostat-and-innervation.jpg`}
                alt={
                  isEn
                    ? 'Anatomical architecture of the elephant trunk muscular hydrostat and innervation'
                    : 'Анатомическая архитектоника мышечного гидростата и иннервация хобота Elephantidae'
                }
                referrerPolicy="no-referrer"
                className="w-full h-56 sm:h-64 object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>

            <div className="pt-3.5 space-y-2">
              <div className="text-[11px] font-mono text-[#14532D] uppercase tracking-wider">
                {isEn ? 'Featured Anatomical Plate' : 'Избранная анатомическая реконструкция'}
              </div>
              <p className="text-xs text-[#44403C] leading-relaxed font-serif italic">
                {isEn
                  ? 'Isovolumetric hydrostatic mechanics (~40,000–140,000 muscle fascicles) and proboscideal nerve trunk pathways in Elephantidae.'
                  : 'Изоволюметрическая гидростатика (~40 000–140 000 мышечных фасцикул) и проводящие пути хоботного нервного ствола у Elephantidae.'}
              </p>
              {featuredMonographs.lead && (
                <button
                  type="button"
                  onClick={() => openArticle(featuredMonographs.lead!.path)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1917] hover:text-[#14532D] pt-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>{isEn ? 'Read full monograph' : 'Открыть монографию'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          TIER 2: FEATURED MONOGRAPHS & ILLUSTRATIONS (3-Column Curatorial Strip)
         ===================================================================== */}
      {featuredMonographs.secondary.length > 0 && (
        <section id="featured-section" className="space-y-6 border-b border-[#DED8CD] pb-14 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#DED8CD] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#78716C] block mb-1">
                {isEn ? 'CURATED RESEARCH MONOGRAPHS' : 'ИЗБРАННЫЕ НАУЧНЫЕ МОНОГРАФИИ'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#1C1917] font-serif tracking-tight">
                {isEn ? 'Keystone Studies & Clinical Protocols' : 'Ключевые исследования и клинические протоколы'}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => openArticle('glossary')}
                className="inline-flex items-center gap-1.5 text-[#44403C] hover:text-[#14532D] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#14532D]" />
                <span>{isEn ? 'Terminological Glossary' : 'Академический глоссарий'}</span>
              </button>
              <span className="text-[#DED8CD]" aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() => openArticle('bibliography')}
                className="inline-flex items-center gap-1.5 text-[#44403C] hover:text-[#14532D] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-[#14532D]" />
                <span>{isEn ? 'Full Bibliography & PDFs' : 'Библиография и архив PDF'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredMonographs.secondary.map((art, idx) => {
              const plateImages = [
                `${import.meta.env.BASE_URL}images/seismic-infrasound-communication.jpeg`,
                `${import.meta.env.BASE_URL}images/eehv-endothelial-pathology.jpeg`,
                `${import.meta.env.BASE_URL}images/taxonomy/deinotherium-cranial-morphology.jpg`,
              ];
              const imgSrc = plateImages[idx % plateImages.length];
              const catObj = ACADEMIC_CATEGORIES.find(c => c.id === art.category);
              const catName = catObj ? (isEn ? catObj.nameEn : catObj.name) : art.category;

              return (
                <article
                  key={art.path}
                  onClick={() => openArticle(art.path)}
                  className="group cursor-pointer flex flex-col justify-between border-b sm:border-b-0 pb-6 sm:pb-0 border-[#DED8CD]"
                >
                  <div className="space-y-3.5">
                    <div className="overflow-hidden border border-[#DED8CD] bg-[#161920] p-2 aspect-[16/10] flex items-center justify-center">
                      <img
                        src={imgSrc}
                        alt={art.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#78716C] tabular-nums">
                      <span className="text-[#14532D] font-semibold uppercase">{catName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{art.readingTime}</span>
                    </div>

                    <h3 className="text-xl font-semibold text-[#1C1917] group-hover:text-[#14532D] transition-colors leading-snug font-serif line-clamp-3">
                      {art.title}
                    </h3>

                    {art.excerpt && (
                      <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#DED8CD]/70 flex items-center justify-between text-xs font-medium text-[#1C1917] group-hover:text-[#14532D]">
                    <span>{isEn ? 'Read monograph' : 'Читать монографию'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================================
          TIER 3: SYSTEMATIC DISCIPLINE ARCHIVE & RUBRICATOR
         ===================================================================== */}
      <section id="catalog-section" className="scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: 10 Systematic Disciplines Index */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-[#DED8CD] pb-3 mb-4">
              <span className="text-xs font-semibold text-[#1C1917] uppercase tracking-[0.14em] font-mono">
                {isEn ? 'SYSTEMATIC RUBRICATOR' : 'СИСТЕМАТИЧЕСКИЙ РУБРИКАТОР'}
              </span>
              <span className="text-[11px] font-mono text-[#78716C] tabular-nums">
                01 — 10
              </span>
            </div>

            <div className="divide-y divide-[#DED8CD] border-y border-[#DED8CD]">
              {ACADEMIC_CATEGORIES.map((disc) => {
                const isActive = activeDiscipline === disc.id;
                const discTitle = isEn ? disc.nameEn : disc.name;
                const count = categoryCounts[disc.id] || 0;

                return (
                  <button
                    key={disc.id}
                    type="button"
                    onClick={() => {
                      const isMobile = window.innerWidth < 1024;
                      handleDisciplineSelect(disc.id, isMobile);
                    }}
                    className={`w-full text-left px-4 py-3.5 transition-colors duration-150 cursor-pointer flex items-center justify-between gap-3 group ${
                      isActive
                        ? 'bg-[#1C1917] text-[#FBF9F5]'
                        : 'bg-transparent text-[#44403C] hover:text-[#1C1917] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span
                        className={`text-xs font-mono tabular-nums shrink-0 ${
                          isActive ? 'text-[#EAE5DC]' : 'text-[#78716C] group-hover:text-[#14532D]'
                        }`}
                      >
                        {disc.code}.
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-sm sm:text-[15px] tracking-tight truncate ${
                            isActive ? 'font-semibold text-[#FBF9F5]' : 'font-medium text-[#1C1917]'
                          }`}
                        >
                          {discTitle}
                        </div>
                        <div
                          className={`text-[11px] font-serif italic truncate ${
                            isActive ? 'text-[#DED8CD]' : 'text-[#78716C]'
                          }`}
                        >
                          {disc.latinSubtitle}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono tabular-nums shrink-0 ${
                        isActive ? 'text-[#FBF9F5] font-semibold' : 'text-[#78716C]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Active Discipline Header, Sub-theme Filter Bar & Monograph List */}
          <div className="lg:col-span-8 xl:col-span-8">
            <div className="flex flex-col">
              
              {/* Category Header */}
              <div className="pb-6 border-b border-[#DED8CD] space-y-2">
                <div className="flex items-center justify-between gap-4 text-xs font-mono text-[#78716C] tabular-nums">
                  <span className="text-[#14532D] font-semibold uppercase tracking-wider">
                    {isEn ? `SECTION ${activeCategory.code}` : `РАЗДЕЛ ${activeCategory.code}`} · {activeCategory.latinSubtitle}
                  </span>
                  <span>
                    {displayedArticles.length} {isEn ? 'monographs' : 'статей в разделе'}
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-semibold text-[#1C1917] tracking-tight font-serif">
                  {activeCategoryTitle}
                </h3>

                <p className="text-sm sm:text-base text-[#44403C] leading-relaxed max-w-2xl pt-1">
                  {activeCategoryDesc}
                </p>
              </div>

              {/* Interactive Sub-theme Filter Controls (Segmented functional buttons) */}
              {activeCategory.clusters && activeCategory.clusters.length > 0 && (
                <div
                  role="tablist"
                  aria-label={isEn ? 'Sub-discipline filter' : 'Фильтр по тематическим кластерам'}
                  className="flex flex-wrap items-center gap-2 py-5 border-b border-[#DED8CD]"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCluster === 'all'}
                    onClick={() => setActiveCluster('all')}
                    className={`px-3.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      activeCluster === 'all'
                        ? 'bg-[#14532D] text-[#FBF9F5] border-[#14532D] font-semibold'
                        : 'bg-[#F2EFE9] text-[#44403C] hover:text-[#1C1917] border-[#DED8CD]'
                    }`}
                  >
                    {isEn ? `All Topics (${disciplineArticles.length})` : `Все темы (${disciplineArticles.length})`}
                  </button>

                  {activeCategory.clusters.map((cluster) => {
                    const isClusterActive = activeCluster === cluster.id;
                    const clusterTitle = isEn ? cluster.titleEn : cluster.title;

                    return (
                      <button
                        key={cluster.id}
                        type="button"
                        role="tab"
                        aria-selected={isClusterActive}
                        onClick={() => setActiveCluster(cluster.id)}
                        className={`px-3.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isClusterActive
                            ? 'bg-[#14532D] text-[#FBF9F5] border-[#14532D] font-semibold'
                            : 'bg-[#F2EFE9] text-[#44403C] hover:text-[#1C1917] border-[#DED8CD]'
                        }`}
                      >
                        {clusterTitle}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Articles Editorial List */}
              <div className="divide-y divide-[#DED8CD]">
                {displayedArticles.length === 0 ? (
                  <div className="p-12 text-center text-[#78716C] text-sm border border-[#DED8CD] my-8">
                    {isEn ? 'No articles in this cluster.' : 'В этом подразделе пока нет материалов.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-0">
                    {displayedArticles.map((article, idx) => (
                      <CatalogArticleCard
                        key={article.path}
                        article={article}
                        index={idx}
                        isEn={isEn}
                        onClick={() => openArticle(article.path)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

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
              className="relative z-10 w-full max-h-[85vh] bg-[#FBF9F5] border-t border-[#DED8CD] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="w-12 h-1 bg-[#C5BDB0] mx-auto my-3 shrink-0" />

              <div className="px-5 pb-3 border-b border-[#DED8CD] flex items-center justify-between gap-3 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-[#14532D] uppercase tracking-wider block">
                    {activeCategory.code} · {activeCategory.latinSubtitle}
                  </span>
                  <h3 className="font-semibold text-lg text-[#1C1917] truncate font-serif">
                    {activeCategoryTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 bg-[#F2EFE9] hover:bg-[#EAE5DC] border border-[#DED8CD] text-[#1C1917] transition-colors cursor-pointer"
                  aria-label={isEn ? 'Close' : 'Закрыть'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {displayedArticles.map((article, idx) => (
                  <CatalogArticleCard
                    key={article.path}
                    article={article}
                    index={idx}
                    isEn={isEn}
                    onClick={() => openArticle(article.path)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
