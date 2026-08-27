const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `  <!-- Tailwind CSS & Lucide Icons & Marked Parser -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            pixel: ['Silkscreen', 'monospace'],
            sans: ['Plus Jakarta Sans', 'sans-serif'],
          },
          colors: {
            kingdom: {
              bg: '#121318',
              card: '#1b1d24',
              surface: '#242733',
              border: '#34384a',
              gold: '#ffd166',
              accent: '#4cc9f0',
              emerald: '#06d6a0',
              rose: '#f72585',
              muted: '#8e96ac',
            }
          }
        }
      }
    }
  </script>`;

const replaceStr = `  <!-- Tailwind CSS & Lucide Icons & Marked Parser -->
  <link rel="stylesheet" href="/assets/stylesheets/tailwind.css">
  <script src="https://unpkg.com/lucide@latest"></script>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('index.html', content);
