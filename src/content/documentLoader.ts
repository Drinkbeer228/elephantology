/**
 * Content Layer: Raw Markdown Document Loader & Path Resolution
 * Isolates Vite's import.meta.glob and filesystem layout from Services and UI.
 */

export const RAW_MARKDOWN_MODULES = import.meta.glob('/docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const LEGACY_SLUG_MAP: Record<string, string> = {
  respiratory_system: 'anatomy/respiratory-system-and-vocal-tract',
  foot_care: 'veterinary/clinical-podiatry-and-foot-care',
  foot_care_protocol: 'veterinary/clinical-podiatry-and-foot-care',
  integumentary_system: 'anatomy/integumentary-system-and-skin-morphology',
  muscular_hydrostat: 'anatomy/muscular-hydrostat-and-trunk-biomechanics',
  skeletal_system_cranial: 'anatomy/skeletal-system-cranial-and-dentition',
  skeletal_system_appendicular: 'anatomy/skeletal-system-appendicular-and-biomechanics',
  sensory_umwelt: 'anatomy/sensory-umwelt-and-multimodal-perception',
  digestive_system: 'anatomy/digestive-system-macroanatomy-and-vascularization',
  urogenital_system: 'anatomy/urogenital-system-and-reproductive-anatomy',
  chemosensory_communication: 'ethogram/chemosensory-communication-and-vomeronasal-system',
  cognitive_architecture: 'cognition/cognitive-architecture-and-self-awareness',
  seismic_communication: 'ethogram/seismic-and-infrasonic-communication',
  acoustic_patterns: 'ethogram/seismic-and-infrasonic-communication',
  aggression_patterns: 'ethogram/aggression-dominance-and-reconciliation',
  social_patterns: 'ethogram/fission-fusion-social-structure',
  taxonomy_evolution: 'taxonomy/proboscidea-evolution-and-phylogeny',
  orphan_calf_rehabilitation: 'veterinary/elephant-neonatology-and-calves',
  eehv_protocol: 'veterinary/eehv-endotheliotropic-herpesvirus-protocols',
  musth_and_temporal_gland: 'ethogram/musth-ethology-and-endocrinology',
};

export function resolveDocumentKey(
  requestedPath: string,
  modulesKeys: string[] = Object.keys(RAW_MARKDOWN_MODULES)
): string | null {
  if (!requestedPath) return null;
  const clean = requestedPath
    .replace(/^https?:\/\/[^/]+/, '')
    .split('#')[0]
    .split('?')[0]
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .replace(/^elephantology\//, '')
    .replace(/^docs\//, '')
    .replace(/\.md$/, '')
    .trim();

  if (!clean) return null;

  // 1. Direct legacy / alias map
  if (LEGACY_SLUG_MAP[clean]) {
    const target = LEGACY_SLUG_MAP[clean];
    const found = modulesKeys.find((k) => k.includes(target));
    if (found) return found;
  }
  const cleanBase = clean.split('/').pop() || '';
  if (LEGACY_SLUG_MAP[cleanBase]) {
    const target = LEGACY_SLUG_MAP[cleanBase];
    const found = modulesKeys.find((k) => k.includes(target));
    if (found) return found;
  }

  // 2. Exact match in module keys (or category/index match)
  const exact = modulesKeys.find((k) => {
    const rel = k.replace(/^\/docs\//, '').replace(/\.md$/, '');
    return (
      rel === clean ||
      rel.toLowerCase() === clean.toLowerCase() ||
      rel.toLowerCase() === `${clean.toLowerCase()}/index`
    );
  });
  if (exact) return exact;

  // 3. Key ends with `/clean.md`
  const endsWith = modulesKeys.find((k) => {
    const rel = k.replace(/^\/docs\//, '').replace(/\.md$/, '');
    return rel.endsWith(`/${clean}`) || rel.toLowerCase().endsWith(`/${clean.toLowerCase()}`);
  });
  if (endsWith) return endsWith;

  // 4. Base filename matching (with underscore/dash normalization)
  const normCleanBase = cleanBase.toLowerCase().replace(/_/g, '-');
  if (normCleanBase !== 'index') {
    const baseMatch = modulesKeys.find((k) => {
      const kFilename = k.split('/').pop()?.replace(/\.md$/, '').toLowerCase() || '';
      if (kFilename === 'index') return false;
      return kFilename === normCleanBase || kFilename.replace(/_/g, '-') === normCleanBase;
    });
    if (baseMatch) return baseMatch;

    // 5. Prefix / substring match
    const subMatch = modulesKeys.find((k) => {
      const kFilename = k
        .split('/')
        .pop()
        ?.replace(/\.md$/, '')
        .toLowerCase()
        .replace(/_/g, '-') || '';
      if (kFilename === 'index') return false;
      return (
        kFilename.startsWith(normCleanBase) ||
        normCleanBase.startsWith(kFilename) ||
        kFilename.includes(normCleanBase) ||
        normCleanBase.includes(kFilename)
      );
    });
    if (subMatch) return subMatch;
  }

  // 6. Multi-word fuzzy match on slug
  const words = normCleanBase.split('-').filter((w) => w.length > 2);
  if (words.length > 0) {
    let bestKey: string | null = null;
    let bestScore = 0;
    for (const k of modulesKeys) {
      const kBase = k
        .split('/')
        .pop()
        ?.replace(/\.md$/, '')
        .toLowerCase()
        .replace(/_/g, '-') || '';
      if (kBase === 'index') continue;
      const matchCount = words.filter((w) => kBase.includes(w)).length;
      if (matchCount > bestScore) {
        bestScore = matchCount;
        bestKey = k;
      }
    }
    if (bestScore >= 2 || (words.length === 1 && bestScore === 1)) {
      return bestKey;
    }
  }

  return null;
}

export function getRawMarkdownByKey(moduleKey: string): string {
  const raw = RAW_MARKDOWN_MODULES[moduleKey];
  if (!raw) return '';
  return typeof raw === 'string' ? raw : (raw as any).default || '';
}

export function getKnowledgeArticleEntries(): Array<[string, string]> {
  return Object.entries(RAW_MARKDOWN_MODULES)
    .filter(
      ([filePath]) =>
        !filePath.includes('/assets/') &&
        filePath !== '/docs/index.md' &&
        !filePath.endsWith('glossary.md') &&
        !filePath.endsWith('bibliography.md')
    )
    .sort(([a], [b]) => {
      const aIsIndex = a.endsWith('/index.md');
      const bIsIndex = b.endsWith('/index.md');
      if (aIsIndex !== bIsIndex) return aIsIndex ? -1 : 1;
      return a.localeCompare(b);
    })
    .map(([filePath, raw]) => [
      filePath,
      typeof raw === 'string' ? raw : (raw as any).default || '',
    ]);
}
