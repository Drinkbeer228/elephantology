export type BuildArgs = Record<'docs' | 'public' | 'out' | 'site', string>;

const DEFAULTS: BuildArgs = {
  docs: './docs',
  public: './public',
  out: './dist/library',
  site: 'https://drinkbeer228.github.io/elephantology',
};

/**
 * `--name=value` flags for `build-library.ts`. An absent flag takes its default;
 * an unknown, repeated or malformed one throws, so a typo cannot fall back silently.
 */
export function parseArgs(argv: readonly string[]): BuildArgs {
  const args = { ...DEFAULTS };
  const seen = new Set<string>();
  for (const arg of argv) {
    const match = /^--([a-z]+)=(.+)$/.exec(arg);
    if (!match) throw new Error(`unexpected argument: ${arg} (expected --name=value)`);
    const [, name, value] = match as unknown as [string, keyof BuildArgs, string];
    if (!(name in DEFAULTS)) throw new Error(`unknown flag: --${name} (known: ${Object.keys(DEFAULTS).map((k) => `--${k}`).join(', ')})`);
    if (seen.has(name)) throw new Error(`repeated flag: --${name}`);
    seen.add(name);
    args[name] = value;
  }
  return args;
}
