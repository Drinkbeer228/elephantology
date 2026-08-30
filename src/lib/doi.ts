/**
 * Normalizes DOI strings by removing leading prefixes (e.g. "https://doi.org/", "http://dx.doi.org/", "doi:")
 * and returns a standard clean DOI string if syntactically valid (10.XXXX/...).
 */
export function normalizeDoi(doiInput?: string | null): string | null {
  if (!doiInput || typeof doiInput !== 'string') return null;

  let cleaned = doiInput.trim();
  // Strip url protocols and prefixes
  cleaned = cleaned.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '');
  cleaned = cleaned.replace(/^doi:\s*/i, '');
  cleaned = cleaned.trim();

  // Basic syntax check: Starts with standard Registrant code 10.NNNN/
  const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
  if (doiRegex.test(cleaned)) {
    return cleaned;
  }

  // Fallback for special academic registry chars
  if (cleaned.startsWith('10.') && cleaned.includes('/')) {
    return cleaned;
  }

  return null;
}

export function formatDoiUrl(doiInput?: string | null): string | null {
  const clean = normalizeDoi(doiInput);
  if (!clean) return null;
  return `https://doi.org/${clean}`;
}
