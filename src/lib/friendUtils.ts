import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Sends a friend request to a target user.
 */
export async function sendFriendRequest(currentUid: string, targetUid: string) {
    if (!currentUid || !targetUid) return;

    const targetRef = doc(db, "users", targetUid);

    // Add to target's friendRequests
    await updateDoc(targetRef, {
        friendRequests: arrayUnion({
            uid: currentUid,
            status: 'pending',
            timestamp: new Date().toISOString() // Using string for easy storage/parsing
        })
    });
}

/**
 * Accepts a friend request.
 */
export async function acceptFriendRequest(currentUid: string, targetUid: string) {
    if (!currentUid || !targetUid) return;

    const currentUserRef = doc(db, "users", currentUid);
    const targetUserRef = doc(db, "users", targetUid);

    // 1. Add to each other's friend list
    await updateDoc(currentUserRef, {
        friends: arrayUnion(targetUid)
    });
    await updateDoc(targetUserRef, {
        friends: arrayUnion(currentUid)
    });

    // 2. Remove the request from current user's list (optional clean up logic)
    // Complex with arrayRemove for objects, easier to read-modify-write or just filter
    const userSnap = await getDoc(currentUserRef);
    if (userSnap.exists()) {
        const data = userSnap.data();
        const newRequests = (data.friendRequests || []).filter((req: any) => req.uid !== targetUid);
        await updateDoc(currentUserRef, {
            friendRequests: newRequests
        });
    }
}

/**
 * Checks if two users are friends.
 */
export async function checkFriendship(uid1: string, uid2: string): Promise<boolean> {
    try {
        const docRef = doc(db, "users", uid1);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const data = snap.data();
            return data.friends?.includes(uid2) || false;
        }
    } catch (e) {
        console.error("Error checking friendship", e);
    }
    return false;
}

/**
 * Removes a friend connection.
 */
export async function removeFriend(uid1: string, uid2: string) {
    if (!uid1 || !uid2) return;

    const user1Ref = doc(db, "users", uid1);
    const user2Ref = doc(db, "users", uid2);

    await updateDoc(user1Ref, {
        friends: arrayRemove(uid2)
    });
    await updateDoc(user2Ref, {
        friends: arrayRemove(uid1)
    });
}
