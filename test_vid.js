const fs = require('fs');
console.log(fs.readFileSync('index.html', 'utf8').includes('src="/assets/promo.mp4"'));
