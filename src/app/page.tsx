"use client";

import Link from "next/link";
import { Users, Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import BackgroundSlider from "@/components/BackgroundSlider";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/GradientText";

export default function LandingPage() {
  return (
    <div className="flex flex-col h-screen relative text-slate-800 font-sans overflow-hidden bg-slate-50">
      {/* Dynamic Background with Blobs */}
      {/* Hero Background - Futuristic DNA Theme */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-background.jpg')` }}
      ></div>

      {/* Overlays for readability and mood - Lighter to show image */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/50"></div>

      {/* Dark Overlay for Text Clarity - slightly lighter for "alive" feel */}
      <div className="absolute inset-0 bg-slate-900/10 z-0 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass px-6 py-4 flex items-center justify-between border-b border-white/10 transition-all duration-300 bg-slate-900/20">
        <div className="text-2xl font-bold tracking-tight">
          <GradientText from="from-white" via="via-blue-100" to="to-blue-300" className="drop-shadow-md">
            LinkeMe
          </GradientText>
        </div>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-full transition hover-bounce inline-block">
            Login
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600/90 backdrop-blur-md rounded-full hover:bg-blue-600 transition shadow-lg hover:shadow-blue-500/30 btn-glow border border-white/20 hover-bounce inline-block"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 w-full h-full pb-8 md:pb-12 pt-20">

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full mb-12"
          >
            <div className="glass p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md bg-slate-900/30">
              <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-xl sm:text-7xl leading-tight mb-6">
                Connect locally. <br />
                <GradientText from="from-cyan-300" via="via-blue-200" to="to-indigo-300" className="drop-shadow-sm">
                  Grow globally.
                </GradientText>
              </h1>

              <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md mb-8">
                The social platform for your city. Find jobs, join trainings, and discover services right next door.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/signup"
                  className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] transition-all transform hover-bounce overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="flex items-center gap-2 relative z-10">
                    Join Your Community
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/feed"
                  className="px-8 py-4 text-white font-semibold glass rounded-full hover:bg-white/20 transition-all border border-white/30 shadow-lg hover:shadow-white/10 backdrop-blur-md hover:scale-105"
                >
                  Explore as Guest
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid - Now properly flowed in document */}
        <div className="w-full px-4 pb-6 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
            <FeatureCard
              icon={Briefcase}
              title="Local Jobs"
              desc="Opportunities nearby."
              delay={0.2}
              color="blue"
            />
            <FeatureCard
              icon={Users}
              title="Community"
              desc="Connect with neighbors."
              delay={0.4}
              color="purple"
            />
            <FeatureCard
              icon={GraduationCap}
              title="Training"
              desc="Local workshops."
              delay={0.6}
              color="emerald"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

import { ElementType } from "react";

function FeatureCard({ icon: Icon, title, desc, delay, color }: { icon: ElementType, title: string, desc: string, delay: number, color: string }) {
  const colorClasses = {
    blue: "from-blue-50 to-white text-blue-600 border-blue-100 group-hover:border-blue-200",
    purple: "from-purple-50 to-white text-purple-600 border-purple-100 group-hover:border-purple-200",
    emerald: "from-emerald-50 to-white text-emerald-600 border-emerald-100 group-hover:border-emerald-200"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className="group glass-card p-4 flex flex-col items-center text-center hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 border border-white/40"
    >
      <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mb-2 shadow-sm border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm text-slate-600 leading-snug">{desc}</p>
    </motion.div>
  );
}
