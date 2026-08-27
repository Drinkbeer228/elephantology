# Энциклопедия «Слонология»

Глубокая интерактивная академическая база знаний по биологии, анатомии, этологии, эволюции и ветеринарии слонов. 
Доступна онлайн: [https://elephantology-wiki.ai.studio](https://elephantology-wiki.ai.studio)

## Текущий масштаб проекта
- **Статей:** 54 академические монографии
- **Категорий:** 6 (Анатомия, Этология, Ветеринария, Экология, Таксономия, Охрана)
- **Терминов в глоссарии:** 40+
- **Архитектура:** React/Tailwind frontend, Node.js backend. Настроена генерация статических страниц (SSG) для SEO (Googlebot-friendly) через `prerender.js`.

## Структура проекта
```text
elephantology-wiki/
├── docs/                 # База знаний в Markdown
│   ├── anatomy/          # Анатомия слонов 
│   ├── ecology/          # Экология и среда обитания
│   ├── ethogram/         # Этограмма и поведение
│   ├── taxonomy/         # Таксономия и эволюция
│   ├── veterinary/       # Ветеринария и уход
│   ├── conservation/     # Охрана и Сохранение видов
│   ├── glossary.md       # Словарь терминов (40+ определений)
│   ├── bibliography.md   # Библиография
│   └── index.md          # Корневой документ
├── src/                  # React Frontend
│   ├── components/       # UI компоненты (ArticleCatalog, Interactive modules)
│   ├── lib/              # Поисковый движок и утилиты
│   └── main.tsx          # Точка входа React
├── public/               # Статические ресурсы (Canvas, скрипты для Vanilla JS)
├── server.js             # Express Backend для парсинга статей и поиска
├── package.json          # Зависимости NPM
└── README.md             # Этот файл
```

## Стандарт данных (Frontmatter)
Все статьи используют строгую YAML-схему:

```yaml
---
title: "Название статьи"
evidence_level: 'established' # Уровень доказательности: established | moderate | limited | hypothesis | contested
description: "Краткое описание (до 160 символов для SEO)"
category: anatomy
tags:
  - тег-1
  - тег-2
difficulty: beginner|intermediate|advanced
reading_time_min: 15
last_reviewed: 2026-08-24
references:
  - type: journal|book|report|website|standard
    title: "Название источника"
    path: "../assets/books/file.pdf"  # для PDF
---
```

### Уровни доказательности (`evidence_level`)
База знаний строго классифицирует научную достоверность фактов:
- `established`: 🟢 Хорошо установлено (академический консенсус)
- `moderate`: 🟢 Достаточная база (подтверждено рядом исследований)
- `limited`: 🟡 Ограниченные данные (единичные наблюдения)
- `hypothesis`: 🟠 Гипотеза (научное предположение)
- `contested`: 🔴 Дискуссионно (существуют противоречивые мнения в научном сообществе)

## Локальная разработка

Стек: React, TypeScript, Node.js (Express), Vite, Tailwind CSS.

```bash
# Установка зависимостей
npm install

# Запуск локального dev-сервера (работает на порту 3000)
npm run dev

# Сборка для продакшена (Vite + esbuild)
npm run build

# Запуск собранного билда
npm run start
```
