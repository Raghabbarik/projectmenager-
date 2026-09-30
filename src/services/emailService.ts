import { SmtpEmailConfig, SendEmailPayload } from '../types';
import { StudentRecord, StudentEmailLog } from '../types/studentMailer';
import { renderTemplate, saveEmailLog } from './studentSheetService';

export const STORAGE_KEY_SMTP = 'my_journey_smtp_config_v1';

export const DEFAULT_SMTP_CONFIG: SmtpEmailConfig = {
  fromEmail: '',
  appPassword: '',
  fromName: 'My Journey',
  provider: 'gmail',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpSecure: true,
};

// Load saved SMTP configuration from localStorage
export function getSmtpConfig(): SmtpEmailConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SMTP);
    if (!raw) return { ...DEFAULT_SMTP_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SMTP_CONFIG,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_SMTP_CONFIG };
  }
}

// Save SMTP configuration to localStorage
export function saveSmtpConfig(config: Partial<SmtpEmailConfig>): SmtpEmailConfig {
  const current = getSmtpConfig();
  const updated: SmtpEmailConfig = {
    ...current,
    ...config,
  };
  localStorage.setItem(STORAGE_KEY_SMTP, JSON.stringify(updated));
  return updated;
}

// Check whether SMTP is configured with at least fromEmail and appPassword
export function isSmtpConfigured(): boolean {
  const cfg = getSmtpConfig();
  return Boolean(cfg.fromEmail.trim() && cfg.appPassword.trim());
}

// Send an individual email through the /api/send-email endpoint
export async function sendSmtpEmail(
  payload: SendEmailPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const savedCfg = getSmtpConfig();

  const finalPayload: SendEmailPayload = {
    fromEmail: payload.fromEmail || savedCfg.fromEmail,
    appPassword: payload.appPassword || savedCfg.appPassword,
    fromName: payload.fromName || savedCfg.fromName,
    provider: payload.provider || savedCfg.provider,
    smtpHost: payload.smtpHost || savedCfg.smtpHost,
    smtpPort: payload.smtpPort || savedCfg.smtpPort,
    smtpSecure: payload.smtpSecure !== undefined ? payload.smtpSecure : savedCfg.smtpSecure,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  };

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
    });

    const data = await res.json().catch(() => ({ success: false, error: 'Invalid response from server' }));

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Server responded with status ${res.status}: ${res.statusText}`,
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with email server',
    };
  }
}

// Test SMTP connection and dispatch a test message
export async function testSmtpConnection(
  config: SmtpEmailConfig,
  testRecipient: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!config.fromEmail.trim() || !config.appPassword.trim()) {
    return {
      success: false,
      error: 'Please enter both your From Email and your App Password.',
    };
  }

  const target = testRecipient.trim() || config.fromEmail.trim();

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...config,
        to: target,
        subject: `[Test] My Journey SMTP Connection Verified!`,
        text: `Hello! This is a test email sent from your My Journey platform using ${config.fromEmail} and your configured App Password.\n\nTime: ${new Date().toLocaleString()}\nProvider: ${config.provider.toUpperCase()}\nStatus: Connection successful!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 20px;">✓ SMTP Connection Verified!</h2>
            </div>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              This test confirms that <strong>My Journey</strong> can successfully send live emails using your sender address <strong>${config.fromEmail}</strong> and your App Password.
            </p>
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #475569;">
              <div><strong>Provider:</strong> ${config.provider.toUpperCase()}</div>
              <div><strong>Sender Name:</strong> ${config.fromName}</div>
              <div><strong>Recipient:</strong> ${target}</div>
              <div><strong>Timestamp:</strong> ${new Date().toLocaleString()}</div>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              Sent securely from your personal My Journey platform.
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json().catch(() => ({ success: false, error: 'Server returned unreadable response' }));

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Failed to dispatch test email',
      };
    }

    return {
      success: true,
      message: `Test email successfully delivered to ${target}!`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error testing SMTP connection',
    };
  }
}

// Dispatch batch emails to student rosters or member lists via direct SMTP
export async function sendBatchEmailsViaSmtp(
  recipients: StudentRecord[],
  subjectTemplate: string,
  bodyTemplate: string,
  sheetName: string,
  senderUser: { name: string; email: string },
  smtpConfig?: SmtpEmailConfig,
  onProgress?: (progress: {
    sentCount: number;
    total: number;
    currentStudent: StudentRecord;
    percentage: number;
  }) => void
): Promise<{
  success: boolean;
  totalSent: number;
  failedCount: number;
  errors: string[];
  log: StudentEmailLog;
}> {
  const cfg = smtpConfig || getSmtpConfig();
  const validRecipients = recipients.filter((r) => r.isValidEmail && r.email.trim());
  const errors: string[] = [];
  let sentCount = 0;

  for (let i = 0; i < validRecipients.length; i++) {
    const student = validRecipients[i];
    const resolvedSubject = renderTemplate(subjectTemplate, student, sheetName);
    const resolvedBody = renderTemplate(bodyTemplate, student, sheetName);

    const result = await sendSmtpEmail({
      fromEmail: cfg.fromEmail,
      appPassword: cfg.appPassword,
      fromName: cfg.fromName || senderUser.name,
      provider: cfg.provider,
      smtpHost: cfg.smtpHost,
      smtpPort: cfg.smtpPort,
      smtpSecure: cfg.smtpSecure,
      to: student.email.trim(),
      subject: resolvedSubject,
      text: resolvedBody,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b; line-height: 1.6;">
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; font-weight: 700; margin-bottom: 4px;">
              ${sheetName || 'Academic Notice'}
            </div>
            <h2 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
              ${resolvedSubject}
            </h2>
          </div>
          <div style="white-space: pre-wrap; font-size: 14px; color: #334155; margin-bottom: 24px;">
${resolvedBody}
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #64748b;">
            Sent by <strong>${cfg.fromName || senderUser.name}</strong> (${cfg.fromEmail || senderUser.email}) via My Journey Platform.
          </div>
        </div>
      `,
    });

    if (result.success) {
      sentCount++;
    } else {
      errors.push(`${student.email}: ${result.error || 'Failed to send'}`);
    }

    if (onProgress) {
      onProgress({
        sentCount: i + 1,
        total: validRecipients.length,
        currentStudent: student,
        percentage: Math.round(((i + 1) / validRecipients.length) * 100),
      });
    }

    // Add a slight pause between SMTP dispatches (120ms) to respect server rate limits
    if (i < validRecipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }

  const log: StudentEmailLog = {
    id: `log-smtp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sheetId: `sheet-${Date.now()}`,
    sheetName,
    subject: subjectTemplate,
    content: bodyTemplate,
    recipientsCount: sentCount,
    recipientEmails: validRecipients.map((r) => r.email),
    sentAt: new Date().toISOString(),
    status: errors.length > 0 ? (sentCount > 0 ? 'partial' : 'failed') : 'sent',
    senderEmail: cfg.fromEmail || senderUser.email,
    senderName: cfg.fromName || senderUser.name,
  };

  saveEmailLog(log);

  return {
    success: sentCount > 0,
    totalSent: sentCount,
    failedCount: errors.length,
    errors,
    log,
  };
}
