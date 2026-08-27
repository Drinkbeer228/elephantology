const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetSkeleton = `                <!-- BONES -->
                <g class="elephant-skeleton" stroke="#d4d4d8" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <!-- Skull Outline and Jaw -->
                  <path d="M 85,90 C 110,70 145,85 150,110 C 155,140 140,160 115,160 C 95,160 80,140 85,90 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3"/>
                  <path d="M 80,130 C 80,160 95,170 115,160" stroke="#a1a1aa" stroke-width="2"/>
                  <!-- Eye Socket -->
                  <circle cx="115" cy="115" r="8" fill="#18181b" stroke="#71717a" stroke-width="2"/>
                  
                  <!-- Tusks (Incisors) -->
                  <path d="M 85,150 C 70,165 45,190 60,200 C 70,205 95,175 100,155 Z" fill="#fef3c7" stroke="#fbbf24" stroke-width="2"/>
                  
                  <!-- Cervical, Thoracic & Lumbar Vertebrae with Spinous processes -->
                  <!-- Spines -->
                  <path d="M 148,105 L 140,80 M 165,102 L 160,75 M 185,100 L 185,65 M 205,98 L 205,60 M 225,99 L 230,62 M 245,100 L 250,68 M 265,102 L 270,75 M 285,103 L 290,82 M 305,105 L 310,88 M 325,108 L 330,95 M 345,110 L 350,100 M 365,113 L 370,103 M 385,116 L 390,106 M 405,120 L 410,110 M 425,124 L 430,115" stroke="#a1a1aa" stroke-width="3"/>
                  <!-- Main Spine Curve -->
                  <path d="M 148,105 C 180,95 240,100 320,110 C 400,120 460,135 500,160" stroke="#e4e4e7" stroke-width="7" stroke-dasharray="10 4"/>
                  
                  <!-- Scapula (Shoulder Blade) -->
                  <path d="M 180,120 L 220,115 L 210,170 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3"/>
                  <!-- Scapular spine -->
                  <path d="M 215,125 L 208,160" stroke="#71717a" stroke-width="2"/>
                  
                  <!-- Front Leg (Humerus, Radius/Ulna) -->
                  <path d="M 205,165 L 185,240 L 190,310" stroke="#e4e4e7" stroke-width="10"/>
                  <path d="M 185,240 L 205,310" stroke="#a1a1aa" stroke-width="7"/> <!-- Ulna -->
                  <circle cx="185" cy="240" r="6" fill="#e4e4e7" stroke="none"/>
                  
                  <!-- Front Foot (Carpals, Metacarpals, Phalanges) -->
                  <path d="M 190,310 C 180,315 175,325 175,330 L 210,330 C 210,325 210,315 205,310 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3"/>
                  <!-- Ribcage (Detailed) -->
                  <path d="M 225,100 C 220,130 210,170 235,185" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 245,100 C 240,130 230,175 255,195" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 265,102 C 260,135 250,185 275,205" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 285,103 C 280,140 270,195 295,215" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 305,105 C 300,145 290,200 315,220" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 325,108 C 320,150 310,205 335,225" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 345,110 C 340,155 330,205 355,220" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 365,113 C 360,155 350,200 375,215" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 385,116 C 385,155 375,195 395,205" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 405,120 C 405,155 400,185 415,190" stroke="#d4d4d8" stroke-width="4"/>
                  <path d="M 425,124 C 425,155 420,180 435,180" stroke="#d4d4d8" stroke-width="4"/>
                  
                  <!-- Pelvis (Ilium, Ischium, Pubis) -->
                  <path d="M 430,130 C 410,140 420,180 440,185 C 470,195 490,165 485,145 C 480,130 450,120 430,130 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3"/>
                  <circle cx="445" cy="175" r="8" fill="#18181b"/>
                  
                  <!-- Hind Leg (Femur, Tibia, Fibula) -->
                  <path d="M 445,175 L 430,250 L 450,310" stroke="#e4e4e7" stroke-width="10"/>
                  <path d="M 430,250 L 460,310" stroke="#a1a1aa" stroke-width="7"/> <!-- Fibula -->
                  <circle cx="430" cy="250" r="6" fill="#e4e4e7" stroke="none"/>
                  
                  <!-- Hind Foot (Tarsals, Metatarsals, Phalanges) -->
                  <path d="M 450,310 C 440,315 435,325 435,330 L 470,330 C 470,325 465,315 460,310 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3"/>
                  <!-- Tail bones -->
                  <path d="M 485,145 C 500,170 515,220 495,270" stroke="#e4e4e7" stroke-width="5" stroke-dasharray="8 4"/>
                </g>`;

