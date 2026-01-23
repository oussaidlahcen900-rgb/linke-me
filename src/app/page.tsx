"use client";

import Link from "next/link";
import { Users, Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import BackgroundSlider from "@/components/BackgroundSlider";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative text-slate-800 font-sans">
      {/* Dynamic Background */}
      <BackgroundSlider />

      {/* Dark Overlay for Text Clarity */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass px-6 py-3 flex items-center justify-between border-b border-white/10">
        <div className="text-xl font-bold text-white drop-shadow-md">
          Linke<span className="text-blue-200">Me</span>
        </div>
        <div className="space-x-3">
          <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white transition">
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600/90 backdrop-blur-md rounded-full hover:bg-blue-600 transition shadow-sm border border-white/20"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 relative z-10 w-full">
        {/* Soft bottom fade to white */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 to-transparent -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-6"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-6xl leading-tight">
            Connect locally. <br />
            <span className="text-blue-200">
              Grow globally.
            </span>
          </h1>
          <p className="text-lg text-white/90 max-w-xl mx-auto drop-shadow-md font-medium">
            The social platform for your city. Find jobs, training, and services right next door.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="btn-primary flex items-center gap-2 text-base shadow-lg"
            >
              Join Your Community <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/feed"
              className="px-6 py-2.5 text-base font-semibold text-white glass rounded-full hover:bg-white/20 transition-all border border-white/30 shadow-md"
            >
              Explore as Guest
            </Link>
          </div>
        </motion.div>

        {/* Features Grid - moved up slightly and made more compact */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full px-4">
          <FeatureCard
            icon={Briefcase}
            title="Local Jobs"
            desc="Find opportunities in your area without the noise of global listings."
            delay={0.1}
          />
          <FeatureCard
            icon={Users}
            title="Community"
            desc="Network with professionals and neighbors in your specific city."
            delay={0.2}
          />
          <FeatureCard
            icon={GraduationCap}
            title="Training"
            desc="Discover workshops, courses, and coaches nearby."
            delay={0.3}
          />
        </div>
      </main>

      <footer className="py-6 text-center text-slate-500 text-xs bg-slate-50 border-t border-slate-200">
        &copy; {new Date().getFullYear()} Linke-Me. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-6 flex flex-col items-center text-center hover:border-blue-400/50"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-white text-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-blue-100">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
