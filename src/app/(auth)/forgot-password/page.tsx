"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            await sendPasswordResetEmail(auth, email);
            setStatus("success");
        } catch (error: any) {
            console.error("Reset Password Error:", error);
            setStatus("error");
            if (error.code === 'auth/user-not-found') {
                setErrorMessage("No account found with this email.");
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage("Please enter a valid email address.");
            } else {
                setErrorMessage("Failed to send reset link. Please try again.");
            }
        }
    };

    return (
        <div className="w-full bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                <p className="text-slate-500 mt-2">Enter your email to receive a reset link</p>
            </div>

            {status === "success" ? (
                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Check your email</h3>
                        <p className="text-slate-500 mt-2 text-sm">
                            We have sent a password reset link to <br />
                            <span className="font-medium text-slate-900">{email}</span>
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition"
                    >
                        Back to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleReset} className="space-y-5">
                    {status === "error" && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {errorMessage}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === "loading" ? <Loader2 className="animate-spin h-5 w-5" /> : "Send Reset Link"}
                    </button>

                    <div className="text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}
