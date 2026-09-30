import React, { useState, useEffect } from 'react';
import {
  Mail,
  KeyRound,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Server,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getSmtpConfig,
  saveSmtpConfig,
  testSmtpConnection,
  isSmtpConfigured,
} from '../../services/emailService';
import { SmtpEmailConfig } from '../../types';

interface SmtpSettingsCardProps {
  onSaved?: (config: SmtpEmailConfig) => void;
}

export const SmtpSettingsCard: React.FC<SmtpSettingsCardProps> = ({ onSaved }) => {
  const [config, setConfig] = useState<SmtpEmailConfig>(() => getSmtpConfig());
  const [showPassword, setShowPassword] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!testEmail && config.fromEmail) {
      setTestEmail(config.fromEmail);
    }
  }, [config.fromEmail, testEmail]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = saveSmtpConfig(config);
    setConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    if (onSaved) onSaved(updated);
  };

  const handleTest = async () => {
    if (!config.fromEmail.trim() || !config.appPassword.trim()) {
      setTestResult({
        type: 'error',
        message: 'Please provide both your From Email and your App Password before testing.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Save current configuration first
    saveSmtpConfig(config);

    const target = testEmail.trim() || config.fromEmail.trim();
    const res = await testSmtpConnection(config, target);

    setIsTesting(false);
    if (res.success) {
      setTestResult({
        type: 'success',
        message: res.message || `Test email successfully sent to ${target}!`,
      });
    } else {
      setTestResult({
        type: 'error',
        message: res.error || 'Failed to dispatch test email. Please check your credentials.',
      });
    }
  };

  const configured = isSmtpConfigured();

  return (
    <section className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Email & SMTP Configuration
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  configured
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
              >
                {configured ? 'Active & Ready' : 'Setup Required'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Add your From Email and App Password so the application can send live emails directly from this platform.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How to get App Password</span>
          {showInstructions ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Instructions Accordion */}
      {showInstructions && (
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>How to generate a Google / Gmail App Password (3 simple steps):</span>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-neutral-700 dark:text-neutral-300 pl-1 leading-relaxed">
            <li>
              Enable <strong>2-Step Verification</strong> on your Google Account (required by Google for automated mail sending).
            </li>
            <li>
              Visit Google's App Passwords page:{' '}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 underline font-semibold hover:text-indigo-800"
              >
                <span>myaccount.google.com/apppasswords</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Enter an app name like <strong>&quot;My Journey&quot;</strong> and click <strong>Create</strong>. Copy the 16-character code (e.g. <code>abcd efgh ijkl mnop</code>) and paste it below!
            </li>
          </ol>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 italic pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
            💡 <strong>Security Note:</strong> Your regular Google account password will not work because Google blocks less secure apps. App Passwords are specifically created for platform integrations and keep your primary account safe.
          </div>
        </div>
      )}

      {/* Provider Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Email Service Provider
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'gmail', label: 'Gmail / Google Workspace', icon: '🔴' },
            { id: 'outlook', label: 'Outlook / Office 365', icon: '🔵' },
            { id: 'yahoo', label: 'Yahoo Mail', icon: '🟣' },
            { id: 'custom', label: 'Custom SMTP Server', icon: '⚙️' },
          ].map((prov) => {
            const isSelected = config.provider === prov.id;
            return (
              <button
                key={prov.id}
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    provider: prov.id as any,
                    smtpHost: prov.id === 'gmail' ? 'smtp.gmail.com' : prev.smtpHost,
                    smtpPort: prov.id === 'gmail' ? 465 : prev.smtpPort,
                  }))
                }
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{prov.icon}</span>
                  <span className="text-xs truncate">{prov.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* From Email Address */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Sender Email Address (&quot;From&quot;)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={config.fromEmail}
                onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                placeholder="your-name@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Emails will be sent and signed from this address.
            </p>
          </div>

          {/* App Password */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              App Password (16 Characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={config.appPassword}
                onChange={(e) => setConfig({ ...config, appPassword: e.target.value })}
                placeholder="abcd efgh ijkl mnop"
                className="w-full pl-9 pr-10 py-2 text-xs font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Spaces are automatically handled. Keep this safe.
            </p>
          </div>
        </div>

        {/* Sender Display Name & Custom SMTP if selected */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Sender Display Name (Optional)
            </label>
            <input
              type="text"
              value={config.fromName}
              onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
              placeholder="e.g. My Journey Admin"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          {config.provider === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={config.smtpHost}
                  onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                  placeholder="smtp.example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={config.smtpPort}
                  onChange={(e) => setConfig({ ...config, smtpPort: Number(e.target.value) })}
                  placeholder="465 or 587"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>

          {saveSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in duration-150">
              ✓ Saved successfully!
            </span>
          )}
        </div>
      </form>

      {/* Test Connection Section */}
      <div className="pt-4 border-t border-neutral-150 dark:border-neutral-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            Test Live Email Dispatch
          </h3>
        </div>

        <p className="text-xs text-neutral-500">
          Verify that your From Email and App Password work by sending a real test message to any mailbox.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Recipient email address (defaults to sender)"
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />

          <button
            type="button"
            disabled={isTesting || !config.fromEmail || !config.appPassword}
            onClick={handleTest}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer shrink-0 ${
              isTesting
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-900 dark:bg-[#e5e5cb] text-white dark:text-[#1a120b] hover:bg-neutral-800 dark:hover:bg-[#d5cea3]'
            }`}
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Email</span>
              </>
            )}
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
              testResult.type === 'success'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
            }`}
          >
            {testResult.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">{testResult.message}</div>
          </div>
        )}
      </div>
    </section>
  );
};
