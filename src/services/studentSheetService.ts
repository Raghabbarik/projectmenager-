import * as XLSX from 'xlsx';
import { StudentRecord, StudentSheet, StudentEmailLog, EmailTemplate } from '../types/studentMailer';

const STORAGE_KEY_SHEETS = 'my_journey_student_sheets_v1';
const STORAGE_KEY_LOGS = 'my_journey_student_email_logs_v1';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const PRESET_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'announcement',
    title: '📢 General Academic Announcement',
    category: 'Announcement',
    subject: 'Important Announcement regarding {{course}} / {{department}}',
    body: `Hello {{name}},

This is an important update for all students enrolled in {{department}}.

Please ensure you review the latest curriculum schedule and check the online portal for newly posted materials and lecture summaries.

Student Details on Record:
- Name: {{name}}
- Roll / ID: {{rollNo}}
- Department: {{department}}

If you have any questions or require support, reply to this email directly.

Best regards,
Academic Administration & Management Team`,
  },
  {
    id: 'exam_schedule',
    title: '📝 Examination & Hall Ticket Notice',
    category: 'Exams',
    subject: 'Upcoming Semester Examination Schedule & Verification — {{rollNo}}',
    body: `Dear {{name}},

This notification confirms that your examination enrollment for {{department}} is registered.

Key Information:
- Candidate Name: {{name}}
- Roll / Registration No: {{rollNo}}
- Batch / Department: {{department}}
- Status: Verified & Eligible

Please download your digital hall ticket and ensure your photo ID is verified before the examination commencement. Arrive at least 20 minutes prior to scheduled slots.

Wishing you the very best in your examinations!

Academic Office`,
  },
  {
    id: 'project_submission',
    title: '⏳ Project & Deliverable Deadline',
    category: 'Assignments',
    subject: 'Action Required: Final Project Milestone Submission for {{name}}',
    body: `Hi {{name}},

A friendly reminder that the milestone submission deadline for your department ({{department}}) is approaching.

Please submit your code repository, documentation, and live preview links before the cutoff date. Submissions received after the deadline may incur milestone grading deductions.

Registered ID: {{rollNo}}
Assigned Batch: {{sheetName}}

Let us know if you encounter any blockers.

Regards,
Project Evaluation Committee`,
  },
  {
    id: 'internship_opportunity',
    title: '🚀 Placement & Internship Opportunity',
    category: 'Careers',
    subject: 'Exclusive Campus Placement Drive — {{name}} ({{department}})',
    body: `Dear {{name}},

We are excited to share an exclusive career and internship opportunity open to students of {{department}}.

Top partner companies are conducting preliminary technical screenings this month. Because your profile (Roll: {{rollNo}}) is in good standing, you are invited to submit your updated resume and portfolio.

Please submit your preference form within 48 hours.

Best of luck with your applications!

Career & Placement Cell`,
  },
  {
    id: 'attendance_notice',
    title: '⚠️ Attendance & Records Update',
    category: 'Attendance',
    subject: 'Notice: Monthly Attendance & Academic Review — {{name}}',
    body: `Dear {{name}},

This is a periodic academic records check for students registered in {{department}}.

Student Record:
- Student Name: {{name}}
- Roll Number: {{rollNo}}
- Sheet Cohort: {{sheetName}}

Please verify that all your session logs and lab attendances are correctly updated. If there are discrepancies in your logged hours, kindly report to the department coordinator.

Best regards,
Student Affairs Department`,
  },
];

export const SAMPLE_SHEETS: StudentSheet[] = [];

