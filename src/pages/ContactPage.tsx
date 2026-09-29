import React, { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { useJourney } from '../context/JourneyContext';
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Cloud,
  Users,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 26 },
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const ContactPage: React.FC = () => {
  const { showToast, navigateTo, publicContent } = useJourney();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'client' | 'general'>('admin');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setIsSubmitted(true);
    showToast('✨ Message received! We will respond within 24 hours.', 'success');
  };

  return (
    <div className="space-y-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14 overflow-hidden">
      {/* 1. Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center space-y-3 max-w-2xl mx-auto pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{publicContent.contact.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          {publicContent.contact.title}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {publicContent.contact.subtitle}
        </p>
      </motion.section>

      {/* 2. Form & Contact Cards Row - Animated on Scroll */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Contact Form */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
          variants={fadeInUp}
          className="lg:col-span-2 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs hover:border-indigo-500/30 transition-colors"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Message Successfully Dispatched!
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Thank you, <strong>{name}</strong>. Our team has received your message regarding "{subject || 'General Inquiry'}" and will reply to <strong>{email}</strong> shortly.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer pt-2"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Inquiring As
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="admin">Administrator / Workspace Owner</option>
                    <option value="member">Team Member / Contributor</option>
                    <option value="client">Client Representative</option>
                    <option value="general">General / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Question about Member Allocations"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our team help your journey?"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </motion.button>
            </form>
          )}
        </motion.div>

        {/* Right 1 Col: Quick Info Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
          variants={staggerContainer}
          className="space-y-4"
        >
          <motion.div
            variants={cardVariant}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Direct Support</span>
            </div>
            <p className="text-xs text-neutral-500">
              For account, database sync, and technical inquiries:
            </p>
            <div className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {publicContent.contact.supportEmail}
            </div>
          </motion.div>

          <motion.div
            variants={cardVariant}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2 hover:border-sky-300 dark:hover:border-sky-800 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
              <Cloud className="w-4 h-4 text-sky-500" />
              <span>Database & Security</span>
            </div>
            <p className="text-xs text-neutral-500">
              For Supabase cloud hosting, RLS policies, and database replication:
            </p>
            <div className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
              {publicContent.contact.databaseEmail}
            </div>
          </motion.div>

          <motion.div
            variants={cardVariant}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs space-y-2 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Member Sign In</span>
            </div>
            <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
              Already have an assigned member account created by your Administrator?
            </p>
            <button
              onClick={() => navigateTo('login')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              <span>Go to Login page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Quick FAQ Grid - Animated on Scroll */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-70px' }}
        variants={fadeInUp}
        className="space-y-6 pt-4 border-t border-neutral-200 dark:border-neutral-800"
      >
        <div className="text-center space-y-1">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {publicContent.contact.faqTitle}
          </h2>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {publicContent.contact.faqSubtitle}
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {publicContent.contact.faqList.map((faq) => (
            <motion.div
              key={faq.id}
              variants={cardVariant}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1.5 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs"
            >
              <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {faq.question}
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
};
