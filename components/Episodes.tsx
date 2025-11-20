
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Universe, Episode, Review, UserProfile, EpisodeComment } from '../types';
import { backend } from '../services/backend';

const calculateAverage = (reviews: Review[]) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

const TopRatedSection: React.FC<{ episodes: Episode[], onSelect: (ep: Episode) => void }> = ({ episodes, onSelect }) => {
    const sortedEpisodes = [...episodes]
        .map(ep => ({ ...ep, avg: calculateAverage(ep.reviews) }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3);

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-10 bg-neon-blue"></div>
                <h2 className="text-2xl font-tech text-white uppercase tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                    TRENDING SIGNALS <span className="text-neon-red animate-pulse ml-2">● LIVE</span>
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sortedEpisodes.map((ep, index) => (
                    <div 
                        key={ep.id} 
                        onClick={() => onSelect(ep)}
                        className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 hover:border-neon-blue transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,247,255,0.2)]"
                    >
                        <div className="absolute top-0 left-0 z-10 bg-neon-blue text-black font-bold font-mono text-4xl px-4 py-2 opacity-90 rounded-br-xl">
                            #{index + 1}
                        </div>
                        <div className="aspect-video relative">
                             <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                             <div className="absolute inset-0 bg-gradient-to-t from-vox-dark to-transparent opacity-80"></div>
                             <div className="absolute bottom-0 left-0 right-0 p-4">
                                 <h3 className="text-white font-tech text-lg truncate tracking-wide text-glow-blue">{ep.title}</h3>
                                 <div className="flex items-center gap-2 text-xs text-neon-blue font-mono">
                                     <span className="text-yellow-400">★ {ep.avg}</span>
                                     <span className="text-gray-500">|</span>
                                     <span className="uppercase">{ep.universe}</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

interface EpisodesProps {
    user: UserProfile;
    onEpisodeAction: (action: 'watch' | 'rate', episodeId: string, rating?: number) => void;
}

const Episodes: React.FC<EpisodesProps> = ({ user, onEpisodeAction }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniverse, setSelectedUniverse] = useState<Universe>(Universe.HAZBIN);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  
  // Rating State
  const [userRating, setUserRating] = useState(5);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Comment State
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Scroll ref for the scrollable content area
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);

  // Fetch Data on Mount
  useEffect(() => {
      const fetchData = async () => {
          try {
              const data = await backend.getEpisodes();
              setEpisodes(data);
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, []);

  // Scroll to top whenever selected episode ID changes
  // Using 'instant' to ensure no scroll lag and using setTimeout to wait for layout
  useEffect(() => {
      if (selectedEpisode && contentScrollRef.current) {
          setTimeout(() => {
              contentScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
          }, 0);
      }
  }, [selectedEpisode?.id]);

  const filteredEpisodes = useMemo(() => 
    episodes.filter(ep => ep.universe === selectedUniverse), 
  [episodes, selectedUniverse]);

  // If user selects an episode, mark it as watched
  useEffect(() => {
      if (selectedEpisode) {
          // Fire and forget the backend call
          backend.markEpisodeWatched(user.username, selectedEpisode.id);
          onEpisodeAction('watch', selectedEpisode.id);
      }
  }, [selectedEpisode]);

  // Set user's existing rating if available
  useEffect(() => {
      if (selectedEpisode && user.ratings && user.ratings[selectedEpisode.id]) {
          setUserRating(user.ratings[selectedEpisode.id]);
      } else {
          setUserRating(5);
      }
  }, [selectedEpisode, user.ratings]);


  const handleRatingSubmit = async () => {
      if (!selectedEpisode) return;
      setRatingSubmitting(true);
      try {
          const updatedReview = await backend.rateEpisode(user.username, user.avatar, selectedEpisode.id, userRating);
           
           setEpisodes(prev => prev.map(ep => {
               if (ep.id === selectedEpisode.id) {
                   // Replace or add review in local state
                   const existingIdx = ep.reviews.findIndex(r => r.user === user.username);
                   const newReviews = [...ep.reviews];
                   if (existingIdx > -1) newReviews[existingIdx] = updatedReview;
                   else newReviews.unshift(updatedReview);
                   return { ...ep, reviews: newReviews };
               }
               return ep;
           }));
           // Update current selection view
           setSelectedEpisode(prev => {
               if(!prev) return null;
               const existingIdx = prev.reviews.findIndex(r => r.user === user.username);
               const newReviews = [...prev.reviews];
               if (existingIdx > -1) newReviews[existingIdx] = updatedReview;
               else newReviews.unshift(updatedReview);
               return { ...prev, reviews: newReviews };
           });

           onEpisodeAction('rate', selectedEpisode.id, userRating);
      } catch(e) { console.error(e); }
      finally { setRatingSubmitting(false); }
  };

  const handleCommentSubmit = async () => {
      if (!selectedEpisode || !commentText.trim()) return;
      setCommentSubmitting(true);
      try {
          const newComment = await backend.addEpisodeComment(user.username, user.avatar, selectedEpisode.id, commentText);
          
          // Robust update to prevent duplicates
          setEpisodes(prev => prev.map(ep => {
              if (ep.id === selectedEpisode.id) {
                  const currentComments = ep.comments || [];
                  // Check if comment ID already exists to prevent React StrictMode/Backend reference duplication
                  if (currentComments.some(c => c.id === newComment.id)) {
                      // Return a new object reference with same comments to trigger render if needed
                      return { ...ep, comments: [...currentComments] };
                  }
                  return { ...ep, comments: [newComment, ...currentComments] };
              }
              return ep;
          }));
          
          setSelectedEpisode(prev => {
              if(!prev) return null;
              const currentComments = prev.comments || [];
              if (currentComments.some(c => c.id === newComment.id)) {
                   return { ...prev, comments: [...currentComments] };
              }
              return { ...prev, comments: [newComment, ...currentComments] };
          });
          
          setCommentText('');
          
          // Optional: Smooth scroll to the new comment if needed, but sticking to top context is usually better
          
      } catch (e) {
          console.error(e);
      } finally {
          setCommentSubmitting(false);
      }
  };

  if (loading) return <div className="text-center py-20 text-neon-blue animate-pulse font-mono">CONNECTING TO VOX SERVER...</div>;

  return (
    <div className="min-h-screen bg-vox-dark text-white p-4 md:p-8 relative overflow-x-hidden tv-grid-bg font-body">
      
      {/* VOX Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50 animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50 animate-pulse"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header & Universe Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neon-blue text-black font-bold font-marker text-3xl flex items-center justify-center rounded shadow-[0_0_20px_#00f7ff]">V</div>
                <div className="flex flex-col">
                    <h1 className="text-4xl font-tech text-white tracking-widest drop-shadow-[0_0_5px_#00f7ff]">
                        VOX <span className="text-neon-blue">TV</span>
                    </h1>
                    <span className="text-[10px] text-neon-blue/70 font-mono uppercase tracking-[0.3em]">Visual Omniscience Xperience</span>
                </div>
            </div>

            <div className="flex gap-0 border border-neon-blue/30 rounded bg-black/50 backdrop-blur-md">
                <button 
                    onClick={() => setSelectedUniverse(Universe.HAZBIN)}
                    className={`px-6 py-2 font-tech text-sm md:text-base transition-all ${selectedUniverse === Universe.HAZBIN ? 'bg-neon-red text-black font-bold shadow-[0_0_15px_#ff003c]' : 'text-gray-500 hover:text-white'}`}
                >
                    HAZBIN
                </button>
                <div className="w-px bg-neon-blue/30"></div>
                <button 
                    onClick={() => setSelectedUniverse(Universe.HELLUVA)}
                    className={`px-6 py-2 font-tech text-sm md:text-base transition-all ${selectedUniverse === Universe.HELLUVA ? 'bg-neon-pink text-black font-bold shadow-[0_0_15px_#ff00cc]' : 'text-gray-500 hover:text-white'}`}
                >
                    HELLUVA
                </button>
            </div>
        </div>

        {/* Top Rated Section */}
        <TopRatedSection episodes={episodes} onSelect={setSelectedEpisode} />

        {/* Main Grid Header */}
        <div className="flex items-center gap-3 mb-6">
             <div className="h-1 w-10 bg-gray-700"></div>
             <h2 className="text-xl font-tech font-bold text-neon-blue/80 uppercase tracking-widest">
                 ARCHIVED BROADCASTS
             </h2>
        </div>

        {/* Episode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {filteredEpisodes.map(ep => {
                const avg = calculateAverage(ep.reviews);
                const isWatched = user.watchedEpisodes?.includes(ep.id);
                const userRatingVal = user.ratings?.[ep.id];

                return (
                    <div 
                        key={ep.id} 
                        onClick={() => setSelectedEpisode(ep)}
                        className={`group bg-black/40 border border-white/5 hover:border-neon-blue/50 rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer hover:shadow-[0_0_20px_rgba(0,247,255,0.1)] relative`}
                    >
                         {/* Watched Indicator */}
                         {isWatched && (
                             <div className="absolute top-2 right-2 z-20 bg-black/80 border border-neon-green text-neon-green p-1 rounded-full shadow-[0_0_10px_rgba(57,255,20,0.4)]" title="Watched">
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                                </svg>
                             </div>
                         )}

                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gray-900 overflow-hidden">
                            <img 
                                src={ep.thumbnail} 
                                alt={ep.title}
                                className={`w-full h-full object-cover transition-all duration-500 ${isWatched ? 'grayscale-[50%] opacity-60' : ''} group-hover:grayscale-0 group-hover:opacity-100`}
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1a1a1a/red?text=NO+SIGNAL'}
                            />
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm text-[10px] font-tech text-neon-blue border border-neon-blue/20">
                                S{ep.season} // E{ep.number}
                            </div>
                            <div className="absolute inset-0 bg-tv-grid opacity-20 pointer-events-none"></div>
                            
                            {/* Play Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 bg-neon-blue/10 border border-neon-blue text-neon-blue rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_15px_#00f7ff]">
                                    ▶
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/80 border border-white/10 px-2 rounded text-xs">
                                <span className="text-yellow-400">★</span>
                                <span className="font-mono font-bold">{avg}</span>
                            </div>
                            
                            {userRatingVal && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-neon-blue/20 border border-neon-blue/50 px-2 rounded text-[10px] text-neon-blue font-mono">
                                    YOU: {userRatingVal}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-4 bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
                            <h3 className="text-sm font-bold font-tech text-white mb-1 truncate group-hover:text-neon-blue transition-colors tracking-wide">{ep.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 font-mono">{ep.synopsis}</p>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      {/* FULL SCREEN PLAYER PAGE - MODAL REFACTOR */}
      {selectedEpisode && (
        <div className="fixed inset-0 z-[100] bg-[#020202] flex flex-col animate-fade-in tv-grid-bg">
            
            {/* 1. Header (Fixed Flex Item) - Always Visible, Not Sticky inside Scroll */}
            <div className="flex-none z-[101] bg-black/95 backdrop-blur-xl border-b border-neon-blue/40 flex items-center justify-between px-4 md:px-8 py-4 shadow-[0_0_30px_rgba(0,247,255,0.15)]">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setSelectedEpisode(null)}
                        className="flex items-center gap-2 bg-neon-red/10 text-neon-red border border-neon-red hover:bg-neon-red hover:text-black transition-all font-tech uppercase tracking-widest px-4 py-2 rounded text-sm font-bold shadow-[0_0_10px_rgba(255,0,60,0.2)] group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> ABORT SIGNAL
                    </button>
                    <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                    <div className="hidden md:flex flex-col">
                        <h2 className="text-neon-blue font-tech text-lg tracking-widest drop-shadow-[0_0_5px_#00f7ff] leading-none">{selectedEpisode.title}</h2>
                        <span className="text-[10px] text-gray-500 font-mono mt-1">SEASON {selectedEpisode.season} // EPISODE {selectedEpisode.number}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 border border-neon-blue/20 rounded-full px-3 py-1 bg-black/50">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-[0_0_5px_lime]"></div>
                    <span className="text-xs font-mono text-neon-green tracking-widest">SECURE CONNECTION</span>
                </div>
            </div>

            {/* 2. Scrollable Content Area (Flex Grow) */}
            <div ref={contentScrollRef} className="flex-1 overflow-y-auto custom-scrollbar pb-32 relative">
                
                {/* Cinema Mode Player */}
                <div className="w-full bg-black border-b border-neon-blue/10 shadow-2xl relative">
                    <div className="absolute inset-0 bg-tv-grid opacity-10 pointer-events-none"></div>
                    <div className="max-w-[1800px] mx-auto">
                         <div className="relative w-full aspect-video max-h-[80vh]">
                            <iframe 
                                src={selectedEpisode.videoUrl} 
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                title="Video Player"
                            />
                         </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: Info & Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Title Block */}
                        <div className="glass-panel p-6 rounded-xl border border-neon-blue/20 relative overflow-hidden">
                             <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-blue blur-[60px] opacity-10"></div>
                            <div className="flex flex-wrap items-center gap-3 mb-4 relative z-10">
                                <span className={`px-3 py-1 rounded text-xs font-bold font-mono uppercase tracking-wider ${selectedEpisode.universe === Universe.HAZBIN ? 'bg-neon-red text-black shadow-[0_0_10px_#ff003c]' : 'bg-neon-pink text-black shadow-[0_0_10px_#ff00cc]'}`}>
                                    {selectedEpisode.universe}
                                </span>
                                <span className="text-neon-blue font-mono text-sm">S{selectedEpisode.season} // E{selectedEpisode.number}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-tech text-white mb-4 text-glow-blue relative z-10">{selectedEpisode.title}</h1>
                            <p className="text-lg text-gray-300 leading-relaxed font-body border-l-2 border-neon-blue/30 pl-4 relative z-10">
                                {selectedEpisode.synopsis}
                            </p>
                        </div>

                        {/* COMMENT SECTION (Distinct from Rating) */}
                        <div ref={commentSectionRef}>
                            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/10">
                                <h3 className="text-xl font-tech text-white tracking-widest">
                                    DATA STREAM (COMMENTS)
                                </h3>
                                <span className="bg-neon-blue/20 text-neon-blue border border-neon-blue/30 px-2 py-0.5 rounded text-xs font-mono">{selectedEpisode.comments?.length || 0}</span>
                            </div>

                            {/* Comment Input */}
                            <div className="mb-8 flex gap-4">
                                <div className="w-10 h-10 rounded border border-white/20 overflow-hidden flex-shrink-0">
                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 relative">
                                    <textarea 
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Inject data into the broadcast stream..."
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-white text-sm focus:border-neon-blue focus:shadow-[0_0_15px_rgba(0,247,255,0.2)] focus:outline-none min-h-[80px] font-mono placeholder-gray-600 transition-all"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            onClick={handleCommentSubmit}
                                            disabled={commentSubmitting || !commentText.trim()}
                                            className="bg-white text-black px-6 py-2 rounded font-bold font-tech text-xs uppercase tracking-widest hover:bg-neon-blue hover:shadow-[0_0_10px_#00f7ff] transition-all disabled:opacity-50 border border-transparent hover:border-white"
                                        >
                                            {commentSubmitting ? 'UPLOADING...' : 'TRANSMIT DATA'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedEpisode.comments && selectedEpisode.comments.length > 0 ? selectedEpisode.comments.map(comment => (
                                    <div key={comment.id} className="bg-black/30 border border-white/5 p-4 rounded flex gap-4 hover:border-neon-blue/30 transition-colors animate-fade-in">
                                        <div className="flex-shrink-0">
                                             <img src={comment.userAvatar} alt={comment.user} className="w-10 h-10 rounded border border-gray-700 object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-neon-blue text-sm font-tech tracking-wide cursor-pointer hover:underline">{comment.user}</h4>
                                                <span className="text-[10px] text-gray-600 font-mono">{comment.timestamp}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm font-body leading-relaxed">{comment.content}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-gray-600 italic p-8 text-center border border-dashed border-gray-800 rounded font-mono bg-black/20">
                                        No data packets found in stream. Be the first to transmit.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Global Score Card */}
                        <div className="glass-panel border border-neon-blue/30 rounded-xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)] text-center">
                            <div className="absolute inset-0 bg-neon-blue/5 group-hover:bg-neon-blue/10 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="text-gray-400 font-tech uppercase tracking-[0.2em] text-xs font-bold mb-2">Global Rating</div>
                                <div className="text-6xl font-tech text-white mb-2 drop-shadow-[0_0_10px_#00f7ff]">
                                    {calculateAverage(selectedEpisode.reviews)}
                                </div>
                                <div className="flex justify-center gap-1 text-yellow-400 text-xl opacity-80">
                                     ★★★★★
                                </div>
                            </div>
                        </div>

                        {/* User Rating Form (Separated) */}
                        <div className="bg-black/60 border border-white/10 rounded-xl p-6 shadow-lg relative">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-tech text-white tracking-wider">RATE SIGNAL</h3>
                                <div className="text-xs font-mono text-neon-blue border border-neon-blue/30 px-2 rounded bg-neon-blue/5">
                                     ID: {user.username}
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={userRating}
                                    onChange={(e) => setUserRating(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-blue hover:accent-white transition-all"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-600 font-mono">1</span>
                                    <div className="font-bold text-3xl text-neon-blue font-tech drop-shadow-[0_0_5px_#00f7ff]">{userRating}</div>
                                    <span className="text-xs text-gray-600 font-mono">10</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleRatingSubmit}
                                disabled={ratingSubmitting}
                                className="w-full bg-neon-blue/10 border border-neon-blue text-neon-blue font-bold py-3 rounded hover:bg-neon-blue hover:text-black transition-all uppercase tracking-widest text-xs font-tech disabled:opacity-50 shadow-[0_0_10px_rgba(0,247,255,0.1)] hover:shadow-[0_0_15px_#00f7ff]"
                            >
                                {ratingSubmitting ? 'CALCULATING...' : 'SUBMIT RATING'}
                            </button>
                        </div>
                        
                        {/* Next Up */}
                        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-3 bg-black/60 border-b border-white/10 flex items-center justify-between">
                                <span className="text-xs font-bold text-neon-blue uppercase tracking-wider font-tech">Queue</span>
                                <span className="w-2 h-2 bg-neon-green rounded-full shadow-[0_0_5px_lime] animate-pulse"></span>
                            </div>
                            <div>
                                {episodes.filter(e => e.id !== selectedEpisode.id && e.universe === selectedEpisode.universe).slice(0,4).map(ep => (
                                    <div 
                                        key={ep.id} 
                                        onClick={() => setSelectedEpisode(ep)}
                                        className="flex gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors group"
                                    >
                                        <div className="w-24 aspect-video bg-black rounded overflow-hidden relative flex-shrink-0 border border-white/10 group-hover:border-neon-blue/50 transition-colors">
                                            <img src={ep.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100"/>
                                        </div>
                                        <div className="overflow-hidden flex flex-col justify-center">
                                            <h4 className="text-sm font-bold font-tech text-white truncate group-hover:text-neon-blue transition-colors">{ep.title}</h4>
                                            <span className="text-[10px] text-gray-500 font-mono">S{ep.season} // E{ep.number}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Episodes;
