import CreatePost from "@/components/feed/CreatePost";
import PostList from "@/components/feed/PostList";
import { User, MapPin, Briefcase } from "lucide-react";

export default function FeedPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
            {/* Sidebar - Profile Summary */}
            <aside className="hidden md:block w-72 space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-3 overflow-hidden">
                        {/* Placeholder for User Avatar */}
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="font-bold text-lg text-slate-800">Guest User</h2>
                    <p className="text-sm text-slate-500 mb-4">Software Engineer</p>

                    <div className="text-left space-y-2 text-sm text-slate-600 border-t border-slate-50 pt-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Casablanca, Morocco</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>Open to work</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content - Feed */}
            <main className="flex-1 max-w-2xl">
                <CreatePost />
                <PostList />
            </main>

            {/* Right Sidebar - Suggestions (Optional placeholder) */}
            <aside className="hidden lg:block w-72">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-700 mb-3">Suggested for you</h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100" />
                                <div>
                                    <p className="text-sm font-medium text-slate-800">Local Business {i}</p>
                                    <p className="text-xs text-slate-500">Promoted</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}