// Helper: Auto-detect column headers
export function detectColumnMappings(headers: string[]): {
  name: string;
  email: string;
  rollNo?: string;
  department?: string;
  phone?: string;
} {
  const norm = headers.map((h) => ({
    orig: h,
    clean: h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''),
  }));

  const findHeader = (patterns: RegExp[]): string => {
    for (const pat of patterns) {
      const match = norm.find((n) => pat.test(n.clean) || pat.test(n.orig.toLowerCase()));
      if (match) return match.orig;
    }
    return '';
  };

  const nameCol = findHeader([
    /^fullname$/,
    /^studentname$/,
    /^name$/,
    /name/,
    /^candidate$/,
    /^person$/,
  ]) || headers[0] || '';

  const emailCol = findHeader([
    /^email$/,
    /^emailaddress$/,
    /^studentemail$/,
    /email/,
    /mail/,
  ]) || headers.find((h) => /mail/i.test(h)) || headers[1] || '';

  const rollCol = findHeader([
    /^rollno$/,
    /^rollnumber$/,
    /^roll$/,
    /^id$/,
    /^studentid$/,
    /^regno$/,
    /^registrationno$/,
    /^usn$/,
    /^enrollment$/,
    /roll/i,
    /reg.*no/i,
  ]);

  const deptCol = findHeader([
    /^department$/,
    /^dept$/,
    /^course$/,
    /^branch$/,
    /^stream$/,
    /^specialization$/,
    /^batch$/,
    /^class$/,
    /^section$/,
    /dept/i,
    /branch/i,
  ]);

  const phoneCol = findHeader([
    /^phone$/,
    /^mobile$/,
    /^contact$/,
    /^cell$/,
    /^phonenumber$/,
    /phone/i,
    /mobile/i,
  ]);

  return {
    name: nameCol,
    email: emailCol,
    rollNo: rollCol || undefined,
    department: deptCol || undefined,
    phone: phoneCol || undefined,
  };
}

