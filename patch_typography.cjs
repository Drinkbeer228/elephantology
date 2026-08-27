const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const newProse = `
.markdown-body {
  @apply text-gray-300 leading-relaxed text-sm;
}
.markdown-body h1 {
  @apply text-3xl sm:text-4xl font-bold text-white mb-8 mt-2 tracking-tight;
}
.markdown-body h2 {
  @apply text-xl font-bold text-gray-100 mt-10 mb-4;
}
.markdown-body h3 {
  @apply text-lg font-bold text-gray-200 mt-8 mb-3;
}
.markdown-body p {
  @apply mb-5 leading-7;
}
.markdown-body ul {
  @apply list-disc list-outside mb-6 ml-4 space-y-2 text-gray-300;
}
.markdown-body ol {
  @apply list-decimal list-outside mb-6 ml-4 space-y-2 text-gray-300;
}
.markdown-body blockquote {
  @apply border-l-2 border-kingdom-muted pl-5 italic text-gray-400 my-8;
}
.markdown-body a {
  @apply text-kingdom-gold hover:text-white transition-colors border-b border-kingdom-gold/30 hover:border-white;
}
.markdown-body code {
  @apply bg-kingdom-surface px-1.5 py-0.5 rounded text-[13px] font-mono text-gray-300;
}
.markdown-body pre {
  @apply bg-kingdom-surface p-4 rounded-xl font-mono text-[13px] overflow-x-auto my-6 text-gray-300 border border-kingdom-border/50;
}
.markdown-body pre code {
  @apply bg-transparent p-0 rounded-none border-none text-inherit;
}
.markdown-body table {
  @apply w-full text-left border-collapse my-8 text-sm;
}
.markdown-body th {
  @apply border-b border-kingdom-border pb-3 font-semibold text-gray-300 uppercase text-[11px] tracking-wider;
}
.markdown-body td {
  @apply border-b border-kingdom-border/40 py-3 text-gray-400;
}
`;

// Replace existing .markdown-body styles with the new ones.
const cssParts = css.split('.markdown-body {');
if (cssParts.length > 1) {
    css = cssParts[0] + newProse;
    fs.writeFileSync('src/index.css', css);
}
