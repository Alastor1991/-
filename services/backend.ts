
import { UserProfile, ForumPost, Episode, Review, Universe, Comment, Community } from '../types';

// --- SEED COMMUNITIES ---
const SEED_COMMUNITIES: Community[] = [
    {
        id: 'all',
        name: 'r/All',
        description: 'The screams of everyone combined.',
        icon: '🌐',
        color: 'text-white'
    },
    {
        id: 'overlords',
        name: 'r/Overlords',
        description: 'Exclusive club for the powerful. If you have to ask, you don\'t belong.',
        icon: '👑',
        color: 'text-neon-red'
    },
    {
        id: 'imp',
        name: 'r/IMP',
        description: 'Immediate Murder Professionals. Client requests & weapon sales.',
        icon: '🔫',
        color: 'text-neon-red'
    },
    {
        id: 'sinners',
        name: 'r/Sinners',
        description: 'General chat for the damned. Rants, drama, and extermination tips.',
        icon: '🔥',
        color: 'text-neon-blue'
    },
    {
        id: 'hazbin',
        name: 'r/HazbinHotel',
        description: 'Redemption is possible! (Maybe). Discuss Charlie\'s project.',
        icon: '🏨',
        color: 'text-neon-pink'
    },
    {
        id: 'tech',
        name: 'r/VoxTek',
        description: 'Support forum for VoxTek products. All hail Vox.',
        icon: '📺',
        color: 'text-neon-blue'
    }
];

// --- INITIAL SEED DATA (If DB is empty) ---
const SEED_EPISODES: Episode[] = [
  {
    id: 'h1',
    universe: Universe.HAZBIN,
    season: 1,
    number: 1,
    title: "Pilot",
    thumbnail: "https://static.wikia.nocookie.net/hazbinhotel/images/5/5a/Pilot_Screenshot.png", 
    videoUrl: "https://www.youtube.com/embed/Zlmswo0S0e0?si=Autoplay",
    synopsis: "Чарли Морнингстар пытается воплотить свою мечту об искуплении грешников, но Ад настроен скептически.",
    reviews: [
      { id: 'r1', user: 'VaggieLover', rating: 10, comment: 'Идеальное начало!', timestamp: '1 day ago' },
      { id: 'r2', user: 'RadioHater', rating: 2, comment: 'Слишком много песен.', timestamp: '2 days ago' }
    ]
  },
  {
    id: 'h2',
    universe: Universe.HAZBIN,
    season: 1,
    number: 2,
    title: "Radio Killed the Video Star",
    thumbnail: "https://static.wikia.nocookie.net/hazbinhotel/images/a/a3/Vox_Pilot.png",
    videoUrl: "https://www.youtube.com/embed/8lQM0y608g8",
    synopsis: "Противостояние старых медиа и новых технологий. Аластор показывает зубки, а Вокс теряет сигнал.",
    reviews: [
        { id: 'r3', user: 'VoxTech_Official', rating: 1, comment: 'ПОЛНЫЙ ОТСТОЙ. ПОМЕХИ В ЭФИРЕ.', timestamp: '1 hour ago' }
    ]
  },
  {
    id: 'hb1',
    universe: Universe.HELLUVA,
    season: 1,
    number: 1,
    title: "Murder Family",
    thumbnail: "https://static.wikia.nocookie.net/helluvaboss/images/5/55/Murder_Family.png",
    videoUrl: "https://www.youtube.com/embed/el_PChGfJN8",
    synopsis: "Блиц и компания отправляются на Землю, чтобы убить цель, но сталкиваются с семьей маньяков.",
    reviews: [
        { id: 'r4', user: 'Moxxie', rating: 7, comment: 'Было немного жестоко, сэр.', timestamp: '1 year ago' }
    ]
  },
  {
    id: 'hb2',
    universe: Universe.HELLUVA,
    season: 1,
    number: 2,
    title: "Loo Loo Land",
    thumbnail: "https://static.wikia.nocookie.net/helluvaboss/images/1/19/Loo_Loo_Land.png",
    videoUrl: "https://www.youtube.com/embed/kpnwWgxEGLI",
    synopsis: "Октавия и Столас пытаются наладить отношения в парке развлечений.",
    reviews: [
        { id: 'r5', user: 'Octavia_Goetia', rating: 9, comment: 'Ненавижу этот парк, но папа старался.', timestamp: '5 months ago' }
    ]
  },
    {
    id: 'hb3',
    universe: Universe.HELLUVA,
    season: 2,
    number: 6,
    title: "Oops",
    thumbnail: "https://static.wikia.nocookie.net/helluvaboss/images/e/e8/Oops.jpg",
    videoUrl: "https://www.youtube.com/embed/h2Zp7_VbUYE",
    synopsis: "Физзаролли и Блиц оказываются в ловушке и вынуждены выяснить отношения.",
    reviews: [
        { id: 'r6', user: 'Asmodeus', rating: 10, comment: 'Мой Физзи был великолепен!', timestamp: '1 week ago' }
    ]
  }
];

