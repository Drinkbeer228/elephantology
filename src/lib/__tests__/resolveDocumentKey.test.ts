import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { resolveDocumentKey } from '../../content/resolveDocumentKey';

const keys = ['/docs/anatomy/muscular-hydrostat-and-trunk-biomechanics.md', '/docs/anatomy/index.md', '/docs/veterinary/clinical-podiatry-and-foot-care.md'];

describe('resolveDocumentKey (pure)', () => {
  it('resolves relative article links', () => {
    expect(resolveDocumentKey('../anatomy/muscular-hydrostat-and-trunk-biomechanics.md', keys)).toBe(keys[0]);
  });
  it('resolves legacy slugs', () => {
    expect(resolveDocumentKey('foot_care', keys)).toBe(keys[2]);
  });
  it('returns null for unknown paths', () => {
    expect(resolveDocumentKey('nothing-like-this', keys)).toBeNull();
  });
  it('does not depend on Vite-only APIs', () => {
    const src = readFileSync(new URL('../../content/resolveDocumentKey.ts', import.meta.url), 'utf8');
    expect(src).not.toMatch(/import\.meta|documentLoader/);
  });
});
