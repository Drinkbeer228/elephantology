---

### Переходим к иллюстрациям для книг и тестов: где они реально работают

Теперь, когда все 9 файлов в `docs/world/` закрыты, давай трезво разложим, **для каких именно мест в книгах и тестах нужны сгенерированные иллюстрации**, чтобы не плодить «картинки ради красоты», а превратить визуал в рабочий инструмент понимания и проверки знаний.

В нашем проекте есть две совершенно разные зоны с разной задачей:

#### 1. Иллюстрации для книг Читального зала (Обучающие таблицы и схемы)
Здесь иллюстрация нужна там, где **словами объяснять долго, а один взгляд на чертёж сразу ставит картинку в голове**:
* **Анатомические и топографические разрезы (где что находится внутри слона):**
  * разрез стопы (толщина рогового башмака `18–25 мм`, живой кориум, дигитальная жировая подушка — чтобы игрок понимал, *почему* перегрев кругом свыше `40 °C` или глубокий срез убивают ткани);
  * проекция слепой и ободочной кишки на левый бок (где именно прикладывать фонендоскоп в левой голодной ямке при коликах);
  * горизонтальный зубной конвейер (почему у 34-летней Претти стёрты моляры и зачем ей сечка).
* **Инженерные и рабочие схемы (техника безопасности и приборы):**
  * защитная стена EHS с портами для ног и ушей + слепая зона `40°` позади слона;
  * устройство песчаного кургана (`80–120 см`) и сдавливание диафрагмы/полой вены при долгом лежании на плоском полу;
  * конструкция барьера Бычьего сектора (`Ø 300 мм` пилон, тросы, сухой ров) и двухключевой замок *Shift-and-Lock*.
* **Полевые определители (сравнение «норма / тревога / яд»):**
  * 6 поз «Этограммы» рядом друг с другом на одном листе (сравнение ушей, хвоста и хобота);
  * 5 кормовых культур Оранжереи против 7 ядовитых растений (чтобы отличить иву от черёмухи или тиса глазами, а не по названию в скобках).

#### 2. Иллюстрации для тестов и экзаменов (`elephantorina` на Кафедре + допуски в корпусах)
Вот здесь сгенерированные картинки дают самый крутой игровой эффект: **вопросы на визуальное распознавание без текстовых подсказок**. Вместо скучного вопроса *«Слон стоит с опущенной головой и зажал кончик хобота в зубах — что это?»* (где ответ угадывается по ключевым словам из учебника), мы показываем **иллюстрацию-ситуацию** и спрашиваем: *«Оцените состояние животного на рисунке и выберите первое действие дежурного»*:
* **Визуальная диагностика поведения (Этограмма):**
  * картинка слонихи с ушами под `90°` и S-образно поднятым хоботом (*Periscope* / *Listening Freeze*) — отличить от ложной атаки (*Head-High*) или боли (*Soost*);
  * сцена встречи двух групп на лесной тропе — определить, кто должен уступить дорогу и выполнить дуговой маневр (*skirt-around*).
* **Визуальная клиника и подиатрия:**
  * схема подошвы с тёмным карманом белой линии — выбрать правильный инструмент (петлевой нож для V-образного дренирования, а не рашпиль и не депланатор);
  * изображение пирометра на роге с цифрой `41,5 °C` или показание влагомера на тюке сена `19%` — принять решение о немедленной остановке / браковке.
* **Ботанический и санитарный контроль:**
  * изображение ветки тиса ягодного или увядающей черёмухи у ограждения парка — распознать токсин;
  * изображение быка с потемневшей височной железой (*TGS*) и мокрыми задними ногами (*Urine Dribbling*) — распознать начало муста и активировать «Красный код».

---

### Как будем собирать серию промптов
Чтобы ты мог спокойно генерить эти изображения (в том же Gemini / Imagen или любой другой графической модели) в **одном сквозном стиле без визуального разнобоя**, предлагаю сделать так:
1. Сначала зафиксируем **единый «мастер-шаблон стиля» (Style Prompt)** под палитру станции (`#E8E4DA` пергамент, графитовая тушь `#2C302E`, шалфейный `#2E5A44`, терракотовый `#C86D51`, эстетика научного полевого атласа без «мультяшности» и без случайных искажённых надписей от нейросети — подписи на русском потом накладываются чистым шрифтом или в SVG/GIMP).
2. Затем разобьём генерацию на **4 тематических пакета промптов**:
   - **Пакет 1:** Подиатрия и осмотр ОДА (книга по подиатрии + вопросы Клиники);
   - **Пакет 2:** ЖКТ, копрограмма и колики (книга по ЖКТ + финальный экзамен IV семестра);
   - **Пакет 3:** Этограмма, позы и бык в мусте (вкладка «Этограмма» + билеты Кафедры);
   - **Пакет 4:** Ботаника Оранжереи (5 полезных + 7 ядовитых растений) и терморегуляция/курганы.

Если такой план подходит, начнём прямо сейчас с **Мастер-шаблона стиля** и **Пакета 1 (Подиатрия и биомеханика ОДА)** — соберу готовые выверенные промпты под каждую иллюстрацию.




