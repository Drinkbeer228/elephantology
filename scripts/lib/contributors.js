const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function entryName(entry) {
  if (typeof entry === 'string') return entry.trim();
  if (isObject(entry) && typeof entry.name === 'string') return entry.name.trim();
  return '';
}

function listErrors(field, list) {
  const errors = [];
  const seen = new Set();
  list.forEach((entry, i) => {
    const name = entryName(entry);
    if (!name) errors.push(`${field}[${i}]: name is empty`);
    if (isObject(entry)) {
      if (entry.orcid != null && !(typeof entry.orcid === 'string' && ORCID_PATTERN.test(entry.orcid))) {
        errors.push(`${field}[${i}]: orcid must match 0000-0000-0000-000X`);
      }
      if (entry.url != null && !(typeof entry.url === 'string' && entry.url.startsWith('https://'))) {
        errors.push(`${field}[${i}]: url must start with https://`);
      }
    }
    if (name) {
      if (seen.has(name)) errors.push(`${field}[${i}]: duplicate name "${name}"`);
      seen.add(name);
    }
  });
  return errors;
}

export function contributorErrors(fm) {
  const errors = [];
  const { authors, editors } = fm;
  if (Array.isArray(authors)) errors.push(...listErrors('authors', authors));
  else if (authors != null && typeof authors !== 'string') errors.push('authors must be a string or a list');
  if (Array.isArray(editors)) errors.push(...listErrors('editors', editors));
  else if (editors != null) errors.push('editors must be a list');
  return errors;
}
