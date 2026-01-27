export const APP_NAME = "Linke-Me";

export const SOUNDS = {
    // Short "pop" sound for notifications/interactions
    POP: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU", // Placeholder - simplified for now
    // A longer real base64 would be needed for a good sound, but this prevents crashes.
    // Ideally we'd load a file from /sounds/pop.mp3
};

export const ROUTES = {
    HOME: "/",
    FEED: "/feed",
    JOBS: "/jobs",
    SERVICES: "/services",
    LEARNING: "/learning",
    CHAT: "/chat",
    PROFILE: "/profile",
    LOGIN: "/login",
    SIGNUP: "/signup",
};

export const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest";
