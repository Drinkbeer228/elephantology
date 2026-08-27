const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// I want to refine the skull shape for the Asian elephant 
// The Asian elephant skull is notable for two large domes separated by a depression
// Also the African elephant skull needs to look a bit rounder, smooth single dome

const targetFunction = `    function updateSkeletonSvg() {
      const setD = (id, d) => { const el = document.getElementById(id); if (el) el.setAttribute('d', d); };
      
      if (currentSkeletonType === 'africana') {
          // African Elephant Skeleton (Default)
          // Flatter single dome skull
          setD('sk-skull', 'M 85,90 C 110,70 145,85 150,110 C 155,140 140,160 115,160 C 95,160 80,140 85,90 Z');
          // Concave back (Saddle) - high shoulders, dips in middle
          setD('sk-spine-curve', 'M 148,105 C 180,95 240,100 320,110 C 400,120 460,135 500,160'); 
          // Taller spines in front
          setD('sk-spines', 'M 148,105 L 140,80 M 165,102 L 160,75 M 185,100 L 185,65 M 205,98 L 205,60 M 225,99 L 230,62 M 245,100 L 250,68 M 265,102 L 270,75 M 285,103 L 290,82 M 305,105 L 310,88 M 325,108 L 330,95 M 345,110 L 350,100 M 365,113 L 370,103 M 385,116 L 390,106 M 405,120 L 410,110 M 425,124 L 430,115');
      } else {
          // Asian Elephant Skeleton
          // Double dome skull (indented forehead)
          setD('sk-skull', 'M 90,95 C 100,55 125,60 135,80 C 140,90 145,105 150,120 C 150,145 135,160 115,160 C 95,160 85,140 90,95 Z');
          // Convex back (Arch) - highest point in middle
          setD('sk-spine-curve', 'M 145,115 C 180,115 240,110 320,95 C 400,90 460,125 500,150'); 
          // Spines follow arch, tallest in middle
          setD('sk-spines', 'M 145,115 L 140,90 M 165,112 L 160,88 M 185,110 L 185,85 M 205,108 L 205,80 M 225,106 L 230,75 M 245,104 L 250,70 M 265,102 L 270,65 M 285,100 L 290,60 M 305,97 L 310,58 M 325,95 L 330,58 M 345,94 L 350,60 M 365,96 L 370,65 M 385,99 L 390,72 M 405,105 L 410,85 M 425,112 L 430,95'); 
      }
    }`;

const newFunction = `    function updateSkeletonSvg() {
      const setD = (id, d) => { const el = document.getElementById(id); if (el) el.setAttribute('d', d); };
      
      if (currentSkeletonType === 'africana') {
          // African Elephant Skeleton (Default)
          // Flatter single dome skull, more gradual slope
          setD('sk-skull', 'M 85,90 C 110,65 145,85 150,110 C 155,140 140,160 115,160 C 95,160 80,140 85,90 Z');
          // Concave back (Saddle) - high shoulders, dips in middle
          setD('sk-spine-curve', 'M 148,105 C 180,95 240,100 320,110 C 400,120 460,135 500,160'); 
          // Taller spines in front
          setD('sk-spines', 'M 148,105 L 140,80 M 165,102 L 160,75 M 185,100 L 185,65 M 205,98 L 205,60 M 225,99 L 230,62 M 245,100 L 250,68 M 265,102 L 270,75 M 285,103 L 290,82 M 305,105 L 310,88 M 325,108 L 330,95 M 345,110 L 350,100 M 365,113 L 370,103 M 385,116 L 390,106 M 405,120 L 410,110 M 425,124 L 430,115');
      } else {
          // Asian Elephant Skeleton
          // Double dome skull - very distinct bump at top (105,60), dip at (125,75), second bump (140,85)
          setD('sk-skull', 'M 90,95 C 100,50 115,55 125,75 C 135,70 145,85 150,110 C 155,140 135,160 115,160 C 95,160 85,140 90,95 Z');
          // Convex back (Arch) - highest point in middle
          setD('sk-spine-curve', 'M 145,115 C 180,115 240,110 320,95 C 400,90 460,125 500,150'); 
          // Spines follow arch, tallest in middle
          setD('sk-spines', 'M 145,115 L 140,90 M 165,112 L 160,88 M 185,110 L 185,85 M 205,108 L 205,80 M 225,106 L 230,75 M 245,104 L 250,70 M 265,102 L 270,65 M 285,100 L 290,60 M 305,97 L 310,58 M 325,95 L 330,58 M 345,94 L 350,60 M 365,96 L 370,65 M 385,99 L 390,72 M 405,105 L 410,85 M 425,112 L 430,95'); 
      }
    }`;

code = code.replace(targetFunction, newFunction);
fs.writeFileSync('script.js', code);
