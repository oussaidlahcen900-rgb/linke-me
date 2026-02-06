"use client";

import Link from "next/link";
import { Users, Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/GradientText";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { ElementType } from "react";

export default function LandingPage() {
  const { t, direction } = useLanguage();

  return (
    <div className="flex flex-col h-screen relative text-slate-800 font-sans overflow-hidden bg-slate-50" dir={direction}>
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
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold tracking-tight">
            <GradientText from="from-white" via="via-blue-100" to="to-blue-300" className="drop-shadow-md">
              LinkeMe
            </GradientText>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher className="text-white/90 hover:text-white" />

          <div className="space-x-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-full transition hover-bounce inline-block">
              {t('login')}
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600/90 backdrop-blur-md rounded-full hover:bg-blue-600 transition shadow-lg hover:shadow-blue-500/30 btn-glow border border-white/20 hover-bounce inline-block"
            >
              {t('signup')}
            </Link>
          </div>
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
            <div className="glass p-6 md:p-10 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md bg-slate-900/40">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-xl leading-tight mb-4 whitespace-pre-line">
                {t('heroTitle')}
              </h1>

              <p className="text-base md:text-lg text-white/90 max-w-xl mx-auto font-medium leading-relaxed drop-shadow-md mb-8">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/signup"
                  className="group relative px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] transition-all transform hover-bounce overflow-hidden text-sm md:text-base"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="flex items-center gap-2 relative z-10">
                    {t('joinCommunity')}
                    <ArrowRight className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${direction === 'rtl' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                  </span>
                </Link>

              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid - Now properly flowed in document */}
        <div className="w-full px-4 pb-6 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
            <FeatureCard
              icon={Briefcase}
              title={t('cardJobs')}
              desc={t('jobsDesc')}
              delay={0.2}
              color="blue"
            />
            <FeatureCard
              icon={Users}
              title={t('cardCommunity')}
              desc={t('communityDesc')}
              delay={0.4}
              color="purple"
            />
            <FeatureCard
              icon={GraduationCap}
              title={t('cardTraining')}
              desc={t('trainingDesc')}
              delay={0.6}
              color="emerald"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay, color }: { icon: ElementType, title: string, desc: string, delay: number, color: string }) {
  const styles = {
    blue: {
      icon: "bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/30",
      hover: "hover:border-blue-300 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.2)]",
      title: "group-hover:text-blue-600"
    },
    purple: {
      icon: "bg-gradient-to-br from-violet-500 to-fuchsia-400 shadow-purple-500/30",
      hover: "hover:border-purple-300 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.2)]",
      title: "group-hover:text-purple-600"
    },
    emerald: {
      icon: "bg-gradient-to-br from-emerald-500 to-teal-400 shadow-emerald-500/30",
      hover: "hover:border-emerald-300 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)]",
      title: "group-hover:text-emerald-600"
    }
  };

  const currentStyle = styles[color as keyof typeof styles];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className={`group relative p-6 rounded-2xl bg-white border border-slate-100 flex flex-col items-center text-center transition-all duration-300 ${currentStyle.hover}`}
    >
      <div className={`w-14 h-14 ${currentStyle.icon} rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className={`text-xl font-bold text-slate-800 mb-2 transition-colors ${currentStyle.title}`}>{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}
