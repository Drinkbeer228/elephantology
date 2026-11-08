import { describe, it, expect } from 'vitest';
import { validateCatalog, validateBook } from '../schema';

// The `catalog.json` example from spec section 5.1, verbatim.
const catalog = {
  "schema": "elephantology.library/1",
  "generatedAt": "2026-11-07T12:00:00Z",
  "source": { "commit": "43b0f0e", "site": "https://drinkbeer228.github.io/elephantology/" },
  "disciplines": [
    { "id": "anatomy", "name": "Анатомия и Физиология", "order": 2, "description": "…" }
  ],
  "books": [
    {
      "id": "anatomy/muscular-hydrostat-and-trunk-biomechanics",
      "discipline": "anatomy",
      "kind": "article",
      "title": "Клиническая миология, биомеханика мышечного гидростата…",
      "shortTitle": "Хобот",
      "shortTitleFrom": "frontmatter",
      "description": "…",
      "tags": ["…"],
      "difficulty": "advanced",
      "evidenceLevel": "established",
      "evidenceBasis": ["peer_reviewed", "primary_studies"],
      "readingMinutes": 11,
      "chars": 17712,
      "lastReviewed": "2026-08-24",
      "contributors": [],
      "contributorsText": null,
      "headings": [{ "level": 2, "text": "1. Анатомическая архитектоника…", "h": "1-анатомическая-…" }],
      "related": ["anatomy/sensory-umwelt-and-multimodal-perception"],
      "siteUrl": "https://drinkbeer228.github.io/elephantology/article/anatomy/muscular-hydrostat-and-trunk-biomechanics/",
      "contentUrl": "books/anatomy/muscular-hydrostat-and-trunk-biomechanics.json",
      "contentHash": "sha256:1f2e3d4c5b6a",
      "missingSources": 0
    }
  ]
};

// The `books/<cat>/<slug>.json` example from spec section 5.1, verbatim.
const book = {
  "schema": "elephantology.library.book/1",
  "id": "anatomy/muscular-hydrostat-and-trunk-biomechanics",
  "contentHash": "sha256:1f2e3d4c5b6a",
  "html": "<section class=\"body\">…</section>",
  "notes": [{ "n": "1", "key": "1", "html": "Kier, W. M., & Smith, K. K. (1985)…", "missing": false }],
  "blocks": 214
};

describe('validateCatalog', () => {
  it('accepts the catalog example from the spec', () => {
    expect(validateCatalog(catalog)).toEqual([]);
  });
  it('rejects a catalog without books', () => {
    const { books: _books, ...withoutBooks } = catalog;
    expect(validateCatalog(withoutBooks)).not.toEqual([]);
  });
  it('rejects an unknown schema', () => {
    expect(validateCatalog({ ...catalog, schema: 'x' })).not.toEqual([]);
  });
  it('rejects a book without contentHash', () => {
    const { contentHash: _hash, ...bookWithoutHash } = catalog.books[0];
    expect(validateCatalog({ ...catalog, books: [bookWithoutHash] })).not.toEqual([]);
  });
});

describe('validateBook', () => {
  it('accepts the book example from the spec', () => {
    expect(validateBook(book)).toEqual([]);
  });
  it('rejects a book without notes', () => {
    const { notes: _notes, ...withoutNotes } = book;
    expect(validateBook(withoutNotes)).not.toEqual([]);
  });
  it('rejects an unknown schema', () => {
    expect(validateBook({ ...book, schema: 'x' })).not.toEqual([]);
  });
  it('rejects a book without contentHash', () => {
    const { contentHash: _hash, ...withoutHash } = book;
    expect(validateBook(withoutHash)).not.toEqual([]);
  });
});
