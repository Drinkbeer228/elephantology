import React, { useState } from 'react';
import { Brain, Ear, Activity, Footprints, Wind, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const elephantDataRu = {
  brain: {
    title: 'Мозг и Когнитивная архитектура',
    icon: <Brain className="w-5 h-5 text-purple-400" />,
    desc: 'Масса мозга достигает 5 кг. Гигантский гиппокамп отвечает за сложнейшую пространственную память (запоминание сотен км водопоев), а веретенообразные нейроны обеспечивают эмпатию и горевание.',
    link: '/article/ethogram/cognitive_architecture'
  },
  ears: {
    title: 'Уши (Терморегуляторные радиаторы)',
    icon: <Ear className="w-5 h-5 text-sky-400" />,
    desc: 'Уши африканских слонов пронизаны густой капиллярной сетью. При взмахах кровь охлаждается до 9°C, что позволяет снизить общую температуру тела. Также служат для визуальных агрессивных дисплеев.',
    link: '/article/anatomy/integumentary_system'
  },
  trunk: {
    title: 'Хобот (Мышечный гидростат)',
    icon: <Wind className="w-5 h-5 text-teal-400" />,
    desc: 'Уникальный орган без единой кости, состоящий из 40 000 мышечных пучков. Хобот может поднять бревно в 250 кг или сорвать травинку. Служит для дыхания (в т.ч. под водой), обоняния, коммуникации и захвата пищи.',
    link: '/article/anatomy/muscular_hydrostat'
  },
  tusks: {
    title: 'Бивни',
    icon: <Activity className="w-5 h-5 text-amber-400" />,
    desc: 'Видоизменённые верхние резцы (не клыки!). Растут на протяжении всей жизни. У слонов есть выраженная "правобивневость" или "левобивневость", как у людей рабочая рука. Служат оружием и инструментом для сдирания коры.',
    link: '/article/anatomy/skeletal_system_cranial'
  },
  feet: {
    title: 'Стопы и Сейсмо-Радар',
    icon: <Footprints className="w-5 h-5 text-emerald-400" />,
    desc: 'Колоссальный вес распределяется через эластичную жировую подушку (digital cushion). Она также работает как акустическая линза, улавливая сейсмические волны низкочастотных румблов сородичей за 30 километров.',
    link: '/article/anatomy/skeletal_system_appendicular'
  }
};

const elephantDataEn = {
  brain: {
    title: 'Brain & Cognitive Architecture',
    icon: <Brain className="w-5 h-5 text-purple-400" />,
    desc: 'Brain mass reaches 5 kg. A giant hippocampus drives extensive spatial memory (tracking waterholes across hundreds of kilometers), while spindle neurons support empathy, grieving, and complex social cognition.',
    link: '/article/ethogram/cognitive_architecture'
  },
  ears: {
    title: 'Ears (Thermoregulatory Radiators)',
    icon: <Ear className="w-5 h-5 text-sky-400" />,
    desc: 'African elephant ears are permeated by dense capillary networks. Flapping lowers blood temperature by up to 9°C to reduce core body heat. Ears also function in visual agonistic threat displays.',
    link: '/article/anatomy/integumentary_system'
  },
  trunk: {
    title: 'Trunk (Muscular Hydrostat)',
    icon: <Wind className="w-5 h-5 text-teal-400" />,
    desc: 'A boneless organ composed of over 40,000 muscle fascicles. The proboscis can lift a 250 kg log or delicately pluck a single blade of grass. It functions in respiration (including snorkeling), olfaction, tactile exploration, and acoustic trumpeting.',
    link: '/article/anatomy/muscular_hydrostat'
  },
  tusks: {
    title: 'Tusks (Elongated Incisors)',
    icon: <Activity className="w-5 h-5 text-amber-400" />,
    desc: 'Modified upper second incisors continuously growing throughout life. Elephants exhibit distinct lateralization ("right-tusked" or "left-tusked"). Tusks are vital tools for debarking, digging minerals, and defense.',
    link: '/article/anatomy/skeletal_system_cranial'
  },
  feet: {
    title: 'Feet & Seismic Substrate Sensor',
    icon: <Footprints className="w-5 h-5 text-emerald-400" />,
    desc: 'Immense body mass is cushioned by an elastic digital cushion. It functions as an acoustic transducer, registering low-frequency seismic rumbles transmitted through the ground from herds over 30 km away.',
    link: '/article/anatomy/skeletal_system_appendicular'
  }
};

export function InteractiveAnatomy() {
  const { lang } = useLanguage();
  const [activePart, setActivePart] = useState<keyof typeof elephantDataRu | null>(null);

  const data = lang === 'en' ? elephantDataEn : elephantDataRu;

  const callVanilla = (path: string) => {
    const win = window as any;
    if (win.loadArticle) {
      win.loadArticle(path.replace('/article/', ''));
    } else {
      window.location.href = path;
    }
  };

  return (
    <div className="my-8 bg-[#1b1d24]/90 backdrop-blur-xl rounded-2xl border-2 border-kingdom-gold/20 overflow-hidden shadow-2xl relative flex flex-col md:flex-row min-h-[450px]">
      {/* Visual Canvas (Left) */}
      <div className="relative w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-gradient-to-br from-black/60 to-[#121318]">
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-kingdom-gold/20 text-kingdom-gold border border-kingdom-gold/40 tracking-wider">
            {lang === 'en' ? 'INTERACTIVE ATLAS' : 'ИНТЕРАКТИВНЫЙ МОДУЛЬ'}
          </span>
        </div>
        
        {/* SVG Elephant Silhouette */}
        <svg viewBox="0 0 500 400" className="w-full h-auto max-w-[400px] drop-shadow-[0_0_20px_rgba(255,209,102,0.1)] mt-4">
          <defs>
            <linearGradient id="elephantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2d3748" />
              <stop offset="100%" stopColor="#1a202c" />
            </linearGradient>
            <filter id="glowG">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Base Silhouette */}
          <path 
            d="M 405,170 C 420,170 435,210 425,270 C 415,320 405,340 395,335 C 385,330 400,280 400,240 C 390,200 375,150 340,110 C 310,80 270,70 230,80 C 180,90 140,110 100,160 C 80,180 50,190 40,180 C 20,160 30,120 70,80 C 120,40 180,20 250,30 C 330,40 400,70 430,120 C 460,170 470,250 450,310 C 440,340 420,360 400,350 C 380,340 410,250 405,170 Z M 220,120 C 270,120 320,130 350,150 C 330,220 280,280 260,250 C 240,220 230,180 220,120 Z" 
            fill="url(#elephantGrad)" 
            stroke="#4a5568" 
            strokeWidth="2" 
          />
          <path d="M 120,150 C 110,220 120,340 90,340 C 70,340 80,250 90,190" fill="transparent" stroke="#2d3748" strokeWidth="30" strokeLinecap="round" />
          <path d="M 280,150 C 270,220 280,340 250,340 C 230,340 240,250 250,190" fill="transparent" stroke="#2d3748" strokeWidth="30" strokeLinecap="round" />
          
          {/* Interactive Hotspots */}
          
          {/* Brain */}
          <g 
            onClick={() => setActivePart('brain')}
            onMouseEnter={() => setActivePart('brain')}
            className="cursor-pointer group"
          >
            <circle cx="370" cy="115" r="28" fill="transparent" />
            <circle cx="370" cy="115" r="8" fill="#a855f7" className="group-hover:animate-ping opacity-80" />
            <circle cx="370" cy="115" r="4" fill="#e9d5ff" />
          </g>

          {/* Ears */}
          <g 
            onClick={() => setActivePart('ears')}
            onMouseEnter={() => setActivePart('ears')}
            className="cursor-pointer group"
          >
            <path 
              d="M 330,100 C 290,120 260,180 280,240 C 300,300 350,310 380,270 C 410,230 400,150 330,100 Z" 
              fill="rgba(14, 165, 233, 0.1)" 
              stroke="#0ea5e9" 
              strokeWidth="2"
              strokeDasharray="4 4"
              className={`transition-all duration-300 ${activePart === 'ears' ? 'fill-sky-500/30 filter drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'group-hover:fill-sky-500/20'}`}
            />
            <circle cx="340" cy="200" r="30" fill="transparent" />
          </g>

          {/* Trunk */}
          <g 
            onClick={() => setActivePart('trunk')}
            onMouseEnter={() => setActivePart('trunk')}
            className="cursor-pointer group"
          >
            <path 
              d="M 410,180 C 450,190 460,250 440,310 C 430,340 400,350 410,320 C 420,290 430,230 410,180" 
              fill="transparent" 
              stroke="#14b8a6" 
              strokeWidth="24"
              strokeLinecap="round"
              className={`transition-all duration-300 ${activePart === 'trunk' ? 'stroke-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.6)]' : 'opacity-40 group-hover:opacity-80'}`}
            />
          </g>

          {/* Tusks */}
          <g 
            onClick={() => setActivePart('tusks')}
            onMouseEnter={() => setActivePart('tusks')}
            className="cursor-pointer group"
          >
            <path 
              d="M 405,230 C 435,240 480,250 500,220" 
              fill="transparent" 
              stroke="#f59e0b" 
              strokeWidth="10"
              strokeLinecap="round"
              className={`transition-all duration-300 ${activePart === 'tusks' ? 'stroke-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'opacity-40 group-hover:opacity-80'}`}
            />
          </g>

          {/* Feet */}
          <g 
            onClick={() => setActivePart('feet')}
            onMouseEnter={() => setActivePart('feet')}
            className="cursor-pointer group"
          >
            <circle cx="410" cy="335" r="20" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" className={activePart === 'feet' ? 'fill-emerald-500/40 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'group-hover:fill-emerald-500/20'} />
            <circle cx="250" cy="340" r="20" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" className={activePart === 'feet' ? 'fill-emerald-500/40 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'group-hover:fill-emerald-500/20'} />
            <circle cx="90" cy="340" r="20" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" className={activePart === 'feet' ? 'fill-emerald-500/40 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'group-hover:fill-emerald-500/20'} />
          </g>
        </svg>

        <p className="absolute bottom-4 left-0 w-full text-center text-xs text-kingdom-muted font-medium">
          {lang === 'en' ? 'Click on illuminated anatomical hotspots to explore organ systems' : 'Кликните на подсвеченные зоны для изучения систем'}
        </p>
      </div>

      {/* Info Panel (Right) */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 bg-[#171920]">
        {activePart ? (
          <div key={activePart} className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
                {data[activePart].icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white font-heading">
                {data[activePart].title}
              </h3>
            </div>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              {data[activePart].desc}
            </p>
            <button 
              onClick={() => callVanilla(data[activePart].link)}
              className="px-5 py-2.5 text-sm font-bold bg-kingdom-gold/10 text-kingdom-gold hover:bg-kingdom-gold/20 hover:scale-105 border border-kingdom-gold/30 rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(255,209,102,0.1)] active:scale-95"
            >
              {lang === 'en' ? 'Read full article →' : 'Читать полную статью →'}
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 animate-pulse shadow-inner">
              <Sparkles className="w-8 h-8 text-kingdom-gold/50" />
            </div>
            <h3 className="text-lg font-bold text-gray-300">
              {lang === 'en' ? 'Anatomical Atlas' : 'Анатомический Атлас'}
            </h3>
            <p className="max-w-[240px] text-sm leading-relaxed">
              {lang === 'en' ? 'Hover or click on the anatomical hotspots on the elephant model to inspect biological structures.' : 'Наведите курсор или кликните на активные биологические системы на модели слона слева.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
