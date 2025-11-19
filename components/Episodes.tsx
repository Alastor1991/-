
import React, { useState, useMemo, useEffect } from 'react';
import { Universe, Episode, Review, UserProfile } from '../types';
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
                <h2 className="text-2xl font-marker text-white uppercase tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                    TRENDING IN HELL <span className="text-neon-red animate-pulse ml-2">● LIVE</span>
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sortedEpisodes.map((ep, index) => (
                    <div 
                        key={ep.id} 
                        onClick={() => onSelect(ep)}
                        className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-transparent hover:border-neon-blue transition-all duration-300"
                    >
                        <div className="absolute top-0 left-0 z-10 bg-neon-blue text-black font-bold font-mono text-4xl px-4 py-2 opacity-90 rounded-br-xl">
                            #{index + 1}
                        </div>
                        <div className="aspect-video relative">
                             <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                             <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                 <h3 className="text-white font-demon text-lg truncate">{ep.title}</h3>
                                 <div className="flex items-center gap-2 text-xs text-gray-300">
                                     <span className="text-yellow-400">★ {ep.avg}</span>
                                     <span>|</span>
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
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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


  const handleReviewSubmit = async () => {
    if (!selectedEpisode || !userComment.trim()) return;
    setSubmitting(true);

    try {
        const newReview = await backend.rateEpisode(
            user.username, 
            user.avatar, 
            selectedEpisode.id, 
            userRating, 
            userComment
        );

        // Update local state immediately
        const updatedEpisodes = episodes.map(ep => {
          if (ep.id === selectedEpisode.id) {
            return { ...ep, reviews: [newReview, ...ep.reviews] };
          }
          return ep;
        });

        setEpisodes(updatedEpisodes);
        onEpisodeAction('rate', selectedEpisode.id, userRating);
        
        // Update selected episode view
        const updatedSelected = updatedEpisodes.find(ep => ep.id === selectedEpisode.id);
        if (updatedSelected) setSelectedEpisode(updatedSelected);
        
        setUserComment('');
    } catch (e) {
        console.error("Failed to submit review", e);
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-neon-blue animate-pulse font-mono">CONNECTING TO VOX SERVER...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-x-hidden">
      
      {/* VOX Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50 animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50 animate-pulse"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
         <div className="absolute inset-0 bg-repeat opacity-[0.03]" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/7/76/Noise_tv.png)' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header & Universe Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div className="border-4 border-neon-blue bg-black px-6 py-2 transform -skew-x-12 shadow-[0_0_15px_#00f7ff]">
                <h1 className="text-3xl md:text-5xl font-demon text-white transform skew-x-12 tracking-widest">
                    VOX <span className="text-neon-blue animate-pulse">TV</span>
                </h1>
            </div>

            <div className="flex gap-0 border-2 border-gray-800 rounded-full overflow-hidden bg-black">
                <button 
                    onClick={() => setSelectedUniverse(Universe.HAZBIN)}
                    className={`px-6 py-2 font-marker text-sm md:text-base transition-all ${selectedUniverse === Universe.HAZBIN ? 'bg-neon-red text-black shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' : 'text-gray-500 hover:text-white'}`}
                >
                    HAZBIN
                </button>
                <div className="w-0.5 bg-gray-800"></div>
                <button 
                    onClick={() => setSelectedUniverse(Universe.HELLUVA)}
                    className={`px-6 py-2 font-marker text-sm md:text-base transition-all ${selectedUniverse === Universe.HELLUVA ? 'bg-neon-pink text-black shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' : 'text-gray-500 hover:text-white'}`}
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
             <h2 className="text-xl font-body font-bold text-gray-400 uppercase tracking-widest">
                 ALL EPISODES
             </h2>
        </div>

        {/* Episode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {filteredEpisodes.map(ep => {
                const avg = calculateAverage(ep.reviews);
                const borderColor = ep.universe === Universe.HAZBIN ? 'hover:border-neon-red' : 'hover:border-neon-pink';
                const isWatched = user.watchedEpisodes?.includes(ep.id);
                const userRatingVal = user.ratings?.[ep.id];

                return (
                    <div 
                        key={ep.id} 
                        onClick={() => setSelectedEpisode(ep)}
                        className={`group bg-[#0a0a0a] border border-gray-800 ${borderColor} rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer hover:shadow-lg relative`}
                    >
                         {/* Watched Indicator */}
                         {isWatched && (
                             <div className="absolute top-2 right-2 z-20 bg-black/80 border border-neon-green text-neon-green p-1 rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)]" title="Watched">
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
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
                                className={`w-full h-full object-cover transition-all duration-500 ${isWatched ? 'grayscale-[50%]' : ''} group-hover:grayscale-0`}
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1a1a1a/red?text=NO+SIGNAL'}
                            />
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm text-[10px] font-bold text-white border border-white/10">
                                S{ep.season} E{ep.number}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                            
                            {/* Play Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 bg-neon-blue/80 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_15px_#00f7ff]">
                                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent ml-1"></div>
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 px-2 rounded-full">
                                <span className="text-yellow-400 text-xs">★</span>
                                <span className="font-bold text-sm">{avg}</span>
                            </div>
                            
                            {userRatingVal && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-neon-blue/20 border border-neon-blue/50 px-2 rounded-full text-xs text-neon-blue">
                                    You: {userRatingVal}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                            <h3 className="text-base font-bold text-white mb-1 truncate group-hover:text-neon-blue transition-colors">{ep.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{ep.synopsis}</p>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      {/* FULL SCREEN PLAYER PAGE */}
      {selectedEpisode && (
        <div className="fixed inset-0 z-[100] bg-[#020202] overflow-y-auto custom-scrollbar animate-fade-in">
            
            {/* Navigation Bar */}
            <div className="sticky top-0 z-[101] bg-black/95 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 md:px-8 py-3 shadow-lg">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSelectedEpisode(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-neon-red transition-colors font-marker uppercase tracking-widest group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Hub
                    </button>
                    <div className="h-6 w-px bg-gray-800 hidden md:block"></div>
                    <h2 className="text-white font-demon text-lg hidden md:block tracking-wider">{selectedEpisode.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-neon-blue tracking-widest">VOX SECURE STREAM</span>
                </div>
            </div>

            {/* Cinema Mode Player */}
            <div className="w-full bg-black border-b border-gray-800 shadow-[0_0_50px_rgba(0,247,255,0.05)]">
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
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* LEFT COLUMN: Info & Reviews */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Title Block */}
                    <div className="border-b border-gray-800 pb-6">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${selectedEpisode.universe === Universe.HAZBIN ? 'bg-neon-red text-black' : 'bg-neon-pink text-black'}`}>
                                {selectedEpisode.universe}
                            </span>
                            <span className="text-gray-500 font-mono font-bold">SEASON {selectedEpisode.season} • EPISODE {selectedEpisode.number}</span>
                            {user.watchedEpisodes?.includes(selectedEpisode.id) && (
                                <span className="text-neon-green text-xs border border-neon-green px-2 rounded uppercase">
                                    Watched
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-demon text-white mb-4 text-glow-blue">{selectedEpisode.title}</h1>
                        <p className="text-lg text-gray-300 leading-relaxed font-body max-w-4xl">
                            {selectedEpisode.synopsis}
                        </p>
                    </div>

                    {/* Reviews Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <h3 className="text-2xl font-marker text-white">
                                COMMENTS
                            </h3>
                            <span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-xs font-bold">{selectedEpisode.reviews?.length || 0}</span>
                        </div>

                        <div className="space-y-6">
                            {selectedEpisode.reviews && selectedEpisode.reviews.length > 0 ? selectedEpisode.reviews.map(review => (
                                <div key={review.id} className="bg-[#080808] border border-gray-800/50 p-5 rounded-lg flex gap-4 hover:border-neon-blue/30 transition-colors">
                                    <div className="flex-shrink-0">
                                         {review.userAvatar ? (
                                             <img src={review.userAvatar} alt={review.user} className="w-12 h-12 rounded-full border border-gray-700 object-cover" />
                                         ) : (
                                             <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full border border-gray-700 flex items-center justify-center text-xl font-bold text-gray-400 shadow-inner">
                                                {review.user.charAt(0)}
                                             </div>
                                         )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-neon-blue text-base">{review.user}</h4>
                                            <span className="text-xs text-gray-600">{review.timestamp}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className={`h-1.5 w-4 rounded-sm ${i < review.rating ? 'bg-yellow-500' : 'bg-gray-800'}`}></div>
                                            ))}
                                            <span className="ml-2 font-mono text-sm text-yellow-500 font-bold">{review.rating}/10</span>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-gray-600 italic p-4 text-center border border-dashed border-gray-800 rounded">
                                    Be the first to transmit your thoughts...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    
                    {/* Score Card */}
                    <div className="bg-[#0a0a0a] border-2 border-neon-blue/30 rounded-xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="text-gray-400 uppercase tracking-[0.2em] text-xs font-bold mb-2">Global Rating</div>
                            <div className="text-7xl font-demon text-white mb-2 drop-shadow-[0_0_15px_#00f7ff] transition-transform group-hover:scale-110 duration-500">
                                {calculateAverage(selectedEpisode.reviews)}
                            </div>
                            <div className="flex justify-center gap-1 opacity-80 text-yellow-400 text-2xl">
                                 ★★★★★
                            </div>
                        </div>
                    </div>

                    {/* Rating Form */}
                    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 shadow-lg relative">
                        <div className="absolute -top-3 left-4 bg-black border border-neon-blue text-neon-blue text-xs px-2 py-0.5 rounded uppercase font-bold">
                             Voting as {user.username}
                        </div>

                        <h3 className="font-marker text-lg text-white mb-4 border-b border-gray-800 pb-2 mt-2">Rate Episode</h3>
                        
                        <div className="mb-6">
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={userRating}
                                onChange={(e) => setUserRating(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-blue hover:accent-white transition-all"
                            />
                            <div className="text-center mt-3 font-bold text-3xl text-neon-blue font-mono">{userRating}<span className="text-sm text-gray-600">/10</span></div>
                        </div>

                        <textarea 
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Leave a review..."
                            className="w-full bg-black border border-gray-700 rounded p-3 text-white text-sm focus:border-neon-blue focus:outline-none min-h-[100px] mb-4 resize-none font-body placeholder-gray-700"
                        />

                        <button 
                            onClick={handleReviewSubmit}
                            disabled={submitting}
                            className="w-full bg-white text-black font-bold py-3 rounded hover:bg-neon-blue transition-colors uppercase tracking-widest text-sm font-marker shadow-[4px_4px_0_rgba(0,247,255,0.5)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50"
                        >
                            {submitting ? 'Transmitting...' : 'Submit Review'}
                        </button>
                    </div>
                    
                    {/* Next Up */}
                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-3 bg-[#111] border-b border-gray-800 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Up Next</span>
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </div>
                        <div>
                            {episodes.filter(e => e.id !== selectedEpisode.id && e.universe === selectedEpisode.universe).slice(0,4).map(ep => (
                                <div 
                                    key={ep.id} 
                                    onClick={() => { setSelectedEpisode(ep); window.scrollTo({top:0, behavior:'smooth'}); }}
                                    className="flex gap-3 p-3 hover:bg-gray-900 cursor-pointer border-b border-gray-800 last:border-0 transition-colors group"
                                >
                                    <div className="w-28 aspect-video bg-black rounded overflow-hidden relative flex-shrink-0 border border-gray-800 group-hover:border-neon-blue/50 transition-colors">
                                        <img src={ep.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100"/>
                                        <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] px-1 text-white rounded">24:00</div>
                                    </div>
                                    <div className="overflow-hidden flex flex-col justify-center">
                                        <h4 className="text-sm font-bold text-white truncate group-hover:text-neon-blue transition-colors">{ep.title}</h4>
                                        <span className="text-xs text-gray-500 font-mono">S{ep.season} • E{ep.number}</span>
                                        {user.watchedEpisodes?.includes(ep.id) && <span className="text-[9px] text-neon-green uppercase">Watched</span>}
                                    </div>
                                </div>
                            ))}
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
