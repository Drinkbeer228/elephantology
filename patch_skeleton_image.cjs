const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');
const lines = code.split('\n');

const startIndex = lines.findIndex(line => line.includes('<svg viewBox="0 0 600 360"'));
const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.includes('</svg>'));

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = `              <!-- Species Toggle -->
              <div class="absolute top-4 left-4 z-10 flex bg-kingdom-bg border border-kingdom-border rounded-lg overflow-hidden">
                <button onclick="setSkeletonImage('africana')" id="btn-skel-africana" class="px-3 py-1.5 text-[10px] font-pixel bg-kingdom-gold text-black transition-colors">L. africana</button>
                <button onclick="setSkeletonImage('maximus')" id="btn-skel-maximus" class="px-3 py-1.5 text-[10px] font-pixel bg-kingdom-surface text-kingdom-muted hover:text-white transition-colors">E. maximus</button>
              </div>

              <!-- Real Image Container -->
              <div class="relative w-full mt-10 flex items-center justify-center">
                <img id="skeleton-real-image" src="assets/skeleton_placeholder.png" alt="Скелет слона" class="w-full h-auto max-h-[400px] object-contain opacity-50 hover:opacity-100 transition-opacity duration-500">
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none text-kingdom-muted text-[11px] text-center px-4" id="skeleton-placeholder-text">
                  <div class="border-2 border-dashed border-kingdom-border rounded-xl p-4 bg-kingdom-bg/80 backdrop-blur-sm">
                    <p class="font-bold text-white mb-2">Загрузите реальные изображения скелетов:</p>
                    <code class="block text-rose-300">assets/skeleton_africana.png</code>
                    <code class="block text-sky-300 mt-1">assets/skeleton_maximus.png</code>
                    <p class="mt-2 text-[10px]">Затем мы откорректируем координаты точек.</p>
                  </div>
                </div>
                
                <!-- Interactive Pins (Percentage-based, to be adjusted once real images are loaded) -->
                <button onclick="selectAnatomyPoint('cranial')" class="absolute top-[20%] left-[20%] w-6 h-6 bg-rose-500/80 border-2 border-white rounded-full hover:scale-125 transition-transform flex items-center justify-center group z-10">
                  <span class="absolute -top-7 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Череп</span>
                  <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </button>
                <button onclick="selectAnatomyPoint('tusks')" class="absolute top-[35%] left-[10%] w-6 h-6 bg-amber-500/80 border-2 border-white rounded-full hover:scale-125 transition-transform flex items-center justify-center group z-10">
                  <span class="absolute -top-7 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Бивни</span>
                  <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </button>
                <button onclick="selectAnatomyPoint('trunk')" class="absolute top-[50%] left-[5%] w-6 h-6 bg-sky-500/80 border-2 border-white rounded-full hover:scale-125 transition-transform flex items-center justify-center group z-10">
                  <span class="absolute -top-7 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Хобот</span>
                  <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </button>
                <button onclick="selectAnatomyPoint('spine')" class="absolute top-[15%] left-[50%] w-6 h-6 bg-cyan-500/80 border-2 border-white rounded-full hover:scale-125 transition-transform flex items-center justify-center group z-10">
                  <span class="absolute -top-7 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Позвоночник</span>
                  <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </button>
                <button onclick="selectAnatomyPoint('heart')" class="absolute top-[40%] left-[45%] w-6 h-6 bg-red-500/80 border-2 border-white rounded-full hover:scale-125 transition-transform flex items-center justify-center group z-10">
                  <span class="absolute -top-7 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Сердце</span>
                  <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </button>
                <button onclick="selectAnatomyPoint('feet')" class="absolute top-[85%] left-[30%] w-6 h-6 bg-purple-500/80 border-2 border-white rounded-full hover:scale-125 transition-transform flex items-center justify-center group z-10">
                  <span class="absolute -top-7 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Стопа</span>
                  <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </button>
              </div>`;

    lines.splice(startIndex, endIndex - startIndex + 1, newContent);
    fs.writeFileSync('index.html', lines.join('\n'));
    console.log('patched skeleton image UI!');
} else {
    console.log('could not find SVG block');
}
