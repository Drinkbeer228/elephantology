import { describe, it, expect } from 'vitest';
import { normalizeDoi, formatDoiUrl } from '../doi';

describe('normalizeDoi', () => {
  it('passes through a clean DOI', () => {
    expect(normalizeDoi('10.1234/abcd.ef-9')).toBe('10.1234/abcd.ef-9');
  });

  it('strips https://doi.org/ prefix', () => {
    expect(normalizeDoi('https://doi.org/10.1016/j.anbehav.2020.05.001')).toBe(
      '10.1016/j.anbehav.2020.05.001'
    );
  });

  it('strips http://dx.doi.org/ prefix', () => {
    expect(normalizeDoi('http://dx.doi.org/10.1038/s41586-021-00001-0')).toBe(
      '10.1038/s41586-021-00001-0'
    );
  });

  it('strips "doi:" prefix', () => {
    expect(normalizeDoi('doi: 10.7551/eio/003.0001')).toBe('10.7551/eio/003.0001');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeDoi('  10.1007/978-1-4020-8274-0_1  ')).toBe('10.1007/978-1-4020-8274-0_1');
  });

  it('returns null for invalid input', () => {
    expect(normalizeDoi(undefined)).toBeNull();
    expect(normalizeDoi(null)).toBeNull();
    expect(normalizeDoi('')).toBeNull();
    expect(normalizeDoi('not-a-doi')).toBeNull();
    expect(normalizeDoi('11.1234/nope')).toBeNull();
    expect(normalizeDoi('10.1234')).toBeNull(); // no slash
  });

  it('accepts special registry characters via fallback', () => {
    expect(normalizeDoi('10.9999/weird;suffix:(x)/y')).toBe('10.9999/weird;suffix:(x)/y');
  });
});

describe('formatDoiUrl', () => {
  it('builds canonical resolvable URL', () => {
    expect(formatDoiUrl('10.1234/abc')).toBe('https://doi.org/10.1234/abc');
  });

  it('normalizes before formatting', () => {
    expect(formatDoiUrl('https://doi.org/10.1234/abc')).toBe('https://doi.org/10.1234/abc');
  });

  it('returns null for garbage', () => {
    expect(formatDoiUrl('javascript:alert(1)')).toBeNull();
    expect(formatDoiUrl('')).toBeNull();
  });
});
