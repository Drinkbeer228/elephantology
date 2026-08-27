const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

// Add styles for markdown body typography
css += `
/* Phase 3 Typography and Table enhancements */
.markdown-body {
  line-height: 1.7;
}
.markdown-body h2 {
  margin-top: 3.5rem !important; /* ~56px */
  margin-bottom: 1.5rem !important; /* ~24px */
}
.markdown-body p, .markdown-body li {
  line-height: 1.7;
}

/* Table Wrapper for horizontal scroll + gradient fade */
.table-wrapper {
  position: relative;
  width: 100%;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.table-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, #1b1d24);
  pointer-events: none;
  border-top-right-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}
.table-scroll-container {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid rgba(52, 56, 74, 1); /* border-kingdom-border */
}
.table-scroll-container table {
  width: 100%;
  text-align: left;
  border-collapse: collapse;
}
`;

fs.writeFileSync('src/index.css', css);
