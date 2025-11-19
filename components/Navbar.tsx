
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'wiki' | 'forum' | 'episodes' | 'profile';
  setActiveTab: (tab: 'home' | 'wiki' | 'forum' | 'episodes' | 'profile') => void;
  user: UserProfile;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: { id: 'home' | 'wiki' | 'forum' | 'episodes'; label: string; color: string; borderColor: string }[] = [
    { id: 'home', label: 'HOME', color: 'text-white hover:text-neon-red', borderColor: 'border-neon-red' },
    { id: 'wiki', label: 'GRIMOIRE', color: 'text-white hover:text-gold', borderColor: 'border-gold' },
    { id: 'forum', label: 'VOXGRAM', color: 'text-white hover:text-neon-blue', borderColor: 'border-neon-blue' },
    { id: 'episodes', label: 'VOX TV', color: 'text-white hover:text-neon-green', borderColor: 'border-neon-green' },
  ];

  const handleNavClick = (id: 'home' | 'wiki' | 'forum' | 'episodes' | 'profile') => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-[60] bg-black/90 border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          
          {/* Logo Area */}
          <div 
            className="flex-shrink-0 cursor-pointer group relative z-50" 
            onClick={() => handleNavClick('home')}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-neon-red blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <span className="relative font-drip text-3xl md:text-4xl text-white drop-shadow-[2px_2px_0_#ff003c]">
              HELL<span className="text-neon-red">'S</span> HUB
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center h-full">
            <div className="ml-10 flex items-center h-full space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative h-full px-6 flex items-center justify-center text-lg font-marker tracking-widest transition-all duration-300 uppercase border-b-4 ${
                    activeTab === item.id
                      ? `bg-white/5 ${item.borderColor} text-white shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)]`
                      : `border-transparent text-gray-500 hover:bg-white/5 ${item.color}`
                  }`}
                >
                  {item.label}
                  {activeTab === item.id && (
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${item.borderColor.replace('border', 'bg')} shadow-[0_0_15px_currentColor]`}></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Profile Button */}
            <div className="ml-8 pl-8 border-l border-white/10 h-10 flex items-center">
                <button 
                    onClick={() => handleNavClick('profile')}
                    className={`flex items-center gap-3 group ${activeTab === 'profile' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                    <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all ${activeTab === 'profile' ? 'border-neon-pink shadow-[0_0_10px_#ff00cc]' : 'border-gray-600 group-hover:border-white'}`}>
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left hidden lg:block">
                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Logged in</div>
                        <div className="text-sm font-bold text-white font-tech tracking-wider truncate max-w-[100px] text-glow-blue">{user.username}</div>
                    </div>
                </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center z-50 gap-4">
             {/* Mobile Profile Icon */}
             <button onClick={() => handleNavClick('profile')} className="w-8 h-8 rounded-full overflow-hidden border border-gray-500">
                 <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
             </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-neon-blue focus:outline-none p-2"
            >
              <div className="w-8 h-8 flex flex-col justify-center gap-1.5">
                <span className={`block w-full h-0.5 bg-current transform transition-all duration-300 shadow-[0_0_5px_currentColor] ${isMenuOpen ? 'rotate-45 translate-y-2 bg-neon-red' : ''}`}></span>
                <span className={`block w-full h-0.5 bg-current transition-all duration-300 shadow-[0_0_5px_currentColor] ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-full h-0.5 bg-current transform transition-all duration-300 shadow-[0_0_5px_currentColor] ${isMenuOpen ? '-rotate-45 -translate-y-2 bg-neon-red' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex items-center justify-center transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col space-y-8 text-center w-full px-8">
            {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-3xl font-marker uppercase tracking-widest py-4 border-b border-white/5 ${
                    activeTab === item.id ? 'text-neon-blue' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </button>
            ))}
             <button
                  onClick={() => handleNavClick('profile')}
                  className={`text-3xl font-marker uppercase tracking-widest py-4 border-b border-white/5 ${
                    activeTab === 'profile' ? 'text-neon-pink' : 'text-gray-500'
                  }`}
                >
                  MY PROFILE
            </button>
          </div>
      </div>
      
      {/* Tech decoration line at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent"></div>
    </nav>
  );
};

export default Navbar;
