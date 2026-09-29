import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useJourney } from '../../context/JourneyContext';
import {
  Compass,
  LogIn,
  LayoutDashboard,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const { currentRoute, navigateTo, user, settings, updateSettings } = useJourney();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  const isLoggedIn = Boolean(
    user &&
    user.email &&
    user.onboarded &&
    !user.email.toLowerCase().includes('alex.mercer')
  );

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navLinks: { label: string; route: 'home' | 'about' | 'contact' }[] = [
    { label: 'Home', route: 'home' },
    { label: 'About', route: 'about' },
    { label: 'Contact', route: 'contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-xl bg-white/90 dark:bg-neutral-950/90 shadow-md shadow-neutral-900/5 dark:shadow-black/20 border-b border-neutral-200/90 dark:border-neutral-800'
          : 'backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 border-b border-neutral-200/60 dark:border-neutral-800/60'
      }`}
    >
      {/* Dynamic Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 origin-left z-50 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
        style={{ scaleX }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-100">
                My Journey
              </span>
            </div>
            <div className="text-[10px] text-neutral-500 -mt-0.5 hidden sm:block">
              Truth in Progress
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => navigateTo(item.route)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle & Login/Dashboard Button */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          {/* Login or Dashboard Button */}
          {isLoggedIn ? (
            <button
              onClick={() => navigateTo('dashboard')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </button>
          ) : (
            <button
              onClick={() => navigateTo('login')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In (Member & Admin)</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => {
                  navigateTo(item.route);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  navigateTo('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Workspace</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  navigateTo('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In (Member & Admin)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
