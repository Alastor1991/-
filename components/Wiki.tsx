
import React, { useState } from 'react';
import { Character, Universe, WikiData } from '../types';

// --- STATIC DATA STORAGE ---
const MOCK_WIKI: Record<string, WikiData> = {
    "Alastor": {
        description: "Аластор, также известный как «Радио-демон», является одним из самых могущественных Повелителей Ада. Он манипулятивный, улыбчивый и невероятно опасный грешник, который помогает Чарли в отеле ради собственного развлечения.",
        abilities: ["Манипуляция радиоволнами", "Призыв теневых щупалец", "Трансформация тела", "Вуду-магия"],
        personality: "Харизматичный, вежливый садист. Следует строгому личному кодексу, всегда улыбается, так как считает, что без улыбки ты не одет полностью.",
        trivia: ["Ненавидит собак.", "Его голос звучит как через старый радиоприемник.", "Является асексуалом.", "Любит джамбалайю по рецепту своей матери."]
    },
    "Angel Dust": {
        description: "Энджел Даст (настоящее имя Энтони) — звезда фильмов для взрослых в Аду и первый постоялец отеля Хазбин. Он борется с зависимостями, скрывая свою душевную боль за маской дерзости и пошлости.",
        abilities: ["Владение любым огнестрельным оружием", "Выдвижные дополнительные руки", "Ядовитый укус", "Невероятная прыгучесть"],
        personality: "Саркастичный, кокетливый и драматичный. Глубоко внутри он заботлив и лоялен к тем, кто относится к нему по-человечески.",
        trivia: ["Любит розовый цвет.", "Имеет домашнюю свинку по имени Фэт Наггетс.", "Умер в 1947 году от передозировки.", "Его семья была частью итальянской мафии."]
    },
    "Charlie": {
        description: "Шарлотта «Чарли» Морнингстар — принцесса Ада, дочь Люцифера и Лилит. В отличие от большинства жителей Ада, она добра, наивна и верит, что любой грешник заслуживает второго шанса на искупление.",
        abilities: ["Пирокинез", "Демоническая трансформация", "Пение", "Рукопашный бой"],
        personality: "Оптимистичная, энергичная и сострадательная. Иногда бывает неуверенной в себе, но готова пойти на все ради своей мечты.",
        trivia: ["Любит щенков и радугу.", "Играет на пианино.", "Встречается с Вэгги.", "Ее фамилия Морнингстар (Утренняя Звезда) отсылает к имени Люцифера."]
    },
    "Blitzo": {
        description: "Блиц (буква «о» не произносится) — основатель и босс компании I.M.P. (Immediate Murder Professionals). Бывший цирковой артист, пытающийся доказать свою значимость в жестоком мире Ада.",
        abilities: ["Мастерское владение оружием", "Акробатика", "Ночное зрение", "Иммунитет к огню"],
        personality: "Эгоцентричный, громкий и хаотичный. Часто скрывает свою неуверенность и страх одиночества за грубыми шутками.",
        trivia: ["Одержим лошадьми.", "Сталкерит своих сотрудников (особенно Мокси).", "Имел роман с принцем Столасом.", "Любит сырные чипсы."]
    },
    "Stolas": {
        description: "Столас — принц из династии Гоэтии, могущественный демон, владеющий знаниями о звездах, травах и драгоценных камнях. Он ведет сложную двойную жизнь, разрываясь между долгом и чувствами.",
        abilities: ["Астрономия и прорицание", "Окаменение взглядом", "Открытие порталов в мир живых", "Телекинез"],
        personality: "Интеллигентный, но эмоционально уязвимый. Склонен к драматизму и меланхолии, особенно в вопросах отношений с Блицем.",
        trivia: ["Владеет магическим гримуаром.", "Любит ухаживать за своими растениями.", "Его имя взято из реальной демонологии.", "Обожает, когда его называют «Совушкой»."]
    },
    "Husk": {
        description: "Хаск — ворчливый бармен отеля Хазбин и бывший Оверлорд, проигравший свою душу Аластору в карты. Он циничен, любит выпить и азартные игры, но обладает житейской мудростью.",
        abilities: ["Полет (крылья)", "Мастерство в азартных играх", "Магические игральные карты", "Многоязычие"],
        personality: "Грубый, прямолинейный пессимист. Легко видит людей насквозь и не терпит фальши.",
        trivia: ["Ненавидит Аластора за то, что находится у него на поводке.", "Любит дешевый алкоголь.", "Умеет играть на саксофоне.", "Слабость к кошачьей мяте."]
    }
};

const fetchCharacterWiki = async (characterName: string, universe: string): Promise<WikiData> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 400));

  // Search loosely for the name
  const key = Object.keys(MOCK_WIKI).find(k => k.toLowerCase().includes(characterName.toLowerCase()) || characterName.toLowerCase().includes(k.toLowerCase()));

  if (key && MOCK_WIKI[key]) {
      return MOCK_WIKI[key];
  }

  // Fallback for unknown characters
  return {
      description: `Досье на демона "${characterName}" пока засекречено или утеряно в архивах Ада. Попробуйте позже.`,
      abilities: ["Неизвестно", "Скрытый потенциал"],
      personality: "Загадочная личность.",
      trivia: ["Никто не знает, откуда он взялся.", "Ходят слухи, что он знаком с Люцифером."]
  };
};


