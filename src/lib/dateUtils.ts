import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function formatRelativeTime(date: any): string {
    if (!date) return "Just now";

    let targetDate: Date;

    if (date instanceof Timestamp) {
        targetDate = date.toDate();
    } else if (date instanceof Date) {
        targetDate = date;
    } else if (typeof date === "number") {
        targetDate = new Date(date);
    } else if (typeof date.toDate === "function") {
        // Handle object that looks like a timestamp
        targetDate = date.toDate();
    } else {
        return "Just now";
    }

    try {
        return formatDistanceToNow(targetDate, { addSuffix: true });
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Just now";
    }
}
