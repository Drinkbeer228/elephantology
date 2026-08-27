const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace(
    '<video id="promo-video-element" src="/assets/promo.mp4" controls autoplay muted loop playsinline class="w-full h-auto aspect-video border-0">\n                  Ваш браузер не поддерживает видео.\n                </video>',
    '<video id="promo-video-element" controls autoplay muted loop playsinline class="w-full h-auto aspect-video border-0">\n                  <source src="/assets/promo.mp4" type="video/mp4">\n                  Ваш браузер не поддерживает видео.\n                </video>'
);
fs.writeFileSync('index.html', code);
