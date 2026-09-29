import React from 'react';
import { motion, type Variants } from 'motion/react';
import { useJourney } from '../context/JourneyContext';
import {
  LogIn,
  ArrowRight,
  ShieldCheck,
  Users,
  CheckCircle2,
  Flame,
  MessageSquare,
  BarChart3,
  Cloud,
  Check,
  Sparkles,
  Award,
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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const HomePage: React.FC = () => {
  const { navigateTo, publicContent } = useJourney();

  return (
    <div className="space-y-20 lg:space-y-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative text-center space-y-6 pt-4 lg:pt-8">
        {/* Glow ambient background elements with subtle breathing animation */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl -z-10 pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-3xl -z-10 pointer-events-none"
        />

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 max-w-4xl mx-auto leading-[1.12]"
        >
          {publicContent.home.heroTitle}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500">
            {publicContent.home.heroGradientTitle}
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
          className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
        >
          {publicContent.home.heroSubtitle}
        </motion.p>

        {/* Hero Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo('login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4 stroke-[2.2]" />
            <span>{publicContent.home.heroCtaText || 'Member & Admin Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo('about')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{publicContent.home.heroSecondaryCtaText || 'Read Our Philosophy'}</span>
          </motion.button>
        </motion.div>

        {/* Quick Highlights Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400 font-mono"
        >
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>Admin Allocation & Approvals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>Member Email & Password Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>Live Cloud Database (Supabase)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Truthful Analytics</span>
          </div>
        </motion.div>

        {/* HERO MOCKUP / DASHBOARD SHOWCASE */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
          className="pt-8 max-w-5xl mx-auto"
        >
          <div className="p-3 sm:p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl shadow-2xl space-y-4 text-left hover:border-indigo-500/30 transition-colors">
            {/* Top Mock Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-150 dark:border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-neutral-400 ml-2">
                  My Journey Live Workspace
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Database Connected</span>
                </span>
              </div>
            </div>

            {/* Mock Dashboard Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Daily Journey Card */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Daily Journey
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Active
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-neutral-500">Progress</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Genuine Track</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1">
                  <span>Focus: 3h 30m</span>
                  <span>Tasks: Real completion</span>
                </div>
              </motion.div>

              {/* Role & Approvals Card */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Admin & Member Roles
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-semibold">
                    Secured
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Admin assigns client portals and reviews proposals. Members login to execute work without distraction.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approvals workflow active</span>
                </div>
              </motion.div>

              {/* Cloud Sync & Messaging */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Supabase Cloud Sync
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-500 font-bold">
                    Real-Time
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Direct database persistence with instant bidirectional sync across tasks, projects, notes, and messages.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-sky-600 dark:text-sky-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Direct team chat ready</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. CORE FEATURES GRID - ANIMATED ON SCROLL */}
      <section className="space-y-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
          variants={fadeInUp}
          className="text-center space-y-2 max-w-2xl mx-auto"
        >
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {publicContent.home.featuresTitle}
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {publicContent.home.featuresSubtitle}
          </p>
          <p className="text-xs sm:text-sm text-neutral-500">
            No bloated setups. No simulated test algorithms. Just pure focus and real-time execution.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {publicContent.home.features.map((feat, index) => {
            const iconRenderers: Record<string, React.ReactNode> = {
              Users: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
              CheckCircle2: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              Cloud: <Cloud className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
              MessageSquare: <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
              Flame: <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
              BarChart3: <BarChart3 className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
            };
            const iconBg = [
              'bg-indigo-50 dark:bg-indigo-950',
              'bg-emerald-50 dark:bg-emerald-950',
              'bg-sky-50 dark:bg-sky-950',
              'bg-violet-50 dark:bg-violet-950',
              'bg-amber-50 dark:bg-amber-950',
              'bg-rose-50 dark:bg-rose-950',
            ][index % 6];

            return (
              <motion.div
                key={feat.id}
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                  {iconRenderers[feat.icon] || <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {feat.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 3. HOW IT WORKS WORKFLOW - ANIMATED ON SCROLL */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-70px' }}
        variants={fadeInUp}
        className="p-8 sm:p-12 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/40 space-y-8"
      >
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Seamless Workflow
          </h2>
          <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            How Admins and Members Collaborate
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            variants={cardVariant}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs"
          >
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>STEP 01</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Admin Creates Members
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The administrator creates team members with an email, secure password, and assigns selected clients and projects.
            </p>
          </motion.div>

          <motion.div
            variants={cardVariant}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs"
          >
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>STEP 02</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Members Sign In & Execute
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Members use their credentials on the Login page to access their dedicated workspace, view assigned clients, track daily tasks, and propose new clients.
            </p>
          </motion.div>

          <motion.div
            variants={cardVariant}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs"
          >
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>STEP 03</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Approvals & Live Sync
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Admin approves member-created clients and projects. Everything syncs to the Supabase cloud database in real-time.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 4. BOTTOM HERO / CTA BANNER - ANIMATED ON SCROLL */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 32 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative overflow-hidden p-8 sm:p-14 rounded-3xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-neutral-950 text-white text-center space-y-6 shadow-xl"
      >
        {/* Ambient background glow inside banner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {publicContent.home.bannerTitle}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
            {publicContent.home.bannerSubtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateTo('login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-neutral-900 hover:bg-neutral-100 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-indigo-600 stroke-[2.2]" />
            <span>{publicContent.home.bannerCtaText}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
};