const CHARACTERS: Character[] = [
  { 
    id: '1', 
    name: 'Alastor', 
    universe: Universe.HAZBIN, 
    role: 'Radio Demon', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Alastor_Hazbin_Hotel.png' 
  },
  { 
    id: '2', 
    name: 'Angel Dust', 
    universe: Universe.HAZBIN, 
    role: 'The Spider', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/24/Angel_Dust_Hazbin_Hotel.png' 
  },
  { 
    id: '3', 
    name: 'Blitzo', 
    universe: Universe.HELLUVA, 
    role: 'Boss', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/04/Blitzo_Helluva_Boss.png' 
  },
  { 
    id: '4', 
    name: 'Charlie', 
    universe: Universe.HAZBIN, 
    role: 'Princess', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Charlie_Morningstar_Hazbin_Hotel.png' 
  },
  { 
    id: '5', 
    name: 'Stolas', 
    universe: Universe.HELLUVA, 
    role: 'Prince', 
    imageUrl: 'https://static.wikia.nocookie.net/hazbinhotel/images/1/1b/Stolas_App.png' // Risky link, handled by fallback
  },
  { 
    id: '6', 
    name: 'Husk', 
    universe: Universe.HAZBIN, 
    role: 'Bartender', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Husk_Hazbin_Hotel.png/250px-Husk_Hazbin_Hotel.png' 
  },
];

