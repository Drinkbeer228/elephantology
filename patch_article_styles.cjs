const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// The markdown-body class from the old CSS was probably lost or not applied to #article-content-container properly.
// Let's add some basic markdown prose styles using tailwind's @apply in index.css

const proseStyles = `
.markdown-body {
  @apply text-gray-300 leading-relaxed text-sm;
}
.markdown-body h1 {
  @apply text-2xl font-bold text-white mb-6 pb-4 border-b border-[#34384a];
}
.markdown-body h2 {
  @apply text-lg font-bold text-gray-200 mt-8 mb-4;
}
.markdown-body h3 {
  @apply text-base font-bold text-gray-300 mt-6 mb-3;
}
.markdown-body p {
  @apply mb-4;
}
.markdown-body ul {
  @apply list-disc list-inside mb-4 pl-4 space-y-1;
}
.markdown-body blockquote {
  @apply border-l-2 border-kingdom-gold pl-4 italic text-[#8e96ac] bg-[#242733]/50 py-2 pr-4 rounded-r-lg my-6;
}
.markdown-body a {
  @apply text-kingdom-gold hover:underline;
}
.markdown-body code {
  @apply bg-[#242733] px-1.5 py-0.5 rounded text-xs font-mono text-pink-300;
}
`;

if (!css.includes('.markdown-body {')) {
    css += '\n' + proseStyles;
    fs.writeFileSync('src/index.css', css);
}

