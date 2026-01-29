import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Linke-Me | Local Social Network",
  description: "Connect with professionals, jobs, and services in your city.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LinkeMe",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming on inputs, more app-like
};

import { AuthProvider } from "@/context/AuthContext";
import { WavingMascot } from "@/components/ui/WavingMascot";
import StartupSound from "@/components/ui/StartupSound";
import InstallPrompt from "@/components/pwa/InstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-slate-50 text-slate-900`}>
        <AuthProvider>
          {children}
          <WavingMascot />
          <StartupSound />
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
