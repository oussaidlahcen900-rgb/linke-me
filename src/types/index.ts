export interface UserProfile {
    uid: string;
    displayName?: string;
    email?: string;
    role?: string; // "admin" | "moderator" | "user"
    city?: string;
    photoURL?: string;
    headline?: string;
    bio?: string;
}

export interface Post {
    id: string;
    text: string;
    imageUrl?: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    likes: number;
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
    postedAt: any; // Firestore Timestamp or string for display
    contactEmail?: string;
}
