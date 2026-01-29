import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Finds an existing conversation between two users or creates a new one.
 * Returns the conversation ID.
 */
export async function startConversation(currentUid: string, targetUid: string): Promise<string> {
    if (!currentUid || !targetUid) throw new Error("Missing user IDs");
    if (currentUid === targetUid) throw new Error("Cannot message yourself");

    // 1. Check for existing conversation
    // Note: Firestore doesn't support "array-contains-all" directly on a single field with other filters easily in all SDKs,
    // but we can query where 'participants' array-contains currentUid, then filter in memory for targetUid.
    // OR since it's just 2 people, we can check if it exists.

    // A better schema would be to have a subcollection or a composite key, but with the current schema:
    const conversationsRef = collection(db, "conversations");
    const q = query(conversationsRef, where("participants", "array-contains", currentUid));

    const snapshot = await getDocs(q);
    const existingConvo = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(targetUid);
    });

    if (existingConvo) {
        return existingConvo.id;
    }

    // 2. Create new conversation if none exists
    // fetch target user details for cache if needed, or just store basic info
    // For now, we just create the basic document structure
    const newConvoData = {
        participants: [currentUid, targetUid],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        unreadCount: {
            [currentUid]: 0,
            [targetUid]: 0
        },
        createdAt: serverTimestamp()
    };

    const newDocRef = await addDoc(conversationsRef, newConvoData);
    return newDocRef.id;
}
