export interface UserProfile {
    uid: string;
    displayName?: string;
    email?: string;
    role?: string; // "admin" | "moderator" | "user"
    city?: string;
    photoURL?: string;
    headline?: string;
    bio?: string;
    socialLinks?: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        website?: string;
    };
}

export interface Post {
    id: string;
    text: string;
    imageUrl?: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    likes: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: any; // Firestore Timestamp
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postedAt: any; // Firestore Timestamp or string for display
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postedAt: any;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: any;
}

export interface Message {
    id: string;
    text: string;
    senderId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: any;
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: string[]; // [uid1, uid2]
    lastMessage: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastMessageAt: any;
    unreadCount: Record<string, number>; // { uid: count }
    // Joined data for display
    otherUser?: {
        displayName: string;
        photoURL: string;
        uid: string;
    };
}
