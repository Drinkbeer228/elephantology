const fs = require('fs');

let svg_content = `
              <svg viewBox="0 0 600 360" class="w-full h-auto max-h-[380px]">
                <!-- Elephant Silhouette Base (Dimmed) -->
                <path d="M 120,200 C 140,120 220,90 320,100 C 400,105 480,120 520,180 C 530,220 510,260 490,280 L 470,330 L 430,330 L 440,260 L 360,260 L 350,330 L 310,330 L 320,230 L 220,230 L 210,330 L 170,330 L 180,220 C 150,220 100,200 80,180 C 60,160 50,110 70,80 C 80,65 100,75 110,120 C 120,160 120,200 120,200 Z" fill="#1e2230" stroke="#2a2f42" stroke-width="2"/>
                
                <!-- BONES -->
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
                </g>

                <!-- Skull & Cranial Pneumatization Hotspot -->
                <g onclick="selectAnatomyPoint('cranial')" class="cursor-pointer group">
                  <circle cx="110" cy="110" r="18" class="fill-rose-500/20 stroke-rose-400 group-hover:scale-125 transition-transform" stroke-width="2"/>
                  <circle cx="110" cy="110" r="6" class="fill-rose-400"/>
                  <text x="110" y="80" text-anchor="middle" class="fill-rose-300 font-pixel text-[10px]">Череп</text>
                </g>

                <!-- Tusks / Incisors -->
                <g onclick="selectAnatomyPoint('tusks')" class="cursor-pointer group">
                  <circle cx="70" cy="180" r="16" class="fill-amber-500/20 stroke-amber-400 group-hover:scale-125 transition-transform" stroke-width="2"/>
                  <circle cx="70" cy="180" r="5" class="fill-amber-400"/>
                  <text x="50" y="210" text-anchor="middle" class="fill-amber-300 font-pixel text-[10px]">Бивни</text>
                </g>

                <!-- Trunk Hydrostat -->
                <g onclick="selectAnatomyPoint('trunk')" class="cursor-pointer group">
                  <circle cx="65" cy="130" r="18" class="fill-sky-500/20 stroke-sky-400 group-hover:scale-125 transition-transform" stroke-width="2"/>
                  <circle cx="65" cy="130" r="6" class="fill-sky-400"/>
                  <text x="35" y="150" text-anchor="middle" class="fill-sky-300 font-pixel text-[10px]">Хобот</text>
                </g>

                <!-- Ears / Thermoregulation -->
                <g onclick="selectAnatomyPoint('ears')" class="cursor-pointer group">
                  <circle cx="160" cy="140" r="22" class="fill-emerald-500/20 stroke-emerald-400 group-hover:scale-125 transition-transform" stroke-width="2"/>
                  <circle cx="160" cy="140" r="6" class="fill-emerald-400"/>
                  <text x="160" y="105" text-anchor="middle" class="fill-emerald-300 font-pixel text-[10px]">Уши</text>
                </g>

                <!-- Heart / Cardiovascular -->
                <g onclick="selectAnatomyPoint('heart')" class="cursor-pointer group">
                  <circle cx="230" cy="210" r="18" class="fill-rose-600/30 stroke-rose-500 group-hover:scale-125 transition-transform" stroke-width="2"/>
                  <circle cx="230" cy="210" r="6" class="fill-rose-500"/>
                  <text x="230" y="180" text-anchor="middle" class="fill-rose-300 font-pixel text-[10px]">Сердце</text>
                </g>

                <!-- Feet / Pacinian Cushion -->
                <g onclick="selectAnatomyPoint('feet')" class="cursor-pointer group">
                  <circle cx="195" cy="330" r="16" class="fill-purple-500/20 stroke-purple-400 group-hover:scale-125 transition-transform" stroke-width="2"/>
                  <circle cx="195" cy="330" r="5" class="fill-purple-400"/>
                  <text x="195" y="365" text-anchor="middle" class="fill-purple-300 font-pixel text-[10px]">Стопа & Подушка</text>
                </g>
                
                <!-- Vertebrae Hotspot -->
                <g onclick="selectAnatomyPoint('spine')" class="cursor-pointer group">
                  <circle cx="300" cy="110" r="16" class="fill-cyan-500/20 stroke-cyan-400 group-hover:scale-125 transition-transform" stroke-width="2"/>
                  <circle cx="300" cy="110" r="5" class="fill-cyan-400"/>
                  <text x="300" y="80" text-anchor="middle" class="fill-cyan-300 font-pixel text-[10px]">Позвоночник</text>
                </g>

              </svg>
`;

let code = fs.readFileSync('index.html', 'utf8');
let match = code.match(/<svg viewBox="0 0 600 360" class="w-full h-auto max-h-\[380px\]">[\s\S]*?<\/svg>/);
if(match) {
    code = code.replace(match[0], svg_content.trim());
    fs.writeFileSync('index.html', code);
    console.log('Replaced SVG successfully');
} else {
    console.log('Could not find SVG match');
}
