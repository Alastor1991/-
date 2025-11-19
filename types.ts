
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

export interface ForumPost {
  id: string;
  communityId: string; // Linked community
  author: string;
  avatar: string;
  title: string;
  content: string;
  image?: string; // Optional post image
  likes: number;
  replies: number;
  tags: string[];
  timestamp: string;
  comments?: Comment[];
  userVote?: number; // 0, 1, or -1 (Local state helper)
}

export interface Review {
  id: string;
  user: string;
  userAvatar?: string;
  rating: number; // 1-10
  comment: string;
  timestamp: string;
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
  reviews: Review[];
}

export interface UserProfile {
  username: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  watchedEpisodes: string[]; // List of Episode IDs
  ratings: Record<string, number>; // EpisodeID -> Rating
  reviews: Review[];
}
