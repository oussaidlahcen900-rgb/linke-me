"use client";

import { MapPin, Mail, Calendar, Edit2 } from "lucide-react";

interface ProfileProps {
    displayName: string;
    email: string;
    city: string;
    photoURL: string;
    role: string;
    bio?: string;
    joinedAt?: string;
    onEdit: () => void;
}

export default function ProfileHeader({ profile }: { profile: ProfileProps }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            {/* Cover Image Placeholder */}
            <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>

            <div className="px-6 pb-6">
                <div className="flex justify-between items-end -mt-12 mb-4">
                    <img
                        src={profile.photoURL}
                        alt={profile.displayName}
                        className="w-24 h-24 rounded-full border-4 border-white bg-white object-cover shadow-sm"
                    />
                    <button
                        onClick={profile.onEdit}
                        className="mb-1 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
                    >
                        <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{profile.displayName}</h1>
                    <p className="text-blue-600 font-medium">{profile.role}</p>
                </div>

                {profile.bio && (
                    <p className="mt-4 text-slate-600 max-w-2xl">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-6 mt-6 text-sm text-slate-500 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {profile.city}
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {profile.email}
                    </div>
                    {profile.joinedAt && (
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Joined {profile.joinedAt}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
