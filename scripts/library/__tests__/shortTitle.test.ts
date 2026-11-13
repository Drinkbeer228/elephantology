import { describe, it, expect } from 'vitest';
import { deriveShortTitle } from '../shortTitle';

describe('deriveShortTitle', () => {
  it.each([
    ['Иммуногеномика Elephantidae', 'Иммуногеномика Elephantidae'],
    ['Клиническая миология, биомеханика мышечного гидростата и нейросенсорный контроль хобота (Proboscis) у Elephantidae: архитектоника', 'Клиническая миология, биомеханика'],
    ['Мониторинг CITES, программа MIKE и криминалистика браконьерства слоновой кости', 'Мониторинг CITES, программа MIKE'],
  ])('%s', (title, expected) => expect(deriveShortTitle(title)).toBe(expected));
});
