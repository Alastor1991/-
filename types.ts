
export enum Universe {
  HAZBIN = 'Hazbin Hotel',
  HELLUVA = 'Helluva Boss'
}

export interface Character {
  id: string;
  name: string;
  universe: Universe;
  role: string;
  imageUrl: string;
}

export interface WikiData {
  description: string;
  abilities: string[];
  personality: string;
  trivia: string[];
}

export interface Community {
    id: string;
    name: string; // e.g. "r/Overlords"
    description: string;
    icon: string;
    color: string;
    creatorId?: string; // Owner of the community
    moderators?: string[]; // List of user IDs with mod powers
    memberCount?: number;
}

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export type PostType = 'text' | 'image' | 'link' | 'poll';

export interface ForumPost {
  id: string;
  communityId: string; // Linked community
  author: string;
  avatar: string;
  title: string;
  content: string;
  type: PostType;
  
  // Optional fields based on type
  image?: string; 
  linkUrl?: string;
  pollOptions?: PollOption[];
  pollTotalVotes?: number;
  userPollSelection?: string; // ID of option user voted for

  // Flags
  isNsfw: boolean;
  isSpoiler: boolean;
  isPinned: boolean;

  likes: number;
  replies: number;
  tags: string[];
  timestamp: string;
  comments?: Comment[];
  userVote?: number; // 0, 1, or -1 (Local state helper)
  isSaved?: boolean; // Local helper
  awards?: number; // Count of "Soul" awards
  awardedBy?: string[]; // List of usernames who awarded this post
}

export interface Comment {
  id: string;
  parentId?: string | null; // For nested comments
  author: string;
  avatar: string;
  content: string;
  likes: number;
  timestamp: string;
  isOp?: boolean;
  children?: Comment[]; // For UI rendering of threads
}

// Used for Episode Reviews (Rating only or Rating+Comment legacy)
export interface Review {
  id: string;
  user: string;
  userAvatar?: string;
  rating: number; // 1-10
  comment?: string; // Optional now
  timestamp: string;
}

export interface EpisodeComment {
    id: string;
    user: string;
    userAvatar: string;
    content: string;
    timestamp: string;
    likes: number;
}

export interface Episode {
  id: string;
  universe: Universe;
  season: number;
  number: number;
  title: string;
  thumbnail: string;
  videoUrl: string; // Embed URL
  synopsis: string;
  reviews: Review[]; // Only strictly ratings/reviews
  comments?: EpisodeComment[]; // Separate comment stream
}

export interface Notification {
    id: string;
    type: 'reply' | 'award' | 'system';
    message: string;
    linkId?: string; // Post ID to jump to
    read: boolean;
    timestamp: string;
}

export interface UserProfile {
  username: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  watchedEpisodes: string[]; // List of Episode IDs
  ratings: Record<string, number>; // EpisodeID -> Rating
  reviews: Review[];
  joinedCommunities: string[]; // IDs of communities
  savedPostIds: string[];
  notifications?: Notification[];
}
