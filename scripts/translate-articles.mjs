#!/usr/bin/env node
/**
 * Batch LLM translation pipeline: docs/ (RU) -> docs_en/ (EN).
 *
 * Usage:
 *   TRANSLATE_API_KEY=sk-... node scripts/translate-articles.mjs [--dry-run] [--force] [--only=<slug>]
 *
 * Env:
 *   TRANSLATE_API_KEY   (required unless --dry-run) — Bearer token for the API
 *   TRANSLATE_BASE_URL  (default https://api.openai.com/v1) — any OpenAI-compatible
 *                       chat-completions endpoint (OpenAI, DeepSeek, Mistral,
 *                       OpenRouter, local Ollama with /v1, ...)
 *   TRANSLATE_MODEL     (default gpt-4o-mini)
 *   TRANSLATE_CONCURRENCY (default 3)
 *   TRANSLATE_MAX_TOKENS  (default 8000 per chunk response)
 *
 * Behaviour:
 *   - Splits each markdown article into chunks at heading boundaries (~6000 chars),
 *     never cutting inside fenced code blocks.
 *   - Translates chunks sequentially (context continuity), concatenates results.
 *   - Frontmatter is preserved verbatim (SEO metadata stays RU canonical).
 *   - Resume-safe: skips existing docs_en files unless --force or source mtime changed.
 *   - Validates output: no leftover Cyrillic prose outside math/code, footnote markers
 *     [^n] and image/link paths preserved; on failure retries once, then keeps backup.
 */
import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';

const ROOT = path.resolve(import.meta.dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUT_DIR = path.join(ROOT, 'docs_en');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const ONLY = (args.find(a => a.startsWith('--only=')) || '').replace('--only=', '');

const BASE_URL = (process.env.TRANSLATE_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const MODEL = process.env.TRANSLATE_MODEL || 'gpt-4o-mini';
const API_KEY = process.env.TRANSLATE_API_KEY || '';
const CONCURRENCY = parseInt(process.env.TRANSLATE_CONCURRENCY || '3', 10);
const MAX_OUTPUT_TOKENS = parseInt(process.env.TRANSLATE_MAX_TOKENS || '8000', 10);
const CHUNK_CHARS = 6000;

if (!DRY_RUN && !API_KEY) {
  console.error('ERROR: set TRANSLATE_API_KEY (or pass --dry-run to just list what would be translated).');
  process.exit(1);
}

// ---------- file discovery ----------
function collectMd(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'stylesheets') continue;
      collectMd(full, base, acc);
    } else if (entry.name.endsWith('.md')) {
      acc.push(path.relative(base, full));
    }
  }
  return acc;
}

// ---------- frontmatter split ----------
const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
function splitFrontmatter(text) {
  const m = text.match(FM_RE);
  if (!m) return { fm: null, body: text };
  return { fm: m[0], body: text.slice(m[0].length) };
}

// ---------- chunking (heading boundaries, fence-aware) ----------
function chunkBody(body, maxChars = CHUNK_CHARS) {
  const lines = body.split('\n');
  const chunks = [];
  let current = [];
  let currentLen = 0;
  let inFence = false;

  const flush = () => {
    if (current.length) {
      chunks.push(current.join('\n'));
      current = [];
      currentLen = 0;
    }
  };

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const isBoundary = !inFence && /^#{2,3}\s/.test(line);
    if (isBoundary && currentLen + line.length > maxChars) {
      flush();
    }
    // hard safety split for giant paragraphs outside fences
    if (!inFence && currentLen + line.length > maxChars * 1.6 && currentLen > 0) {
      flush();
    }
    current.push(line);
    currentLen += line.length + 1;
  }
  flush();
  return chunks.filter(c => c.trim().length > 0);
}

