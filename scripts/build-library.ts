import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildLibrary, type BuildReport } from './library/buildLibrary';

/** `--name=value` flags; a flag that is absent falls back to the default. */
function parseArgs(argv: string[]): Record<'docs' | 'public' | 'out' | 'site', string> {
  const flags = new Map<string, string>();
  for (const arg of argv) {
    const match = /^--([a-z]+)=(.*)$/.exec(arg);
    if (match) flags.set(match[1], match[2]);
  }
  return {
    docs: flags.get('docs') ?? './docs',
    public: flags.get('public') ?? './public',
    out: flags.get('out') ?? './dist/library',
    site: flags.get('site') ?? 'https://drinkbeer228.github.io/elephantology',
  };
}

function currentCommit(): string {
  return process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
}

type Issue = BuildReport['issues'][number];

const issuesOf = (report: BuildReport, kind: Issue['kind']): Issue[] => report.issues.filter((issue) => issue.kind === kind);

/** Prints the issues of one kind, one line each: the book, then the detail. */
function printIssues(report: BuildReport, kind: Issue['kind'], title: string): void {
  const issues = issuesOf(report, kind);
  console.log(`${title}: ${issues.length}`);
  for (const issue of issues) console.log(`  ${issue.book}: ${issue.detail}`);
}

/** Prints `<count>  <book>` per book, most first. */
function printCountsPerBook(report: BuildReport, kind: Issue['kind'], title: string): void {
  const counts = new Map<string, number>();
  for (const issue of issuesOf(report, kind)) counts.set(issue.book, (counts.get(issue.book) ?? 0) + 1);
  console.log(`${title}: ${issuesOf(report, kind).length} in ${counts.size} books`);
  for (const [book, count] of [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) console.log(`  ${String(count).padStart(4)}  ${book}`);
}

/** The 1-based source line holding the end of a formula, so a KaTeX error can be found in the article. */
function lineOf(docsDir: string, book: string, formula: string): string {
  const file = join(docsDir, `${book}.md`);
  const tail = formula.trimEnd().slice(-12);
  if (!existsSync(file) || tail.length < 8) return '';
  const index = readFileSync(file, 'utf8').split('\n').findIndex((line) => line.includes(tail));
  return index < 0 ? '' : ` (line ${index + 1})`;
}

function printKatexErrors(report: BuildReport, docsDir: string): void {
  const issues = issuesOf(report, 'katex');
  console.log(`KaTeX errors: ${issues.length}`);
  for (const issue of issues) {
    const formula = issue.detail.split(' \u2014 KaTeX')[0];
    console.log(`  ${issue.book}${lineOf(docsDir, issue.book, formula)}: ${issue.detail}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const { report } = await buildLibrary({
    docsDir: resolve(args.docs),
    publicDir: resolve(args.public),
    outDir: resolve(args.out),
    siteBase: args.site,
    commit: currentCommit(),
    now: new Date().toISOString(),
  });

  console.log(`library: ${report.books} books (${report.articles} articles) -> ${resolve(args.out)}`);
  printKatexErrors(report, resolve(args.docs));
  printCountsPerBook(report, 'missing-source', 'missing-source notes');
  printIssues(report, 'unresolved-link', 'unresolved links');
  printIssues(report, 'repaired-math', 'repaired formulas');
  printIssues(report, 'missing-image', 'missing images');
  console.log(`schema errors: ${report.schemaErrors.length}`);
  for (const error of report.schemaErrors) console.log(`  ${error}`);

  // The files and the report are written first; only then does the exit code decide.
  if (report.schemaErrors.length > 0 || report.books < report.articles || report.katexErrors > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
