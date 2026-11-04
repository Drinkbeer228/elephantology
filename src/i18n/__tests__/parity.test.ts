import { describe, it, expect } from 'vitest';
import { ru } from '../ru';
import { en } from '../en';

/** Собираем все пути leaf-ключей вложенного объекта переводов */
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') out.push(...collectKeys(v as Record<string, unknown>, path));
    else out.push(path);
  }
  return out.sort();
}

describe('i18n RU/EN parity', () => {
  const ruKeys = collectKeys(ru);
  const enKeys = collectKeys(en);

  it('наборы ключей идентичны', () => {
    expect(enKeys).toEqual(ruKeys);
  });

  it('все значения — непустые строки', () => {
    const check = (obj: Record<string, unknown>, name: string) => {
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === 'object') check(v as Record<string, unknown>, `${name}.${k}`);
        else expect(typeof v === 'string' && (v as string).trim().length > 0, `${name}.${k}`).toBe(true);
      }
    };
    check(ru, 'ru');
    check(en, 'en');
  });

  it('секция steps содержит все типы степов', () => {
    for (const dict of [ru.steps, en.steps]) {
      expect(dict.theory).toBeTruthy();
      expect(dict.quiz).toBeTruthy();
      expect(dict.cards).toBeTruthy();
      expect(dict.lab).toBeTruthy();
      expect(dict.navAria).toBeTruthy();
    }
  });

  it('в EN UI-словаре нет кириллицы', () => {
    const cyr = /[А-Яа-яЁё]/;
    // Секции чистого UI (без шаблонов библиографических цитат, где «Слонология» — имя собственное ГОСТ-формата)
    const uiDicts = { header: en.header, footer: en.footer, catalog: en.catalog, article: en.article, evidence: en.evidence, search: en.search, steps: en.steps, a11y: en.a11y };
    const paths = collectKeys(uiDicts);
    const values = paths.map((p) => p.split('.').reduce<unknown>((o: any, k) => o?.[k], uiDicts));
    const bad = values.filter((v) => typeof v === 'string' && cyr.test(v));
    expect(bad).toEqual([]);
  });
});
