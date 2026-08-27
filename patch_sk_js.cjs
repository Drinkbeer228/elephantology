const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const targetFunction = `    // ANATOMY HOTSPOT SELECTION
    function selectAnatomyPoint(point) {`;

const newFunction = `    let currentSkeletonType = 'africana';

    window.toggleSkeletonType = function() {
      currentSkeletonType = currentSkeletonType === 'africana' ? 'maximus' : 'africana';
      const textEl = document.getElementById('skeleton-type-text');
      if (textEl) textEl.innerText = currentSkeletonType === 'africana' ? 'L. africana' : 'E. maximus';
      updateSkeletonSvg();
    };

    function updateSkeletonSvg() {
      const setD = (id, d) => { const el = document.getElementById(id); if (el) el.setAttribute('d', d); };
      const setPos = (id, cx, cy) => { const el = document.getElementById(id); if(el) { el.setAttribute('cx', cx); el.setAttribute('cy', cy); } };
      
      if (currentSkeletonType === 'africana') {
          // African Elephant Skeleton (Default)
          setD('sk-skull', 'M 85,90 C 110,70 145,85 150,110 C 155,140 140,160 115,160 C 95,160 80,140 85,90 Z');
          setD('sk-spine-curve', 'M 148,105 C 180,95 240,100 320,110 C 400,120 460,135 500,160'); // Concave back (Saddle)
          setD('sk-spines', 'M 148,105 L 140,80 M 165,102 L 160,75 M 185,100 L 185,65 M 205,98 L 205,60 M 225,99 L 230,62 M 245,100 L 250,68 M 265,102 L 270,75 M 285,103 L 290,82 M 305,105 L 310,88 M 325,108 L 330,95 M 345,110 L 350,100 M 365,113 L 370,103 M 385,116 L 390,106 M 405,120 L 410,110 M 425,124 L 430,115'); // Taller spines in front
      } else {
          // Asian Elephant Skeleton
          // Double dome skull, shorter
          setD('sk-skull', 'M 90,95 C 110,65 140,75 145,115 C 150,140 135,155 115,155 C 95,155 85,135 90,95 Z');
          setD('sk-spine-curve', 'M 145,110 C 180,115 240,110 320,95 C 400,90 460,125 500,150'); // Convex back (Arch)
          setD('sk-spines', 'M 145,110 L 140,85 M 165,108 L 160,85 M 185,108 L 185,85 M 205,105 L 205,80 M 225,103 L 230,80 M 245,100 L 250,75 M 265,98 L 270,70 M 285,96 L 290,65 M 305,94 L 310,60 M 325,94 L 330,65 M 345,95 L 350,70 M 365,98 L 370,75 M 385,102 L 390,80 M 405,110 L 410,90 M 425,115 L 430,100'); // Spines follow arch
      }
    }

    // ANATOMY HOTSPOT SELECTION
    function selectAnatomyPoint(point) {`;

if (code.indexOf('toggleSkeletonType') === -1) {
  code = code.replace(targetFunction, newFunction);
  fs.writeFileSync('script.js', code);
  console.log('patched script.js skeleton!');
} else {
  console.log('already patched');
}
