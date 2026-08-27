const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const skelLogic = `
    // --- SKELETON IMAGE LOGIC ---
    let currentSkeletonType = 'africana';

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
        img.src = '/assets/skeleton_' + species + '.png';
        
        img.onerror = () => {
           if(placeholderTxt) placeholderTxt.classList.remove('hidden');
        };
        img.onload = () => {
           if(placeholderTxt) placeholderTxt.classList.add('hidden');
        };
      }
    };
`;

const insertMarker = `// ANATOMY HOTSPOT SELECTION`;
if (code.includes(insertMarker)) {
    code = code.replace(insertMarker, skelLogic + '\\n    ' + insertMarker);
    fs.writeFileSync('index.html', code);
    console.log('patched setSkeletonImage');
} else {
    // just append before closing script
    code = code.replace('</script>\\n  <!-- MAIN SCRIPT ENGINE -->', skelLogic + '\\n  </script>\\n  <!-- MAIN SCRIPT ENGINE -->');
    // wait, the closing tag is just `</script>\n</body>\n</html>`? No, wait.
    // I appended the three.js script at the end.
    // Let's search for "function selectAnatomyPoint"
    const fallbackMarker = `function selectAnatomyPoint(point) {`;
    if (code.includes(fallbackMarker)) {
        code = code.replace(fallbackMarker, skelLogic + '\\n    ' + fallbackMarker);
        fs.writeFileSync('index.html', code);
        console.log('patched setSkeletonImage via fallback marker');
    } else {
        console.log('could not find where to insert skeleton logic');
    }
}