const CharacterCard: React.FC<{ char: Character; onClick: () => void }> = ({ char, onClick }) => {
  const [imgError, setImgError] = useState(false);
  
  const isHazbin = char.universe === Universe.HAZBIN;
  const borderColor = isHazbin ? 'border-neon-pink' : 'border-neon-red';
  const shadowColor = isHazbin ? 'group-hover:shadow-[0_0_25px_#ff00cc]' : 'group-hover:shadow-[0_0_25px_#ff003c]';
  const bgPattern = isHazbin 
    ? "bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" 
    : "bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]";

  return (
    <div 
      onClick={onClick}
      className={`group relative w-full aspect-[2/3] bg-black rounded-xl border-4 ${borderColor} shadow-lg ${shadowColor} overflow-hidden cursor-pointer transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1`}
    >
      {/* Card Background */}
      <div className={`absolute inset-0 opacity-30 ${bgPattern}`}></div>
      
      {/* Image Area */}
      <div className="absolute top-2 left-2 right-2 bottom-16 bg-[#1a050a] border-2 border-white/20 overflow-hidden rounded-lg">
         {!imgError ? (
             <img 
               src={char.imageUrl} 
               alt={char.name}
               onError={() => setImgError(true)}
               className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
             />
         ) : (
             // Stylized Fallback if image fails
             <div className="w-full h-full flex flex-col items-center justify-center bg-[#2b0a12] p-4 text-center">
                <span className="text-6xl mb-2 grayscale opacity-50">
                    {char.name === 'Alastor' ? '🦌' : 
                     char.name === 'Angel Dust' ? '🕷️' :
                     char.name === 'Blitzo' ? '🤡' : '💀'}
                </span>
                <span className="font-demon text-2xl text-white/50 rotate-[-10deg] border-2 border-white/50 px-2">NO SIGNAL</span>
             </div>
         )}
         {/* Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
      </div>

      {/* Name Plate */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-black flex flex-col items-center justify-center border-t-4 border-white z-20">
        <h3 className="font-demon text-2xl text-white tracking-widest uppercase drop-shadow-md group-hover:text-neon-red transition-colors">
            {char.name}
        </h3>
        <div className="flex gap-2 items-center">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-black ${isHazbin ? 'bg-neon-pink' : 'bg-neon-red'}`}>
                {char.universe === Universe.HAZBIN ? 'HOTEL' : 'HELL'}
            </span>
            <span className="text-gray-400 text-xs font-marker">{char.role}</span>
        </div>
      </div>

      {/* Corner Suit Symbols */}
      <div className="absolute top-3 left-3 text-white font-demon text-xl z-20 drop-shadow-md opacity-50 group-hover:opacity-100 transition-opacity">
        {isHazbin ? '♥' : '♠'}
      </div>
      <div className="absolute bottom-14 right-3 text-white font-demon text-xl z-20 drop-shadow-md rotate-180 opacity-50 group-hover:opacity-100 transition-opacity">
        {isHazbin ? '♥' : '♠'}
      </div>
    </div>
  );
};

const Wiki: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCharClick = async (char: Character) => {
    setSelectedChar(char);
    setWikiData(null);
    setLoading(true);
    
    // Smooth scroll to top for mobile users when opening details
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const data = await fetchCharacterWiki(char.name, char.universe);
      setWikiData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-glitch-pattern">
      {/* Header */}
      <div className="flex justify-center mb-12 relative">
        <div className="bg-black border-4 border-gold px-8 md:px-12 py-4 transform -rotate-2 shadow-[10px_10px_0px_#ffd700] hover:rotate-0 transition-transform duration-300">
            <h2 className="text-3xl md:text-5xl font-demon text-white tracking-[0.2em]">
                THE GRIMOIRE
            </h2>
        </div>
      </div>

      {/* Grid */}
      {!selectedChar ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4 pb-20">
          {CHARACTERS.map((char) => (
            <CharacterCard key={char.id} char={char} onClick={() => handleCharClick(char)} />
          ))}
        </div>
      ) : (
        /* Detail View - Old Paper / Dossier Style */
        <div className="max-w-5xl mx-auto bg-[#f3e5ab] text-black rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative rotate-1 animate-fade-in p-2 mb-20">
             {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] opacity-50 pointer-events-none"></div>
            
            {/* Close Button (Desktop) */}
            <button 
                onClick={() => setSelectedChar(null)}
                className="hidden md:block absolute -top-6 -right-6 bg-neon-red text-white w-16 h-16 rounded-full font-marker text-2xl border-4 border-black hover:scale-110 hover:bg-white hover:text-neon-red transition-all z-50 shadow-lg"
                title="Close Dossier"
            >
                X
            </button>

            <div className="border-4 border-black border-double p-6 md:p-10 relative bg-white/10 backdrop-blur-[1px]">
                {/* Secret Stamp */}
                <div className="absolute top-10 right-10 border-4 border-red-700 text-red-700 font-marker text-2xl md:text-4xl px-4 py-2 rounded opacity-40 rotate-[-15deg] pointer-events-none">
                    CONFIDENTIAL
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column: Photo */}
                    <div className="md:w-1/3 flex flex-col">
                        <div className="bg-black p-2 rotate-[-3deg] shadow-xl hover:rotate-0 transition-transform duration-500">
                            <img 
                                src={selectedChar.imageUrl} 
                                alt={selectedChar.name}
                                className="w-full h-auto object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500 max-h-[400px] md:max-h-none"
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/black/red?text=NO+DATA'}
                            />
                            <div className="mt-2 font-marker text-center text-white text-xl py-2">
                                #{selectedChar.id} // {selectedChar.role}
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedChar(null)}
                            className="md:hidden mt-6 w-full bg-black text-white font-marker py-3 border-2 border-red-500 hover:bg-red-500 hover:text-black transition-colors shadow-[4px_4px_0_#000]"
                        >
                            ← BACK TO LIST
                        </button>
                    </div>

                    {/* Right Column: Text */}
                    <div className="md:w-2/3 space-y-6 relative z-10">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-demon mb-2 text-black border-b-4 border-black inline-block drop-shadow-sm">
                                {selectedChar.name}
                            </h1>
                            <div className="flex gap-2 mt-2">
                                <span className="bg-black text-white font-bold px-3 py-1 uppercase text-xs tracking-widest shadow-[3px_3px_0_rgba(0,0,0,0.3)]">
                                    UNIVERSE: {selectedChar.universe}
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center font-drip text-2xl animate-pulse text-red-900">
                                Summoning Data from Hell...
                            </div>
                        ) : wikiData ? (
                            <div className="font-body text-lg leading-relaxed space-y-6 text-[#2a0a10]">
                                <p className="first-letter:text-5xl first-letter:font-demon first-letter:mr-2 font-medium bg-white/30 p-2 rounded border border-black/5">
                                    {wikiData.description}
                                </p>

                                <div className="bg-black/5 p-4 border-l-4 border-neon-red hover:bg-black/10 transition-colors">
                                    <h3 className="font-demon text-xl mb-2 underline decoration-wavy decoration-neon-red">Abilities</h3>
                                    <ul className="list-disc list-inside font-serif italic text-gray-900 space-y-1">
                                        {wikiData.abilities.map((ab, i) => <li key={i}>{ab}</li>)}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/80 p-4 border-2 border-black shadow-[4px_4px_0_#000] hover:transform hover:-translate-y-1 transition-transform">
                                        <h4 className="font-bold uppercase text-xs mb-2 bg-yellow-300 inline-block px-2 py-0.5 border border-black">Personality</h4>
                                        <p className="text-sm font-mono leading-tight">{wikiData.personality}</p>
                                    </div>
                                    <div className="bg-white/80 p-4 border-2 border-black shadow-[4px_4px_0_#000] hover:transform hover:-translate-y-1 transition-transform">
                                        <h4 className="font-bold uppercase text-xs mb-2 bg-neon-blue inline-block px-2 py-0.5 border border-black">Trivia</h4>
                                        <ul className="text-sm font-mono list-decimal list-inside space-y-1">
                                            {wikiData.trivia.slice(0,3).map((t, i) => <li key={i}>{t}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-red-800 font-marker border-2 border-red-800 p-4 rotate-2">
                                Error fetching soul data. The connection to Hell is unstable.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Wiki;
