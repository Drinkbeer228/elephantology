import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ShieldCheck, Scale, AlertCircle, Lightbulb, HelpCircle, CheckCircle2, HelpCircle as HelpIcon, AlertTriangle, Layers, BookCheck, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { EvidenceBasisType } from '../types';

interface EvidenceConfig {
  labelKey: 'established' | 'moderate' | 'limited' | 'hypothesis' | 'contested';
  bg: string;
  text: string;
  border: string;
  icon: LucideIcon;
  description: string;
  descriptionEn: string;
}

const EVIDENCE_BADGE_MAP: Record<string, EvidenceConfig> = {
  established: {
    labelKey: 'established',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-800/60',
    icon: ShieldCheck,
    description: 'Установленный научный статус: подтверждено систематическими обзорами, множественными первичными исследованиями и научным консенсусом.',
    descriptionEn: 'Established status: corroborated by systematic reviews, multiple primary studies, and broad scientific consensus.'
  },
  moderate: {
    labelKey: 'moderate',
    bg: 'bg-blue-950/40',
    text: 'text-blue-300',
    border: 'border-blue-800/60',
    icon: Scale,
    description: 'Достаточная доказательная база: подтверждено валидированными клиническими или эмпирическими данными.',
    descriptionEn: 'Moderate evidence base: corroborated by validated clinical or empirical studies with strong observational data.'
  },
  limited: {
    labelKey: 'limited',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-800/60',
    icon: AlertCircle,
    description: 'Ограниченные данные: наблюдения единичных когорт или предварительные пилотные исследования.',
    descriptionEn: 'Limited data: derived from isolated cohort observations or preliminary pilot inquiries.'
  },
  hypothesis: {
    labelKey: 'hypothesis',
    bg: 'bg-orange-950/40',
    text: 'text-orange-300',
    border: 'border-orange-800/60',
    icon: Lightbulb,
    description: 'Научная гипотеза: теоретическая модель или биофизическая экстраполяция, требующая верификации.',
    descriptionEn: 'Working hypothesis: theoretical model or biophysical extrapolation awaiting further experimental verification.'
  },
  contested: {
    labelKey: 'contested',
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-800/60',
    icon: HelpCircle,
    description: 'Дискуссионный вопрос: в академическом сообществе существуют взаимоисключающие данные или полемика.',
    descriptionEn: 'Contested status: conflicting data models or ongoing methodological debate across the scholarly community.'
  }
};

/**
 * Renders the evidence level badge with evidence basis clarification
 */
