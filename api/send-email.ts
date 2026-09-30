import nodemailer from 'nodemailer';

export interface SmtpRequestBody {
  fromEmail?: string;
  appPassword?: string;
  fromName?: string;
  provider?: 'gmail' | 'outlook' | 'yahoo' | 'custom';
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export async function handleSendEmailRequest(body: SmtpRequestBody) {
  const fromEmail = (body.fromEmail || process.env.SMTP_USER || process.env.SMTP_FROM_EMAIL || '').trim();
  const rawPass = (body.appPassword || process.env.SMTP_PASS || process.env.SMTP_APP_PASSWORD || '').trim();
  // Strip spaces from Google App Password if present (Google formats them as "xxxx xxxx xxxx xxxx")
  const appPassword = rawPass.replace(/\s+/g, '');
  const fromName = (body.fromName || process.env.SMTP_FROM_NAME || 'My Journey').trim();
  const provider = body.provider || 'gmail';

  if (!fromEmail) {
    throw new Error('Missing "From" email address. Please provide your email.');
  }

  if (!appPassword) {
    throw new Error('Missing App Password. Please provide your Google or SMTP App Password.');
  }

  if (!body.to || (Array.isArray(body.to) && body.to.length === 0)) {
    throw new Error('Missing recipient address in "to" field.');
  }

  let transportOptions: any;

  if (provider === 'gmail') {
    transportOptions = {
      service: 'gmail',
      auth: {
        user: fromEmail,
        pass: appPassword,
      },
    };
  } else if (provider === 'outlook') {
    transportOptions = {
      service: 'hotmail',
      auth: {
        user: fromEmail,
        pass: appPassword,
      },
    };
  } else if (provider === 'yahoo') {
    transportOptions = {
      service: 'yahoo',
      auth: {
        user: fromEmail,
        pass: appPassword,
      },
    };
  } else {
    // Custom SMTP
    const host = (body.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(body.smtpPort || process.env.SMTP_PORT || 465);
    const secure = body.smtpSecure !== undefined ? body.smtpSecure : port === 465;

    transportOptions = {
      host,
      port,
      secure,
      auth: {
        user: fromEmail,
        pass: appPassword,
      },
    };
  }

  const transporter = nodemailer.createTransport(transportOptions);

  const formattedFrom = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
  const toList = Array.isArray(body.to) ? body.to.join(', ') : body.to;

  const info = await transporter.sendMail({
    from: formattedFrom,
    to: toList,
    subject: body.subject || '(No Subject)',
    text: body.text || '',
    html: body.html || undefined,
  });

  return {
    success: true,
    messageId: info.messageId,
    accepted: info.accepted,
  };
}

// Handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await handleSendEmailRequest(body);
    return res.status(200).json(result);
  } catch (error: any) {
    let msg = error.message || 'Unknown SMTP error occurred';
    if (
      msg.includes('Invalid login') ||
      msg.includes('535-5.7.8') ||
      msg.includes('535 5.7.8') ||
      msg.includes('BadCredentials') ||
      msg.includes('Username and Password not accepted')
    ) {
      msg =
        'Authentication failed: Invalid email or App Password. If using Gmail, make sure 2-Step Verification is active and generate a 16-character "App Password" from your Google Account Security settings (your standard Google account password will not work).';
    }
    return res.status(400).json({ success: false, error: msg });
  }
}
