import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Submits a report for a piece of content.
 * @param postId The ID of the post being reported
 * @param reporterId The UID of the user reporting it
 * @param reason The reason for the report (optional)
 */
export async function submitReport(postId: string, reporterId: string, reason: string = "Inappropriate content") {
    try {
        await addDoc(collection(db, "reports"), {
            postId,
            reporterId,
            reason,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error submitting report:", error);
        return false;
    }
}
