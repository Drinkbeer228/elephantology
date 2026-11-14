import { describe, expect, it } from 'vitest';
import { parseArgs } from '../args';

describe('parseArgs', () => {
  it('uses defaults and known flags', () => {
    expect(parseArgs(['--out=./x'])).toEqual({
      docs: './docs',
      public: './public',
      out: './x',
      site: 'https://drinkbeer228.github.io/elephantology',
    });
  });
  it('rejects unknown, malformed and repeated flags', () => {
    expect(() => parseArgs(['--ouy=./x'])).toThrow(/unknown flag: --ouy/);
    expect(() => parseArgs(['out=./x'])).toThrow(/unexpected argument/);
    expect(() => parseArgs(['--out='])).toThrow(/unexpected argument/);
    expect(() => parseArgs(['--out=a', '--out=b'])).toThrow(/repeated flag/);
  });
});