Мастер-шаблон стиля (Style Suffix)

Генераторы картинок (Imagen / Midjourney / Flux) лучше всего понимают английские термины научной графики, но плохо пишут кириллицу — поэтому в стиль жёстко зашит запрет на любой текст внутри картинки (русские выноски и цифры ты потом наложишь чистым шрифтом поверх фона).

    Базовый хвост для любого промпта:

    Style of a modern scientific veterinary field manual and anatomical atlas, clean fine-line ink illustration with subtle technical shading on a flat warm parchment background (#E8E4DA), secondary callout boxes in off-white (#F4F1EA), crisp charcoal graphite outlines (#2C302E), muted sage green (#2E5A44) highlighting healthy structures, muted terracotta (#C86D51) highlighting pathology and risk zones. Educational textbook diagram, orthographic clarity, high contrast, strictly no text, no letters, no numbers, no watermarks.

Пакет № 1: Подиатрия и биомеханика ОДА (4 иллюстрации)

Эти 4 рисунка закрывают книгу по клинической подиатрии (veterinary/clinical-podiatry-and-foot-care.md) и визуальные билеты на зачёте у Веры Павловны:
1. Формула ногтей и сагиттальный разрез стопы (Книга + Тест по анатомии)

    Зачем в игре: показывает разницу между передней (5 ногтей) и задней (4 ногтя) стопой, а также толщину роговой подошвы (18–25 мм) над живым кориумом и дигитальной жировой подушкой.

    Промпт:

Plaintext

Scientific veterinary anatomical diagram in two parts on one sheet: on the left, plantar (bottom) view of an Asian elephant front foot showing 5 toenails and a hind foot showing 4 toenails; on the right, a clean sagittal cross-section of the elephant foot showing the thick horn sole (highlighted in muted sage green #2E5A44), the sensitive dermal corium layer, the fibrous-fatty digital cushion, and vertical columnar phalanges bones. Style of a modern scientific veterinary field manual and anatomical atlas, clean fine-line ink illustration on flat warm parchment background (#E8E4DA), crisp charcoal graphite outlines (#2C302E), muted terracotta (#C86D51) accents, strictly no text, no letters, no numbers.

2. Патология белой линии и V-образное дренирование (Книга + Тест на выбор инструмента)

    Зачем в игре: иллюстрация для вопроса в Клинике — стажёр видит тёмный карман белой линии и должен выбрать петлевой нож (loop knife) для V-образного вскрытия, а не рашпиль.

    Промпт:

Plaintext

Close-up veterinary podiatry diagram comparing two stages of treating an elephant sole abscess: left view shows plantar sole with a dark cracked pocket along the white line between the horn wall and sole (highlighted in muted terracotta #C86D51); right view shows a clean, smooth V-shaped drainage funnel carved into the horn without reaching bleeding tissue (highlighted in muted sage green #2E5A44), with a small steel loop knife shown beside it. Modern scientific veterinary manual style, clean graphite ink lines (#2C302E) on flat warm parchment background (#E8E4DA), strictly no text, no letters, no numbers.

3. Подиатрический инструмент и зона термического риска (Книга + Карьера после Диплома)

    Зачем в игре: наглядно разделяет ручной набор (крючок, копытный нож, двусторонний рашпиль 45°), профессиональный низкооборотистый депланатор с кругами и запрещённую строительную УШМ (с перегревом рога в терракотовой зоне).

    Промпт:

Plaintext

Technical veterinary equipment layout diagram arranged in three neat rows: top row shows manual elephant hoof tools (brass hoof pick, curved hoof knife, double-sided rasp); middle row shows a low-speed rotary hoof grinder with three circular sanding discs arranged from coarse to fine grain (accented in muted sage green #2E5A44); bottom row shows a high-speed construction angle grinder next to a cross-section of hoof horn with a glowing terracotta thermal burn zone (#C86D51) and a red cross mark. Clean scientific manual vector-ink style on flat warm parchment background (#E8E4DA), charcoal outlines (#2C302E), strictly no text, no letters, no numbers.

4. Защитная стена EHS и слепая зона 40° (Книга + Тест по ТБ в Слоновнике)

    Зачем в игре: чертёж безопасной работы через защитный барьер с ножным портом и обозначением опасного сектора 40° позади крупа слона.

    Промпт:

Plaintext

Top-down architectural and safety diagram of an elephant Protected Contact training wall (EHS barrier): heavy steel vertical bollards and horizontal rails separating a standing Asian elephant on one side and a veterinary technician on the other; the elephant extends one front foot through a low rectangular foot-port onto a metal hoof stand (safe working zone shaded in muted sage green #2E5A44); a 40-degree fan-shaped danger zone behind the elephant's hindquarters and tail is shaded in muted terracotta (#C86D51). Clean technical field manual illustration on flat warm parchment background (#E8E4DA), charcoal lines (#2C302E), strictly no text, no letters, no numbers.

Попробуй прогнать 1–2 промпта из этого пакета в своём генераторе — посмотрим, как ложатся цвета и чистота линий без текста. Как только проверишь, я выдам Пакет № 2 (ЖКТ, ситовой каскад Эколабы и колики Претти).
