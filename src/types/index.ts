import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    displayName?: string;
    email?: string;
    role?: 'owner' | 'admin' | 'user'; // Hierarchy: Owner > Admin > User
    isVerified?: boolean; // Blue checkmark status
    city?: string;
    photoURL?: string;
    headline?: string;
    bio?: string;
    skills?: string[];
    experience?: string;
    socialLinks?: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        website?: string;
    };
    friends?: string[]; // Array of UIDs
    friendRequests?: {
        uid: string;
        status: 'pending' | 'accepted' | 'rejected';
        timestamp: Timestamp | any;
    }[];
    hasSeenWelcome?: boolean;
}

export interface Post {
    id: string;
    text: string;
    imageUrl?: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorVerified?: boolean; // Snapshot of verification status
    likes: number;
    createdAt: Timestamp | any; // Firestore Timestamp
}
export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
    description: string;
    authorId: string;
    authorVerified?: boolean; // Snapshot
    postedAt: Timestamp | any; // Firestore Timestamp or string for display
    contactEmail?: string;
}

export interface Service {
    id: string;
    title: string;
    providerName: string;
    description: string;
    category: string;
    price: string;
    location: string;
    contactPhone: string;
    authorId: string;
    postedAt: Timestamp | any;
}

export interface Course {
    id: string;
    title: string;
    provider: string;
    description: string;
    location: string;
    date?: string;
    duration?: string;
    price?: string;
    authorId: string;
    createdAt: Timestamp | any;
}

export interface Message {
    id: string;
    text: string;
    imageUrl?: string;
    senderId: string;
    createdAt: Timestamp | any;
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: string[]; // [uid1, uid2]
    lastMessage: string;
    lastMessageAt: Timestamp | any;
    unreadCount: Record<string, number>; // { uid: count }
    // Joined data for display
    otherUser?: {
        displayName: string;
        photoURL: string;
        uid: string;
    };
}
