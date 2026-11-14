/** Where the Research Station library reader lives (it reads the books this site publishes). */
export const LIBRARY_READER = 'https://drinkbeer228.github.io/research-station/#/library/';

/**
 * The reader link for an article: its path without `.md` is the book id
 * (`anatomy/x.md` → `#/library/anatomy/x`, `bibliography.md` → `#/library/bibliography`).
 */
export function libraryBookUrl(path: string): string {
  const id = path.replace(/^\/+/, '').replace(/^docs\//, '').replace(/\.md$/, '');
  return `${LIBRARY_READER}${id.split('/').map(encodeURIComponent).join('/')}`;
}
