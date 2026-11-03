import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, HelpCircle, Layers, FlaskConical, Check } from 'lucide-react';

/* ============================================================
   StepTabs — горизонтальная лента шагов урока в стиле Stepik iOS.
   Типы степов определяются по заголовкам разделов (h2) статьи:
     📖 теория · ❓ тест/вопросы · 🗂 карточки/термины · 🧪 симулятор/эксперимент
   Активный шаг: яркий цвет + 2px градиентная линия #0593C6 → #D83996 снизу.
   Пройденный шаг: миниатюрная галочка под иконкой.
   Контент статей НЕ изменяется — только навигация поверх него.
   ============================================================ */

export type StepKind = 'theory' | 'quiz' | 'cards' | 'lab';

export interface LessonStep {
  id: string;
  title: string;
  kind: StepKind;
}

const STEP_META: Record<StepKind, { icon: typeof BookOpen; label: string }> = {
  theory: { icon: BookOpen,      label: 'Теория' },
  quiz:   { icon: HelpCircle,    label: 'Тест' },
  cards:  { icon: Layers,        label: 'Карточки' },
  lab:    { icon: FlaskConical,  label: 'Практика' },
};

/** slugify заголовка — должен совпадать с id, которые генерирует ArticleViewer */
export function stepSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Определение типа степа по названию раздела (без изменения текста статьи) */
export function classifyStep(title: string): StepKind {
  const s = title.toLowerCase();
  if (/(тест|квиз|провер|вопрос|quiz|self[- ]?check)/.test(s)) return 'quiz';
  if (/(карточк|термин|глоссар|словар|termin|flashcard)/.test(s)) return 'cards';
  if (/(симулятор|эксперимент|лаборатор|практик|simulat|lab\b|hands[- ]?on)/.test(s)) return 'lab';
  return 'theory';
}

interface StepTabsProps {
  steps: LessonStep[];
  onScrollToStep?: (step: LessonStep) => void;
  /** i18n-подписи (опционально, RU по умолчанию) */
  labels?: Partial<Record<StepKind, string>>;
}

export function StepTabs({ steps, onScrollToStep, labels }: StepTabsProps) {
  const [activeId, setActiveId] = useState<string>(steps[0]?.id ?? '');
  const [visited, setVisited] = useState<Set<string>>(new Set());

  // Сброс при смене статьи
  useEffect(() => {
    setActiveId(steps[0]?.id ?? '');
    setVisited(new Set());
  }, [steps.map((s) => s.id).join('|')]);

  // Scroll-spy: активным считается последний пройденный заголовок раздела
  useEffect(() => {
    if (steps.length === 0) return;
    const headings = steps
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (headings.length === 0) return;

    const onScroll = () => {
      const offset = 120; // высота шапки + ленты
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= offset) current = h.id;
      }
      setActiveId(current);
      setVisited((prev) => (prev.has(current) ? prev : new Set(prev).add(current)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [steps]);

  const orderedActiveIndex = useMemo(
    () => steps.findIndex((s) => s.id === activeId),
    [steps, activeId],
  );

  if (steps.length < 2) return null;

  const handleClick = (step: LessonStep) => {
    setActiveId(step.id);
    setVisited((prev) => new Set(prev).add(step.id));
    if (onScrollToStep) {
      onScrollToStep(step);
    } else {
      const el = document.getElementById(step.id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      aria-label="Шаги урока"
      className="sticky top-16 z-40 -mx-4 px-2 sm:mx-0 sm:px-0 overflow-x-auto"
      style={{
        background: 'color-mix(in srgb, var(--page-bg) 78%, transparent)',
        backdropFilter: 'blur(14px) saturate(150%)',
        WebkitBackdropFilter: 'blur(14px) saturate(150%)',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <ol className="flex items-stretch gap-1 min-w-max py-1">
        {steps.map((step, idx) => {
          const Icon = STEP_META[step.kind].icon;
          const isActive = step.id === activeId;
          // Пройденным считаем все шаги левее активного + явно посещённые
          const isDone = !isActive && (idx < orderedActiveIndex || visited.has(step.id));
          const label = labels?.[step.kind] ?? STEP_META[step.kind].label;

          return (
            <li key={step.id} className="relative">
              <button
                onClick={() => handleClick(step)}
                aria-current={isActive ? 'step' : undefined}
                title={step.title}
                className={`group flex flex-col items-center gap-0.5 px-3 pt-2 pb-1.5 rounded-t-lg transition-colors cursor-pointer min-w-[64px] focus:outline-none ${
                  isActive
                    ? 'text-brand-blue'
                    : isDone
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-400/70 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(5,147,198,0.45)]' : ''}`}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span className="text-[10px] font-semibold tracking-wide uppercase leading-none">
                  {label}
                </span>
                {/* Миниатюрная отметка пройденного шага (галочка-точка) */}
                <span className="h-3 flex items-center justify-center">
                  {isDone ? (
                    <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} aria-hidden />
                  ) : (
                    <span
                      className={`w-1 h-1 rounded-full ${isActive ? 'bg-transparent' : 'bg-slate-600'}`}
                      aria-hidden
                    />
                  )}
                </span>
                {/* Нижняя линия активного шага: 2px, градиент #0593C6 → #D83996 */}
                <span
                  className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-opacity"
                  style={{
                    backgroundImage: 'var(--brand-gradient)',
                    opacity: isActive ? 1 : 0,
                  }}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
