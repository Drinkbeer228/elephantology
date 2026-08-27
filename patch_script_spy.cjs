const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

code = code.replace(
  /html \+= \\\`<a href="#\\\$\\{item\.id\\}" class="toc-link block \\\$\\{pl\\} \\\$\\{color\\} transition-colors line-clamp-2 leading-snug cursor-pointer">\\\$\\{item\.title\\}<\/a>\\\`;/,
  'html += \\`<a href="#${item.id}" data-level="${item.level}" class="toc-link block ${pl} ${color} transition-colors line-clamp-2 leading-snug cursor-pointer">${item.title}</a>\\`;'
);

// rewrite the intersection observer part
code = code.replace(
  /links\.forEach\(link => \{[\s\S]*?\}\);\s*\}\s*\}\);/m,
  `links.forEach(link => {
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('text-kingdom-gold', 'font-bold');
            link.classList.remove('text-gray-200', 'text-gray-400', 'text-gray-500');
          } else {
            link.classList.remove('text-kingdom-gold', 'font-bold');
            if (link.getAttribute('data-level') === '3') {
               link.classList.add('text-gray-400');
            } else {
               link.classList.add('text-gray-200');
            }
          }
        });
      }
    });`
);

fs.writeFileSync('script.js', code);
