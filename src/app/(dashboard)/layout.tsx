"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { UseWelcomeSound } from "@/hooks/useWelcomeSound";
import { Loader2 } from "lucide-react";
import { WavingMascot } from "@/components/ui/WavingMascot";
import WelcomeDialog from "@/components/onboarding/WelcomeDialog";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return null; // Prevent showing protected content while redirecting
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <UseWelcomeSound />
            <WelcomeDialog />
            <WavingMascot />
            <Sidebar />
            <div className="md:pl-64">
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