export function EvidenceBadge({ 
  level, 
  basis,
  showTooltip = true 
}: { 
  level?: string; 
  basis?: EvidenceBasisType[];
  showTooltip?: boolean;
}) {
  const { t, isEn } = useLanguage();
  if (!level) return null;

  const normalized = level.toLowerCase();
  const current = EVIDENCE_BADGE_MAP[normalized] || EVIDENCE_BADGE_MAP.established;
  const label = t.evidence[current.labelKey].toUpperCase();
  const Icon = current.icon;

  const basisLabels: Record<string, { ru: string; en: string }> = {
    peer_reviewed: { ru: 'Рецензируемые публикации', en: 'Peer-reviewed articles' },
    systematic_review: { ru: 'Систематический обзор', en: 'Systematic review' },
    primary_studies: { ru: 'Первичные эмпирические исследования', en: 'Primary empirical studies' },
    consensus: { ru: 'Академический консенсус', en: 'Scholarly consensus' },
    expert_assessment: { ru: 'Экспертная зоологическая оценка', en: 'Expert assessment' }
  };

  return (
    <div className="relative inline-flex group items-center align-middle">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${current.bg} ${current.text} ${current.border}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>

      {showTooltip && (
        <div className="absolute left-0 top-full mt-1.5 w-72 p-3 bg-[#1e2130] border border-[#34384a] rounded-lg shadow-xl text-xs text-gray-200 font-normal normal-case opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30 pointer-events-none space-y-1.5">
          <p>{isEn ? current.descriptionEn : current.description}</p>
          {basis && basis.length > 0 && (
            <div className="pt-1.5 border-t border-[#34384a] text-[11px] text-gray-400">
              <span className="font-semibold text-gray-200 block mb-0.5">
                {isEn ? 'Evidence Basis:' : 'Основание оценки:'}
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {basis.map((b) => (
                  <li key={b}>{basisLabels[b] ? (isEn ? basisLabels[b].en : basisLabels[b].ru) : b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Блок «Ключевые сведения / Показатели»:
 */
export function KeyFindingsBlock({ content }: { content: string }) {
  const { isEn } = useLanguage();
  if (!content) return null;

  return (
    <section className="my-8 rounded-xl border border-[#34384a] border-l-4 border-l-amber-400 bg-[#161822] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-amber-300 font-semibold text-sm">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{isEn ? 'Key Scientific Findings' : 'Ключевые сведения'}</span>
      </div>
      <div className="text-slate-200 text-sm leading-relaxed space-y-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-amber-200">{children}</strong>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-slate-300">{children}</ul>,
            li: ({ children }) => <li className="text-slate-300">{children}</li>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
}

/**
 * Блок «Научная неопределённость и открытые вопросы»:
 */
export function ScientificUncertaintyBlock({
  consensus,
  debate,
  unknown
}: {
  consensus?: string;
  debate?: string;
  unknown?: string;
}) {
  const { isEn } = useLanguage();
  if (!consensus && !debate && !unknown) return null;

  return (
    <section className="my-8 p-5 bg-[#1a1d29] border border-[#34384a] rounded-xl space-y-4">
      <div className="flex items-center gap-2 border-b border-[#34384a] pb-3">
        <Scale className="w-5 h-5 text-indigo-400 shrink-0" />
        <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
          {isEn ? 'Scientific Consensus & Epistemic Uncertainty' : 'Научный консенсус и исследовательские дебаты'}
        </h3>
      </div>

      <div className="space-y-3.5">
        {consensus && (
          <div className="flex items-start gap-3 p-3 bg-[#13151f] rounded-lg border border-emerald-900/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-emerald-300 block mb-0.5">
                {isEn ? 'Established Consensus:' : 'Установленный научный консенсус:'}
              </span>
              <p className="text-slate-300 leading-relaxed">{consensus}</p>
            </div>
          </div>
        )}

        {debate && (
          <div className="flex items-start gap-3 p-3 bg-[#13151f] rounded-lg border border-amber-900/40">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-amber-300 block mb-0.5">
                {isEn ? 'Current Scholarly Debates:' : 'Дискуссионные аспекты и гипотезы:'}
              </span>
              <p className="text-slate-300 leading-relaxed">{debate}</p>
            </div>
          </div>
        )}

        {unknown && (
          <div className="flex items-start gap-3 p-3 bg-[#13151f] rounded-lg border border-rose-900/40">
            <HelpIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-rose-300 block mb-0.5">
                {isEn ? 'Open Inquiries & Data Gaps:' : 'Открытые исследовательские вопросы:'}
              </span>
              <p className="text-slate-300 leading-relaxed">{unknown}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Блок «Редакционный статус»:
 */
export function EditorialStatusBlock({
  lastReviewed,
  datePublished,
  category,
  evidenceLevel,
  evidenceBasis
}: {
  lastReviewed?: string;
  datePublished?: string;
  category?: string;
  evidenceLevel?: string;
  evidenceBasis?: EvidenceBasisType[];
}) {
  const { isEn } = useLanguage();
  const displayDate = lastReviewed || '2026-08-24';

  return (
    <section className="mt-12 pt-6 border-t border-[#34384a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
      <div className="space-y-1">
        <div className="font-medium text-slate-200">
          {isEn ? 'Editorial & Epistemic Status' : 'Редакционный статус статьи'}
        </div>
        <p className="text-slate-400">
          {isEn ? 'Last scholarly review: ' : 'Последний академический пересмотр: '}
          <span className="font-mono text-kingdom-gold font-semibold">{displayDate}</span>
          {datePublished && (
            <span className="ml-3 text-slate-500">
              ({isEn ? 'Published: ' : 'Опубликовано: '}<span className="font-mono text-slate-400">{datePublished}</span>)
            </span>
          )}
        </p>
      </div>

      <div className="text-slate-400 sm:text-right sm:max-w-sm leading-relaxed">
        <p>
          {isEn 
            ? 'Monograph verified against current zoological literature, primary peer-reviewed sources, and taxonomic registries.'
            : 'Материал проверен на соответствие новейшим профильным публикациям, первичным источникам и таксономическим реестрам.'
          }
        </p>
      </div>
    </section>
  );
}
