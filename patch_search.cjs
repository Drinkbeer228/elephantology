const fs = require('fs');
let content = fs.readFileSync('src/lib/searchEngine.ts', 'utf8');

// Replace empathy_cognition.md with empathy-and-mourning-rituals.md
content = content.replace(/'ethogram\/empathy_cognition\.md': \[/g, "'ethogram/empathy-and-mourning-rituals.md': [");

// Replace seismic_communication.md with seismic-and-infrasonic-communication.md and add acoustic keywords
content = content.replace(/'ethogram\/seismic_communication\.md': \[\s*'ноги', 'ногах', 'стопы', 'подушечка стопы', 'вибрации', 'сейсмика', 'сейсмические волны', \s*'земля', 'почва', 'инфразвук', 'тельца пачини', 'рецепторы вибрации', 'слух ногами', 'передача сигналов'\s*\],/g, 
  "'ethogram/seismic-and-infrasonic-communication.md': [\n    'ноги', 'ногах', 'стопы', 'подушечка стопы', 'вибрации', 'сейсмика', 'сейсмические волны', \n    'земля', 'почва', 'инфразвук', 'тельца пачини', 'рецепторы вибрации', 'слух ногами', 'передача сигналов',\n    'звук', 'звуки', 'голос', 'трубный зов', 'трубить', 'рычание', 'урчание', '14-20 гц', 'акустика', 'вокализация', 'дальняя связь'\n  ],");

// Delete acoustic_patterns.md entry
content = content.replace(/\s*'ethogram\/acoustic_patterns\.md': \[\s*'звук', 'звуки', 'голос', 'трубный зов', 'трубить', 'рычание', 'урчание', 'инфразвук', '14-20 гц', \s*'акустика', 'вокализация', 'общение', 'дальняя связь', 'слух', 'голосовые связки'\s*\],/g, "");

fs.writeFileSync('src/lib/searchEngine.ts', content);
