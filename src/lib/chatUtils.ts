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

/**
 * Updates the typing status of a user in a conversation.
 */
import { updateDoc, doc } from "firebase/firestore";


export const BOT_ID = "linke-me-bot";

/**
 * Finds an existing conversation with the Bot or creates a new one.
 */
export async function getOrCreateBotConversation(currentUid: string): Promise<string> {
    if (!currentUid) throw new Error("Missing user ID");

    // 1. Check for existing conversation with Bot
    const conversationsRef = collection(db, "conversations");
    const q = query(
        conversationsRef,
        where("participants", "array-contains", currentUid)
    );

    const snapshot = await getDocs(q);
    const existingConvo = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(BOT_ID);
    });

    if (existingConvo) {
        return existingConvo.id;
    }

    // 2. Create new conversation with Bot
    const newConvoData = {
        participants: [currentUid, BOT_ID],
        lastMessage: "Welcome to Linke-Me! 🦊",
        lastMessageAt: serverTimestamp(),
        unreadCount: {
            [currentUid]: 1, // Start with unread welcome
            [BOT_ID]: 0
        },
        createdAt: serverTimestamp(),
        // Add typing field initialization if needed
        typing: {}
    };

    const newDocRef = await addDoc(conversationsRef, newConvoData);

    // Add initial welcome message
    const messagesRef = collection(db, "conversations", newDocRef.id, "messages");
    await addDoc(messagesRef, {
        text: "Hi there! I'm the Linke-Me Mascot. How can I help you today? 👋",
        senderId: BOT_ID,
        createdAt: serverTimestamp(),
        read: false
    });

    return newDocRef.id;
}

export async function setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    if (!conversationId || !userId) return;

    const convoRef = doc(db, "conversations", conversationId);

    // Using dot notation to update nested field in the 'typing' map
    await updateDoc(convoRef, {
        [`typing.${userId}`]: {
            isTyping,
            lastTyped: serverTimestamp()
        }
    });
}

/**
 * Fetches basic user profile data.
 * In a real app, implement caching here.
 */
import { getDoc } from "firebase/firestore";
import { UserProfile } from "@/types";

export async function getUserProfile(uid: string): Promise<Partial<UserProfile> | null> {
    if (!uid) return null;
    if (uid === BOT_ID) {
        return {
            displayName: "Linke-Me Bot 🦊",
            photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=LinkeMe",
            uid: BOT_ID
        };
    }

    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
    return null;
}
export function getBotReply(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes("image") || lower.includes("photo") || lower.includes("picture") || lower.includes("upload")) {
        return "To post an image, click the generic 'Image' icon (🖼️) next to the text input box. You can upload photos to the Feed or in Chats! 📸";
    }

    if (lower.includes("job") || lower.includes("work") || lower.includes("hire")) {
        return "Looking for work? Check out the 'Jobs' tab in the sidebar to specific local opportunities. You can also post a job there! 💼";
    }

    if (lower.includes("friend") || lower.includes("connect") || lower.includes("network")) {
        return "To add a friend, visit their profile and click the 'Add Friend' button. Once they accept, you can chat with them! 🤝";
    }

    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        return "Hello there! I'm the Linke-Me Fox 🦊. Ask me about posting images, finding jobs, or making friends!";
    }

    if (lower.includes("help")) {
        return "I can help with:\n- split Uploading Images\n- Finding Jobs\n- Growing your Network\nJust ask me! 🦊";
    }

    const defaults = [
        "That's interesting! Tell me more. 🦊",
        "I'm learning more about this city every day! 🏙️",
        "Check out the 'Community' tab to see what neighbors are up to.",
        "I'm just a mascot for now, but I try my best to help! 📚",
        "Waving at you! 👋"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}
