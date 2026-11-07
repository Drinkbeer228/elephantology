import type { Contributor } from '../../src/types';

// Data contract of the library that Research Station reads (spec section 5.1).
// A change that old readers cannot handle needs a new schema number.

export const CATALOG_SCHEMA = 'elephantology.library/1';
export const BOOK_SCHEMA = 'elephantology.library.book/1';

export interface Heading {
  level: 2 | 3;
  text: string;
  h: string;
}

export interface BookNote {
  n: string;
  key: string;
  html: string;
  missing: boolean;
}

export interface BookFile {
  schema: typeof BOOK_SCHEMA;
  id: string;
  contentHash: string;
  html: string;
  notes: BookNote[];
  blocks: number;
}

export interface Discipline {
  id: string;
  name: string;
  order: number;
  description: string;
}

export interface CatalogBook {
  id: string;
  discipline: string;
  kind: 'article' | 'overview' | 'reference';
  title: string;
  shortTitle: string;
  shortTitleFrom: 'frontmatter' | 'derived';
  description: string;
  tags: string[];
  difficulty: string | null;
  evidenceLevel: string | null;
  evidenceBasis: string[];
  readingMinutes: number;
  chars: number;
  lastReviewed: string | null;
  contributors: Contributor[];
  contributorsText: string | null;
  headings: Heading[];
  related: string[];
  siteUrl: string;
  contentUrl: string;
  contentHash: string;
  missingSources: number;
}

export interface CatalogFile {
  schema: typeof CATALOG_SCHEMA;
  generatedAt: string;
  source: { commit: string; site: string };
  disciplines: Discipline[];
  books: CatalogBook[];
}

export interface BuildIssue {
  book: string;
  kind: 'missing-source' | 'unresolved-link' | 'katex' | 'missing-image' | 'repaired-math';
  detail: string;
}

/** Problems with a `catalog.json` value; an empty list means it matches schema 1. */
export function validateCatalog(x: unknown): string[] {
  const errors: string[] = [];
  catalogFile(x, 'catalog', errors);
  if (errors.length === 0) {
    const catalog = x as CatalogFile;
    uniqueIds(catalog.disciplines, 'catalog.disciplines', errors);
    uniqueIds(catalog.books, 'catalog.books', errors);
    // Reference books stand on the lectern, not on a shelf: only they may name no discipline of the catalog.
    const shelves = new Set(catalog.disciplines.map((d) => d.id));
    catalog.books.forEach((book, i) => {
      if (book.kind !== 'reference' && !shelves.has(book.discipline)) {
        errors.push(`catalog.books[${i}].discipline: "${book.discipline}" is not in catalog.disciplines`);
      }
    });
  }
  return errors;
}

/** Problems with a `books/<cat>/<slug>.json` value; an empty list means it matches schema 1. */
export function validateBook(x: unknown): string[] {
  const errors: string[] = [];
  bookFile(x, 'book', errors);
  if (errors.length === 0) {
    const book = x as BookFile;
    const seen = new Set<string>();
    book.notes.forEach((note, i) => {
      if (seen.has(note.n)) errors.push(`book.notes[${i}].n: duplicate note number "${note.n}"`);
      seen.add(note.n);
    });
  }
  return errors;
}

type Check = (value: unknown, path: string, errors: string[]) => void;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const matches =
  (pattern: RegExp, expected: string): Check =>
  (value, path, errors) => {
    if (typeof value !== 'string' || !pattern.test(value)) errors.push(`${path}: expected ${expected}`);
  };

const text: Check = (value, path, errors) => {
  if (typeof value !== 'string') errors.push(`${path}: expected a string`);
};

const filled = matches(/\S/, 'a non-empty string');
// The glossary and the bibliography are books without a category: their ids are bare slugs.
const bookId = matches(/^[\w-]+(\/[\w-]+)?$/, 'an id of the form "<cat>/<slug>" or "<slug>"');
const hash = matches(/^sha256:[0-9a-f]+$/, 'a hash of the form "sha256:<hex>"');
const httpsUrl = matches(/^https:\/\/\S+$/, 'an https:// URL');
const dateTime = matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/, 'an ISO 8601 date and time');

