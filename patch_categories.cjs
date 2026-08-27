const fs = require('fs');
let code = fs.readFileSync('src/components/ArticleCatalog.tsx', 'utf8');

const oldCategories = `const CATEGORIES = [
  { id: 'main', name: 'Анатомия и физиология', icon: '🦴' },
  { id: 'behavior', name: 'Поведение и психология', icon: '🧠' },
  { id: 'ecology', name: 'Экология и миграции', icon: '🌍' },
  { id: 'vet', name: 'Ветеринария и здоровье', icon: '🩺' },
  { id: 'evolution', name: 'Эволюция и палеонтология', icon: '🦕' },
  { id: 'culture', name: 'Философия и Культура', icon: '📖' },
  { id: 'architecture', name: 'Архитектура системы', icon: '⚙️' }
];`;

const newCategories = `const CATEGORIES = [
  { id: 'main', name: 'Общая база знаний', icon: '🐘' },
  { id: 'anatomy', name: 'Анатомия и физиология', icon: '🦴' },
  { id: 'ethogram', name: 'Поведение и психология', icon: '🧠' },
  { id: 'ecology', name: 'Экология и миграции', icon: '🌍' },
  { id: 'veterinary', name: 'Ветеринария и здоровье', icon: '🩺' },
  { id: 'taxonomy', name: 'Эволюция и палеонтология', icon: '🦕' },
  { id: 'philosophy', name: 'Философия и Культура', icon: '📖' }
];`;

code = code.replace(oldCategories, newCategories);
fs.writeFileSync('src/components/ArticleCatalog.tsx', code);
