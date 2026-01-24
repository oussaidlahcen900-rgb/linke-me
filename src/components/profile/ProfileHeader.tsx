"use client";

import { UserProfile } from "@/types";
import { MapPin, Calendar, Edit3, Briefcase } from "lucide-react";

interface ProfileHeaderProps {
    profile: UserProfile;
    postCount: number;
}

export default function ProfileHeader({ profile, postCount }: ProfileHeaderProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            {/* Cover Image Placeholder */}
            <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>

            <div className="px-6 pb-6">
                <div className="flex justify-between items-start">
                    {/* Avatar */}
                    <div className="-mt-12">
                        <img
                            src={profile.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile.uid}
                            alt={profile.displayName}
                            className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md object-cover"
                        />
                    </div>

                    {/* Edit Button */}
                    <button className="mt-4 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>

                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-slate-900">{profile.displayName || "User"}</h1>
                    <p className="text-lg text-slate-600 mt-1">{profile.headline || "No headline yet"}</p>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                        {profile.city && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{profile.city}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{profile.role || "Member"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined recently</span>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex gap-8 mt-6 pt-6 border-t border-slate-50">
                        <div>
                            <span className="block font-bold text-slate-900 text-lg">{postCount}</span>
                            <span className="text-sm text-slate-500">Posts</span>
                        </div>
                        <div>
                            <span className="block font-bold text-slate-900 text-lg">0</span>
                            <span className="text-sm text-slate-500">Followers</span>
                        </div>
                        <div>
                            <span className="block font-bold text-slate-900 text-lg">0</span>
                            <span className="text-sm text-slate-500">Following</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