const count: Check = (value, path, errors) => {
  if (!Number.isInteger(value) || (value as number) < 0) errors.push(`${path}: expected a whole number of 0 or more`);
};

const positive: Check = (value, path, errors) => {
  if (!Number.isInteger(value) || (value as number) < 1) errors.push(`${path}: expected a whole number of 1 or more`);
};

const finite: Check = (value, path, errors) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) errors.push(`${path}: expected a number`);
};

const flag: Check = (value, path, errors) => {
  if (typeof value !== 'boolean') errors.push(`${path}: expected true or false`);
};

const oneOf =
  (...allowed: readonly (string | number)[]): Check =>
  (value, path, errors) => {
    if (!allowed.includes(value as string | number)) {
      errors.push(`${path}: expected one of ${allowed.map((a) => JSON.stringify(a)).join(', ')}`);
    }
  };

const nullable =
  (check: Check): Check =>
  (value, path, errors) => {
    if (value !== null) check(value, path, errors);
  };

const list =
  (item: Check): Check =>
  (value, path, errors) => {
    if (!Array.isArray(value)) {
      errors.push(`${path}: expected a list`);
      return;
    }
    value.forEach((entry, i) => item(entry, `${path}[${i}]`, errors));
  };

const record =
  (shape: Record<string, Check>): Check =>
  (value, path, errors) => {
    if (!isObject(value)) {
      errors.push(`${path}: expected an object`);
      return;
    }
    for (const [key, check] of Object.entries(shape)) {
      if (key in value) check(value[key], `${path}.${key}`, errors);
      else errors.push(`${path}.${key}: missing`);
    }
  };

const contributor = record({
  name: filled,
  role: filled,
  affiliation: nullable(text),
  orcid: nullable(text),
  url: nullable(text),
});

const heading = record({ level: oneOf(2, 3), text: filled, h: filled });

const discipline = record({ id: filled, name: filled, order: finite, description: text });

const catalogBookFields = record({
  id: bookId,
  discipline: filled,
  kind: oneOf('article', 'overview', 'reference'),
  title: filled,
  shortTitle: filled,
  shortTitleFrom: oneOf('frontmatter', 'derived'),
  description: text,
  tags: list(text),
  difficulty: nullable(text),
  evidenceLevel: nullable(text),
  evidenceBasis: list(text),
  readingMinutes: positive,
  chars: count,
  lastReviewed: nullable(text),
  contributors: list(contributor),
  contributorsText: nullable(text),
  headings: list(heading),
  related: list(text),
  siteUrl: httpsUrl,
  contentUrl: text,
  contentHash: hash,
  missingSources: count,
});

// The book file of `<cat>/<slug>` lives at `books/<cat>/<slug>.json`, next to `catalog.json`.
const catalogBook: Check = (value, path, errors) => {
  const before = errors.length;
  catalogBookFields(value, path, errors);
  if (errors.length > before) return;
  const book = value as CatalogBook;
  if (book.contentUrl !== `books/${book.id}.json`) {
    errors.push(`${path}.contentUrl: expected "books/${book.id}.json"`);
  }
};

const catalogFile = record({
  schema: oneOf(CATALOG_SCHEMA),
  generatedAt: dateTime,
  source: record({ commit: filled, site: httpsUrl }),
  disciplines: list(discipline),
  books: list(catalogBook),
});

const note = record({ n: filled, key: filled, html: text, missing: flag });

const bookFile = record({
  schema: oneOf(BOOK_SCHEMA),
  id: bookId,
  contentHash: hash,
  html: text,
  notes: list(note),
  blocks: count,
});

function uniqueIds(entries: readonly { id: string }[], path: string, errors: string[]): void {
  const seen = new Set<string>();
  entries.forEach((entry, i) => {
    if (seen.has(entry.id)) errors.push(`${path}[${i}].id: duplicate id "${entry.id}"`);
    seen.add(entry.id);
  });
}
