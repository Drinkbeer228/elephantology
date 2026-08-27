const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Find drawPixelElephant
let match = code.match(/function drawPixelElephant[\s\S]*?    \/\/ DRAW ZOOKEEPER/);
if (!match) { console.log('not found'); process.exit(1); }

let newFunc = `function drawPixelElephant(ctx, x, y, scale, dir, state, frame, animTime, species = 'african', isWet = false) {
      const isSubmerged = (y > 124 || state === 'bath');
      const subOffsetY = isSubmerged ? 13 : 0; // Lowers elephant body down into the river!

      ctx.save();
      ctx.translate(x, y + subOffsetY);
      ctx.scale(dir * scale, scale);

      // Color Palette based on species and wetness!
      const isAsian = (species === 'asian');
      let cLight = isAsian ? '#83776e' : '#727d91';   // Back highlight
      let cMain  = isAsian ? '#65584f' : '#525b6c';   // Body main
      let cDark  = isAsian ? '#453a33' : '#373d4a';   // Underbelly / shadow
      const cTusk  = '#f4f1de';   // Ivory
      const cPink  = '#8c6b7b';   // Inner ear flesh
      const cFreckle = '#d9bda9'; // Pinkish depigmentation freckles

      if (isWet) {
        cLight = isAsian ? '#5a5048' : '#454f60';
        cMain  = isAsian ? '#423831' : '#303744';
        cDark  = isAsian ? '#2b231f' : '#1d222b';
      }

      const isWalking = (state === 'walk' || state === 'flee');
      const legPhase = isWalking ? (animTime * (state === 'flee' ? 0.25 : 0.12)) % (Math.PI * 2) : 0;
      const leg1 = isWalking ? Math.sin(legPhase) * 2.5 : 0;
      const trunkSway = Math.sin(animTime * 0.1) * 3;
      
      const waterY = 125 - (y + subOffsetY); // The Y coordinate in local space where water starts

      function drawElephantShapes() {
        ctx.fillStyle = cDark;
        // Far Back Leg
        ctx.fillRect(-13, -6, 6, 6); ctx.fillRect(-13 + leg1, -2, 5, 11); ctx.fillRect(-13 + leg1, 9, 5, 2);
        // Far Front Leg
        ctx.fillRect(7, -6, 6, 6); ctx.fillRect(7 - leg1, -2, 5, 11); ctx.fillRect(7 - leg1, 9, 5, 2);

        // Main Body
        ctx.fillStyle = cMain;
        ctx.beginPath();
        ctx.ellipse(-2, -14, 18, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Back Highlight
        ctx.fillStyle = cLight;
        ctx.fillRect(-14, -26, 20, 3); ctx.fillRect(-8, -27, 12, 2);
        if (isWet) {
          ctx.fillStyle = '#e0fbfc';
          ctx.fillRect(-12, -26, 16, 1); ctx.fillRect(-6, -27, 8, 1);
        }

        // Underbelly
        ctx.fillStyle = cDark; ctx.fillRect(-14, -6, 24, 3);

        // Tail
        const tailSway = Math.sin(animTime * 0.06) * 4;
        ctx.fillRect(-20, -18, 2, 14); ctx.fillRect(-22 + tailSway, -4, 4, 6);

        // Head
        ctx.fillStyle = cMain; 
        ctx.fillRect(10, -26, 12, 15); 
        ctx.fillRect(12, -28, 9, 3);
        ctx.fillRect(4, -26, 8, 15); // Neck bridge

        ctx.fillStyle = cLight; 
        ctx.fillRect(13, -28, 6, 2);

        if (isAsian) {
          ctx.fillStyle = cFreckle;
          ctx.fillRect(15, -26, 2, 1); ctx.fillRect(18, -27, 2, 1);
          ctx.fillRect(14, -24, 2, 2); ctx.fillRect(19, -23, 2, 1); ctx.fillRect(16, -21, 2, 2);
        }

        // Ear (Animated flap!)
        ctx.fillStyle = cDark;
        ctx.beginPath();
        let earFlap2 = 1.0;
        if (state !== 'flee') {
          earFlap2 = 0.6 + Math.sin(animTime * 0.12) * 0.4;
        }
        ctx.save();
        ctx.translate(5, -18);
        ctx.scale(earFlap2, 1.0);
        if (isAsian) ctx.ellipse(1, 0, 5, 8, 0.1, 0, Math.PI * 2);
        else ctx.ellipse(0, 0, 8, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = cPink;
        if (isAsian) ctx.fillRect(0, -2, 3, 5);
        else ctx.fillRect(-2, -2, 4, 8);
        ctx.restore();
        ctx.fillStyle = cLight; ctx.fillRect(1, -26, 3, 2);

        // Near Legs
        ctx.fillStyle = cMain;
        ctx.fillRect(-13, -8, 8, 6); ctx.fillRect(-12 - leg1 * 0.5, -4, 7, 6); ctx.fillRect(-11 - leg1, 1, 5, 9);
        ctx.fillStyle = cTusk; ctx.fillRect(-11 - leg1, 9, 2, 1); ctx.fillRect(-8 - leg1, 9, 2, 1);

        ctx.fillStyle = cMain;
        ctx.fillRect(7, -8, 8, 6); ctx.fillRect(8 + leg1 * 0.5, -4, 7, 6); ctx.fillRect(9 + leg1, 1, 5, 9);
        ctx.fillStyle = cTusk; ctx.fillRect(9 + leg1, 9, 2, 1); ctx.fillRect(12 + leg1, 9, 2, 1);

        // Tusk
        ctx.fillStyle = cTusk;
        if (isAsian) {
          ctx.fillRect(18, -12, 4, 2);
        } else {
          if (state === 'trumpet') {
            ctx.fillRect(18, -16, 10, 3); ctx.fillRect(26, -19, 3, 4);
          } else {
            ctx.fillRect(18, -13, 9, 3); ctx.fillRect(25, -11, 3, 4);
          }
        }

        // Trunk
        ctx.fillStyle = cMain;
        if (state === 'drink') {
          ctx.fillRect(20, -18, 6, 8); ctx.fillRect(24, -11, 5, 8); ctx.fillRect(27, -4, 5, 12);
        } else if (state === 'dust_bath') {
          // Trunk scooping dirt and flinging over back
          ctx.fillRect(20, -16, 6, 8);
          ctx.fillRect(18, -24, 5, 8);
          ctx.fillRect(10, -32, 5, 8); // Tossing backward
        } else if (state === 'eat' || state === 'eat_apple') {
          ctx.fillRect(20, -18, 6, 8); ctx.fillRect(23, -11, 5, 8); ctx.fillRect(25 + Math.sin(animTime * 0.15) * 2, -3, 5, 8);
        } else if (state === 'trumpet') {
          ctx.fillRect(20, -22, 6, 6); ctx.fillRect(24, -28, 5, 8); ctx.fillRect(27, -35, 5, 8);
          ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(32, -38, 4, 2); ctx.fillRect(36, -42, 6, 2);
        } else if (state === 'bath') {
          ctx.fillRect(20, -22, 6, 6); ctx.fillRect(17, -28, 5, 8); ctx.fillRect(12, -35, 5, 8);
        } else if (isSubmerged || waterY < 0) {
          // Snorkel breathing pose above water
          ctx.fillRect(20, -18, 6, 7);
          ctx.fillRect(22 + trunkSway * 0.5, -14, 5, 7);
          ctx.fillRect(24 + trunkSway, -10, 4, 7);
        } else {
          ctx.fillRect(20, -18, 6, 7); ctx.fillRect(22 + trunkSway * 0.5, -12, 5, 7); ctx.fillRect(24 + trunkSway, -6, 4, 7);
        }

        if (isAsian) {
          ctx.fillStyle = cFreckle; ctx.fillRect(21, -16, 2, 2); ctx.fillRect(23, -10, 2, 1);
        }

        // Eye
        ctx.fillStyle = '#101010'; ctx.fillRect(17, -22, 2, 2);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(18, -22, 1, 1);
      } // end drawElephantShapes

      if (waterY < 15) { // Meaning part of elephant is under water
        // Draw Above Water
        ctx.save();
        ctx.beginPath();
        ctx.rect(-100, -100, 200, 100 + waterY);
        ctx.clip();
        drawElephantShapes();
        ctx.restore();

        // Draw Below Water
        ctx.save();
        ctx.beginPath();
        ctx.rect(-100, waterY, 200, 200);
        ctx.clip();
        ctx.globalAlpha = 0.38;
        drawElephantShapes();
        
        // Water ripples / foam line around body
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.fillRect(-22, waterY, 44, 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(-24, waterY + 1, 48, 1);
        ctx.restore();

        // Water bubbles rising around head
        if (state === 'bath') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          let bY = -12 - (animTime * 2 % 16);
          ctx.beginPath();
          ctx.arc(16 + Math.sin(animTime * 0.3) * 3, bY, 1.5, 0, Math.PI * 2);
          ctx.arc(10 + Math.cos(animTime * 0.2) * 3, bY - 4, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Fully onshore, no clipping
        drawElephantShapes();
      }

      ctx.restore();
    }
    // DRAW ZOOKEEPER`;

code = code.replace(match[0], newFunc);
fs.writeFileSync('index.html', code);
console.log('Success');
