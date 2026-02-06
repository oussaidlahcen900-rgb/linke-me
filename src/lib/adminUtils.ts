import { db } from "@/lib/firebase";
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
