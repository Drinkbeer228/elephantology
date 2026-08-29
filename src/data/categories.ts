export interface CategoryDef {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  order: number;
}

export const ACADEMIC_CATEGORIES: CategoryDef[] = [
  { 
    id: 'taxonomy', 
    name: 'Таксономия и Эволюция', 
    nameEn: 'Taxonomy and Evolution',
    icon: '🌳',
    description: 'Систематика хоботных, филогения, классификация видов и эволюционные ветви.', 
    descriptionEn: 'Systematics of Proboscidea, phylogeny, species classification, and evolutionary branches.',
    order: 1
  },
  { 
    id: 'anatomy', 
    name: 'Анатомия и Физиология', 
    nameEn: 'Anatomy and Physiology',
    icon: '🫀',
    description: 'Морфология хобота, бивней, зубной системы, опорно-двигательный аппарат и терморегуляция.', 
    descriptionEn: 'Morphology of trunk, tusks, dentition, musculoskeletal system, and thermoregulation.',
    order: 2
  },
  { 
    id: 'ethogram', 
    name: 'Этология и Поведение', 
    nameEn: 'Ethology and Behavior',
    icon: '🐘',
    description: 'Матриархальная структура, инфразвуковая коммуникация, ритуалы и социальная иерархия.', 
    descriptionEn: 'Matriarchal structure, infrasonic communication, rituals, and social hierarchy.',
    order: 3
  },
  { 
    id: 'cognition', 
    name: 'Когнитивистика и Память', 
    nameEn: 'Cognition and Memory',
    icon: '🧠',
    description: 'Зеркальный тест самосознания, долговременная топографическая память и орудийная деятельность.', 
    descriptionEn: 'Mirror self-recognition test, long-term topographic memory, and tool use.',
    order: 4
  },
  { 
    id: 'veterinary', 
    name: 'Ветеринария и Патологии', 
    nameEn: 'Veterinary and Pathologies',
    icon: '🩺',
    description: 'Эндотелиотропный герпесвирус (EEHV), пододерматиты, анестезиология и превентивная медицина.', 
    descriptionEn: 'Endotheliotropic herpesvirus (EEHV), pododermatitis, anesthesiology, and preventive medicine.',
    order: 5
  },
  { 
    id: 'ecology', 
    name: 'Экология и Среда обитания', 
    nameEn: 'Ecology and Habitat',
    icon: '🌿',
    description: 'Средообразующая роль мегагербиворов, дисперсия семян, зоогенная гидрология и кормовой бюджет.', 
    descriptionEn: 'Habitat-forming role of megaherbivores, seed dispersal, zoogenic hydrology, and foraging budget.',
    order: 6
  },
  { 
    id: 'conservation', 
    name: 'Охрана и Сохранение видов', 
    nameEn: 'Conservation and Protection',
    icon: '🛡️',
    description: 'Борьба с браконьерством, фрагментация ареалов, коридоры миграции и мониторинг популяций.', 
    descriptionEn: 'Anti-poaching, habitat fragmentation, migration corridors, and population monitoring.',
    order: 7
  },
  { 
    id: 'culture', 
    name: 'Антропозоология и Культура', 
    nameEn: 'Anthrozoology and Culture',
    icon: '🏛️',
    description: 'Слоны в мифологии, религиях Востока, военном деле античности и этика сосуществования.', 
    descriptionEn: 'Elephants in mythology, Eastern religions, ancient warfare, and coexistence ethics.',
    order: 8
  },
  { 
    id: 'paleontology', 
    name: 'Палеонтология и Ископаемые', 
    nameEn: 'Paleontology and Fossils',
    icon: '🦴',
    description: 'Мамонтовая фауна, мастодонты, гомфотерии, дейнотерии и островная карликовость.', 
    descriptionEn: 'Mammoth fauna, mastodons, gomphotheres, deinotheres, and island dwarfism.',
    order: 9
  },
  { 
    id: 'genomics', 
    name: 'Геномика и Молекулярная биология',
    nameEn: 'Genomics and Molecular Biology',
    icon: '🔬',
    description: 'Парадокс Пето, ген TP53, древняя ДНК мамонтов и эпигенетические адаптации.',
    descriptionEn: "Peto's paradox, TP53 duplication, ancient mammoth DNA, and epigenetic adaptations.",
    order: 10
  }
];

export const VALID_CATEGORY_IDS = new Set(ACADEMIC_CATEGORIES.map(c => c.id));

export const CATEGORY_MAP_RU: Record<string, string> = Object.fromEntries(
  ACADEMIC_CATEGORIES.map(c => [c.id, c.name])
);

export const CATEGORY_MAP_EN: Record<string, string> = Object.fromEntries(
  ACADEMIC_CATEGORIES.map(c => [c.id, c.nameEn])
);
