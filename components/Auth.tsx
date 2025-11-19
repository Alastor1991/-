
import React, { useState } from 'react';

interface AuthModalProps {
    onLogin: (username: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);
        try {
            // In our backend service, login auto-registers if not found
            await onLogin(username);
        } catch (e) {
            setError("Failed to enter Hell. Try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#050002] bg-opacity-95 backdrop-blur-sm">
            <div className="relative w-full max-w-md p-8 bg-[#1a050a] border-4 border-neon-red rounded-2xl shadow-[0_0_50px_rgba(255,0,60,0.5)] overflow-hidden">
                
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-red blur-[50px] opacity-20 animate-pulse"></div>

                <div className="relative z-10 text-center">
                    <h1 className="font-demon text-5xl text-white mb-2 drop-shadow-[0_0_10px_#ff003c]">HELL'S HUB</h1>
                    <p className="font-marker text-neon-pink text-xl mb-8 rotate-[-2deg]">Identifying Soul...</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="ENTER YOUR SINNER NAME"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black border-2 border-gray-700 rounded-lg p-4 text-center text-white font-mono text-lg focus:border-neon-red focus:outline-none focus:shadow-[0_0_15px_#ff003c] transition-all"
                                autoFocus
                            />
                        </div>

                        {error && <div className="text-red-500 font-bold animate-pulse">{error}</div>}

                        <button 
                            type="submit" 
                            disabled={isLoading || !username.trim()}
                            className="w-full group relative bg-neon-red text-black font-demon text-2xl py-4 rounded hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">SUMMONING...</span>
                            ) : (
                                <>
                                    <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                                    ENTER HELL
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-gray-500 text-xs font-mono">
                        By entering, you agree to forfeit your soul to Alastor (or Vox, depending on who pays more).
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
