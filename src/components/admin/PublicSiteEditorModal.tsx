import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  X,
  Save,
  RotateCcw,
  Eye,
  Globe,
  Home,
  BookOpen,
  Mail,
  Sparkles,
  Check,
  Plus,
  Trash2,
  User,
  Share2,
} from 'lucide-react';
import { PublicSiteContent } from '../../data/defaultPublicContent';

export const PublicSiteEditorModal: React.FC = () => {
  const {
    isPublicEditorOpen,
    closePublicEditor,
    publicEditorActiveTab,
    publicContent,
    updatePublicContent,
    resetPublicContent,
    navigateTo,
    showToast,
    isAdmin,
  } = useJourney();

  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'contact' | 'developer'>(
    publicEditorActiveTab || 'home'
  );

  // Local draft state for editing
  const [homeDraft, setHomeDraft] = useState(publicContent.home);
  const [aboutDraft, setAboutDraft] = useState(publicContent.about);
  const [contactDraft, setContactDraft] = useState(publicContent.contact);
  const [developerDraft, setDeveloperDraft] = useState(publicContent.developer);

  // Sync draft when opened
  React.useEffect(() => {
    setHomeDraft(publicContent.home);
    setAboutDraft(publicContent.about);
    setContactDraft(publicContent.contact);
    setDeveloperDraft(publicContent.developer);
    if (publicEditorActiveTab) {
      setActiveTab(publicEditorActiveTab);
    }
  }, [publicContent, publicEditorActiveTab, isPublicEditorOpen]);

  if (!isPublicEditorOpen || !isAdmin) return null;

  const handleSaveHome = (e: React.FormEvent) => {
    e.preventDefault();
    updatePublicContent('home', homeDraft);
  };

  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    updatePublicContent('about', aboutDraft);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updatePublicContent('contact', contactDraft);
  };

  const handleSaveDeveloper = (e: React.FormEvent) => {
    e.preventDefault();
    updatePublicContent('developer', developerDraft);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-4xl w-full my-8 rounded-3xl border border-neutral-700/60 dark:border-neutral-700/60 bg-neutral-950 dark:bg-neutral-950 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-100">
                  Admin Panel · Public Site CMS
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                  Live Publishing
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Edit headlines, subtitles, features, and FAQs across Home, About, and Contact pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closePublicEditor();
                navigateTo(activeTab);
              }}
              className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview {activeTab.toUpperCase()}</span>
            </button>
            <button
              onClick={closePublicEditor}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-neutral-800 px-6 pt-2 gap-2 shrink-0 bg-neutral-900">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home Page Content</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>About Page Content</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact & Support Content</span>
          </button>

          <button
            onClick={() => setActiveTab('developer')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'developer'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Developer &amp; Social Links</span>
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-950">
          {/* TAB 1: HOME PAGE EDITOR */}
          {activeTab === 'home' && (
            <form onSubmit={handleSaveHome} className="space-y-6">
              {/* Hero Section Inputs */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                  Hero Section
                </h3>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Hero Eyebrow Badge
                  </label>
                  <input
                    type="text"
                    value={homeDraft.heroBadge}
                    onChange={(e) => setHomeDraft({ ...homeDraft, heroBadge: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Main Headline (Lead text)
                    </label>
                    <input
                      type="text"
                      value={homeDraft.heroTitle}
                      onChange={(e) => setHomeDraft({ ...homeDraft, heroTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Gradient Highlight Text
                    </label>
                    <input
                      type="text"
                      value={homeDraft.heroGradientTitle}
                      onChange={(e) =>
                        setHomeDraft({ ...homeDraft, heroGradientTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={homeDraft.heroSubtitle}
                    onChange={(e) => setHomeDraft({ ...homeDraft, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Primary Login CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={homeDraft.heroCtaText}
                      onChange={(e) => setHomeDraft({ ...homeDraft, heroCtaText: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Secondary Button Label
                    </label>
                    <input
                      type="text"
                      value={homeDraft.heroSecondaryCtaText}
                      onChange={(e) =>
                        setHomeDraft({ ...homeDraft, heroSecondaryCtaText: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Cards Section */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                    Feature Cards (6 Items)
                  </h3>
                  <div className="text-xs text-neutral-400">Edit titles and descriptions</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {homeDraft.features.map((feat, index) => (
                    <div
                      key={feat.id}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => {
                            const updated = [...homeDraft.features];
                            updated[index].title = e.target.value;
                            setHomeDraft({ ...homeDraft, features: updated });
                          }}
                          className="flex-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={feat.description}
                        onChange={(e) => {
                          const updated = [...homeDraft.features];
                          updated[index].description = e.target.value;
                          setHomeDraft({ ...homeDraft, features: updated });
                        }}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-neutral-700 bg-transparent text-neutral-700 dark:text-neutral-300 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Banner */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                  Bottom Call-to-Action Banner
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Banner Heading
                    </label>
                    <input
                      type="text"
                      value={homeDraft.bannerTitle}
                      onChange={(e) =>
                        setHomeDraft({ ...homeDraft, bannerTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Banner Button Label
                    </label>
                    <input
                      type="text"
                      value={homeDraft.bannerCtaText}
                      onChange={(e) =>
                        setHomeDraft({ ...homeDraft, bannerCtaText: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Banner Subtitle
                  </label>
                  <input
                    type="text"
                    value={homeDraft.bannerSubtitle}
                    onChange={(e) =>
                      setHomeDraft({ ...homeDraft, bannerSubtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setHomeDraft(publicContent.home)}
                  className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish Home Page</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ABOUT PAGE EDITOR */}
          {activeTab === 'about' && (
            <form onSubmit={handleSaveAbout} className="space-y-6">
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                  About Page Header
                </h3>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Eyebrow Badge
                  </label>
                  <input
                    type="text"
                    value={aboutDraft.badge}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, badge: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Lead Title
                    </label>
                    <input
                      type="text"
                      value={aboutDraft.title}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Gradient Title
                    </label>
                    <input
                      type="text"
                      value={aboutDraft.gradientTitle}
                      onChange={(e) =>
                        setAboutDraft({ ...aboutDraft, gradientTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={aboutDraft.subtitle}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, subtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 resize-none"
                  />
                </div>
              </div>

              {/* Story Section */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                  Why We Built My Journey (Story)
                </h3>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={aboutDraft.storyTitle}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, storyTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-bold"
                  />
                </div>

                <div className="space-y-3">
                  {aboutDraft.storyParagraphs.map((para, pIdx) => (
                    <div key={pIdx}>
                      <label className="block text-[11px] font-mono text-neutral-500 mb-1">
                        Paragraph {pIdx + 1}
                      </label>
                      <textarea
                        rows={3}
                        value={para}
                        onChange={(e) => {
                          const updated = [...aboutDraft.storyParagraphs];
                          updated[pIdx] = e.target.value;
                          setAboutDraft({ ...aboutDraft, storyParagraphs: updated });
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillars Section */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                  4 Core Pillars
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {aboutDraft.pillars.map((pil, idx) => (
                    <div
                      key={pil.id}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {pil.num}
                        </span>
                        <input
                          type="text"
                          value={pil.title}
                          onChange={(e) => {
                            const updated = [...aboutDraft.pillars];
                            updated[idx].title = e.target.value;
                            setAboutDraft({ ...aboutDraft, pillars: updated });
                          }}
                          className="flex-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={pil.description}
                        onChange={(e) => {
                          const updated = [...aboutDraft.pillars];
                          updated[idx].description = e.target.value;
                          setAboutDraft({ ...aboutDraft, pillars: updated });
                        }}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-neutral-700 bg-transparent text-neutral-700 dark:text-neutral-300 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAboutDraft(publicContent.about)}
                  className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish About Page</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CONTACT PAGE EDITOR */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContact} className="space-y-6">
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                  Contact Header & Direct Emails
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={contactDraft.title}
                      onChange={(e) =>
                        setContactDraft({ ...contactDraft, title: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Eyebrow Badge
                    </label>
                    <input
                      type="text"
                      value={contactDraft.badge}
                      onChange={(e) =>
                        setContactDraft({ ...contactDraft, badge: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={contactDraft.subtitle}
                    onChange={(e) =>
                      setContactDraft({ ...contactDraft, subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Direct Support Email
                    </label>
                    <input
                      type="email"
                      value={contactDraft.supportEmail}
                      onChange={(e) =>
                        setContactDraft({ ...contactDraft, supportEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Database & Security Email
                    </label>
                    <input
                      type="email"
                      value={contactDraft.databaseEmail}
                      onChange={(e) =>
                        setContactDraft({ ...contactDraft, databaseEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                    Frequently Asked Questions (FAQ)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setContactDraft({
                        ...contactDraft,
                        faqList: [
                          ...contactDraft.faqList,
                          {
                            id: `faq-${Date.now()}`,
                            question: 'New Question Title?',
                            answer: 'Explanation and helpful guidance.',
                          },
                        ],
                      });
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {contactDraft.faqList.map((faq, fIdx) => (
                    <div
                      key={faq.id || fIdx}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          Q{fIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const updated = [...contactDraft.faqList];
                            updated[fIdx].question = e.target.value;
                            setContactDraft({ ...contactDraft, faqList: updated });
                          }}
                          placeholder="Question title"
                          className="flex-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                        />
                        {contactDraft.faqList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = contactDraft.faqList.filter((_, i) => i !== fIdx);
                              setContactDraft({ ...contactDraft, faqList: updated });
                            }}
                            className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer"
                            title="Remove FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const updated = [...contactDraft.faqList];
                          updated[fIdx].answer = e.target.value;
                          setContactDraft({ ...contactDraft, faqList: updated });
                        }}
                        placeholder="Answer details"
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-neutral-700 bg-transparent text-neutral-700 dark:text-neutral-300 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setContactDraft(publicContent.contact)}
                  className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish Contact Page</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: DEVELOPER & SOCIAL LINKS EDITOR */}
          {activeTab === 'developer' && (
            <form onSubmit={handleSaveDeveloper} className="space-y-6">
              {/* Creator & Portfolio Section */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Developer &amp; Architect Profile</span>
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Displayed on Public Footer, About &amp; Contact
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Developer Full Name
                    </label>
                    <input
                      type="text"
                      value={developerDraft.name}
                      onChange={(e) => setDeveloperDraft({ ...developerDraft, name: e.target.value })}
                      placeholder="Raghab Barik"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Developer Title / Role
                    </label>
                    <input
                      type="text"
                      value={developerDraft.tagline}
                      onChange={(e) => setDeveloperDraft({ ...developerDraft, tagline: e.target.value })}
                      placeholder="Lead Architect &amp; Creator"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Portfolio Website URL (e.g. https://www.raghabportfolio.in/)
                  </label>
                  <input
                    type="url"
                    value={developerDraft.portfolioUrl}
                    onChange={(e) => setDeveloperDraft({ ...developerDraft, portfolioUrl: e.target.value })}
                    placeholder="https://www.raghabportfolio.in/"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 font-mono text-neutral-100 border-neutral-700"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    All "Powered by" badges will link to this URL.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Powered-By Custom Text
                  </label>
                  <input
                    type="text"
                    value={developerDraft.poweredByText}
                    onChange={(e) => setDeveloperDraft({ ...developerDraft, poweredByText: e.target.value })}
                    placeholder="Powered by https://www.raghabportfolio.in/"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 font-mono text-neutral-100 border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Developer Bio / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={developerDraft.bio}
                    onChange={(e) => setDeveloperDraft({ ...developerDraft, bio: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 border-neutral-700 resize-none"
                  />
                </div>
              </div>

              {/* Social Channels & Contact IDs */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-800/30 dark:bg-neutral-800/30 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                  Social Channels &amp; Contact Links
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Email Address (Contact ID)
                    </label>
                    <input
                      type="email"
                      value={developerDraft.email}
                      onChange={(e) => setDeveloperDraft({ ...developerDraft, email: e.target.value })}
                      placeholder="rraghabbarik@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 font-mono text-neutral-100 border-neutral-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Instagram Profile URL
                    </label>
                    <input
                      type="text"
                      value={developerDraft.instagram}
                      onChange={(e) => setDeveloperDraft({ ...developerDraft, instagram: e.target.value })}
                      placeholder="https://instagram.com/raghab_barik"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 font-mono text-neutral-100 border-neutral-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      GitHub Profile URL
                    </label>
                    <input
                      type="text"
                      value={developerDraft.github}
                      onChange={(e) => setDeveloperDraft({ ...developerDraft, github: e.target.value })}
                      placeholder="https://github.com/raghabbarik"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 font-mono text-neutral-100 border-neutral-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Twitter / X Profile URL
                    </label>
                    <input
                      type="text"
                      value={developerDraft.twitter}
                      onChange={(e) => setDeveloperDraft({ ...developerDraft, twitter: e.target.value })}
                      placeholder="https://x.com/raghabbarik"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-900 font-mono text-neutral-100 border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setDeveloperDraft(publicContent.developer)}
                  className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish Developer &amp; Social Links</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={resetPublicContent}
            className="text-neutral-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400">
              Only accessible by Workspace Administrator
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
