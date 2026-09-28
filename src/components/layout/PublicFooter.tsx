import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Compass,
  ShieldCheck,
  ArrowUpRight,
  Cloud,
  Mail,
  Instagram,
  Github,
  Twitter,
  Globe,
  User,
  ExternalLink,
  Code2,
} from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { navigateTo, publicContent } = useJourney();

  const dev = publicContent?.developer || {
    name: 'Raghab Barik',
    tagline: 'Lead Architect & Creator',
    bio: 'Software engineer and system architect building high-fidelity client management and productivity platforms.',
    portfolioUrl: 'https://www.raghabportfolio.in/',
    poweredByText: 'Powered by https://www.raghabportfolio.in/',
    email: 'rraghabbarik@gmail.com',
    instagram: 'https://instagram.com/raghab_barik',
    github: 'https://github.com/raghabbarik',
    twitter: 'https://x.com/raghabbarik',
  };

  const portfolioLink = dev.portfolioUrl || 'https://www.raghabportfolio.in/';

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none group w-fit"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                <Compass className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-100">
                My Journey
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The high-fidelity productivity, client management, and execution workspace for modern teams.
              Real database synchronicity and role protection.
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Cloud className="w-3 h-3" />
                <span>Supabase Cloud Connected</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              Navigation
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Home &amp; Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  About Our Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Contact &amp; Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('login')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer font-medium text-neutral-900 dark:text-neutral-200"
                >
                  Member &amp; Admin Sign In →
                </button>
              </li>
            </ul>
          </div>

          {/* Platform capabilities */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              Workspace Core
            </div>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li>• Real-Time Supabase Cloud Sync</li>
              <li>• Centralized Shared Redis Cache</li>
              <li>• Admin Client &amp; Project Allocation</li>
              <li>• Member Client &amp; Project Approval</li>
              <li>• Direct Internal Team Messaging</li>
              <li>• Genuine Daily Timeline Tracking</li>
            </ul>
          </div>

          {/* Developer / Powered By Card — new style */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-900 to-indigo-950 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950 shadow-lg p-5 space-y-4">
            {/* Decorative glow */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-violet-500/15 blur-2xl pointer-events-none" />

            {/* Avatar + name */}
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full ring-2 ring-indigo-500/60 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-indigo-900/40">
                {dev.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">{dev.name}</div>
                <div className="text-[11px] text-indigo-300/80">{dev.tagline}</div>
              </div>
            </div>

            {/* Social icons row */}
            <div className="relative flex items-center gap-1">
              {dev.email && (
                <a href={`mailto:${dev.email}`} title={dev.email}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                  <Mail className="w-4 h-4" />
                </a>
              )}
              {dev.instagram && (
                <a href={dev.instagram.startsWith('http') ? dev.instagram : `https://${dev.instagram}`}
                  target="_blank" rel="noopener noreferrer" title="Instagram"
                  className="p-2 rounded-lg text-neutral-400 hover:text-pink-400 hover:bg-white/10 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {dev.github && (
                <a href={dev.github.startsWith('http') ? dev.github : `https://${dev.github}`}
                  target="_blank" rel="noopener noreferrer" title="GitHub"
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {dev.twitter && (
                <a href={dev.twitter.startsWith('http') ? dev.twitter : `https://${dev.twitter}`}
                  target="_blank" rel="noopener noreferrer" title="Twitter / X"
                  className="p-2 rounded-lg text-neutral-400 hover:text-sky-400 hover:bg-white/10 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {dev.portfolioUrl && (
                <a href={dev.portfolioUrl.startsWith('http') ? dev.portfolioUrl : `https://${dev.portfolioUrl}`}
                  target="_blank" rel="noopener noreferrer" title="Portfolio"
                  className="p-2 rounded-lg text-neutral-400 hover:text-indigo-400 hover:bg-white/10 transition-all">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Powered by link */}
            <a
              href={portfolioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/40 transition-all group"
            >
              <span className="text-[11px] font-mono text-indigo-300 group-hover:text-white transition-colors truncate">
                {dev.poweredByText || 'Powered by raghabportfolio.in'}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

        </div>

        {/* Bottom copyright & powered by */}
        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} My Journey Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-neutral-500">
            <a
              href={portfolioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>{dev.poweredByText || 'Powered by https://www.raghabportfolio.in/'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
