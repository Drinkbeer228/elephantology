const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const target1 = "    const { messages, message } = req.body;";
const replace1 = "    const { messages, message, context } = req.body;";
code = code.replace(target1, replace1);

const target2 = "    const systemInstruction = `Ты — ведущий научный консультант и эксперт-слонолог интерактивной энциклопедии «Слонология».";
const replace2 = `    
    let contextStr = '';
    if (context) {
      if (context.currentArticlePath) {
        contextStr += \`\\nТекущая статья пользователя: \${context.currentArticlePath}\`;
      }
      if (context.allArticles && context.allArticles.length > 0) {
        const articleLinks = context.allArticles.map(a => \`- [\${a.title}](/article/\${a.path.replace('.md', '')})\`).join('\\n');
        contextStr += \`\\n\\nСПИСОК ДОСТУПНЫХ СТАТЕЙ В БАЗЕ:\\n\${articleLinks}\\n\\nИспользуй эти ссылки в своих ответах, чтобы направлять пользователя к соответствующим статьям. Например: "Подробнее об этом читайте в статье [Анатомия хобота](/article/anatomy/trunk)."\`;
      }
    }

    const systemInstruction = \`Ты — ведущий научный консультант и эксперт-слонолог интерактивной энциклопедии «Слонология».\${contextStr}`;
code = code.replace(target2, replace2);

fs.writeFileSync('server.js', code);
