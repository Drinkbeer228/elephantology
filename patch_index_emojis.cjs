const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace in Mobile Drawer
html = html.replace('🌳 Древо Эволюции', 'ДРЕВО ЭВОЛЮЦИИ');
html = html.replace('🦴 Анатомический Рентген', 'АНАТОМИЧЕСКИЙ РЕНТГЕН');
html = html.replace('📊 Гормональный Таймлайн', 'ГОРМОНАЛЬНЫЙ ТАЙМЛАЙН');
html = html.replace('🗺️ GPS-Карта Миграций', 'GPS-КАРТА МИГРАЦИЙ');
html = html.replace('🗂️ Матрица Этограммы', 'МАТРИЦА ЭТОГРАММЫ');
html = html.replace('🎙️ Акустика & Сейсмо-радар', 'АКУСТИКА & СЕЙСМО-РАДАР');
html = html.replace('🩺 Ветеринарный Чекер', 'ВЕТЕРИНАРНЫЙ ЧЕКЕР');
html = html.replace('🧠 Обучающий Тренажер', 'ОБУЧАЮЩИЙ ТРЕНАЖЕР');

// Replace in moduleTitles
html = html.replace("tree: '🌳 Древо Эволюции Proboscidea',", "tree: '[ Древо Эволюции ] Proboscidea',");
html = html.replace("xray: '🦴 Анатомический Рентген',", "xray: '[ Анатомический Рентген ]',");
html = html.replace("musth: '📊 Гормональный Таймлайн Муста',", "musth: '[ Гормональный Таймлайн ]',");
html = html.replace("gps: '🗺️ GPS-Карта Миграций Масаи-Мара',", "gps: '[ GPS-Карта ] Миграций',");
html = html.replace("ethogram: '🗂️ Матрица Этограммы и Поведений',", "ethogram: '[ Матрица Этограммы ]',");
html = html.replace("skeleton: '🦴 Интерактивный Атлас Скелета',", "skeleton: '[ Атлас Скелета ]',");
html = html.replace("audio: '🎙️ Акустика & Сейсмо-радар',", "audio: '[ Акустика & Сейсмо-радар ]',");
html = html.replace("vet: '🩺 Ветеринарный Чекер Стоп',", "vet: '[ Ветеринарный Чекер ]',");
html = html.replace("flashcards: '🧠 Обучающий Тренажер'", "flashcards: '[ Обучающий Тренажер ]'");

// Also replace the remaining ones in mobile drawer tabs if any
html = html.replace('<span>Модули (9)</span>', '<span>ЛАБОРАТОРИЯ</span>');
html = html.replace('<span>Статьи</span>', '<span>АРХИВ</span>');
html = html.replace('<h3 class="font-pixel text-xs text-kingdom-gold uppercase">Каталог Слонологии</h3>', '<h3 class="font-mono text-xs text-kingdom-gold uppercase tracking-widest">[ БАЗА ДАННЫХ ]</h3>');
html = html.replace('📚', '<i data-lucide="database" class="w-5 h-5 text-kingdom-muted"></i>');

fs.writeFileSync('index.html', html);
