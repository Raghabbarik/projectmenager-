import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  Compass,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Brain,
  Briefcase,
  Code2,
  Dumbbell,
  Target,
  Coffee,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigateTo, loginUser, showToast } = useJourney();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    try {
      const ok = await loginUser(email.trim(), password);
      if (!ok) {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Card */}
        <div className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl space-y-6">
          {/* Back to Home */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          {/* Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-1">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              My Journey
            </h1>
            <p className="text-xs text-neutral-500">
              Sign in with your email and password to access your workspace.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigateTo('forgot-password')}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center text-xs text-neutral-500 space-y-1">
          <div className="font-semibold text-neutral-700 dark:text-neutral-300">Admin Access</div>
          <p>Sign in with your Supabase account email & password. Members receive an invitation from their admin.</p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { navigateTo, updateUser, showToast } = useJourney();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert('Please agree to the privacy policy.');
      return;
    }
    updateUser({ name: name || 'New Voyager', email, onboarded: false });
    showToast('Account created');
    navigateTo('onboarding');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-11 h-11 rounded-xl bg-indigo-600 items-center justify-center text-white shadow-xs mb-1">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Create Account
          </h1>
          <p className="text-xs text-neutral-500">
            Begin your personal journey tracking and life management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>I agree to the private personal data terms</span>
          </label>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
          >
            Create Account & Begin
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 pt-1">
          Already have an account?{' '}
          <button
            onClick={() => navigateTo('login')}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { navigateTo, showToast } = useJourney();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast('Reset link sent if email exists');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Reset Password
          </h1>
          <p className="text-xs text-neutral-500">
            Enter your email to receive a secure recovery link
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs text-center space-y-3">
            <p>Password recovery instructions sent to {email}.</p>
            <button
              onClick={() => navigateTo('login')}
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline block mx-auto"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="w-full text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 text-center block pt-2"
            >
              ← Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const OnboardingPage: React.FC = () => {
  const { navigateTo, updateUser, showToast, user } = useJourney();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Reading',
    'Learning',
    'Work',
    'Coding/Building',
  ]);

  const trackingOptions = [
    { label: 'Reading', icon: BookOpen },
    { label: 'Learning', icon: Brain },
    { label: 'Work', icon: Briefcase },
    { label: 'Coding/Building', icon: Code2 },
    { label: 'Exercise', icon: Dumbbell },
    { label: 'Goals', icon: Target },
    { label: 'Personal', icon: Coffee },
    { label: 'Other', icon: Compass },
  ];

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleFinish = () => {
    updateUser({ trackingInterests: selectedInterests, onboarded: true });
    showToast('Your journey is ready');
    navigateTo(user?.role === 'member' ? 'projects' : 'dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>Step {step} of 3</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-6 h-1 rounded-full ${
                  s <= step ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Compass className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Welcome to My Journey
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Your private personal growth and life-management dashboard. Record what you do, organize projects, track ideas, and reflect on your real story.
            </p>
            <button
              onClick={() => setStep(2)}
              className="mt-6 px-6 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 2: What do you want to track? */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                What do you want to track?
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Select the activities you want to cultivate and record
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {trackingOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedInterests.includes(opt.label);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => toggleInterest(opt.label)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-indigo-500" />
                    <span className="text-xs font-medium">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-neutral-500 hover:text-neutral-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: You're ready */}
        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              You&rsquo;re Ready
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Your private environment is prepared with realistic seed activities, project timelines, and ideas. You can edit, add, or clear them anytime.
            </p>
            <button
              onClick={handleFinish}
              className="mt-6 px-6 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Start My Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
