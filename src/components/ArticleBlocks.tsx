import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ShieldCheck, Scale, AlertCircle, Lightbulb, HelpCircle, CheckCircle2, HelpCircle as HelpIcon, AlertTriangle } from 'lucide-react';

/**
 * Рендерит бейдж уровня доказательности (Established, Moderate, Limited, Hypothesis, Contested)
 */
export function EvidenceBadge({ level, showTooltip = true }: { level?: string; showTooltip?: boolean }) {
  if (!level) return null;

  const normalized = level.toLowerCase();

  // Сопоставление уровней доказательности согласно ТЗ:
  // established (зелёный), moderate (синий), limited (жёлтый), hypothesis (оранжевый), contested (красный)
  const configMap: Record<string, { label: string; bg: string; text: string; border: string; icon: any; description: string }> = {
    established: {
      label: 'УСТАНОВЛЕНО',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: ShieldCheck,
      description: 'Установленный научный факт: подтверждено множественными независимыми исследованиями и консенсусом.'
    },
    moderate: {
      label: 'ДОСТАТОЧНАЯ БАЗА',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Scale,
      description: 'Достаточная доказательная база: подтверждено валидированными клиническими или эмпирическими данными.'
    },
    limited: {
      label: 'ОГРАНИЧЕННЫЕ ДАННЫЕ',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: AlertCircle,
      description: 'Ограниченные данные: наблюдения единичных когорт или предварительные пилотные исследования.'
    },
    hypothesis: {
      label: 'ГИПОТЕЗА',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
      icon: Lightbulb,
      description: 'Научная гипотеза: теоретическая модель или экстраполяция, требующая дальнейшей экспериментальной верификации.'
    },
    contested: {
      label: 'ДИСКУССИОННО',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: HelpCircle,
      description: 'Дискуссионный вопрос: в академическом сообществе существуют взаимоисключающие данные или полемика.'
    }
  };

  const current = configMap[normalized] || configMap.established;
  const Icon = current.icon;

  return (
    <div className="relative inline-flex group items-center align-middle">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${current.bg} ${current.text} ${current.border}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{current.label}</span>
      </span>

      {showTooltip && (
        <div className="absolute left-0 top-full mt-1.5 w-64 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl text-xs text-slate-600 dark:text-slate-300 font-normal normal-case opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30 pointer-events-none">
          {current.description}
        </div>
      )}
    </div>
  );
}

/**
 * Блок «Ключевые сведения / Показатели»:
 * Светлый фон (slate-50 / dark:slate-900/60), левая рамка 4px slate-400, padding 20px
 */
export function KeyFindingsBlock({ content }: { content: string }) {
  if (!content) return null;

  return (
    <section className="my-8 rounded-xl border border-[#34384a] border-l-4 border-l-amber-400 bg-[#161822] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-amber-300 font-semibold text-sm">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Ключевые сведения</span>
      </div>
      <div className="text-slate-200 text-sm leading-relaxed space-y-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 text-slate-200" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 text-slate-200" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 text-slate-200" {...props} />,
            li: ({ node, ...props }) => <li className="text-slate-200" {...props} />,
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-3 border border-[#34384a] rounded-lg">
                <table className="w-full text-xs text-left border-collapse" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => <th className="border-b border-[#34384a] bg-[#1f2230] text-slate-100 font-semibold py-2.5 px-3 uppercase tracking-wider text-[11px]" {...props} />,
            td: ({ node, ...props }) => <td className="border-b border-[#252838] bg-[#141620]/80 py-2.5 px-3 text-slate-200 text-xs" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
}

/**
 * Блок «Научная неопределённость»:
 * Три подблока (Known / Probable / Unknown), каждый с цветной иконкой-маркером (зеленый / желтый / красный)
 */
export function ScientificUncertaintyBlock({
  known,
  probable,
  unknown
}: {
  known?: string;
  probable?: string;
  unknown?: string;
}) {
  if (!known && !probable && !unknown) return null;

  return (
    <section className="my-10 p-5 rounded-2xl bg-[#161822] border border-[#34384a]">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#34384a]">
        <Scale className="w-4 h-4 text-kingdom-gold shrink-0" />
        <h3 className="font-semibold text-sm text-white">
          Границы научного знания и неопределённость
        </h3>
      </div>

      <div className="space-y-4">
        {/* Что достоверно известно (Known) - Зелёный */}
        {known && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121f1a] border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-emerald-300 block mb-0.5">
                Достоверно установлено:
              </span>
              <p className="text-slate-200 leading-relaxed">{known}</p>
            </div>
          </div>
        )}

        {/* Что вероятно / в процессе изучения (Probable) - Жёлтый */}
        {probable && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#231e13] border border-amber-500/30">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-amber-300 block mb-0.5">
                Вероятно / Требует подтверждения:
              </span>
              <p className="text-slate-200 leading-relaxed">{probable}</p>
            </div>
          </div>
        )}

        {/* Что неизвестно / открытые вопросы (Unknown) - Красный */}
        {unknown && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#25151b] border border-rose-500/30">
            <HelpIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-rose-300 block mb-0.5">
                Открытые исследовательские вопросы:
              </span>
              <p className="text-slate-200 leading-relaxed">{unknown}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Блок «Редакционный статус»:
 * Дата пересмотра, примечание об актуальности и рецензировании
 */
export function EditorialStatusBlock({
  lastReviewed,
  category,
  evidenceLevel
}: {
  lastReviewed?: string;
  category?: string;
  evidenceLevel?: string;
}) {
  const displayDate = lastReviewed || '2026-08-28';

  return (
    <section className="mt-12 pt-6 border-t border-[#34384a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
      <div className="space-y-1">
        <div className="font-medium text-slate-200">
          Редакционный статус статьи
        </div>
        <p className="text-slate-400">
          Последний академический пересмотр: <span className="font-mono text-kingdom-gold font-semibold">{displayDate}</span>
        </p>
      </div>

      <div className="text-slate-400 text-right sm:max-w-xs leading-relaxed">
        <p>
          Материал проверен на соответствие новейшим профильным публикациям и таксономическим реестрам.
        </p>
      </div>
    </section>
  );
}
