import { getGlossaryTermEntries } from '../content';
import { GlossaryTermEntry } from '../types';

/**
 * Content Service: Glossary Term Resolution & Text Segmentation
 * Provides pure functions for resolving scientific terms and segmenting text.
 */

export interface TextSegment {
  type: 'text' | 'term';
  value: string;
  termKey?: string;
}

const GLOSSARY_ENTRIES: GlossaryTermEntry[] = getGlossaryTermEntries();
const GLOSSARY_MAP: Record<string, GlossaryTermEntry> = Object.fromEntries(
  GLOSSARY_ENTRIES.map((entry) => [entry.key, entry])
);

const ADDITIONAL_ALIASES: Record<string, string[]> = {
  'мышечный гидростат': [
    'мышечный гидростат',
    'мышечного гидростата',
    'мышечным гидростатом',
    'muscular hydrostat',
  ],
  полифиодонтия: ['полифиодонтия', 'полифиодонтии', 'полифиодонтию', 'polyphyodonty'],
  гравипортальность: [
    'гравипортальность',
    'гравипортальной',
    'гравипортальные',
    'гравипортальная',
    'graviportal',
  ],
  диплоэ: ['диплоэ', 'диплоэтической', 'диплоэтические', 'diploë'],
  пахидермия: ['пахидермия', 'пахидермии', 'pachydermia'],
  тестикондия: ['тестикондия', 'тестикондии', 'тестикондности', 'testicondy'],
  муст: ['муст', 'муста', 'мусте', 'musth'],
  флемен: ['флемен', 'флемена', 'flehmen'],
  'тельца Пачини': [
    'тельца Пачини',
    'телец Пачини',
    'тельцами Пачини',
    'Pacinian corpuscles',
  ],
  'нейроны фон Экономо': [
    'нейроны фон Экономо',
    'нейронов фон Экономо',
    'веретеновидные нейроны',
    'von Economo neurons',
  ],
  'парадокс Пето': ['парадокс Пето', 'парадокса Пето', "Peto's paradox"],
  копрофагия: ['копрофагия', 'копрофагии', 'coprophagy'],
  алломатеринство: [
    'алломатеринство',
    'алломатеринства',
    'алломатеринской',
    'allomothering',
  ],
  геофагия: ['геофагия', 'геофагии', 'geophagy'],
  инфразвук: [
    'инфразвук',
    'инфразвука',
    'инфразвуковой',
    'инфразвуковых',
    'infrasound',
  ],
  пододерматит: ['пододерматит', 'пододерматита', 'пододерматитов', 'pododermatitis'],
  эторфин: ['эторфин', 'эторфина', 'эторфином', 'etorphine'],
  'линии Шрегера': ['линии Шрегера', 'линий Шрегера', 'Schreger lines'],
  'Fission-Fusion': [
    'fission-fusion',
    'слияния-разделения',
    'слияние-разделение',
  ],
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface CompiledAlias {
  pattern: string;
  key: string;
  length: number;
}

const COMPILED_ALIASES: CompiledAlias[] = (() => {
  const list: CompiledAlias[] = [];
  for (const key of Object.keys(GLOSSARY_MAP)) {
    const patterns = ADDITIONAL_ALIASES[key] || [key];
    for (const p of patterns) {
      list.push({
        pattern: escapeRegExp(p),
        key,
        length: p.length,
      });
    }
  }
  list.sort((a, b) => b.length - a.length);
  return list;
})();

export function getGlossaryEntryByKey(termKey: string): GlossaryTermEntry | undefined {
  return GLOSSARY_MAP[termKey];
}

export function getAllGlossaryEntries(): GlossaryTermEntry[] {
  return GLOSSARY_ENTRIES;
}

export function segmentTextWithGlossary(
  text: string,
  seenTermsSet: Set<string> = new Set()
): TextSegment[] {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', value: text || '' }];
  }

  const availableAliases = COMPILED_ALIASES.filter((a) => !seenTermsSet.has(a.key));
  if (availableAliases.length === 0) {
    return [{ type: 'text', value: text }];
  }

  const combinedPattern = availableAliases.map((a) => `(${a.pattern})`).join('|');
  let regex: RegExp;
  try {
    regex = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${combinedPattern})(?![\\p{L}\\p{N}_])`, 'giu');
  } catch {
    return [{ type: 'text', value: text }];
  }

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchedString = match[0];
    const matchIndex = match.index;

    let matchedKey: string | null = null;
    for (let i = 0; i < availableAliases.length; i++) {
      if (match[i + 1] !== undefined) {
        matchedKey = availableAliases[i].key;
        break;
      }
    }

    if (matchIndex > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, matchIndex) });
    }

    if (matchedKey && !seenTermsSet.has(matchedKey)) {
      seenTermsSet.add(matchedKey);
      segments.push({
        type: 'term',
        value: matchedString,
        termKey: matchedKey,
      });
    } else {
      segments.push({ type: 'text', value: matchedString });
    }

    lastIndex = matchIndex + matchedString.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}