const SEED_POSTS: ForumPost[] = [
  {
    id: 'p1',
    communityId: 'overlords',
    author: 'RadioDemon',
    avatar: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Alastor_Hazbin_Hotel.png',
    title: 'О посредственности современного телевидения',
    content: 'Визуал для слабоумных! Истинный ужас и восторг кроются в радиоволнах. Кто вообще смотрит этот ящик с картинками?',
    likes: 666,
    replies: 3,
    tags: ['Opinion', 'Radio', 'Classic'],
    timestamp: '2024-05-20T12:00:00Z', // ISO format for sorting
    comments: [
        { id: 'c1', parentId: null, author: 'AngelDust', avatar: 'https://upload.wikimedia.org/wikipedia/en/2/24/Angel_Dust_Hazbin_Hotel.png', content: 'О боже, какая драма! 🍿 Продолжай, я записываю.', likes: 69, timestamp: '5m ago' },
        { id: 'c2', parentId: 'c1', author: 'RadioDemon', avatar: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Alastor_Hazbin_Hotel.png', content: 'Убери свои лапы от клавиатуры, женоподобный паук.', likes: 120, timestamp: '3m ago' },
        { id: 'c3', parentId: null, author: 'Vox', avatar: 'https://static.wikia.nocookie.net/hazbinhotel/images/c/c2/Vox_App.png', content: 'Твое время ушло, старик. Будущее за экранами.', likes: -50, timestamp: '1m ago' }
    ]
  },
  {
    id: 'p2',
    communityId: 'overlords',
    author: 'Velvette',
    avatar: 'https://static.wikia.nocookie.net/hazbinhotel/images/e/e5/Velvette_profile.png',
    title: '#VeesMeeting: Полный провал показа мод',
    content: 'Если я увижу еще одно скучное пальто, я закричу. @Carmilla научи своих дочерей одеваться.',
    likes: 8900,
    replies: 0,
    image: 'https://i.pinimg.com/736x/d3/5a/52/d35a522147759987c661f4339600988c.jpg',
    tags: ['Fashion', 'Rant', 'Vees'],
    timestamp: '2024-05-20T14:00:00Z',
    comments: []
  },
  {
    id: 'p3',
    communityId: 'imp',
    author: 'Blitzo',
    avatar: 'https://upload.wikimedia.org/wikipedia/en/0/04/Blitzo_Helluva_Boss.png',
    title: 'РАСПРОДАЖА ОРУЖИЯ! ИЩЕМ КЛИЕНТОВ!',
    content: 'Если у вас есть бывшая, которую нужно убрать, или босс, который вас бесит - звоните в I.M.P! Скидки 50% если цель - клоун.',
    likes: 42,
    replies: 0,
    tags: ['Business', 'Murder', 'Horses'],
    timestamp: '2024-05-21T09:00:00Z',
    comments: []
  },
  {
    id: 'p4',
    communityId: 'tech',
    author: 'Vox',
    avatar: 'https://static.wikia.nocookie.net/hazbinhotel/images/c/c2/Vox_App.png',
    title: 'VoxTek Drone v7.0 Update Log',
    content: 'Improved surveillance range by 500%. Now with automated soul-tracking algorithms. Trust us with your safety.',
    likes: 15000,
    replies: 0,
    tags: ['Tech', 'Update', 'TrustUs'],
    timestamp: '2024-05-21T10:30:00Z',
    comments: []
  }
];

// --- DATABASE INTERFACE ---

interface DB {
    users: UserProfile[];
    posts: ForumPost[];
    episodes: Episode[];
    communities: Community[];
    currentUser: string | null; // username
}

const DB_KEY = 'HELLS_HUB_DB_V3'; // Bumped version

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to format time
const formatTime = (isoDate: string) => {
    try {
        const date = new Date(isoDate);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (isNaN(diffMins)) return isoDate;

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    } catch (e) {
        return isoDate;
    }
}

class BackendService {
    private db: DB;

    constructor() {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            this.db = JSON.parse(stored);
            if (!this.db.episodes) this.db.episodes = SEED_EPISODES;
            // Merge seed posts if needed or just keep DB ones. For dev, we re-seed if empty
            if (!this.db.posts || this.db.posts.length === 0) this.db.posts = SEED_POSTS;
            this.db.communities = SEED_COMMUNITIES;
        } else {
            this.db = {
                users: [],
                posts: SEED_POSTS,
                episodes: SEED_EPISODES,
                communities: SEED_COMMUNITIES,
                currentUser: null
            };
            this.save();
        }
    }

    private save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    }

    // --- AUTH & USERS ---

    async login(username: string): Promise<UserProfile> {
        await delay(500);
        let user = this.db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (!user) {
            user = {
                username: username,
                avatar: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
                bio: 'New soul in Hell.',
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                watchedEpisodes: [],
                ratings: {},
                reviews: []
            };
            this.db.users.push(user);
        }
        
        this.db.currentUser = user.username;
        this.save();
        return user;
    }

    async logout(): Promise<void> {
        await delay(200);
        this.db.currentUser = null;
        this.save();
    }

    async getCurrentUser(): Promise<UserProfile | null> {
        await delay(200);
        if (!this.db.currentUser) return null;
        return this.db.users.find(u => u.username === this.db.currentUser) || null;
    }

    async getUserProfile(username: string): Promise<UserProfile | null> {
        await delay(300);
        const user = this.db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (user) return user;

        // Generate mock profile if looking up a seed user (like RadioDemon) who hasn't logged in
        const seedUsers = ['RadioDemon', 'Vox', 'Velvette', 'Blitzo', 'AngelDust'];
        if (seedUsers.includes(username)) {
             return {
                username: username,
                avatar: this.db.posts.find(p => p.author === username)?.avatar || `https://ui-avatars.com/api/?name=${username}`,
                bio: 'Prominent figure in Hell. Too busy for bio.',
                joinedDate: 'Since the beginning',
                watchedEpisodes: [],
                ratings: {},
                reviews: []
             }
        }

        return null;
    }

    async updateUserProfile(username: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        await delay(500);
        const index = this.db.users.findIndex(u => u.username === username);
        if (index === -1) throw new Error("User not found");

        this.db.users[index] = { ...this.db.users[index], ...updates };
        this.save();
        return this.db.users[index];
    }

    // --- EPISODES ---

    async getEpisodes(): Promise<Episode[]> {
        await delay(300);
        return this.db.episodes;
    }

    async markEpisodeWatched(username: string, episodeId: string): Promise<void> {
        await delay(200);
        const user = this.db.users.find(u => u.username === username);
        if (user && !user.watchedEpisodes.includes(episodeId)) {
            user.watchedEpisodes.push(episodeId);
            this.save();
        }
    }

    async rateEpisode(username: string, userAvatar: string, episodeId: string, rating: number, commentText: string): Promise<Review> {
        await delay(400);
        const user = this.db.users.find(u => u.username === username);
        if (user) {
            user.ratings[episodeId] = rating;
        }

        const episode = this.db.episodes.find(e => e.id === episodeId);
        if (!episode) throw new Error("Episode not found");

        const newReview: Review = {
            id: Date.now().toString(),
            user: username,
            userAvatar: userAvatar,
            rating,
            comment: commentText,
            timestamp: 'Just now'
        };

        episode.reviews.unshift(newReview);
        this.save();
        return newReview;
    }

    // --- FORUM ---

    async getCommunities(): Promise<Community[]> {
        return this.db.communities;
    }

    async getPosts(): Promise<ForumPost[]> {
        await delay(400);
        // Return raw posts
        return this.db.posts.map(p => ({
            ...p,
            timestamp: formatTime(p.timestamp),
            userVote: 0 // Reset local vote state on refresh
        }));
    }

    async createPost(post: ForumPost): Promise<ForumPost> {
        await delay(500);
        // Set timestamp to ISO for sorting
        const newPost = { ...post, timestamp: new Date().toISOString() };
        this.db.posts.unshift(newPost);
        this.save();
        // Return formatted
        return { ...newPost, timestamp: 'Just now' };
    }

    async addComment(postId: string, comment: Comment): Promise<ForumPost> {
        await delay(300);
        const post = this.db.posts.find(p => p.id === postId);
        if (!post) throw new Error("Post not found");
        
        if (!post.comments) post.comments = [];
        post.comments.push(comment);
        post.replies = post.comments.length;
        
        this.save();
        // Format timestamp for display return
        return { ...post, timestamp: formatTime(post.timestamp) };
    }

    async votePost(postId: string, amount: number): Promise<number> {
        await delay(100);
        const post = this.db.posts.find(p => p.id === postId);
        if (!post) throw new Error("Post not found");
        
        post.likes += amount;
        this.save();
        return post.likes;
    }

    async voteComment(postId: string, commentId: string, amount: number): Promise<void> {
        await delay(100);
        const post = this.db.posts.find(p => p.id === postId);
        if (!post || !post.comments) return;

        const findAndUpdate = (comments: Comment[]): boolean => {
            for (const c of comments) {
                if (c.id === commentId) {
                    c.likes += amount;
                    return true;
                }
                // Since we store flat list in DB but tree in UI, backend has flat list.
                // However, if we were using recursive structure in DB, we'd recurse here.
                // Our current mock DB stores comments as a flat array in the post object.
            }
            return false;
        };

        const comment = post.comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes += amount;
            this.save();
        }
    }
}

export const backend = new BackendService();