// Convert 2D table data to StudentRecords
export function convertRowsToStudents(
  headers: string[],
  rows: any[][],
  mappings: {
    name: string;
    email: string;
    rollNo?: string;
    department?: string;
    phone?: string;
  }
): StudentRecord[] {
  const nameIdx = headers.indexOf(mappings.name);
  const emailIdx = headers.indexOf(mappings.email);
  const rollIdx = mappings.rollNo ? headers.indexOf(mappings.rollNo) : -1;
  const deptIdx = mappings.department ? headers.indexOf(mappings.department) : -1;
  const phoneIdx = mappings.phone ? headers.indexOf(mappings.phone) : -1;

  const students: StudentRecord[] = [];

  rows.forEach((row, idx) => {
    // Skip completely empty row
    if (!row || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
      return;
    }

    const rawName = nameIdx >= 0 && row[nameIdx] !== undefined ? String(row[nameIdx]).trim() : '';
    const rawEmail = emailIdx >= 0 && row[emailIdx] !== undefined ? String(row[emailIdx]).trim() : '';
    const rawRoll = rollIdx >= 0 && row[rollIdx] !== undefined ? String(row[rollIdx]).trim() : '';
    const rawDept = deptIdx >= 0 && row[deptIdx] !== undefined ? String(row[deptIdx]).trim() : '';
    const rawPhone = phoneIdx >= 0 && row[phoneIdx] !== undefined ? String(row[phoneIdx]).trim() : '';

    // Only skip if both name and email are completely empty
    if (!rawName && !rawEmail) return;

    // Collect custom/extra fields
    const customFields: Record<string, string> = {};
    headers.forEach((h, hIdx) => {
      if (hIdx !== nameIdx && hIdx !== emailIdx && hIdx !== rollIdx && hIdx !== deptIdx && hIdx !== phoneIdx) {
        if (row[hIdx] !== undefined && row[hIdx] !== null && String(row[hIdx]).trim() !== '') {
          customFields[h] = String(row[hIdx]).trim();
        }
      }
    });

    const isValid = EMAIL_REGEX.test(rawEmail);

    students.push({
      id: `student-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      name: rawName || 'Unnamed Student',
      email: rawEmail,
      rollNo: rawRoll || undefined,
      department: rawDept || undefined,
      phone: rawPhone || undefined,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      isValidEmail: isValid,
    });
  });

  return students;
}

// Parse uploaded file (.xlsx, .xls, .csv)
export async function parseFileToSheet(
  file: File
): Promise<{
  sheetName: string;
  availableSheets: string[];
  rawHeaders: string[];
  rawRows: any[][];
  students: StudentRecord[];
  mappings: {
    name: string;
    email: string;
    rollNo?: string;
    department?: string;
    phone?: string;
  };
}> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('No sheets found in this file.');
  }

  const selectedSheetName = sheetNames[0];
  const worksheet = workbook.Sheets[selectedSheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!data || data.length === 0) {
    throw new Error('The selected sheet appears to be empty.');
  }

  // Find header row: first row that has at least 2 non-empty values
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const filledCount = (data[i] || []).filter((c) => c !== '' && c !== null && c !== undefined).length;
    if (filledCount >= 2) {
      headerRowIndex = i;
      break;
    }
  }

  const rawHeaders = (data[headerRowIndex] || []).map((h, i) =>
    h !== undefined && h !== null && String(h).trim() !== '' ? String(h).trim() : `Column ${i + 1}`
  );
  const rawRows = data.slice(headerRowIndex + 1);

  const mappings = detectColumnMappings(rawHeaders);
  const students = convertRowsToStudents(rawHeaders, rawRows, mappings);

  return {
    sheetName: file.name.replace(/\.[^/.]+$/, ''),
    availableSheets: sheetNames,
    rawHeaders,
    rawRows,
    students,
    mappings,
  };
}

// Fetch Google Sheet data via public export URL
export async function fetchGoogleSheet(
  inputUrl: string
): Promise<{
  sheetName: string;
  rawHeaders: string[];
  rawRows: any[][];
  students: StudentRecord[];
  mappings: {
    name: string;
    email: string;
    rollNo?: string;
    department?: string;
    phone?: string;
  };
}> {
  // Extract spreadsheet ID
  const idMatch = inputUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch || !idMatch[1]) {
    throw new Error('Invalid Google Sheet URL. Please ensure it contains "/spreadsheets/d/YOUR_SHEET_ID".');
  }

  const sheetId = idMatch[1];
  // Extract gid (tab id) if present
  const gidMatch = inputUrl.match(/gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  // Construct direct CSV export URLs
  const candidateUrls = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
  ];

  let csvText = '';
  let lastError: any = null;

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        csvText = await res.text();
        if (csvText && !csvText.includes('<!DOCTYPE html>') && !csvText.includes('<html')) {
          break;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!csvText || csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
    throw new Error(
      'Could not access Google Sheet. Please ensure the sheet sharing is set to "Anyone with the link can view", or use File > Share > Publish to web (CSV), or copy & paste rows directly.'
    );
  }

  // Parse CSV text with SheetJS
  const workbook = XLSX.read(csvText, { type: 'string' });
  const sheetName = workbook.SheetNames[0] || 'Google Sheet';
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!data || data.length === 0) {
    throw new Error('The Google Sheet returned empty data.');
  }

  const rawHeaders = (data[0] || []).map((h, i) =>
    h !== undefined && h !== null && String(h).trim() !== '' ? String(h).trim() : `Column ${i + 1}`
  );
  const rawRows = data.slice(1);
  const mappings = detectColumnMappings(rawHeaders);
  const students = convertRowsToStudents(rawHeaders, rawRows, mappings);

  return {
    sheetName: `Google Sheet (${sheetId.slice(0, 6)}...)`,
    rawHeaders,
    rawRows,
    students,
    mappings,
  };
}

// Parse pasted tabular text (TSV or CSV)
export function parsePastedTable(
  text: string,
  customSheetName?: string
): {
  sheetName: string;
  rawHeaders: string[];
  rawRows: any[][];
  students: StudentRecord[];
  mappings: {
    name: string;
    email: string;
    rollNo?: string;
    department?: string;
    phone?: string;
  };
} {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Pasted content is empty.');
  }

  // Use SheetJS to parse pasted string
  const workbook = XLSX.read(trimmed, { type: 'string' });
  const sheetName = workbook.SheetNames[0] || 'Pasted Table';
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!data || data.length === 0) {
    throw new Error('Could not parse any rows from the pasted text.');
  }

  const rawHeaders = (data[0] || []).map((h, i) =>
    h !== undefined && h !== null && String(h).trim() !== '' ? String(h).trim() : `Column ${i + 1}`
  );
  const rawRows = data.slice(1);
  const mappings = detectColumnMappings(rawHeaders);
  const students = convertRowsToStudents(rawHeaders, rawRows, mappings);

  return {
    sheetName: customSheetName || `Pasted Roster (${new Date().toLocaleDateString()})`,
    rawHeaders,
    rawRows,
    students,
    mappings,
  };
}

// Storage helpers
export function loadSavedSheets(): StudentSheet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHEETS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any previous dummy/sample sheets
      const realSheets = parsed.filter((s) => s && s.id && !s.id.startsWith('sample-'));
      return realSheets;
    }
    return [];
  } catch (e) {
    console.error('Error loading student sheets:', e);
    return [];
  }
}

export function clearAllSavedSheets(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SHEETS);
  } catch (e) {
    console.error('Error clearing student sheets:', e);
  }
}

export function saveSheetsToStorage(sheets: StudentSheet[]): void {
  try {
    const cleanSheets = sheets.filter((s) => s && s.id && !s.id.startsWith('sample-'));
    localStorage.setItem(STORAGE_KEY_SHEETS, JSON.stringify(cleanSheets));
  } catch (e) {
    console.error('Error saving student sheets:', e);
  }
}

export function loadEmailLogs(): StudentEmailLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading email logs:', e);
    return [];
  }
}

export function saveEmailLog(log: StudentEmailLog): void {
  try {
    const existing = loadEmailLogs();
    const updated = [log, ...existing].slice(0, 50); // Keep last 50 logs
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving email log:', e);
  }
}

export function clearEmailLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LOGS);
  } catch (e) {
    console.error('Error clearing email logs:', e);
  }
}

// Template dynamic placeholder substitution
export function renderTemplate(
  templateStr: string,
  student: StudentRecord,
  sheetName: string
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return templateStr
    .replace(/\{\{\s*name\s*\}\}/gi, student.name || 'Student')
    .replace(/\{\{\s*email\s*\}\}/gi, student.email || '')
    .replace(/\{\{\s*rollNo\s*\}\}/gi, student.rollNo || 'N/A')
    .replace(/\{\{\s*id\s*\}\}/gi, student.rollNo || 'N/A')
    .replace(/\{\{\s*department\s*\}\}/gi, student.department || 'General')
    .replace(/\{\{\s*course\s*\}\}/gi, student.course || student.department || 'Course')
    .replace(/\{\{\s*phone\s*\}\}/gi, student.phone || '')
    .replace(/\{\{\s*sheetName\s*\}\}/gi, sheetName || 'Class Roster')
    .replace(/\{\{\s*date\s*\}\}/gi, dateStr);
}

// Generate Gmail Web Composer Link (with BCC recipient list)
export function generateGmailComposeUrl(
  recipients: string[],
  subject: string,
  body: string
): string {
  const bcc = encodeURIComponent(recipients.join(','));
  const sub = encodeURIComponent(subject);
  const msg = encodeURIComponent(body);
  return `https://mail.google.com/mail/?view=cm&fs=1&bcc=${bcc}&su=${sub}&body=${msg}`;
}

// Generate Gmail Web Composer Link for an individual student (direct "To:" recipient)
export function generateSingleGmailComposeUrl(
  toEmail: string,
  subject: string,
  body: string
): string {
  const to = encodeURIComponent(toEmail.trim());
  const sub = encodeURIComponent(subject);
  const msg = encodeURIComponent(body);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${sub}&body=${msg}`;
}

// Generate standard Mailto URL with BCC
export function generateMailtoUrl(
  recipients: string[],
  subject: string,
  body: string
): string {
  const bcc = encodeURIComponent(recipients.join(','));
  const sub = encodeURIComponent(subject);
  const msg = encodeURIComponent(body);
  return `mailto:?bcc=${bcc}&subject=${sub}&body=${msg}`;
}

// Generate Mailto URL for an individual student (direct "To:" recipient)
export function generateSingleMailtoUrl(
  toEmail: string,
  subject: string,
  body: string
): string {
  const to = encodeURIComponent(toEmail.trim());
  const sub = encodeURIComponent(subject);
  const msg = encodeURIComponent(body);
  return `mailto:${to}?subject=${sub}&body=${msg}`;
}

// Dispatch REAL emails to student mailboxes using Resend API (HTTP direct dispatch)
export async function sendRealEmailsViaResend(
  apiKey: string,
  fromEmail: string,
  recipients: StudentRecord[],
  subjectTemplate: string,
  bodyTemplate: string,
  sheetName: string,
  senderUser: { name: string; email: string },
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
  const validRecipients = recipients.filter((r) => r.isValidEmail && r.email.trim());
  const errors: string[] = [];
  let sentCount = 0;

  for (let i = 0; i < validRecipients.length; i++) {
    const student = validRecipients[i];
    const resolvedSubject = renderTemplate(subjectTemplate, student, sheetName);
    const resolvedBody = renderTemplate(bodyTemplate, student, sheetName);

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail.trim() || 'onboarding@resend.dev',
          to: [student.email.trim()],
          subject: resolvedSubject,
          text: resolvedBody,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        errors.push(`${student.email}: ${errJson.message || res.statusText}`);
      } else {
        sentCount++;
      }
    } catch (e: any) {
      errors.push(`${student.email}: ${e.message || 'Network error'}`);
    }

    if (onProgress) {
      onProgress({
        sentCount: i + 1,
        total: validRecipients.length,
        currentStudent: student,
        percentage: Math.round(((i + 1) / validRecipients.length) * 100),
      });
    }
  }

  const log: StudentEmailLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sheetId: `sheet-${Date.now()}`,
    sheetName,
    subject: subjectTemplate,
    content: bodyTemplate,
    recipientsCount: sentCount,
    recipientEmails: validRecipients.map((r) => r.email),
    sentAt: new Date().toISOString(),
    status: errors.length > 0 ? (sentCount > 0 ? 'partial' : 'failed') : 'sent',
    senderEmail: senderUser.email,
    senderName: senderUser.name,
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

// Batch Dispatch Simulation with live transmission progress
export async function dispatchInAppStudentEmails(
  recipients: StudentRecord[],
  subjectTemplate: string,
  bodyTemplate: string,
  sheetName: string,
  senderUser: { name: string; email: string },
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
  log: StudentEmailLog;
}> {
  const validRecipients = recipients.filter((r) => r.isValidEmail && r.email.trim());
  const invalidCount = recipients.length - validRecipients.length;

  for (let i = 0; i < validRecipients.length; i++) {
    const student = validRecipients[i];
    // Realistic simulated sending latency for dispatch experience
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (onProgress) {
      onProgress({
        sentCount: i + 1,
        total: validRecipients.length,
        currentStudent: student,
        percentage: Math.round(((i + 1) / validRecipients.length) * 100),
      });
    }
  }

  const log: StudentEmailLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sheetId: `sheet-${Date.now()}`,
    sheetName,
    subject: subjectTemplate,
    content: bodyTemplate,
    recipientsCount: validRecipients.length,
    recipientEmails: validRecipients.map((r) => r.email),
    sentAt: new Date().toISOString(),
    status: invalidCount > 0 && validRecipients.length > 0 ? 'partial' : 'sent',
    senderEmail: senderUser.email,
    senderName: senderUser.name,
  };

  saveEmailLog(log);

  return {
    success: true,
    totalSent: validRecipients.length,
    failedCount: invalidCount,
    log,
  };
}