const newSkeleton = `                <!-- SWITCHER -->
                <g transform="translate(10, 10)" class="cursor-pointer" onclick="toggleSkeletonType()">
                  <rect x="0" y="0" width="120" height="30" rx="15" fill="#27272a" stroke="#e4e4e7" stroke-width="2"/>
                  <text id="skeleton-type-text" x="60" y="20" text-anchor="middle" class="fill-white font-pixel text-[10px]">L. africana</text>
                </g>

                <!-- BONES -->
                <g class="elephant-skeleton" stroke="#d4d4d8" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <!-- Skull Outline and Jaw (Dynamic) -->
                  <path id="sk-skull" d="M 85,90 C 110,70 145,85 150,110 C 155,140 140,160 115,160 C 95,160 80,140 85,90 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3" style="transition: all 0.5s ease"/>
                  <path id="sk-jaw" d="M 80,130 C 80,160 95,170 115,160" stroke="#a1a1aa" stroke-width="2" style="transition: all 0.5s ease"/>
                  <!-- Eye Socket -->
                  <circle id="sk-eye" cx="115" cy="115" r="8" fill="#18181b" stroke="#71717a" stroke-width="2" style="transition: all 0.5s ease"/>
                  
                  <!-- Tusks (Incisors) -->
                  <path id="sk-tusks" d="M 85,150 C 70,165 45,190 60,200 C 70,205 95,175 100,155 Z" fill="#fef3c7" stroke="#fbbf24" stroke-width="2" style="transition: all 0.5s ease"/>
                  
                  <!-- Cervical, Thoracic & Lumbar Vertebrae with Spinous processes -->
                  <!-- Spines (Dynamic) -->
                  <path id="sk-spines" d="M 148,105 L 140,80 M 165,102 L 160,75 M 185,100 L 185,65 M 205,98 L 205,60 M 225,99 L 230,62 M 245,100 L 250,68 M 265,102 L 270,75 M 285,103 L 290,82 M 305,105 L 310,88 M 325,108 L 330,95 M 345,110 L 350,100 M 365,113 L 370,103 M 385,116 L 390,106 M 405,120 L 410,110 M 425,124 L 430,115" stroke="#a1a1aa" stroke-width="3" style="transition: all 0.5s ease"/>
                  <!-- Main Spine Curve -->
                  <path id="sk-spine-curve" d="M 148,105 C 180,95 240,100 320,110 C 400,120 460,135 500,160" stroke="#e4e4e7" stroke-width="7" stroke-dasharray="10 4" style="transition: all 0.5s ease"/>
                  
                  <!-- Scapula (Shoulder Blade) -->
                  <path id="sk-scapula" d="M 180,120 L 220,115 L 210,170 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3" style="transition: all 0.5s ease"/>
                  <!-- Scapular spine -->
                  <path id="sk-scapula-spine" d="M 215,125 L 208,160" stroke="#71717a" stroke-width="2" style="transition: all 0.5s ease"/>
                  
                  <!-- Front Leg (Humerus, Radius/Ulna) -->
                  <path id="sk-front-leg" d="M 205,165 L 185,240 L 190,310" stroke="#e4e4e7" stroke-width="10" style="transition: all 0.5s ease"/>
                  <path id="sk-ulna" d="M 185,240 L 205,310" stroke="#a1a1aa" stroke-width="7" style="transition: all 0.5s ease"/> <!-- Ulna -->
                  <circle id="sk-elbow" cx="185" cy="240" r="6" fill="#e4e4e7" stroke="none" style="transition: all 0.5s ease"/>
                  
                  <!-- Front Foot (Carpals, Metacarpals, Phalanges) -->
                  <path id="sk-front-foot" d="M 190,310 C 180,315 175,325 175,330 L 210,330 C 210,325 210,315 205,310 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3" style="transition: all 0.5s ease"/>
                  <!-- Ribcage (Detailed) -->
                  <g id="sk-ribs" style="transition: all 0.5s ease">
                    <path d="M 225,100 C 220,130 210,170 235,185" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 245,100 C 240,130 230,175 255,195" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 265,102 C 260,135 250,185 275,205" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 285,103 C 280,140 270,195 295,215" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 305,105 C 300,145 290,200 315,220" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 325,108 C 320,150 310,205 335,225" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 345,110 C 340,155 330,205 355,220" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 365,113 C 360,155 350,200 375,215" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 385,116 C 385,155 375,195 395,205" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 405,120 C 405,155 400,185 415,190" stroke="#d4d4d8" stroke-width="4"/>
                    <path d="M 425,124 C 425,155 420,180 435,180" stroke="#d4d4d8" stroke-width="4"/>
                  </g>
                  
                  <!-- Pelvis (Ilium, Ischium, Pubis) -->
                  <path id="sk-pelvis" d="M 430,130 C 410,140 420,180 440,185 C 470,195 490,165 485,145 C 480,130 450,120 430,130 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3" style="transition: all 0.5s ease"/>
                  <circle id="sk-hip" cx="445" cy="175" r="8" fill="#18181b" style="transition: all 0.5s ease"/>
                  
                  <!-- Hind Leg (Femur, Tibia, Fibula) -->
                  <path id="sk-hind-leg" d="M 445,175 L 430,250 L 450,310" stroke="#e4e4e7" stroke-width="10" style="transition: all 0.5s ease"/>
                  <path id="sk-fibula" d="M 430,250 L 460,310" stroke="#a1a1aa" stroke-width="7" style="transition: all 0.5s ease"/> <!-- Fibula -->
                  <circle id="sk-knee" cx="430" cy="250" r="6" fill="#e4e4e7" stroke="none" style="transition: all 0.5s ease"/>
                  
                  <!-- Hind Foot (Tarsals, Metatarsals, Phalanges) -->
                  <path id="sk-hind-foot" d="M 450,310 C 440,315 435,325 435,330 L 470,330 C 470,325 465,315 460,310 Z" fill="#27272a" stroke="#e4e4e7" stroke-width="3" style="transition: all 0.5s ease"/>
                  <!-- Tail bones -->
                  <path id="sk-tail" d="M 485,145 C 500,170 515,220 495,270" stroke="#e4e4e7" stroke-width="5" stroke-dasharray="8 4" style="transition: all 0.5s ease"/>
                </g>`;

if (code.indexOf('toggleSkeletonType') === -1) {
  code = code.replace(targetSkeleton, newSkeleton);
  fs.writeFileSync('index.html', code);
  console.log('patched html skeleton!');
} else {
  console.log('already patched');
}
