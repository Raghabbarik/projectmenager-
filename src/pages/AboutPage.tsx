import React from 'react';
import { motion, type Variants } from 'motion/react';
import { useJourney } from '../context/JourneyContext';
import {
  Compass,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Check,
  Users,
  BookOpen,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const AboutPage: React.FC = () => {
  const { navigateTo, publicContent } = useJourney();

  return (
    <div className="space-y-16 lg:space-y-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14 overflow-hidden">
      {/* 1. Header Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center space-y-4 max-w-3xl mx-auto pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>{publicContent.about.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          {publicContent.about.title}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-[#d5cea3] dark:to-[#e5e5cb]">
            {publicContent.about.gradientTitle}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {publicContent.about.subtitle}
        </p>
      </motion.section>

      {/* 2. The Core Philosophy Story - Animated on Scroll */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-70px' }}
        variants={fadeInUp}
        className="p-8 sm:p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6 hover:border-indigo-500/30 transition-colors"
      >
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{publicContent.about.storyTitle}</span>
          </h2>
          <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 space-y-4 leading-relaxed">
            {publicContent.about.storyParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 3. The 4 Guiding Principles - Animated on Scroll */}
      <section className="space-y-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
          variants={fadeInUp}
          className="text-center space-y-1"
        >
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {publicContent.about.pillarsTitle}
          </h2>
          <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {publicContent.about.pillarsSubtitle}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {publicContent.about.pillars.map((pillar) => (
            <motion.div
              key={pillar.id}
              variants={cardVariant}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2.5 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {pillar.num}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {pillar.title}
                </h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. Role Architecture Explained - Animated on Scroll */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-70px' }}
        variants={fadeInUp}
        className="p-8 sm:p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/40 space-y-6"
      >
        <div className="space-y-1">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Permissions & Architecture
          </h2>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            How Roles Operate in the Workspace
          </h3>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <motion.div
            variants={cardVariant}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                Administrator
              </span>
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Full access to all client accounts, financial trackers, and system settings</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Create and manage team members with email and secure passwords</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>One-click approvals for member-proposed clients and projects</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Broadcast and direct messages to all team members</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={cardVariant}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                Team Member
              </span>
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Log in using allocated email and password credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Access designated client portals and allocated project streams</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Propose new clients and candidate projects for Admin approval</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Send questions and updates directly to the Administrator</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 5. Bottom CTA - Animated on Scroll */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-70px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center p-8 sm:p-12 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {publicContent.about.ctaTitle}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
          {publicContent.about.ctaSubtitle}
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigateTo('login')}
          className="px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{publicContent.about.ctaButtonText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </motion.section>
    </div>
  );
};