// ---------- validation ----------
function validate(src, out) {
  const problems = [];
  // strip code fences + inline math/code before Cyrillic check
  const stripped = out
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/(?<!\\)\$[^$\n]+\$/g, ' ')
    .replace(/`[^`\n]+`/g, ' ');
  const cyrCount = (stripped.match(/[а-яА-ЯёЁ]/g) || []).length;
  const srcCyr = (src.replace(/```[\s\S]*?```/g, ' ').match(/[а-яА-ЯёЁ]/g) || []).length;
  if (cyrCount > Math.max(40, srcCyr * 0.05)) {
    problems.push(`leftover Cyrillic: ${cyrCount} chars (source had ${srcCyr})`);
  }
  const srcFoot = new Set((src.match(/\[\^[^\]]+\]/g) || []));
  const outFoot = new Set((out.match(/\[\^[^\]]+\]/g) || []));
  const missingFoot = [...srcFoot].filter(f => !outFoot.has(f));
  if (missingFoot.length) problems.push(`lost footnote markers: ${missingFoot.slice(0, 5).join(', ')}`);
  const srcImgs = (src.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;
  const outImgs = (out.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;
  if (outImgs < srcImgs) problems.push(`images dropped: ${outImgs}/${srcImgs}`);
  if (!/^#\s+/m.test(out) && /^#\s+/m.test(src)) problems.push('H1 lost');
  return problems;
}

// ---------- LLM call ----------
const SYSTEM_PROMPT = `You are a professional translator producing publishable English prose for an academic encyclopedia about elephants (Elephantidae), originally written in Russian.

