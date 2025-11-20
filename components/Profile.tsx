
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
    user: UserProfile;
    onUpdateUser?: (updated: Partial<UserProfile>) => void;
    onLogout?: () => void;
    onClose?: () => void; // New prop to handle "Back" or "Exit"
    readOnly?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout, onClose, readOnly = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user.username);
    const [editBio, setEditBio] = useState(user.bio);
    const [editAvatar, setEditAvatar] = useState(user.avatar);

    const handleSave = () => {
        if (onUpdateUser) {
            onUpdateUser({
                username: editName,
                bio: editBio,
                avatar: editAvatar
            });
            setIsEditing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
            
            {/* SCANLINES EFFECT */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,6px_100%]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>
            
            {/* CLOSE / BACK BUTTON (Top Right - Matches Navbar Avatar Position) */}
            {onClose && (
                <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
                    <button 
                        onClick={onClose}
                        className="group flex items-center gap-2 bg-black/50 backdrop-blur border border-white/20 hover:border-neon-red text-white px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_#ff003c]"
                    >
                        <span className="font-marker text-sm uppercase tracking-widest group-hover:text-neon-red transition-colors">Close Session</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-neon-red group-hover:text-black transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                    </button>
                </div>
            )}

            {/* MAIN CARD */}
            <div className="relative w-full max-w-5xl z-10 animate-fade-in">
                <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
                    
                    {/* Top Decorative Bar */}
                    <div className="h-2 bg-gradient-to-r from-neon-blue via-purple-500 to-neon-red"></div>
                    
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                         <div>
                             <h1 className="text-4xl font-demon text-white tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                 SINNER <span className="text-neon-blue">DB</span>
                             </h1>
                             <div className="text-gray-500 text-xs font-mono uppercase tracking-[0.3em] mt-1">VoxTek Verified Identity</div>
                         </div>
                         <div className="font-mono text-neon-green text-sm border border-neon-green/30 px-3 py-1 rounded bg-neon-green/5 shadow-[0_0_10px_rgba(204,255,0,0.1)]">
                             STATUS: {readOnly ? 'OBSERVING' : 'ACTIVE'}
                         </div>
                    </div>

                    <div className="p-8 flex flex-col md:flex-row gap-12">
                        
                        {/* LEFT: Avatar & Metrics */}
                        <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                            <div className="relative w-64 h-64 mb-6 group-hover:scale-[1.02] transition-transform duration-700">
                                {/* Hexagon Mask (CSS Clip Path) or Rounded Square */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue to-neon-pink rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 bg-black">
                                    <img 
                                        src={isEditing ? editAvatar : user.avatar} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/000/fff?text=VOID'}
                                    />
                                </div>
                                
                                {!readOnly && (
                                    <div className="absolute -bottom-3 -right-3 bg-black border border-white/20 p-2 rounded-full z-20">
                                        <button onClick={() => setIsEditing(!isEditing)} className="text-white hover:text-neon-blue">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {isEditing && (
                                <div className="w-full mb-6 animate-fade-in">
                                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1 block">Avatar Image URL</label>
                                    <input
                                        value={editAvatar}
                                        onChange={(e) => setEditAvatar(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white font-mono focus:border-neon-blue outline-none transition-colors placeholder-gray-600"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="w-full grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:border-neon-blue/30 transition-colors">
                                    <div className="text-2xl font-bold text-white font-mono">{user.watchedEpisodes?.length || 0}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Watched</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:border-neon-pink/30 transition-colors">
                                    <div className="text-2xl font-bold text-white font-mono">{user.ratings ? Object.keys(user.ratings).length : 0}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Reviews</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Details */}
                        <div className="flex-1 flex flex-col justify-between min-h-[300px]">
                            <div>
                                <div className="mb-8">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-[0.2em] mb-2 flex items-center gap-2">
                                        Entity Name
                                        <div className="flex-1 h-px bg-gray-800"></div>
                                    </div>
                                    {isEditing ? (
                                        <input 
                                            value={editName}
                                            disabled
                                            className="text-5xl font-bold text-gray-600 bg-transparent border-b border-gray-800 w-full focus:outline-none cursor-not-allowed"
                                        />
                                    ) : (
                                        <h2 className="text-5xl md:text-6xl font-body font-bold text-white tracking-tight">{user.username}</h2>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-[0.2em] mb-2 flex items-center gap-2">
                                        Data Log / Bio
                                        <div className="flex-1 h-px bg-gray-800"></div>
                                    </div>
                                    {isEditing ? (
                                        <textarea 
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-gray-200 h-32 focus:border-neon-blue focus:outline-none resize-none font-body text-lg"
                                        />
                                    ) : (
                                        <p className="text-xl text-gray-300 font-light leading-relaxed">
                                            "{user.bio}"
                                        </p>
                                    )}
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-3 mb-8">
                                    <span className="px-3 py-1 rounded bg-red-900/30 text-red-500 border border-red-900/50 text-xs font-bold uppercase tracking-wider">Sinner</span>
                                    <span className="px-3 py-1 rounded bg-blue-900/30 text-blue-400 border border-blue-900/50 text-xs font-bold uppercase tracking-wider">VoxTek User</span>
                                    {user.watchedEpisodes?.length > 5 && (
                                         <span className="px-3 py-1 rounded bg-yellow-900/30 text-yellow-500 border border-yellow-900/50 text-xs font-bold uppercase tracking-wider">Binge Watcher</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Footer Actions */}
                            <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                                <div className="text-xs font-mono text-gray-600">
                                    <div>ID: {user.username.toUpperCase()}_666</div>
                                    <div>JOINED: {user.joinedDate}</div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2 rounded-lg text-gray-400 hover:text-white font-bold text-sm uppercase tracking-widest"
                                        >
                                            Discard
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            className="px-8 py-2 rounded-lg bg-neon-blue text-black font-bold text-sm uppercase tracking-widest hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all"
                                        >
                                            Save Updates
                                        </button>
                                    </div>
                                )}

                                {!readOnly && !isEditing && onLogout && (
                                    <button 
                                        onClick={onLogout}
                                        className="text-red-900 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Terminate Session
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
