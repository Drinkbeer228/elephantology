const fs = require('fs');
let code = fs.readFileSync('src/components/AIChatModal.tsx', 'utf8');

const target = `    try {\n      const res = await fetch('/api/chat', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({\n          messages: newMessages\n        })\n      });`;
const replacement = `    try {\n      const win = window as any;\n      const aiContext = win.getAIContext ? win.getAIContext() : null;\n      const res = await fetch('/api/chat', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({\n          messages: newMessages,\n          context: aiContext\n        })\n      });`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AIChatModal.tsx', code);