STRICT RULES:
1. Output ONLY the translated Markdown. No commentary, no preamble, no triple-backtick wrapping of the whole document.
2. Preserve ALL Markdown structure exactly: heading levels (#, ##), emphasis, blockquotes, tables (keep column alignment), lists, HTML tags, KaTeX math ($...$, $$...$$, \\[...\\]) and inline code. NEVER translate or alter anything inside $...$ math, \`code\`, or fenced code blocks — copy them byte-for-byte.
3. Preserve footnote syntax untouched: [\^ref] markers and [\^ref]: definition lines keep their identifiers exactly; translate only the definition text after the colon.
4. Preserve all link/image targets (URLs, relative paths like ../assets/...) unchanged; translate only visible link text.
5. Keep Latin-script scientific names (Loxodonta africana, Proboscidea, Elephas maximus), gene/protein symbols, units (kg, cm, Ma, Hz) and numeric values as-is. Convert decimal commas to decimal points in numbers.
6. Render Russian section headings with their established English equivalents (e.g. «Ключевые сведения» -> "Key Findings", «Научная неопределённость» -> "Scientific Uncertainty", «Литература» -> "References", «Связанные знания» -> "Related Topics").
7. Register: formal academic English, precise terminology (anatomy, veterinary science, paleontology, genomics). Do not simplify or omit content — translate everything, sentence by sentence.
8. A previous partial translation may be provided for context; do NOT re-output it, continue seamlessly from where it ends.`;

async function translateChunk(chunk, prevTail, attempt = 1) {
  const userMsg = prevTail
    ? `Context — tail of the already-translated previous part (do not repeat):\n"""\n${prevTail}\n"""\n\nTranslate the following next part into English:\n\n${chunk}`
    : `Translate the following Markdown document part into English:\n\n${chunk}`;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  let out = (json.choices?.[0]?.message?.content || '').trim();
  // unwrap accidental full-document code fence
  out = out.replace(/^```(?:markdown)?\r?\n/, '').replace(/\r?\n```\s*$/, '');
  if (!out) throw new Error('Empty completion');
  return out;
}

async function translateWithRetry(chunk, prevTail) {
  try {
    return await translateChunk(chunk, prevTail);
  } catch (err) {
    console.warn(`  retry after error: ${err.message}`);
    await new Promise(r => setTimeout(r, 3000));
    return await translateChunk(chunk, prevTail);
  }
}

// ---------- per-file pipeline ----------
async function processFile(relPath) {
  const srcFile = path.join(DOCS_DIR, relPath);
  const outFile = path.join(OUT_DIR, relPath);
  const srcRaw = fs.readFileSync(srcFile, 'utf8');
  const { fm, body } = splitFrontmatter(srcRaw);

  if (!FORCE && fs.existsSync(outFile)) {
    const stSrc = fs.statSync(srcFile).mtimeMs;
    const stOut = fs.statSync(outFile).mtimeMs;
    if (stOut >= stSrc) return { relPath, status: 'skip(up-to-date)' };
  }

  const chunks = chunkBody(body);
  const parts = [];
  let tokensIn = 0, tokensOut = 0;
  for (let i = 0; i < chunks.length; i++) {
    const prevTail = parts.length ? parts[parts.length - 1].slice(-600) : null;
    const translated = await translateWithRetry(chunks[i], prevTail);
    parts.push(translated);
    tokensIn += Math.ceil(chunks[i].length / 3.5);
    tokensOut += Math.ceil(translated.length / 4);
    console.log(`  [${relPath}] chunk ${i + 1}/${chunks.length} done (${translated.length} chars)`);
  }
  const enBody = parts.join('\n\n');

  const problems = validate(body, enBody);
  if (problems.length) {
    console.error(`  [${relPath}] VALIDATION FAILED: ${problems.join(' | ')}`);
    const retried = await translateWithRetry(chunks.join('\n\n'), null).catch(() => null);
    if (retried && validate(body, retried).length === 0) {
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, (fm || '') + retried.trim() + '\n', 'utf8');
      return { relPath, status: 'ok(after-full-retry)', approxTokens: tokensIn + tokensOut };
    }
    // write anyway but flag it — better a flagged draft than nothing
    const bak = outFile + '.rejected';
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(bak, (fm || '') + enBody.trim() + '\n', 'utf8');
    return { relPath, status: `REJECTED->${path.basename(bak)} (${problems.join('; ')})` };
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, (fm || '') + enBody.trim() + '\n', 'utf8');
  return { relPath, status: 'ok', approxTokens: tokensIn + tokensOut };
}

// ---------- main ----------
const allFiles = collectMd(DOCS_DIR).sort();
const targets = ONLY ? allFiles.filter(f => f.includes(ONLY)) : allFiles;

console.log(`Model: ${MODEL} @ ${BASE_URL}`);
console.log(`Articles found: ${allFiles.length}; to process: ${targets.length}${DRY_RUN ? ' (DRY RUN)' : ''}`);

if (DRY_RUN) {
  let totalChunks = 0;
  for (const f of targets) {
    const raw = fs.readFileSync(path.join(DOCS_DIR, f), 'utf8');
    const n = chunkBody(splitFrontmatter(raw).body).length;
    totalChunks += n;
    console.log(`  ${f} — ${raw.length} chars, ${n} chunk(s)`);
  }
  console.log(`Total chunks: ${totalChunks}. Rough cost estimate at gpt-4o-mini rates: ~$${(totalChunks * 0.003).toFixed(2)}–${(totalChunks * 0.012).toFixed(2)}.`);
  process.exit(0);
}

const limit = pLimit(CONCURRENCY);
const results = await Promise.all(targets.map(f => limit(() => processFile(f).catch(e => ({ relPath: f, status: `ERROR: ${e.message}` })))));

let ok = 0, skip = 0, bad = 0, tokens = 0;
for (const r of results) {
  tokens += r.approxTokens || 0;
  if (r.status === 'ok' || r.status.startsWith('ok')) ok++;
  else if (r.status.startsWith('skip')) skip++;
  else { bad++; console.error(`!! ${r.relPath}: ${r.status}`); }
}
console.log(`\nDone: ${ok} translated, ${skip} skipped, ${bad} failed/rejected. ~${tokens.toLocaleString()} tokens used.`);
console.log(`Output tree: ${OUT_DIR}`);
