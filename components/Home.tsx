import React from 'react';

const Home: React.FC<{ setTab: (t: 'home'|'wiki'|'forum') => void }> = ({ setTab }) => {
  return (
    <div className="relative min-h-[calc(100vh-100px)] flex flex-col items-center justify-center overflow-hidden p-4">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-stripes opacity-20 z-0"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-neon-pink rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-neon-red rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-float"></div>

      {/* Hero Section */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center gap-12">
        
        {/* Left: Text & CTA */}
        <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-block bg-neon-red text-black font-bold font-marker px-4 py-1 transform -rotate-3 mb-4 border-2 border-white">
                DO NOT DISTURB!
            </div>
            
            <h1 className="text-7xl md:text-9xl font-demon text-white leading-none drop-shadow-[5px_5px_0_#000]">
                <span className="block text-neon-red" style={{ textShadow: '4px 4px 0px #000' }}>HAZBIN</span>
                <span className="block text-5xl md:text-7xl text-white" style={{ textShadow: '4px 4px 0px #ff003c' }}>& HELLUVA</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 font-elegant border-l-4 border-neon-pink pl-6 italic">
                "Добро пожаловать в лучший (и единственный) фан-клуб в Аду. <br/>
                Пожалуйста, вытирайте копыта при входе."
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mt-8 justify-center md:justify-start">
                <button 
                    onClick={() => setTab('wiki')}
                    className="group relative px-8 py-4 bg-black border-2 border-gold overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gold transition-all duration-300 ease-out transform -translate-x-full group-hover:translate-x-0"></div>
                    <span className="relative text-xl font-demon text-gold group-hover:text-black transition-colors">
                        ОТКРЫТЬ ГРИМУАР
                    </span>
                </button>

                <button 
                    onClick={() => setTab('forum')}
                    className="group relative px-8 py-4 bg-black border-2 border-neon-blue overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-neon-blue transition-all duration-300 ease-out transform translate-x-full group-hover:translate-x-0"></div>
                    <span className="relative text-xl font-marker text-neon-blue group-hover:text-black transition-colors">
                        ЧАТ ГРЕШНИКОВ
                    </span>
                </button>
            </div>
        </div>

        {/* Right: Visual element (Stylized Frame) */}
        <div className="flex-1 w-full max-w-md relative">
            <div className="absolute inset-0 bg-neon-red transform rotate-6 rounded-3xl blur-sm opacity-50"></div>
            <div className="relative bg-black border-4 border-white rounded-3xl p-2 transform -rotate-3 shadow-[10px_10px_0px_rgba(255,0,60,0.5)]">
                <div className="bg-[#1a0505] rounded-2xl overflow-hidden border-2 border-neon-pink relative h-[400px] flex items-center justify-center">
                    {/* Placeholder stylized character art using pure CSS/SVG if image fails */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-20"></div>
                    <div className="text-center z-10 transform hover:scale-110 transition-transform duration-500">
                         <span className="text-9xl filter drop-shadow-[0_0_10px_#ff00cc]">🍎</span>
                         <div className="font-drip text-neon-red text-4xl mt-4 animate-pulse">LUCIFER</div>
                         <div className="font-marker text-white text-xl bg-black/50 px-4 py-1 mt-2 rotate-2">APPROVES THIS SITE</div>
                    </div>
                </div>
                
                {/* Decorative Stickers */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center font-marker text-black border-2 border-black transform rotate-12 shadow-lg">
                    NEW!
                </div>
                <div className="absolute -bottom-6 -left-4 bg-white px-4 py-2 font-marker text-black border-2 border-black transform -rotate-6 shadow-lg text-sm">
                    SINNERS ONLY
                </div>
            </div>
        </div>

      </div>

      {/* Bottom Ticker */}
      <div className="fixed bottom-0 w-full bg-neon-green text-black font-mono font-bold text-lg border-t-4 border-black py-2 overflow-hidden z-50">
         <div className="whitespace-nowrap animate-[float_8s_linear_infinite]">
            💀 ВНИМАНИЕ: МЫ НЕ НЕСЕМ ОТВЕТСТВЕННОСТИ ЗА ПОТЕРЮ ДУШИ 💀 СКИДКИ НА АНГЕЛЬСКОЕ ОРУЖИЕ 💀 ИЩЕМ СОТРУДНИКОВ В I.M.P 💀
         </div>
      </div>
    </div>
  );
};

export default Home;