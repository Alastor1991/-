
import React, { useState, useEffect, useMemo } from 'react';
import { ForumPost, Comment, UserProfile, Community, PostType, PollOption } from '../types';
import { backend } from '../services/backend';

// --- SUBCOMPONENTS ---

const CommunityIcon: React.FC<{ icon: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ icon, size = 'md' }) => {
    const isUrl = icon.startsWith('http') || icon.startsWith('data:');
    
    let sizeClasses = "w-8 h-8 text-xl";
    if (size === 'sm') sizeClasses = "w-4 h-4 text-xs";
    if (size === 'lg') sizeClasses = "w-16 h-16 text-4xl";
    if (size === 'xl') sizeClasses = "w-20 h-20 text-6xl";

    if (isUrl) {
        return (
            <div className={`${sizeClasses} rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-black`}>
                <img 
                    src={icon} 
                    alt="icon" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                        // Fallback if image fails
                        (e.target as HTMLElement).style.display = 'none';
                        (e.target as HTMLElement).parentElement!.innerText = '📡';
                    }}
                />
            </div>
        );
    }

    return <span className={`flex items-center justify-center ${sizeClasses}`}>{icon}</span>;
};

const VoteControl: React.FC<{ 
    likes: number; 
    userVote?: number; 
    onVote: (type: 'up' | 'down') => void; 
    vertical?: boolean;
    size?: 'sm' | 'md' 
}> = ({ likes, userVote = 0, onVote, vertical = true, size = 'md' }) => {
    
    const getCountColor = () => {
        if (userVote === 1) return 'text-neon-red';
        if (userVote === -1) return 'text-neon-blue';
        return 'text-white font-bold';
    };

    return (
        <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-1 bg-black/40 rounded-lg p-1.5 border border-white/5`}>
            <button 
                onClick={(e) => { e.stopPropagation(); onVote('up'); }}
                className={`p-1 transition-all rounded hover:bg-white/10 ${userVote === 1 ? 'text-neon-red' : 'text-gray-500 hover:text-neon-red'}`}
            >
                <svg className={size === 'sm' ? "w-4 h-4" : "w-6 h-6"} fill="currentColor" viewBox="0 0 20 20"><path d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"/></svg>
            </button>
            
            <span className={`font-mono ${size === 'sm' ? 'text-xs' : 'text-base'} ${getCountColor()}`}>
                {likes >= 1000 ? (likes / 1000).toFixed(1) + 'k' : likes}
            </span>

            <button 
                onClick={(e) => { e.stopPropagation(); onVote('down'); }}
                className={`p-1 transition-all rounded hover:bg-white/10 ${userVote === -1 ? 'text-neon-blue' : 'text-gray-500 hover:text-neon-blue'}`}
            >
                <svg className={size === 'sm' ? "w-4 h-4" : "w-6 h-6"} fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"/></svg>
            </button>
        </div>
    );
};

// Utility to build a nested tree from flat comments
const buildCommentTree = (comments: Comment[], sort: 'new'|'old'|'best' = 'best') => {
    const map: Record<string, Comment> = {};
    const roots: Comment[] = [];
    
    // Deep copy to avoid mutating props
    const sortedComments = [...comments];
    
    // Sort logic
    if (sort === 'new') sortedComments.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // This won't work perfectly with the fuzzy timestamps, but good for now
    if (sort === 'best') sortedComments.sort((a,b) => b.likes - a.likes);

    // Initialize map with children arrays
    sortedComments.forEach(c => {
        map[c.id] = { ...c, children: [] };
    });

    // Link children to parents
    sortedComments.forEach(c => {
        if (c.parentId && map[c.parentId]) {
            map[c.parentId].children!.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });

    return roots;
};

// Recursive Comment Component
const CommentNode: React.FC<{ 
    comment: Comment; 
    depth?: number; 
    onReply: (parentId: string, authorName: string) => void;
    onUserClick: (username: string) => void;
    onVote: (commentId: string, type: 'up' | 'down') => void;
}> = ({ comment, depth = 0, onReply, onUserClick, onVote }) => {
    const [collapsed, setCollapsed] = useState(false);
    const hasChildren = comment.children && comment.children.length > 0;

    // Mock local vote state for immediate UI feedback
    const [localScore, setLocalScore] = useState(comment.likes);
    const [localVote, setLocalVote] = useState(0); 

    const handleVote = (type: 'up' | 'down') => {
        let diff = 0;
        let newVote = 0;
        if (type === 'up') {
            if (localVote === 1) { diff = -1; newVote = 0; }
            else if (localVote === -1) { diff = 2; newVote = 1; }
            else { diff = 1; newVote = 1; }
        } else {
            if (localVote === -1) { diff = 1; newVote = 0; }
            else if (localVote === 1) { diff = -2; newVote = -1; }
            else { diff = -1; newVote = -1; }
        }
        setLocalScore(localScore + diff);
        setLocalVote(newVote);
        onVote(comment.id, type);
    };

    return (
        <div className={`mt-4 ${depth > 0 ? 'ml-2 md:ml-6 pl-4 border-l-2 border-white/10' : ''}`}>
            <div className="flex gap-3 group">
                {/* Avatar Line */}
                <div className="flex flex-col items-center cursor-pointer pt-1" onClick={() => setCollapsed(!collapsed)}>
                    <img 
                        src={comment.avatar} 
                        className="w-8 h-8 rounded md:rounded-full object-cover border border-gray-600 ring-2 ring-transparent group-hover:ring-neon-blue/50 transition-all" 
                        alt={comment.author} 
                    />
                    {hasChildren && !collapsed && (
                        <div className="w-0.5 flex-1 bg-gradient-to-b from-white/10 to-transparent mt-2 group-hover:from-neon-blue/30 transition-colors"></div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#0f1219] rounded-br-xl rounded-bl-md rounded-tr-xl border border-white/5 hover:border-neon-blue/30 transition-all p-3 shadow-sm">
                    <div className="flex items-center flex-wrap gap-2 text-xs mb-2 border-b border-white/5 pb-2">
                        <span 
                            onClick={(e) => { e.stopPropagation(); onUserClick(comment.author); }}
                            className={`font-bold font-tech text-sm cursor-pointer hover:underline tracking-wide ${comment.isOp ? 'text-neon-blue' : 'text-gray-200'}`}
                        >
                            {comment.author}
                        </span>
                        {comment.isOp && <span className="text-[9px] bg-neon-blue/10 border border-neon-blue/50 text-neon-blue px-1.5 rounded uppercase font-bold">OP</span>}
                        <span className="text-gray-500 font-mono">• {comment.timestamp}</span>
                        
                        {collapsed && <span className="text-neon-blue text-xs cursor-pointer ml-auto" onClick={() => setCollapsed(false)}>[EXPAND DATA]</span>}
                    </div>

                    {!collapsed && (
                        <>
                            <p className="text-sm text-gray-300 mb-3 leading-relaxed whitespace-pre-wrap font-body">{comment.content}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <VoteControl 
                                        likes={localScore} 
                                        userVote={localVote}
                                        onVote={handleVote}
                                        vertical={false}
                                        size="sm"
                                    />
                                    <button 
                                        onClick={() => onReply(comment.id, comment.author)}
                                        className="text-xs font-bold text-gray-500 hover:text-neon-blue flex items-center gap-1 transition-colors uppercase tracking-wider"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Recursive Children */}
            {!collapsed && hasChildren && (
                <div>
                    {comment.children!.map(child => (
                        <CommentNode 
                            key={child.id} 
                            comment={child} 
                            depth={depth + 1} 
                            onReply={onReply} 
                            onUserClick={onUserClick} 
                            onVote={onVote}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

interface ForumProps {
    user: UserProfile;
    onViewUserProfile: (username: string) => void;
}

const Forum: React.FC<ForumProps> = ({ user, onViewUserProfile }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(user.joinedCommunities || []);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
  const [creatingCommunity, setCreatingCommunity] = useState(false);

  const [loading, setLoading] = useState(true);
  
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState<'new' | 'hot' | 'top'>('new');
  const [commentSort, setCommentSort] = useState<'new' | 'old' | 'best'>('best');

  // New Post State
  const [postType, setPostType] = useState<PostType>('text');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLink, setNewLink] = useState('');
  const [postCommunityId, setPostCommunityId] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isNsfw, setIsNsfw] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);

  // New Community State
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommIcon, setNewCommIcon] = useState('📢');

  // Comment State
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Local Spoiler reveals
  const [revealedSpoilers, setRevealedSpoilers] = useState<string[]>([]);

  // Initial Fetch
  useEffect(() => {
      const init = async () => {
          try {
              const [p, c, u] = await Promise.all([backend.getPosts(), backend.getCommunities(), backend.getCurrentUser()]);
              setPosts(p);
              setCommunities(c);
              if (u) setJoinedCommunities(u.joinedCommunities);
              if (c.length > 0) setPostCommunityId(c[1].id); 
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      init();
  }, []);

  // Derived State
  const currentCommunity = communities.find(c => c.id === selectedCommunityId) || communities[0];

  const processedPosts = useMemo(() => {
      let result = [...posts];

      // Filter by Community
      if (selectedCommunityId === 'all') {
          // Only show joined communities unless user joined nothing, then show generic seed
          if (joinedCommunities.length > 0 && !joinedCommunities.includes('all')) {
              result = result.filter(p => joinedCommunities.includes(p.communityId));
          }
      } else {
          result = result.filter(p => p.communityId === selectedCommunityId);
      }

      // Filter by Search
      if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          result = result.filter(p => 
              p.title.toLowerCase().includes(query) || 
              p.content.toLowerCase().includes(query) ||
              p.author.toLowerCase().includes(query)
          );
      }

      // Sort
      const getScore = (p: ForumPost) => p.likes + (p.isPinned ? 10000 : 0);
      
      switch (activeSort) {
          case 'top': result.sort((a, b) => b.likes - a.likes); break;
          case 'hot': result.sort((a, b) => (b.likes + b.replies * 2) - (a.likes + a.replies * 2)); break;
          default: // New
              result.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              break;
      }

      // Always float pinned to top within sort
      result.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

      return result;
  }, [posts, selectedCommunityId, searchQuery, activeSort, joinedCommunities]);

  const commentTree = useMemo(() => {
      if (!selectedPost || !selectedPost.comments) return [];
      return buildCommentTree(selectedPost.comments, commentSort);
  }, [selectedPost, commentSort]);

  const handleJoinToggle = async (commId: string) => {
      if (commId === 'all') return;
      const joined = await backend.toggleJoinCommunity(commId);
      setJoinedCommunities(prev => joined ? [...prev, commId] : prev.filter(id => id !== commId));
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !postCommunityId) return;
    
    let finalImage = undefined;
    let finalPollOptions: PollOption[] | undefined = undefined;

    if (postType === 'image') finalImage = newLink;
    if (postType === 'poll') {
        finalPollOptions = pollOptions.filter(o => o.trim()).map((text, idx) => ({
            id: `opt-${idx}-${Date.now()}`,
            text,
            votes: 0
        }));
    }

    const newPost: ForumPost = {
      id: Date.now().toString(),
      communityId: postCommunityId,
      author: user.username,
      avatar: user.avatar,
      title: newTitle,
      content: newContent,
      type: postType,
      image: finalImage,
      linkUrl: postType === 'link' ? newLink : undefined,
      pollOptions: finalPollOptions,
      isNsfw,
      isSpoiler,
      isPinned: false,
      likes: 0,
      replies: 0,
      tags: [postType.toUpperCase()],
      timestamp: 'Just now',
      comments: [],
      userVote: 0,
      awards: 0,
      awardedBy: []
    };

    try {
        const savedPost = await backend.createPost(newPost);
        setPosts([savedPost, ...posts]);
        setIsCreateModalOpen(false);
        // Reset form
        setNewTitle(''); setNewContent(''); setNewLink(''); setPollOptions(['','']);
        setPostType('text'); setIsNsfw(false); setIsSpoiler(false);
        
        if (selectedCommunityId !== 'all' && selectedCommunityId !== postCommunityId) {
            setSelectedCommunityId(postCommunityId);
        }
    } catch (e) {
        console.error("Failed to create post", e);
    }
  };

  const handleCreateCommunity = async () => {
      if (!newCommName.trim() || !newCommDesc.trim()) return;
      if (creatingCommunity) return; 

      setCreatingCommunity(true);
      
      let finalName = newCommName.trim();
      if (!finalName.startsWith('r/')) finalName = 'r/' + finalName;

      const newCommId = finalName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      const newCommunity: Community = {
          id: newCommId,
          name: finalName,
          description: newCommDesc,
          icon: newCommIcon || '📡',
          color: 'text-neon-green'
      };

      try {
          const created = await backend.createCommunity(newCommunity);
          setCommunities(prev => {
              if (prev.some(c => c.id === created.id)) return prev;
              return [...prev, created];
          });
          setJoinedCommunities(prev => [...prev, created.id]);
          setIsCreateCommunityModalOpen(false);
          setNewCommName('');
          setNewCommDesc('');
          setNewCommIcon('📢');
          setSelectedCommunityId(created.id); 
      } catch (e) {
          console.error("Failed to create community", e);
          alert("Failed to create channel. It might already exist.");
      } finally {
          setCreatingCommunity(false);
      }
  };

  // Actions
  const handlePostDelete = async (postId: string) => {
      if (!window.confirm("Sever this connection? This cannot be undone.")) return;
      await backend.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
  };

  const handlePostPin = async (postId: string) => {
      const newVal = await backend.togglePinPost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: newVal } : p));
      if (selectedPost?.id === postId) setSelectedPost({ ...selectedPost, isPinned: newVal });
  };

  const handlePostSave = async (postId: string) => {
      const isSaved = await backend.toggleSavePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved } : p));
      if (selectedPost?.id === postId) setSelectedPost({ ...selectedPost, isSaved });
  };
  
  const handleGiveAward = async (postId: string) => {
      const currentPost = posts.find(p => p.id === postId);
      if (currentPost && currentPost.awardedBy?.includes(user.username)) {
          // Already awarded, do nothing
          return;
      }

      // Optimistic update
      const updatedAwards = (currentPost?.awards || 0) + 1;
      const updatedAwardedBy = [...(currentPost?.awardedBy || []), user.username];
      
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, awards: updatedAwards, awardedBy: updatedAwardedBy } : p));
      if (selectedPost?.id === postId) {
          setSelectedPost(prev => prev ? { ...prev, awards: updatedAwards, awardedBy: updatedAwardedBy } : null);
      }

      await backend.giveAward(postId);
  };

  const handlePollVote = async (postId: string, optionId: string) => {
      const updatedPostRaw = await backend.votePoll(postId, optionId);
      if (updatedPostRaw) {
          // Re-map raw post to UI post format (timestamp)
          const updatedPost = { ...updatedPostRaw, userVote: 0 }; 
          setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
          if (selectedPost?.id === postId) setSelectedPost(updatedPost);
      }
  };

  const handlePostComment = async () => {
      if(!selectedPost || !commentText.trim()) return;
      setSubmittingComment(true);

      const newComment: Comment = {
          id: Date.now().toString(),
          parentId: replyTo?.id || null,
          author: user.username,
          avatar: user.avatar,
          content: commentText,
          likes: 0,
          timestamp: 'Just now',
          isOp: user.username === selectedPost.author
      };

      try {
          const updatedPost = await backend.addComment(selectedPost.id, newComment);
          setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
          setSelectedPost(updatedPost);
          setCommentText('');
          setReplyTo(null);
      } catch(e) {
          console.error(e);
      } finally {
          setSubmittingComment(false);
      }
  };

  const handleVote = async (postId: string, type: 'up' | 'down') => {
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    
    const post = posts[postIndex];
    const currentVote = post.userVote || 0;
    let diff = 0;
    let newVote = 0;

    if (type === 'up') {
        if (currentVote === 1) { diff = -1; newVote = 0; }
        else if (currentVote === -1) { diff = 2; newVote = 1; }
        else { diff = 1; newVote = 1; }
    } else {
        if (currentVote === -1) { diff = 1; newVote = 0; }
        else if (currentVote === 1) { diff = -2; newVote = -1; }
        else { diff = -1; newVote = -1; }
    }

    const updatedPost = { ...post, likes: post.likes + diff, userVote: newVote };
    setPosts(prev => {
        const newArr = [...prev];
        newArr[postIndex] = updatedPost;
        return newArr;
    });
    if (selectedPost?.id === postId) setSelectedPost(updatedPost);
    await backend.votePost(postId, diff);
  };

  const handleCommentVote = async (commentId: string, type: 'up' | 'down') => {
      if (!selectedPost) return;
      let diff = 0;
      if (type === 'up') diff = 1; 
      else diff = -1;

      await backend.voteComment(selectedPost.id, commentId, diff);
  };

  const openPost = (post: ForumPost) => {
      setSelectedPost(post);
      window.scrollTo({top: 0, behavior: 'smooth'});
  };

  // --- RENDER HELPERS ---

  const isMod = (commId: string) => {
      const c = communities.find(x => x.id === commId);
      return c?.creatorId === user.username; 
  };

  if (loading) return <div className="text-center py-20 text-neon-blue font-mono animate-pulse tracking-widest">ESTABLISHING SECURE LINK...</div>;

  return (
    <div className="min-h-screen bg-radial-glow text-gray-200 font-body relative flex flex-col bg-fixed tv-grid-bg">
      
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-vox-dark/90 backdrop-blur-xl border-b border-neon-blue/30 px-4 h-16 flex items-center justify-between shadow-[0_0_20px_rgba(0,247,255,0.1)]">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-neon-blue text-black font-bold font-marker text-xl flex items-center justify-center rounded shadow-[0_0_10px_#00f7ff]">V</div>
             <h1 className="text-2xl font-tech text-white hidden md:block tracking-widest drop-shadow-[0_0_5px_#00f7ff]">
                 VOX<span className="text-neon-blue">GRAM</span>
             </h1>
          </div>
          
          <div className="flex-1 max-w-xl mx-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-md transition-opacity group-hover:opacity-40"></div>
                <input 
                    type="text" 
                    placeholder="SCAN FREQUENCIES..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative w-full bg-black/50 border border-neon-blue/30 rounded-full py-2 px-6 focus:outline-none focus:border-neon-blue focus:bg-black/80 text-sm transition-all text-neon-blue placeholder-neon-blue/50 font-mono uppercase tracking-wider"
                />
              </div>
          </div>

          <div className="flex items-center gap-3">
               <button onClick={() => setIsCreateModalOpen(true)} className="md:hidden text-neon-blue text-2xl border border-neon-blue rounded px-2">+</button>
               <img 
                  src={user.avatar} 
                  onClick={() => onViewUserProfile(user.username)}
                  alt="" 
                  className="w-9 h-9 rounded-full border-2 border-gray-700 cursor-pointer hover:border-neon-blue hover:shadow-[0_0_15px_#00f7ff] transition-all object-cover"
               />
          </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 pt-6">
          
          {/* LEFT SIDEBAR (Communities) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 px-2">
              <div className="sticky top-24 space-y-2">
                  <div className="flex justify-between items-end px-3 mb-3 border-b border-neon-blue/20 pb-2">
                    <div className="text-[10px] text-neon-blue font-bold uppercase tracking-[0.2em]">Channels</div>
                    <button 
                        onClick={() => setIsCreateCommunityModalOpen(true)}
                        className="text-[10px] bg-neon-blue/10 hover:bg-neon-blue text-neon-blue hover:text-black font-bold px-2 py-0.5 rounded transition-colors uppercase tracking-wider"
                        title="Create New Channel"
                    >
                        + New
                    </button>
                  </div>
                  
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-1">
                    {communities.map(c => {
                        const isJoined = joinedCommunities.includes(c.id);
                        return (
                        <div key={c.id} className="group relative flex items-center">
                            <button
                                onClick={() => { setSelectedCommunityId(c.id); setSelectedPost(null); window.scrollTo({top:0}); }}
                                className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-r-xl border-l-4 transition-all duration-200 ${selectedCommunityId === c.id ? 'bg-gradient-to-r from-neon-blue/20 to-transparent border-neon-blue text-white' : 'border-transparent hover:bg-white/5 text-gray-400 hover:text-white hover:border-gray-500'}`}
                            >
                                <span className={`transition-transform duration-300 group-hover:scale-110`}>
                                    <CommunityIcon icon={c.icon} size="md"/>
                                </span>
                                <span className={`text-sm font-bold font-tech tracking-wide truncate ${selectedCommunityId === c.id ? 'text-neon-blue' : ''}`}>{c.name}</span>
                            </button>
                            {c.id !== 'all' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleJoinToggle(c.id); }}
                                    className={`absolute right-2 text-xs font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all ${isJoined ? 'bg-gray-800 text-red-500' : 'bg-neon-blue text-black'}`}
                                >
                                    {isJoined ? '-' : '+'}
                                </button>
                            )}
                        </div>
                    )})}
                  </div>
                  
                  <div className="my-6 pt-4 px-2 border-t border-white/5">
                      <button 
                         onClick={() => setIsCreateModalOpen(true)}
                         className="w-full relative overflow-hidden group bg-transparent border border-neon-blue text-neon-blue font-bold py-3 rounded uppercase tracking-[0.2em] text-xs transition-all hover:text-black"
                      >
                          <div className="absolute inset-0 bg-neon-blue transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                          <span className="relative z-10 flex items-center justify-center gap-2">
                              <span>+</span> Broadcast Signal
                          </span>
                      </button>
                  </div>
              </div>
          </div>

          {/* CENTER CONTENT */}
          <div className="col-span-1 md:col-span-9 lg:col-span-7 min-h-screen pb-20">
              
              {selectedPost ? (
                  // === POST DETAIL VIEW ===
                  <div className="glass-panel rounded-xl border border-neon-blue/20 overflow-hidden animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-2 md:mx-0">
                      
                      {/* Post Header */}
                      <div className="bg-vox-dark/95 p-3 flex items-center justify-between border-b border-neon-blue/20 sticky top-0 z-50 backdrop-blur-md">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedPost(null)} className="hover:bg-neon-blue/20 p-2 rounded-full text-neon-blue transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <span className="font-bold font-tech text-neon-blue tracking-wider uppercase">Signal Source #{selectedPost.id.slice(-4)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                              {/* Mod/Author Actions */}
                              {(user.username === selectedPost.author || isMod(selectedPost.communityId)) && (
                                  <button 
                                    onClick={() => handlePostDelete(selectedPost.id)} 
                                    className="text-gray-500 hover:text-red-500 p-2" title="Exterminate Signal"
                                  >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                              )}
                              {isMod(selectedPost.communityId) && (
                                  <button 
                                    onClick={() => handlePostPin(selectedPost.id)}
                                    className={`p-2 ${selectedPost.isPinned ? 'text-neon-green' : 'text-gray-500 hover:text-neon-green'}`} 
                                    title="Impale (Pin)"
                                  >
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
                                  </button>
                              )}
                          </div>
                      </div>

                      <div className="flex flex-col md:flex-row">
                           {/* Desktop Vote */}
                           <div className="hidden md:flex w-16 bg-black/30 border-r border-white/5 pt-6 justify-center">
                               <VoteControl 
                                  likes={selectedPost.likes} 
                                  userVote={selectedPost.userVote} 
                                  onVote={(t) => handleVote(selectedPost.id, t)} 
                               />
                           </div>
                           
                           <div className="flex-1 p-4 md:p-8">
                               {/* Mobile Vote */}
                               <div className="md:hidden mb-6">
                                   <VoteControl 
                                      likes={selectedPost.likes} 
                                      userVote={selectedPost.userVote} 
                                      onVote={(t) => handleVote(selectedPost.id, t)}
                                      vertical={false} 
                                   />
                               </div>

                               {/* Post Meta */}
                               <div className="flex items-center gap-3 text-xs text-gray-400 mb-6 font-mono">
                                   <span className="font-bold text-black px-2 py-1 bg-neon-blue rounded shadow-[0_0_10px_#00f7ff]">{communities.find(c => c.id === selectedPost.communityId)?.name}</span>
                                   <span className="text-gray-600">|</span>
                                   <span className="text-gray-400">TRANSMISSION BY</span>
                                   <span 
                                      className="text-white hover:text-neon-blue cursor-pointer font-bold underline decoration-neon-blue/50 hover:decoration-neon-blue transition-colors"
                                      onClick={(e) => { e.stopPropagation(); onViewUserProfile(selectedPost.author); }}
                                   >
                                       u/{selectedPost.author}
                                   </span>
                                   <span className="ml-auto text-neon-blue/70">{selectedPost.timestamp}</span>
                               </div>
                               
                               {/* Awards & Flags */}
                               <div className="flex flex-wrap gap-2 mb-4">
                                   {selectedPost.isNsfw && <span className="border border-red-500 text-red-500 px-2 py-0.5 text-[10px] font-bold uppercase rounded">SINFUL (NSFW)</span>}
                                   {selectedPost.isSpoiler && <span className="border border-yellow-500 text-yellow-500 px-2 py-0.5 text-[10px] font-bold uppercase rounded">HAZARD (SPOILER)</span>}
                                   {(selectedPost.awards || 0) > 0 && (
                                       <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-2 py-0.5 text-[10px] font-bold uppercase rounded flex items-center gap-1 shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                                           👻 {selectedPost.awards} Souls Harvested
                                       </span>
                                   )}
                               </div>

                               <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight text-glow-blue/30">{selectedPost.title}</h1>
                               
                               {/* POST CONTENT RENDERING */}
                               <div className={`mb-8 ${selectedPost.isSpoiler && !revealedSpoilers.includes(selectedPost.id) ? 'filter blur-lg cursor-pointer opacity-50 hover:opacity-80 transition-all' : ''}`}
                                    onClick={() => selectedPost.isSpoiler && setRevealedSpoilers(prev => [...prev, selectedPost.id])}
                               >
                                   {selectedPost.type === 'image' && selectedPost.image && (
                                       <div className="rounded-lg border-2 border-neon-blue/20 bg-black flex justify-center overflow-hidden shadow-[0_0_30px_rgba(0,247,255,0.05)]">
                                           <img src={selectedPost.image} className="max-h-[600px] w-auto object-contain" alt="Post"/>
                                       </div>
                                   )}
                                   
                                   {selectedPost.type === 'link' && selectedPost.linkUrl && (
                                       <a href={selectedPost.linkUrl} target="_blank" rel="noreferrer" className="block p-4 bg-neon-blue/10 border border-neon-blue/30 rounded text-neon-blue hover:underline truncate">
                                           🔗 {selectedPost.linkUrl}
                                       </a>
                                   )}

                                   {selectedPost.type === 'poll' && selectedPost.pollOptions && (
                                       <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                           {selectedPost.pollOptions.map(opt => {
                                               const total = selectedPost.pollTotalVotes || 1; // prevent div/0
                                               const percent = Math.round((opt.votes / total) * 100);
                                               const isChosen = selectedPost.userPollSelection === opt.id;
                                               return (
                                                   <div key={opt.id} onClick={() => !selectedPost.userPollSelection && handlePollVote(selectedPost.id, opt.id)} className={`relative mb-3 h-10 rounded cursor-pointer overflow-hidden border ${isChosen ? 'border-neon-green' : 'border-transparent'}`}>
                                                       <div className="absolute inset-0 bg-gray-800"></div>
                                                       <div className={`absolute inset-0 bg-neon-blue/30 transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                                                       <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                                                           <span className="font-bold text-sm text-white">{opt.text} {isChosen && '✓'}</span>
                                                           <span className="font-mono text-xs">{percent}% ({opt.votes})</span>
                                                       </div>
                                                   </div>
                                               )
                                           })}
                                            <div className="text-xs text-gray-500 text-right font-mono">{selectedPost.pollTotalVotes} votes total</div>
                                       </div>
                                   )}

                                   <p className="text-gray-200 whitespace-pre-wrap mt-6 font-body leading-relaxed text-base md:text-lg bg-black/20 p-4 rounded border-l-2 border-neon-blue/50">{selectedPost.content}</p>
                               </div>

                               {/* Action Footer */}
                               <div className="flex gap-4 mb-8 pb-4 border-b border-white/5">
                                   <button onClick={() => handlePostSave(selectedPost.id)} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${selectedPost.isSaved ? 'text-neon-green' : 'text-gray-500 hover:text-white'}`}>
                                       <svg className="w-4 h-4" fill={selectedPost.isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                       {selectedPost.isSaved ? 'Signal Saved' : 'Save Signal'}
                                   </button>
                                   
                                   {(() => {
                                       const hasAwarded = selectedPost.awardedBy?.includes(user.username);
                                       return (
                                            <button 
                                                onClick={() => handleGiveAward(selectedPost.id)} 
                                                disabled={hasAwarded}
                                                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                                                    hasAwarded 
                                                        ? 'text-yellow-500 cursor-default opacity-100 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' 
                                                        : 'text-gray-500 hover:text-yellow-400'
                                                }`}
                                            >
                                                <svg className="w-4 h-4" fill={hasAwarded ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {hasAwarded ? 'Soul Offered' : 'Offer Soul'}
                                            </button>
                                       );
                                   })()}
                               </div>

                               {/* Comment Section */}
                               <div className="pt-4 relative">
                                   <div className="flex justify-between items-center mb-6">
                                        <div className="bg-[#0f172a] px-4 py-1 border border-neon-blue/30 rounded-full text-neon-blue text-xs font-bold uppercase tracking-widest">
                                            Data Stream
                                        </div>
                                        {/* Comment Sort */}
                                        <select 
                                            value={commentSort} 
                                            onChange={(e) => setCommentSort(e.target.value as any)}
                                            className="bg-black border border-gray-700 text-xs text-gray-400 rounded px-2 py-1 outline-none focus:border-neon-blue"
                                        >
                                            <option value="best">Best</option>
                                            <option value="new">Newest</option>
                                            <option value="old">Oldest</option>
                                        </select>
                                   </div>

                                   <div className="mb-8 bg-[#050a14] p-4 rounded-xl border border-white/10 focus-within:border-neon-blue focus-within:shadow-[0_0_20px_rgba(0,247,255,0.1)] transition-all mt-4">
                                       {replyTo && (
                                            <div className="flex justify-between items-center mb-2 text-xs bg-neon-blue/10 p-2 rounded text-neon-blue border border-neon-blue/20">
                                                <span>Replying to: u/{replyTo.author}</span>
                                                <button onClick={() => setReplyTo(null)} className="text-white hover:text-neon-red font-bold">ABORT</button>
                                            </div>
                                       )}
                                       <textarea 
                                           className="w-full bg-transparent text-white focus:outline-none text-sm min-h-[80px] placeholder-gray-600 font-mono"
                                           placeholder="Inject data into the stream..."
                                           value={commentText}
                                           onChange={(e) => setCommentText(e.target.value)}
                                       />
                                       <div className="flex justify-end mt-2">
                                           <button 
                                               onClick={handlePostComment}
                                               disabled={!commentText.trim() || submittingComment}
                                               className="bg-white text-black hover:bg-neon-blue hover:text-black px-6 py-2 rounded font-bold text-xs transition-all disabled:opacity-50 uppercase tracking-[0.1em] border border-transparent hover:border-white"
                                           >
                                               {submittingComment ? 'Uploading...' : 'Transmit'}
                                           </button>
                                       </div>
                                   </div>

                                   <div className="space-y-8 pl-0 md:pl-2">
                                       {commentTree.map(c => (
                                           <CommentNode 
                                              key={c.id} 
                                              comment={c} 
                                              onReply={(pid, author) => setReplyTo({id: pid, author})} 
                                              onUserClick={onViewUserProfile}
                                              onVote={handleCommentVote}
                                           />
                                       ))}
                                       {commentTree.length === 0 && (
                                           <div className="text-center py-10 text-gray-600 font-mono">No data packets found. Be the first to transmit.</div>
                                       )}
                                   </div>
                               </div>
                           </div>
                      </div>
                  </div>
              ) : (
                  // === FEED VIEW ===
                  <div className="space-y-4 px-2 md:px-0">
                      
                      {/* Community Banner */}
                      {currentCommunity.id !== 'all' && (
                          <div className="relative rounded-xl p-8 mb-8 overflow-hidden border border-neon-blue/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                               <div className="absolute inset-0 bg-gradient-to-r from-[#050a14] via-[#0a1525] to-[#050a14] z-0"></div>
                               {/* Abstract BG element */}
                               <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-neon-blue/10 to-transparent transform skew-x-12"></div>
                               
                               <div className="relative z-10 flex justify-between items-start">
                                   <div className="flex items-center gap-6">
                                        <div className="filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                            <CommunityIcon icon={currentCommunity.icon} size="xl"/>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-tech font-bold text-white mb-1 tracking-wide">{currentCommunity.name}</h2>
                                            <p className="text-neon-blue/70 text-sm font-mono">{currentCommunity.description}</p>
                                            <div className="mt-2 text-xs text-gray-500">Creator: {currentCommunity.creatorId || 'Unknown'}</div>
                                        </div>
                                   </div>
                                   <button 
                                        onClick={() => handleJoinToggle(currentCommunity.id)}
                                        className={`px-6 py-2 font-bold uppercase tracking-widest rounded border transition-all ${joinedCommunities.includes(currentCommunity.id) ? 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500' : 'bg-neon-blue text-black border-neon-blue hover:bg-white'}`}
                                   >
                                       {joinedCommunities.includes(currentCommunity.id) ? 'Sever Contract' : 'Sign Contract'}
                                   </button>
                               </div>
                          </div>
                      )}

                      {/* Feed Controls */}
                      <div className="flex items-center gap-2 mb-6 pl-1 border-b border-white/5 pb-4">
                           {['new', 'hot', 'top'].map(sort => (
                               <button 
                                  key={sort}
                                  onClick={() => setActiveSort(sort as any)}
                                  className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all border ${activeSort === sort ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_10px_#00f7ff]' : 'text-gray-500 border-gray-800 hover:border-neon-blue/50 hover:text-white bg-black'}`}
                               >
                                   {sort}
                               </button>
                           ))}
                      </div>

                      {/* Post List */}
                      {processedPosts.length > 0 ? processedPosts.map(post => {
                          const isHidden = post.isSpoiler && !revealedSpoilers.includes(post.id);
                          return (
                          <div 
                              key={post.id} 
                              onClick={() => openPost(post)}
                              className={`relative group bg-[#0f1623] border ${post.isPinned ? 'border-neon-green/40' : 'border-white/5'} hover:border-neon-blue/40 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer flex hover:shadow-[0_0_20px_rgba(0,247,255,0.05)] hover:-translate-y-1`}
                          >
                               {post.isPinned && <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-t-neon-green border-l-[30px] border-l-transparent z-20"></div>}
                               
                               <div className="w-12 bg-[#0b121b] border-r border-white/5 flex flex-col items-center pt-4 hidden md:flex group-hover:border-neon-blue/20 transition-colors">
                                   <VoteControl 
                                       likes={post.likes} 
                                       userVote={post.userVote} 
                                       onVote={(t) => handleVote(post.id, t)} 
                                   />
                                   {post.isSaved && (
                                       <span className="mt-4 text-neon-green" title="Saved">
                                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
                                       </span>
                                   )}
                               </div>
                               <div className="p-5 flex-1 relative">
                                   {/* Subtle bg glow on hover */}
                                   <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                   <div className="relative z-10">
                                       <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3 font-mono">
                                           <CommunityIcon icon={communities.find(c => c.id === post.communityId)?.icon || '📡'} size="sm"/>
                                           <span className="text-gray-300 font-bold">{communities.find(c => c.id === post.communityId)?.name}</span>
                                           <span className="text-gray-700">|</span>
                                           <span className="text-neon-blue/80">u/{post.author}</span>
                                           <span className="ml-auto">{post.timestamp}</span>
                                       </div>
                                       
                                       <div className="flex gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    {post.isNsfw && <span className="text-[9px] border border-red-500 text-red-500 px-1 rounded">NSFW</span>}
                                                    {post.isSpoiler && <span className="text-[9px] border border-yellow-500 text-yellow-500 px-1 rounded">SPOILER</span>}
                                                    {post.type === 'poll' && <span className="text-[9px] bg-gray-700 text-white px-1 rounded">POLL</span>}
                                                    <h3 className="text-lg md:text-xl font-bold text-white leading-snug group-hover:text-neon-blue transition-colors font-body">{post.title}</h3>
                                                </div>
                                                
                                                <div className={`text-sm text-gray-400 line-clamp-2 mb-2 leading-relaxed font-light ${isHidden ? 'filter blur-sm' : ''}`}>
                                                    {post.type === 'text' ? post.content : (post.type === 'poll' ? '📊 Interactive Poll' : 'Click to view content')}
                                                </div>
                                            </div>
                                            {post.image && !isHidden && !post.isNsfw && (
                                               <div className="w-24 h-24 md:w-32 md:h-32 rounded border border-gray-700 bg-black flex-shrink-0 overflow-hidden group-hover:border-neon-blue/50 transition-colors">
                                                    <img src={post.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105" alt="preview"/>
                                               </div>
                                            )}
                                            {(post.isNsfw || isHidden) && post.image && (
                                                <div className="w-24 h-24 bg-gray-900 flex items-center justify-center border border-gray-700 text-[10px] text-gray-500 font-mono text-center p-2">
                                                    {post.isNsfw ? 'SINFUL CONTENT' : 'HAZARD BLUR'}
                                                </div>
                                            )}
                                       </div>

                                       <div className="flex items-center gap-4 mt-4">
                                           <div className="md:hidden" onClick={e => e.stopPropagation()}>
                                               <VoteControl likes={post.likes} userVote={post.userVote} onVote={(t) => handleVote(post.id, t)} vertical={false} size='sm'/>
                                           </div>

                                           <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded text-xs font-bold text-gray-400 group-hover:bg-neon-blue/10 group-hover:text-neon-blue transition-colors">
                                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                               {post.replies} <span className="hidden sm:inline">COMMENTS</span>
                                           </div>
                                           
                                           {(post.awards || 0) > 0 && (
                                               <span className="text-yellow-500 text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                                                   👻 {post.awards}
                                               </span>
                                           )}

                                           {post.tags.map(tag => (
                                               <span key={tag} className="text-[10px] uppercase border border-gray-700 px-2 py-0.5 rounded text-gray-500 group-hover:border-neon-blue/30 group-hover:text-neon-blue/70 transition-colors">
                                                   #{tag}
                                               </span>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                          </div>
                      )}) : (
                          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl bg-black/20">
                              <div className="text-4xl mb-4 grayscale opacity-20 animate-pulse">📡</div>
                              <div className="text-gray-500 font-mono">NO SIGNALS FOUND. {selectedCommunityId === 'all' && joinedCommunities.length <= 1 ? "Try joining some channels!" : ""}</div>
                          </div>
                      )}
                  </div>
              )}
          </div>

          {/* RIGHT SIDEBAR (Info) */}
          <div className="hidden lg:block lg:col-span-3 px-2">
              <div className="bg-[#0b1016] border border-white/10 rounded-xl p-0 sticky top-24 shadow-lg overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-[#050a14] to-black relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-tv-grid opacity-20"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1016] to-transparent"></div>
                      <div className="relative z-10 font-tech text-neon-blue text-2xl drop-shadow-[0_0_5px_#00f7ff] text-center px-2 tracking-widest">
                          {currentCommunity.id === 'all' ? 'HELL\'S HUB' : currentCommunity.name}
                      </div>
                  </div>
                  
                  <div className="p-6">
                      <p className="text-sm text-gray-400 mb-6 leading-relaxed border-l-2 border-neon-blue/30 pl-3">
                          {currentCommunity.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-center mb-6">
                          <div className="flex flex-col p-3 bg-black border border-gray-800 rounded hover:border-neon-blue/30 transition-colors">
                              <span className="text-lg font-bold text-white font-mono">{currentCommunity.memberCount}</span>
                              <span className="text-xs text-neon-blue/50 uppercase tracking-widest">Sinners</span>
                          </div>
                          <div className="flex flex-col p-3 bg-black border border-gray-800 rounded hover:border-neon-green/30 transition-colors">
                              <span className="text-lg font-bold text-neon-green flex items-center justify-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse"></span>
                                  1.5k
                              </span>
                              <span className="text-xs text-neon-green/50 uppercase tracking-widest">Online</span>
                          </div>
                      </div>

                      {currentCommunity.id !== 'all' && (
                           <button 
                              onClick={() => handleJoinToggle(currentCommunity.id)}
                              className={`w-full py-2 mb-4 font-bold uppercase tracking-widest rounded text-sm border transition-all ${joinedCommunities.includes(currentCommunity.id) ? 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500' : 'bg-white text-black border-white hover:bg-neon-blue hover:border-neon-blue'}`}
                           >
                               {joinedCommunities.includes(currentCommunity.id) ? 'Sever Contract' : 'Sign Contract'}
                           </button>
                      )}
                  </div>
              </div>
          </div>

      </div>

      {/* CREATE POST MODAL */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={() => setIsCreateModalOpen(false)}>
              <div 
                  className="bg-[#0f172a] w-full max-w-2xl border border-neon-blue/30 rounded-xl shadow-[0_0_50px_rgba(0,247,255,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
                  onClick={e => e.stopPropagation()}
              >
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/50">
                      <h3 className="text-white font-tech text-lg tracking-widest uppercase">Initialize Broadcast</h3>
                      <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-neon-red text-2xl">&times;</button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar bg-tv-grid">
                      <div className="mb-4">
                          <select 
                              value={postCommunityId} 
                              onChange={(e) => setPostCommunityId(e.target.value)}
                              className="w-full bg-black/50 border border-gray-700 text-white text-sm rounded px-3 py-3 focus:border-neon-blue outline-none transition-colors font-mono"
                          >
                              <option value="" disabled>SELECT DESTINATION...</option>
                              {communities.filter(c => c.id !== 'all').map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                      </div>

                      {/* Type Tabs */}
                      <div className="flex gap-2 mb-4">
                          {(['text', 'image', 'link', 'poll'] as const).map(t => (
                              <button 
                                key={t}
                                onClick={() => setPostType(t)}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest border rounded ${postType === t ? 'bg-neon-blue text-black border-neon-blue' : 'bg-black text-gray-500 border-gray-700 hover:text-white'}`}
                              >
                                  {t}
                              </button>
                          ))}
                      </div>

                      <div className="mb-4">
                           <input 
                               className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-neon-blue focus:outline-none text-lg font-bold placeholder-gray-600 transition-colors font-body"
                               placeholder="SIGNAL TITLE"
                               value={newTitle}
                               onChange={e => setNewTitle(e.target.value)}
                               autoFocus
                           />
                      </div>
                      
                      {/* Dynamic Inputs based on Type */}
                      {postType === 'image' && (
                          <div className="mb-4">
                               <input 
                                   className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-neon-blue focus:outline-none text-xs font-mono placeholder-gray-600"
                                   placeholder="IMAGE URL (https://...)"
                                   value={newLink}
                                   onChange={e => setNewLink(e.target.value)}
                               />
                          </div>
                      )}
                      {postType === 'link' && (
                          <div className="mb-4">
                               <input 
                                   className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-neon-blue focus:outline-none text-xs font-mono placeholder-gray-600"
                                   placeholder="EXTERNAL LINK URL"
                                   value={newLink}
                                   onChange={e => setNewLink(e.target.value)}
                               />
                          </div>
                      )}
                      {postType === 'poll' && (
                          <div className="mb-4 space-y-2">
                               {pollOptions.map((opt, idx) => (
                                   <input 
                                        key={idx}
                                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-neon-blue focus:outline-none text-sm placeholder-gray-600"
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={e => {
                                            const newOpts = [...pollOptions];
                                            newOpts[idx] = e.target.value;
                                            setPollOptions(newOpts);
                                        }}
                                   />
                               ))}
                               <button 
                                onClick={() => setPollOptions([...pollOptions, ''])} 
                                className="text-xs text-neon-blue hover:underline"
                               >
                                   + Add Option
                               </button>
                          </div>
                      )}

                      <textarea 
                          className="w-full h-32 bg-black/50 border border-gray-700 rounded p-4 text-white focus:border-neon-blue focus:outline-none mb-4 transition-colors font-mono text-sm resize-none placeholder-gray-600"
                          placeholder="OPTIONAL BODY TEXT..."
                          value={newContent}
                          onChange={e => setNewContent(e.target.value)}
                      />

                      <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={isNsfw} onChange={e => setIsNsfw(e.target.checked)} className="accent-red-500"/>
                              <span className="text-xs font-bold text-red-500">NSFW</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={isSpoiler} onChange={e => setIsSpoiler(e.target.checked)} className="accent-yellow-500"/>
                              <span className="text-xs font-bold text-yellow-500">SPOILER</span>
                          </label>
                      </div>
                  </div>

                  <div className="p-4 border-t border-white/5 bg-black/50 flex justify-end gap-3">
                      <button 
                          onClick={() => setIsCreateModalOpen(false)}
                          className="px-6 py-2 rounded border border-gray-700 text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors uppercase text-xs tracking-[0.2em]"
                      >
                          Abort
                      </button>
                      <button 
                          onClick={handleCreatePost}
                          className={`px-8 py-2 rounded bg-neon-blue text-black font-bold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all uppercase text-xs tracking-[0.2em] ${(!newTitle.trim() || !postCommunityId) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!newTitle.trim() || !postCommunityId}
                      >
                          Broadcast
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* CREATE COMMUNITY MODAL */}
      {isCreateCommunityModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={() => setIsCreateCommunityModalOpen(false)}>
              <div 
                  className="bg-[#0f172a] w-full max-w-lg border border-neon-green/30 rounded-xl shadow-[0_0_50px_rgba(57,255,20,0.1)] overflow-hidden flex flex-col"
                  onClick={e => e.stopPropagation()}
              >
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/50">
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-neon-green animate-pulse rounded-full"></div>
                          <h3 className="text-white font-tech text-lg tracking-widest uppercase text-neon-green">Establish New Node</h3>
                      </div>
                      <button onClick={() => setIsCreateCommunityModalOpen(false)} className="text-gray-500 hover:text-neon-green text-2xl">&times;</button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto bg-tv-grid">
                      <div className="mb-4">
                           <label className="text-[10px] uppercase text-neon-green/70 font-bold tracking-widest mb-1 block">Channel Designation</label>
                           <div className="relative">
                                <input 
                                    className="w-full bg-black/50 border border-gray-700 rounded p-3 pl-8 text-white focus:border-neon-green focus:outline-none font-bold placeholder-gray-600 transition-colors font-mono"
                                    placeholder="r/YourChannel"
                                    value={newCommName}
                                    onChange={e => setNewCommName(e.target.value)}
                                    autoFocus
                                />
                                <div className="absolute left-3 top-3 text-gray-500 font-mono">#</div>
                           </div>
                           <p className="text-[9px] text-gray-500 mt-1">Will be formatted as r/Name</p>
                      </div>
                      
                      <div className="mb-4">
                           <label className="text-[10px] uppercase text-neon-green/70 font-bold tracking-widest mb-1 block">Node Icon (Emoji OR Image URL)</label>
                           <input 
                               className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-neon-green focus:outline-none transition-colors"
                               placeholder="📡 or https://image.png"
                               value={newCommIcon}
                               onChange={e => setNewCommIcon(e.target.value)}
                           />
                      </div>

                      <div className="mb-2">
                          <label className="text-[10px] uppercase text-neon-green/70 font-bold tracking-widest mb-1 block">Description</label>
                          <textarea 
                              className="w-full h-24 bg-black/50 border border-gray-700 rounded p-4 text-white focus:border-neon-green focus:outline-none mb-2 transition-colors font-mono text-sm resize-none placeholder-gray-600"
                              placeholder="Define the purpose of this frequency..."
                              value={newCommDesc}
                              onChange={e => setNewCommDesc(e.target.value)}
                          />
                      </div>
                  </div>

                  <div className="p-4 border-t border-white/5 bg-black/50 flex justify-end gap-3">
                      <button 
                          onClick={() => setIsCreateCommunityModalOpen(false)}
                          className="px-6 py-2 rounded border border-gray-700 text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors uppercase text-xs tracking-[0.2em]"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleCreateCommunity}
                          className={`px-8 py-2 rounded bg-neon-green text-black font-bold transition-all uppercase text-xs tracking-[0.2em] ${(!newCommName.trim() || !newCommDesc.trim() || creatingCommunity) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'}`}
                          disabled={!newCommName.trim() || !newCommDesc.trim() || creatingCommunity}
                      >
                          {creatingCommunity ? 'INITIALIZING...' : 'INITIALIZE'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Forum;