import fs from 'fs';

let mdContent = fs.readFileSync('docs/taxonomy/deinotheriidae-evolution-and-functional-morphology.md', 'utf8');

const relatedMatch = mdContent.match(/##\s*Связанные знания[^\n]*\n([\s\S]*?)(?=##|$)/i);
let extractedRelated = '';
if (relatedMatch) {
  extractedRelated = relatedMatch[1].trim();
  mdContent = mdContent.replace(relatedMatch[0], '');
}

console.log("EXTRACTED:", extractedRelated);
