import { SECTION_TRANSLATIONS } from './articleTranslations';

// Academic and biological terminology mapping for zoology, veterinary, paleontology, and genetics
const TERM_REPLACEMENTS: [RegExp, string][] = [
  // Common Structural & Section phrases
  [/^##\s+Кратко\s*\(Lead\)/gim, '## Executive Summary (Lead)'],
  [/^##\s+Кратко/gim, '## Executive Summary'],
  [/^##\s+(?:📊\s*)?Ключевые сведения/gim, '## Key Scientific Insights'],
  [/^##\s+(?:📊\s*)?Ключевые показатели/gim, '## Key Metrics & Values'],
  [/^##\s+(?:📊\s*)?Ключевые метрики/gim, '## Key Quantitative Indicators'],
  [/^##\s+(?:📊\s*)?Ключевые палеонтологические метрики/gim, '## Key Paleontological Metrics'],
  [/^##\s+(?:📊\s*)?Ключевые геномные метрики/gim, '## Key Genomic Indicators'],
  [/^##\s+(?:⚖️\s*)?Научная неопредел[её]нность/gim, '## Scientific Uncertainty & Epistemic Status'],
  [/^##\s+(?:⚖️\s*)?Границы научного знания/gim, '## Boundaries of Scientific Knowledge'],
  [/^##\s+Связанные знания/gim, '## Related Topics & Knowledge'],
  [/^##\s+Связанные материалы/gim, '## Related Academic Materials'],
  [/^##\s+Литература/gim, '## Primary Literature & References'],
  [/^##\s+Библиография/gim, '## Bibliography'],
  [/^##\s+Выводы и заключение/gim, '## Conclusions & Perspectives'],
  [/^##\s+Выводы/gim, '## Conclusions'],
  [/^##\s+Введение/gim, '## Introduction'],
  [/^##\s+Патогенез/gim, '## Pathogenesis'],
  [/^##\s+Клиническая картина/gim, '## Clinical Presentation'],
  [/^##\s+Диагностика/gim, '## Diagnostics & Laboratory Protocols'],
  [/^##\s+Терапия и протоколы/gim, '## Therapeutics & Clinical Protocols'],
  [/^##\s+Профилактика/gim, '## Prophylaxis & Prevention'],
  [/^##\s+Эволюционные маркеры/gim, '## Evolutionary Markers'],
  [/^##\s+Морфологическая адаптация/gim, '## Morphological Adaptations'],
  [/^##\s+Физиология и биомеханика/gim, '## Physiology and Biomechanics'],
  [/^##\s+Экологическая роль/gim, '## Ecological Role and Impacts'],

  // Epistemic labels
  [/\bИзвестно\s*:/gi, 'Established facts:'],
  [/\bДостоверно\s*:/gi, 'Empirically confirmed:'],
  [/\bВероятно\s*:/gi, 'Probable hypotheses:'],
  [/\bГипотезы\s*:/gi, 'Hypotheses:'],
  [/\bНеизвестно\s*:/gi, 'Unresolved questions:'],
  [/\bОткрытые вопросы\s*:/gi, 'Open scientific questions:'],

  // Time & Measurement
  [/\bмлн лет назад\b/gi, 'million years ago (Ma)'],
  [/\bтыс\.\s*лет назад\b/gi, 'thousand years ago (ka)'],
  [/\bмлн лет\b/gi, 'million years'],
  [/\bтыс\.\s*лет\b/gi, 'thousand years'],
  [/\bлет\b/gi, 'years'],
  [/\bмин\b/gi, 'min'],
  [/\bкг\b/gi, 'kg'],
  [/\bт\b/gi, 'tons'],
  [/\bсм\b/gi, 'cm'],
  [/\bмм\b/gi, 'mm'],
  [/\bм\b/gi, 'm'],
  [/\bкм\b/gi, 'km'],
  [/\bГц\b/gi, 'Hz'],

  // Common Academic and Biological Terms
  [/\bхоботные\b/gi, 'proboscideans'],
  [/\bхоботных\b/gi, 'proboscideans'],
  [/\bхоботным\b/gi, 'proboscideans'],
  [/\bхоботными\b/gi, 'proboscideans'],
  [/\bотряд хоботных\b/gi, 'order Proboscidea'],
  [/\bотряда хоботных\b/gi, 'order Proboscidea'],
  [/\bслон\b/gi, 'elephant'],
  [/\bслона\b/gi, 'elephant'],
  [/\bслону\b/gi, 'elephant'],
  [/\bслоном\b/gi, 'elephant'],
  [/\bслоне\b/gi, 'elephant'],
  [/\bслоны\b/gi, 'elephants'],
  [/\bслонов\b/gi, 'elephants'],
  [/\bслонам\b/gi, 'elephants'],
  [/\bслонами\b/gi, 'elephants'],
  [/\bафриканский слон\b/gi, 'African elephant'],
  [/\bазиатский слон\b/gi, 'Asian elephant'],
  [/\bсаванный слон\b/gi, 'savanna elephant'],
  [/\bлесной слон\b/gi, 'forest elephant'],
  [/\bшерстистый мамонт\b/gi, 'woolly mammoth'],
  [/\bмамонт\b/gi, 'mammoth'],
  [/\bмамонты\b/gi, 'mammoths'],
  [/\bмастодонт\b/gi, 'mastodon'],
  [/\bмастодонты\b/gi, 'mastodons'],
  [/\bдейнотерий\b/gi, 'deinothere'],
  [/\bдейнотерии\b/gi, 'deinotheres'],
  [/\bгомфотерий\b/gi, 'gomphothere'],
  [/\bгомфотерии\b/gi, 'gomphotheres'],

  // Anatomy & Physiology Terms
  [/\bмышечный гидростат\b/gi, 'muscular hydrostat'],
  [/\bхобот\b/gi, 'proboscis (trunk)'],
  [/\bхобота\b/gi, 'proboscis (trunk)'],
  [/\bбивни\b/gi, 'tusks'],
  [/\bбивней\b/gi, 'tusks'],
  [/\bбивнем\b/gi, 'tusk'],
  [/\bбивень\b/gi, 'tusk'],
  [/\bмоляры\b/gi, 'molars'],
  [/\bпремоляры\b/gi, 'premolars'],
  [/\bкраниодентальный конвейер\b/gi, 'horizontal craniodental progression conveyor'],
  [/\bполифиодонтии\b/gi, 'polyphyodonty'],
  [/\bполифиодонтия\b/gi, 'polyphyodonty'],
  [/\bдиплоэ\b/gi, 'diploë'],
  [/\bпневматизация\b/gi, 'pneumatization'],
  [/\bвисочная железа\b/gi, 'temporal gland'],
  [/\bвисочные железы\b/gi, 'temporal glands'],
  [/\bушные раковины\b/gi, 'ear pinnae'],
  [/\bтерморегуляция\b/gi, 'thermoregulation'],
  [/\bтерморегуляции\b/gi, 'thermoregulation'],
  [/\bинфразвук\b/gi, 'infrasound'],
  [/\bинфразвуковая коммуникация\b/gi, 'infrasonic communication'],
  [/\bсейсмические сигналы\b/gi, 'seismic signals'],
  [/\bсейсмическая коммуникация\b/gi, 'seismic communication'],
  [/\bтельца пачини\b/gi, 'Pacinian corpuscles'],
  [/\bтестикондия\b/gi, 'testicondy (intra-abdominal testes)'],
  [/\bмуст\b/gi, 'musth'],
  [/\bмуста\b/gi, 'musth'],
  [/\bвомероназальный орган\b/gi, 'vomeronasal organ (Jacobson organ)'],
  [/\bфлемен\b/gi, 'flehmen response'],

  // Veterinary terms
  [/\bэндотелиотропный герпесвирус\b/gi, 'elephant endotheliotropic herpesvirus (EEHV)'],
  [/\bгеморрагическая болезнь\b/gi, 'hemorrhagic disease'],
  [/\bфамцикловир\b/gi, 'famciclovir'],
  [/\bплазмотрансфузия\b/gi, 'plasma transfusion'],
  [/\bиммобилизация\b/gi, 'chemical immobilization'],
  [/\bэторфин\b/gi, 'etorphine'],
  [/\bналтрексон\b/gi, 'naltrexone'],
  [/\bпододерматит\b/gi, 'pododermatitis'],
  [/\bабсцесс\b/gi, 'abscess'],
  [/\bколика\b/gi, 'colic'],
  [/\bколики\b/gi, 'colic'],
  [/\bслепая кишка\b/gi, 'cecum'],
  [/\bтолстый кишечник\b/gi, 'hindgut / large intestine'],

  // Ecology & Behavior
  [/\bматриарх\b/gi, 'matriarch'],
  [/\bматриархат\b/gi, 'matriarchy'],
  [/\bматриархальная структура\b/gi, 'matriarchal social structure'],
  [/\bэкосистемный инженер\b/gi, 'ecosystem engineer'],
  [/\bключевой вид\b/gi, 'keystone species'],
  [/\bдеревья\b/gi, 'trees'],
  [/\bсемена\b/gi, 'seeds'],
  [/\bбраконьерство\b/gi, 'poaching'],
  [/\bбраконьерства\b/gi, 'poaching'],
  [/\bслоновая кость\b/gi, 'ivory'],
  [/\bслоновой кости\b/gi, 'ivory'],
  [/\bохрана природы\b/gi, 'conservation'],
  [/\bсохранение видов\b/gi, 'species conservation']
];

/**
 * Advanced dictionary of phrase-level scientific academic translations
 */
const SENTENCE_DICTIONARY: Record<string, string> = {
  'Настоящая статья представляет собой комплексный историко-палеонтологический и молекулярно-филогенетический анализ эволюционной траектории отряда хоботных (*Proboscidea*), берущей начало в позднем палеоцене Африки около 60 млн лет назад':
    'This academic review provides a comprehensive paleontological and molecular phylogenetic synthesis of the evolutionary trajectory of the order Proboscidea, originating in the late Paleocene of Afro-Arabia ~60 million years ago',
  'Эволюция хоботных характеризуется яркими параллелизмами и постепенным усложнением краниодентальной морфологии при переходе от питания мягкой листвой к абразивным злакам':
    'Proboscidean evolution is distinguished by marked morphological parallelisms and progressive cranial-dental specialization during the dietary transition from soft browse to abrasive C4 graminoids'
};

const SORTED_TERM_REPLACEMENTS = [...TERM_REPLACEMENTS].sort((a, b) => b[0].source.length - a[0].source.length);

const translationCache = new Map<string, string>();

/**
 * Translates a Russian markdown article into fluent, structured academic English.
 */
export function translateMarkdownToEnglish(markdown: string): string {
  if (!markdown) return '';
  if (translationCache.has(markdown)) {
    return translationCache.get(markdown)!;
  }

  let result = markdown;

  // 1. First check direct sentence replacements
  Object.entries(SENTENCE_DICTIONARY).forEach(([ru, en]) => {
    result = result.split(ru).join(en);
  });

  // 2. Translate common Markdown headings and Section labels
  Object.entries(SECTION_TRANSLATIONS).forEach(([ru, en]) => {
    const headingRegex = new RegExp(`^(#{1,4}\\s*(?:[📊⚖️🩺🌿🔬🧠🦴🌳🛡️🏛️🫀]\\s*)?)${ru}`, 'gim');
    result = result.replace(headingRegex, `$1${en}`);
  });

  // 3. Protect markdown link and image URLs
  const linkUrls: string[] = [];
  result = result.replace(/(\[[^\]]*\]\()([^)]+)(\))/g, (_, prefix, url, suffix) => {
    const index = linkUrls.length;
    linkUrls.push(url);
    return `${prefix}__LINK_URL_${index}__${suffix}`;
  });

  // 4. Apply regex scientific and biological terminology replacements
  SORTED_TERM_REPLACEMENTS.forEach(([regex, replacement]) => {
    result = result.replace(regex, replacement);
  });

  // 5. Restore protected URLs
  result = result.replace(/__LINK_URL_(\d+)__/g, (match, idx) => {
    return linkUrls[Number(idx)] || match;
  });

  translationCache.set(markdown, result);
  return result;
}
