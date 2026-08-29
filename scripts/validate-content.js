import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';

const DOCS_DIR = './docs';
const VALID_CATEGORIES = new Set([
  'taxonomy',
  'anatomy',
  'ethogram',
  'cognition',
  'veterinary',
  'ecology',
  'conservation',
  'culture',
  'paleontology',
  'genomics'
]);

const VALID_EVIDENCE_LEVELS = new Set([
  'established',
  'moderate',
  'limited',
  'hypothesis',
  'contested'
]);

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function getAllMarkdownFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'assets') {
        fileList = getAllMarkdownFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function validateArticles() {
  console.log('🔬 Starting Academic Content Validation (Phase 3D)...');
  const files = getAllMarkdownFiles(DOCS_DIR);
  
  if (files.length === 0) {
    console.error('❌ Error: No markdown files found in docs directory.');
    process.exit(1);
  }

  const errors = [];
  const warnings = [];
  const articlePaths = new Map();
  const nonIndexSlugs = new Map();
  const allArticleKeys = new Set();

  // First pass: collect all article keys / relative paths
  files.forEach(file => {
    const relPath = path.relative(DOCS_DIR, file).replace(/\\/g, '/').replace(/\.md$/, '');
    allArticleKeys.add(relPath);

    if (articlePaths.has(relPath)) {
      errors.push({
        file,
        message: `Duplicate article path '${relPath}' detected (also in ${articlePaths.get(relPath)})`
      });
    } else {
      articlePaths.set(relPath, file);
    }

    const slug = path.basename(file, '.md');
    if (slug !== 'index') {
      if (nonIndexSlugs.has(slug)) {
        errors.push({
          file,
          message: `Duplicate non-index slug '${slug}' detected (also in ${nonIndexSlugs.get(slug)})`
        });
      } else {
        nonIndexSlugs.set(slug, file);
      }
    }
  });

  // Second pass: validate each file
  files.forEach(file => {
    const relPath = path.relative(DOCS_DIR, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');

    // Check frontmatter presence
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
      errors.push({ file: relPath, message: 'Missing frontmatter delimiter (---)' });
      return;
    }

    let parsed;
    try {
      parsed = load(match[1]) || {};
    } catch (e) {
      errors.push({ file: relPath, message: `YAML syntax error: ${e.message}` });
      return;
    }

    // 1. Mandatory Fields
    if (!parsed.title || String(parsed.title).trim().length === 0) {
      errors.push({ file: relPath, message: 'Missing or empty mandatory field: "title"' });
    }

    if (!parsed.description && !parsed.excerpt) {
      errors.push({ file: relPath, message: 'Missing mandatory field: "description" or "excerpt"' });
    }

    // 2. Category Check
    const category = parsed.category ? String(parsed.category).trim().toLowerCase() : null;
    if (!category) {
      errors.push({ file: relPath, message: 'Missing mandatory field: "category"' });
    } else if (!VALID_CATEGORIES.has(category)) {
      errors.push({
        file: relPath,
        message: `Invalid category: "${category}". Allowed: ${Array.from(VALID_CATEGORIES).join(', ')}`
      });
    }

    // 3. Evidence Level Check
    const evidence = (parsed.evidence_level || parsed.evidenceLevel);
    if (!evidence) {
      errors.push({ file: relPath, message: 'Missing mandatory field: "evidence_level"' });
    } else {
      const normalizedEv = String(evidence).trim().toLowerCase();
      if (!VALID_EVIDENCE_LEVELS.has(normalizedEv)) {
        errors.push({
          file: relPath,
          message: `Invalid evidence_level: "${evidence}". Allowed: ${Array.from(VALID_EVIDENCE_LEVELS).join(', ')}`
        });
      }
    }

    // 4. Date Validation
    const lastReviewed = parsed.last_reviewed || parsed.lastReviewed;
    if (!lastReviewed) {
      errors.push({ file: relPath, message: 'Missing mandatory field: "last_reviewed"' });
    } else {
      const dateStr = String(lastReviewed).trim();
      if (!DATE_REGEX.test(dateStr) && isNaN(Date.parse(dateStr))) {
        errors.push({
          file: relPath,
          message: `Invalid date format for last_reviewed: "${dateStr}". Expected YYYY-MM-DD.`
        });
      }
    }

    if (parsed.date_published || parsed.datePublished) {
      const pubStr = String(parsed.date_published || parsed.datePublished).trim();
      if (!DATE_REGEX.test(pubStr) && isNaN(Date.parse(pubStr))) {
        errors.push({
          file: relPath,
          message: `Invalid date format for date_published: "${pubStr}". Expected YYYY-MM-DD.`
        });
      }
    }

    // 5. References Validation
    const references = parsed.references;
    if (!references || !Array.isArray(references) || references.length === 0) {
      errors.push({ file: relPath, message: 'Missing or empty mandatory field: "references" (must be non-empty array)' });
    } else {
      const seenRefIds = new Set();
      references.forEach((ref, idx) => {
        if (!ref) {
          errors.push({ file: relPath, message: `Reference at index ${idx} is null or undefined` });
          return;
        }
        if (typeof ref === 'object') {
          if (ref.id) {
            const refId = String(ref.id).trim();
            if (seenRefIds.has(refId)) {
              errors.push({ file: relPath, message: `Duplicate reference ID "${refId}" in article` });
            }
            seenRefIds.add(refId);
          }
          if (!ref.title && !ref.id && !ref.doi && !ref.isbn) {
            errors.push({ file: relPath, message: `Reference at index ${idx} has no title, id, or DOI` });
          }
        } else if (typeof ref === 'string') {
          if (ref.trim().length === 0) {
            errors.push({ file: relPath, message: `Empty reference string at index ${idx}` });
          }
        }
      });
    }

    // 6. Related Knowledge Targets Validation
    if (Array.isArray(parsed.related_knowledge)) {
      parsed.related_knowledge.forEach((item, idx) => {
        let target = '';
        if (typeof item === 'string') {
          target = item.trim().replace(/^\//, '').replace(/^docs\//, '').replace(/\.md$/, '');
        } else if (item && typeof item === 'object') {
          target = (item.target || item.path || item.link || '').trim().replace(/^\//, '').replace(/^docs\//, '').replace(/\.md$/, '');
        }

        if (target && !allArticleKeys.has(target)) {
          const found = Array.from(allArticleKeys).some(k => k === target || k.endsWith(`/${target}`) || k.split('/').pop() === target);
          if (!found) {
            warnings.push({
              file: relPath,
              message: `related_knowledge[${idx}] references unknown target: "${target}"`
            });
          }
        }
      });
    }

    // 7. Internal Markdown Links Check
    const bodyContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '');
    const linkMatches = bodyContent.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
    for (const match of linkMatches) {
      const href = match[2].trim();
      if (href.startsWith('/article/')) {
        const cleanHref = href.replace(/^\/article\//, '').split('#')[0].split('?')[0].replace(/\/$/, '');
        const exists = Array.from(allArticleKeys).some(k => k === cleanHref || k.endsWith(`/${cleanHref}`));
        if (!exists && !cleanHref.startsWith('http')) {
          warnings.push({
            file: relPath,
            message: `Internal link broken: "${href}" (text: "${match[1]}")`
          });
        }
      }
    }
  });

  // Report results
  console.log(`\n📊 Validated ${files.length} markdown documents:`);
  console.log(`   - Critical Errors: ${errors.length}`);
  console.log(`   - Warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log('\n⚠️  Validation Warnings:');
    warnings.slice(0, 10).forEach(w => console.warn(`   [${w.file}] ${w.message}`));
    if (warnings.length > 10) {
      console.warn(`   ... and ${warnings.length - 10} more warnings.`);
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Validation failed with critical errors:');
    errors.forEach(e => console.error(`   [${e.file}] ${e.message}`));
    process.exit(1);
  }

  console.log('\n✨ Academic Content Validation passed successfully (0 errors)!\n');
}

validateArticles();
