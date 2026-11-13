const LIMIT = 40;

/**
 * Short title of an article that has no `short_title` (spec 5.1): the part before the first
 * colon; when that is longer than 40 characters it is cut at the last space within the first
 * 41, then trailing punctuation and trailing words of two letters or fewer are removed.
 */
export function deriveShortTitle(title: string): string {
  let short = title.split(':')[0].trim();
  if (short.length > LIMIT) {
    const head = short.slice(0, LIMIT + 1);
    const space = head.lastIndexOf(' ');
    short = space > 0 ? head.slice(0, space) : head.slice(0, LIMIT);
  }
  for (;;) {
    const trimmed = short.replace(/[\s\p{P}]+$/u, '');
    const withoutWord = trimmed.replace(/\s+\p{L}{1,2}$/u, '');
    if (withoutWord === short) return short;
    short = withoutWord;
  }
}
