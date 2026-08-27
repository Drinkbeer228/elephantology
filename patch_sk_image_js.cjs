const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const targetRegex = /let currentSkeletonType = 'africana';[\s\S]*?function selectAnatomyPoint/m;

const newCode = `    let currentSkeletonType = 'africana';

    window.setSkeletonImage = function(species) {
      currentSkeletonType = species;
      
      const btnAfricana = document.getElementById('btn-skel-africana');
      const btnMaximus = document.getElementById('btn-skel-maximus');
      const img = document.getElementById('skeleton-real-image');
      const placeholderTxt = document.getElementById('skeleton-placeholder-text');
      
      if (btnAfricana && btnMaximus) {
        if (species === 'africana') {
          btnAfricana.className = 'px-3 py-1.5 text-[10px] font-pixel bg-kingdom-gold text-black transition-colors';
          btnMaximus.className = 'px-3 py-1.5 text-[10px] font-pixel bg-kingdom-surface text-kingdom-muted hover:text-white transition-colors';
        } else {
          btnMaximus.className = 'px-3 py-1.5 text-[10px] font-pixel bg-kingdom-gold text-black transition-colors';
          btnAfricana.className = 'px-3 py-1.5 text-[10px] font-pixel bg-kingdom-surface text-kingdom-muted hover:text-white transition-colors';
        }
      }

      if (img) {
        img.src = \`assets/skeleton_\${species}.png\`;
        
        // Let's assume once user uploads the real images, they will load successfully.
        // We can hide the placeholder text if image loads successfully (error handling can be done but for now we just show it if not loaded)
        img.onerror = () => {
           if(placeholderTxt) placeholderTxt.classList.remove('hidden');
        };
        img.onload = () => {
           if(placeholderTxt) placeholderTxt.classList.add('hidden');
        };
      }
    };

    // ANATOMY HOTSPOT SELECTION
    function selectAnatomyPoint`;

code = code.replace(targetRegex, newCode);
fs.writeFileSync('script.js', code);
console.log('patched script.js for skeleton images');
