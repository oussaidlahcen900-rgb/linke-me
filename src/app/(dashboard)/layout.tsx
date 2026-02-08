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
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 mx-auto max-w-7xl w-full px-0 sm:px-4 lg:px-6 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
