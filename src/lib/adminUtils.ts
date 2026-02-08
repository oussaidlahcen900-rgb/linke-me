import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { collection, addDoc, serverTimestamp, getDocs, updateDoc, doc, deleteDoc, query, orderBy, limit } from "firebase/firestore";

const AVG_IMAGE_SIZE_MB = 0.3; // 300KB approx compressed
const AVG_DB_RECORD_MB = 0.005; // 5KB

export async function getStorageStats() {
    try {
        // Count posts with images
        const postsSnap = await getDocs(collection(db, "posts"));
        const posts = postsSnap.docs.map(d => d.data());
        const postsWithImage = posts.filter(p => p.imageUrl).length;

        // Count users (avatars)
        const usersSnap = await getDocs(collection(db, "users"));
        const userCount = usersSnap.size;

        const imagesSize = (postsWithImage * AVG_IMAGE_SIZE_MB) + (userCount * 0.05); // Posts + Avatars (smaller)
        const otherSize = (posts.length * AVG_DB_RECORD_MB) + (userCount * AVG_DB_RECORD_MB);

        // Mocking Videos/Free for now as we don't have video uploads yet
        const videosSize = 0;
        const totalQuota = 1024; // 1GB free tier assumption
        const free = totalQuota - (imagesSize + otherSize + videosSize);

        return [
            { name: 'Images', value: parseFloat(imagesSize.toFixed(1)) },
            { name: 'Videos', value: videosSize },
            { name: 'Other', value: parseFloat(otherSize.toFixed(1)) },
            { name: 'Free', value: parseFloat(free.toFixed(1)) }
        ];
    } catch (error) {
        console.error("Failed to calc storage:", error);
        return [
            { name: 'Images', value: 0 },
            { name: 'Videos', value: 0 },
            { name: 'Other', value: 0 },
            { name: 'Free', value: 1024 }
        ];
    }
}

// ... existing storage stats code ...

interface ChartData {
    name: string;
    users: number;
    posts: number;
}

export const getAnalyticsData = async (): Promise<ChartData[]> => {
    // In a real app, you would aggregate this data via Cloud Functions to avoid heavy client-side reads.
    // For this demo, we'll simulate the data or fetch a small subset.

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    return last7Days.map(day => ({
        name: day,
        users: Math.floor(Math.random() * 50) + 10,
        posts: Math.floor(Math.random() * 100) + 20,
    }));
};

export const getRecentUsers = async (): Promise<UserProfile[]> => {
    try {
        const q = query(
            collection(db, "users"),
            // orderBy("createdAt", "desc"), // Requires index
            limit(5)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
        console.error("Error fetching recent users:", error);
        return [];
    }
};

export const getMockStorageStats = async () => { // Renamed to avoid conflict
    // Mocking storage stats as Firebase Client SDK doesn't support getMetadata for all files easily
    // In production, use Cloud Functions to track usage.
    return {
        used: 4.2, // GB
        total: 5.0, // GB
        percentage: 84
    };
};

// --- User Management ---
export async function getAllUsers() {
    try {
        const snap = await getDocs(collection(db, "users"));
        return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    } catch (e) { console.error(e); return []; }
}

export async function toggleBanUser(uid: string, currentStatus: boolean) {
    try {
        await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
        return true;
    } catch (e) { console.error(e); return false; }
}

export async function verifyUser(uid: string) {
    try {
        await updateDoc(doc(db, "users", uid), { isVerified: true });
        return true;
    } catch (e) { console.error(e); return false; }
}

// --- Content Moderation ---
export async function getAllPosts() {
    try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error(e); return []; }
}

export async function deletePostAdmin(postId: string) {
    try {
        await deleteDoc(doc(db, "posts", postId));
        return true;
    } catch (e) { console.error(e); return false; }
}

// --- Reports ---
export async function getReports() {
    try {
        // Assuming reports collection exists
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error("Reports err", e); return []; }
}

export async function resolveReport(reportId: string) {
    try {
        await deleteDoc(doc(db, "reports", reportId));
        return true;
    } catch (e) { return false; }
}

export async function logAdminAction(adminId: string, actionType: string, targetId: string, details: string = "") {
    try {
        await addDoc(collection(db, "adminLogs"), {
            adminId,
            actionType,
            targetId,
            details,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to log admin action", error);
    }
}
