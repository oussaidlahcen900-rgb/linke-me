"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar"; // Reuse or create new AdminSidebar

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (profile?.role !== "admin") {
                router.push("/feed"); // Redirect non-admins to feed
            }
        }
    }, [user, profile, loading, router]);

    if (loading || !profile || profile.role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600 font-medium">Verifying Admin Access...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            {/* For Admin, we might want a slightly different layout or sidebar */}
            {/* reusing Sidebar for now but maybe adding an 'Admin' badge or link */}
            <Sidebar />
            <div className="md:pl-64">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
                    <div className="text-sm text-slate-500">
                        Logged in as <span className="font-semibold text-blue-600">{user?.displayName}</span>
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
