
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Wiki from './components/Wiki';
import Forum from './components/Forum';
import Episodes from './components/Episodes';
import Profile from './components/Profile';
import AuthModal from './components/Auth';
import { UserProfile } from './types';
import { backend } from './services/backend';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'wiki' | 'forum' | 'episodes' | 'profile'>('home');
  const [previousTab, setPreviousTab] = useState<'home' | 'wiki' | 'forum' | 'episodes'>('home'); // Track where we came from
  const [user, setUser] = useState<UserProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null); // User being viewed in Read-Only mode
  const [loading, setLoading] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
        const currentUser = await backend.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (username: string) => {
      const loggedUser = await backend.login(username);
      setUser(loggedUser);
  };

  const handleLogout = async () => {
      await backend.logout();
      setUser(null);
      setActiveTab('home');
  };

  const handleUpdateUser = async (updated: Partial<UserProfile>) => {
    if (!user) return;
    try {
        const newUser = await backend.updateUserProfile(user.username, updated);
        setUser(newUser);
    } catch (e) {
        console.error("Failed to update profile", e);
    }
  };

  const handleEpisodeAction = (action: 'watch' | 'rate', episodeId: string, rating?: number) => {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return null;
      const newState = { ...prev };
      
      if (action === 'watch' && !newState.watchedEpisodes.includes(episodeId)) {
        newState.watchedEpisodes = [...newState.watchedEpisodes, episodeId];
      }
      if (action === 'rate' && rating !== undefined) {
        newState.ratings = { ...newState.ratings, [episodeId]: rating };
      }
      return newState;
    });
  };

  const handleViewUserProfile = async (username: string) => {
      // Save current tab before switching to profile to allow "Back" functionality
      if (activeTab !== 'profile') {
          setPreviousTab(activeTab as any);
      }
      
      setLoading(true);
      try {
          if (user && username.toLowerCase() === user.username.toLowerCase()) {
              // Viewing self
              setViewingProfile(null);
          } else {
              // Viewing other
              const profile = await backend.getUserProfile(username);
              if (profile) setViewingProfile(profile);
          }
          setActiveTab('profile');
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleTabChange = (tab: 'home' | 'wiki' | 'forum' | 'episodes' | 'profile') => {
      if (tab !== 'profile') {
          setViewingProfile(null);
          setPreviousTab(tab as any);
      }
      // If clicking Profile tab directly from Navbar, we view own profile
      if (tab === 'profile') {
           setViewingProfile(null);
           if (activeTab !== 'profile') setPreviousTab(activeTab as any);
      }
      setActiveTab(tab);
  };

  // Logic to close profile and return to previous screen
  const handleCloseProfile = () => {
      setViewingProfile(null);
      setActiveTab(previousTab);
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#050002] flex items-center justify-center">
              <div className="font-drip text-neon-red text-4xl animate-pulse">LOADING HELL...</div>
          </div>
      );
  }

  if (!user) {
      return <AuthModal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-hell-bg font-body text-gray-100 bg-pattern">
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} user={user} />
      
      <main className="transition-opacity duration-300">
        {activeTab === 'home' && <Home setTab={handleTabChange} />}
        {activeTab === 'wiki' && <Wiki />}
        {activeTab === 'forum' && (
            <Forum 
                user={user} 
                onViewUserProfile={handleViewUserProfile} 
            />
        )}
        {activeTab === 'episodes' && (
          <Episodes 
            user={user} 
            onEpisodeAction={handleEpisodeAction} 
          />
        )}
        {activeTab === 'profile' && (
            <Profile 
                user={viewingProfile || user} 
                onUpdateUser={viewingProfile ? undefined : handleUpdateUser} 
                onLogout={viewingProfile ? undefined : handleLogout}
                onClose={handleCloseProfile}
                readOnly={!!viewingProfile}
            />
        )}
      </main>

      <footer className="py-6 border-t border-white/5 bg-[#050505] text-center">
        <p className="text-gray-600 font-demon text-sm">
          &copy; 2024 Hell's Hub. Неофициальное фанатское сообщество. <br/>
          Все права на персонажей принадлежат SpindleHorse Toons.
        </p>
      </footer>
    </div>
  );
};

export default App;
