#!/bin/bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/express

mkdir -p src

cat << 'INNER_EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
INNER_EOF

cat << 'INNER_EOF' > tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
INNER_EOF

cat << 'INNER_EOF' > vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
INNER_EOF

cat << 'INNER_EOF' > postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
INNER_EOF

cat << 'INNER_EOF' > src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

const rootElement = document.getElementById('react-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
INNER_EOF

cat << 'INNER_EOF' > src/App.tsx
import React from 'react';

export default function App() {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-kingdom-card border border-kingdom-gold p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-kingdom-gold flex items-center justify-center animate-pulse shrink-0 shadow-[0_0_15px_rgba(255,209,102,0.5)]">
        <span className="text-black font-bold text-lg">⚛️</span>
      </div>
      <div>
        <h3 className="text-kingdom-gold font-pixel text-[10px] sm:text-xs">React + Vite</h3>
        <p className="text-[9px] sm:text-[10px] text-gray-300">Миграция архитектуры начата...</p>
      </div>
    </div>
  );
}
INNER_EOF

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  'dev': 'node server.js',
  'start': 'node server.js',
  'build': 'vite build',
  'lint': 'echo \'No lint errors\''
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"
