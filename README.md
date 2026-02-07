# Linke-Me | Local Social Network 🌍

**Connect locally. Grow globally.**

Linke-Me is a modern, localized social platform designed to connect professionals, neighbors, and businesses within their city. It combines the professional networking of LinkedIn with the hyper-local community feel of Nextdoor.

![Linke-Me Banner](/public/icon.svg)

## 🚀 Features

### 1. **Smart Social Feed** 📱
- **Localized Content**: Posts are filtered by your city.
- **Rich Media**: Share photos with smart compression (5MB -> 50KB!).
- **Interactions**: Like, Comment, and Share.
- **Friend System**: Send requests, accept connections, and grow your network.

### 2. **Advanced Chat System** 💬
- **Real-time Messaging**: Instant delivery.
- **Typing Indicators**: See when others are typing (User is typing...).
- **Read Receipts**: Double-check marks (✓✓) when messages are read.
- **Image Sharing**: Send compressed images instantly in chat.

### 3. **Professional Networking** 💼
- **Jobs Board**: Post and find local job opportunities.
- **Service Marketplace**: Offer or find local services (Plumbing, Tuition, etc.).
- **Learning Center**: Share knowledge and mini-courses.

### 4. **Magic Avatars** 🎨
- **Profile Customization**: Upload your own photo or...
- **AI Generator**: Type any name to generate a unique avatar from 10+ styles (Pixel, Anime, etc.).

### 5. **Admin Power** 🛡️
- **Dashboard**: Track user growth and storage usage with charts.
- **Moderation**: Report and delete inappropriate content.
- **User Management**: Ban/Unban users.

### 6. **Global Ready** 🌐
- **Multi-language**: English, French, Arabic, Darija.
- **RTL Support**: Native Right-to-Left layout for Arabic/Darija.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4) + Framer Motion
- **Backend & Auth**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- A Firebase Project (with Auth, Firestore, and Storage enabled)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/linke-me.git
    cd linke-me
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env.local` file in the root:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 📱 Mobile (PWA)
Linke-Me is a Progressive Web App!
- **Install**: Click "Add to Home Screen" on your mobile browser.
- **Native Feel**: Runs standalone without browser bars.
- **Responsive**: Adjusted specific viewports for optimal mobile typing.

## License
MIT
