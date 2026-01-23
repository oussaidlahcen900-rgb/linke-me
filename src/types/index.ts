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
