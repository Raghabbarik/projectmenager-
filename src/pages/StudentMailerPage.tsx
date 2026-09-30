import React, { useState, useEffect, useMemo } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  GraduationCap,
  FileSpreadsheet,
  UploadCloud,
  Link as LinkIcon,
  ClipboardPaste,
  Mail,
  Send,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  Trash2,
  Edit3,
  Download,
  ExternalLink,
  Copy,
  RotateCcw,
  Eye,
  EyeOff,
  Users,
  Check,
  X,
  Plus,
  Clock,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
} from 'lucide-react';
import {
  StudentRecord,
  StudentSheet,
  StudentEmailLog,
} from '../types/studentMailer';
import {
  getSmtpConfig,
  saveSmtpConfig,
  isSmtpConfigured,
  sendBatchEmailsViaSmtp,
} from '../services/emailService';
import {
  loadSavedSheets,
  saveSheetsToStorage,
  loadEmailLogs,
  clearEmailLogs,
  parseFileToSheet,
  fetchGoogleSheet,
  parsePastedTable,
  convertRowsToStudents,
  renderTemplate,
  generateGmailComposeUrl,
  generateSingleGmailComposeUrl,
  generateMailtoUrl,
  generateSingleMailtoUrl,
  sendRealEmailsViaResend,
  dispatchInAppStudentEmails,
  PRESET_EMAIL_TEMPLATES,
} from '../services/studentSheetService';

export const StudentMailerPage: React.FC = () => {
  const { user, showToast } = useJourney();

  // Multi-sheet state (defaults to empty: no pre-existing fake students)
  const [sheets, setSheets] = useState<StudentSheet[]>(() => loadSavedSheets());
  const [activeSheetId, setActiveSheetId] = useState<string>(() => {
    const saved = loadSavedSheets();
    return saved.length > 0 ? saved[0].id : '';
  });

  // Current active sheet
  const activeSheet = useMemo(() => {
    return sheets.find((s) => s.id === activeSheetId) || sheets[0] || null;
  }, [sheets, activeSheetId]);

  // Selected students in active sheet (set of student IDs)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [emailStatusFilter, setEmailStatusFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  // Top Upload / Fetch Panel State
  const [showUploadPanel, setShowUploadPanel] = useState<boolean>(() => sheets.length === 0);
  const [importMethod, setImportMethod] = useState<'file' | 'google-sheet' | 'paste'>('file');
  const [googleSheetUrlInput, setGoogleSheetUrlInput] = useState('');
  const [pastedTextInput, setPastedTextInput] = useState('');
  const [customSheetName, setCustomSheetName] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Staged fetch result for review & mapping before adding to roster
  const [stagedFetch, setStagedFetch] = useState<{
    sheetName: string;
    rawHeaders: string[];
    rawRows: any[][];
    mappings: {
      name: string;
      email: string;
      rollNo?: string;
      department?: string;
      phone?: string;
    };
    students: StudentRecord[];
  } | null>(null);

  // Rename Sheet Modal
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Email Composer Modal
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    'Important Academic Update for {{name}} — {{sheetName}}'
  );
  const [emailBody, setEmailBody] = useState(PRESET_EMAIL_TEMPLATES[0].body);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('announcement');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<{
    sent: number;
    total: number;
    currentName: string;
    percent: number;
  }>({
    sent: 0,
    total: 0,
    currentName: '',
    percent: 0,
  });
  const [sendSuccessReceipt, setSendSuccessReceipt] = useState<StudentEmailLog | null>(null);

  // Direct SMTP Configuration (From Email & App Password)
  const [smtpConfig, setSmtpConfig] = useState(() => getSmtpConfig());
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [smtpPasswordVisible, setSmtpPasswordVisible] = useState(false);

  // Real Email API Configuration (Resend API)
  const [resendApiKey, setResendApiKey] = useState(() => localStorage.getItem('my_journey_resend_api_key') || '');
  const [resendFromEmail, setResendFromEmail] = useState(() => localStorage.getItem('my_journey_resend_from') || 'onboarding@resend.dev');
  const [showApiSettings, setShowApiSettings] = useState(false);

  // View Mode: 'roster' vs 'logs'
  const [activeTab, setActiveTab] = useState<'roster' | 'logs'>('roster');
  const [emailLogs, setEmailLogs] = useState<StudentEmailLog[]>(() => loadEmailLogs());
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Keep storage synchronized
  useEffect(() => {
    saveSheetsToStorage(sheets);
  }, [sheets]);

  // Reset selection and filters when active sheet switches
  useEffect(() => {
    if (activeSheet) {
      setSelectedStudentIds(new Set());
      setSearchQuery('');
      setDepartmentFilter('all');
      setEmailStatusFilter('all');
    }
  }, [activeSheetId]);

  // If no sheets remain, expand the upload panel automatically
  useEffect(() => {
    if (sheets.length === 0) {
      setShowUploadPanel(true);
    }
  }, [sheets.length]);

  // Get unique departments for active sheet
  const availableDepartments = useMemo(() => {
    if (!activeSheet) return [];
    const depts = new Set<string>();
    activeSheet.students.forEach((s) => {
      if (s.department && s.department.trim()) {
        depts.add(s.department.trim());
      }
    });
    return Array.from(depts).sort();
  }, [activeSheet]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    if (!activeSheet) return [];
    let list = activeSheet.students;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
          (s.department && s.department.toLowerCase().includes(q))
      );
    }

    if (departmentFilter !== 'all') {
      list = list.filter((s) => s.department === departmentFilter);
    }

    if (emailStatusFilter === 'valid') {
      list = list.filter((s) => s.isValidEmail);
    } else if (emailStatusFilter === 'invalid') {
      list = list.filter((s) => !s.isValidEmail);
    }

    return list;
  }, [activeSheet, searchQuery, departmentFilter, emailStatusFilter]);

  // Selection handlers
  const isAllFilteredSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => selectedStudentIds.has(s.id));
  }, [filteredStudents, selectedStudentIds]);

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const next = new Set(selectedStudentIds);
      filteredStudents.forEach((s) => next.delete(s.id));
      setSelectedStudentIds(next);
    } else {
      const next = new Set(selectedStudentIds);
      filteredStudents.forEach((s) => next.add(s.id));
      setSelectedStudentIds(next);
    }
  };

  const toggleSelectStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudentIds(next);
  };

  const selectValidEmailsOnly = () => {
    if (!activeSheet) return;
    const next = new Set<string>();
    activeSheet.students.forEach((s) => {
      if (s.isValidEmail && s.email.trim()) {
        next.add(s.id);
      }
    });
    setSelectedStudentIds(next);
    showToast(`Selected ${next.size} students with verified email addresses`, 'info');
  };

  const clearSelection = () => {
    setSelectedStudentIds(new Set());
  };

  // Selected student records for mailing
  const selectedStudentsList = useMemo(() => {
    if (!activeSheet) return [];
    return activeSheet.students.filter((s) => selectedStudentIds.has(s.id));
  }, [activeSheet, selectedStudentIds]);

  const previewStudent = useMemo(() => {
    if (selectedStudentsList.length > 0) return selectedStudentsList[0];
    if (activeSheet && activeSheet.students.length > 0) return activeSheet.students[0];
    return null;
  }, [selectedStudentsList, activeSheet]);

  // =========================================================================
  // Sheet Fetch / Upload Handlers
  // =========================================================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const parsed = await parseFileToSheet(file);
      setStagedFetch({
        sheetName: file.name.replace(/\.[^/.]+$/, ''),
        rawHeaders: parsed.rawHeaders,
        rawRows: parsed.rawRows,
        mappings: parsed.mappings,
        students: parsed.students,
      });
      if (!customSheetName) {
        setCustomSheetName(file.name.replace(/\.[^/.]+$/, ''));
      }
      showToast(`Extracted ${parsed.students.length} students from file!`, 'success');
    } catch (err: any) {
      setFetchError(err.message || 'Failed to parse spreadsheet file.');
    } finally {
      setIsFetching(false);
      e.target.value = '';
    }
  };

  const handleFetchGoogleSheet = async () => {
    if (!googleSheetUrlInput.trim()) {
      setFetchError('Please paste a valid Google Sheet URL.');
      return;
    }
    setIsFetching(true);
    setFetchError(null);
    try {
      const fetched = await fetchGoogleSheet(googleSheetUrlInput.trim());
      setStagedFetch({
        sheetName: customSheetName.trim() || fetched.sheetName,
        rawHeaders: fetched.rawHeaders,
        rawRows: fetched.rawRows,
        mappings: fetched.mappings,
        students: fetched.students,
      });
      if (!customSheetName) {
        setCustomSheetName(fetched.sheetName);
      }
      showToast(`Fetched ${fetched.students.length} students from Google Sheet!`, 'success');
    } catch (err: any) {
      setFetchError(err.message || 'Failed to fetch Google Sheet.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleParsePastedRows = () => {
    if (!pastedTextInput.trim()) {
      setFetchError('Please paste student table rows first.');
      return;
    }
    setIsFetching(true);
    setFetchError(null);
    try {
      const parsed = parsePastedTable(pastedTextInput, customSheetName.trim());
      setStagedFetch({
        sheetName: customSheetName.trim() || parsed.sheetName,
        rawHeaders: parsed.rawHeaders,
        rawRows: parsed.rawRows,
        mappings: parsed.mappings,
        students: parsed.students,
      });
      if (!customSheetName) {
        setCustomSheetName(parsed.sheetName);
      }
      showToast(`Parsed ${parsed.students.length} students from pasted rows!`, 'success');
    } catch (err: any) {
      setFetchError(err.message || 'Failed to parse pasted table rows.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleStagingMappingChange = (key: string, headerName: string) => {
    if (!stagedFetch) return;
    const newMappings = {
      ...stagedFetch.mappings,
      [key]: headerName || undefined,
    };
    const updatedStudents = convertRowsToStudents(
      stagedFetch.rawHeaders,
      stagedFetch.rawRows,
      newMappings as any
    );
    setStagedFetch({
      ...stagedFetch,
      mappings: newMappings as any,
      students: updatedStudents,
    });
  };

  const handleCommitFetchedSheet = () => {
    if (!stagedFetch) return;
    if (stagedFetch.students.length === 0) {
      setFetchError('Cannot load sheet with 0 student records.');
      return;
    }

    const validCount = stagedFetch.students.filter((s) => s.isValidEmail).length;
    const newSheet: StudentSheet = {
      id: `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: customSheetName.trim() || stagedFetch.sheetName,
      sourceType: importMethod,
      uploadedAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      students: stagedFetch.students,
      columnMappings: stagedFetch.mappings,
      totalCount: stagedFetch.students.length,
      validEmailCount: validCount,
      googleSheetUrl: importMethod === 'google-sheet' ? googleSheetUrlInput.trim() : undefined,
    };

    const updated = [newSheet, ...sheets];
    setSheets(updated);
    setActiveSheetId(newSheet.id);
    setStagedFetch(null);
    setGoogleSheetUrlInput('');
    setPastedTextInput('');
    setCustomSheetName('');
    setFetchError(null);
    setShowUploadPanel(false); // Collapse upload panel so student details take center stage
    showToast(`Loaded ${newSheet.students.length} students into roster below!`, 'success');
  };

  const handleDeleteSheet = (idToDelete: string) => {
    const target = sheets.find((s) => s.id === idToDelete);
    if (!window.confirm(`Are you sure you want to remove sheet "${target?.name || ''}"?`)) {
      return;
    }
    const updated = sheets.filter((s) => s.id !== idToDelete);
    setSheets(updated);
    if (activeSheetId === idToDelete) {
      setActiveSheetId(updated.length > 0 ? updated[0].id : '');
    }
    showToast('Sheet removed.', 'info');
  };

  const handleOpenRename = () => {
    if (!activeSheet) return;
    setRenameValue(activeSheet.name);
    setShowRenameModal(true);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim() || !activeSheet) return;
    const updated = sheets.map((s) =>
      s.id === activeSheet.id ? { ...s, name: renameValue.trim() } : s
    );
    setSheets(updated);
    setShowRenameModal(false);
    showToast('Sheet renamed successfully.', 'success');
  };

  const handleExportSheetCsv = () => {
    if (!activeSheet) return;
    const headers = ['Name', 'Email', 'Roll No', 'Department', 'Phone', 'Valid Email'];
    const rows = activeSheet.students.map((s) => [
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.rollNo || '').replace(/"/g, '""')}"`,
      `"${(s.department || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      s.isValidEmail ? 'YES' : 'NO',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Sheet exported as CSV', 'success');
  };

  // Copy selected email addresses to clipboard
  const handleCopyEmails = () => {
    const emails = selectedStudentsList
      .filter((s) => s.isValidEmail && s.email.trim())
      .map((s) => s.email.trim());
    if (emails.length === 0) {
      showToast('No valid emails to copy.', 'warning');
      return;
    }
    navigator.clipboard.writeText(emails.join(', '));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
    showToast(`Copied ${emails.length} email addresses to clipboard!`, 'success');
  };

  // Dispatch Email Broadcast
  const handleSendBroadcast = async () => {
    if (selectedStudentsList.length === 0) {
      showToast('Please select at least one student to send email.', 'warning');
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      showToast('Please enter both subject and message body.', 'warning');
      return;
    }

    const validRecipients = selectedStudentsList.filter((s) => s.isValidEmail);
    if (validRecipients.length === 0) {
      showToast('None of the selected students have valid email addresses.', 'warning');
      return;
    }

    setIsSending(true);
    setSendSuccessReceipt(null);
    setSendingProgress({
      sent: 0,
      total: validRecipients.length,
      currentName: validRecipients[0].name,
      percent: 0,
    });

    try {
      const result = await dispatchInAppStudentEmails(
        validRecipients,
        emailSubject,
        emailBody,
        activeSheet?.name || 'Class Sheet',
        { name: user.name || 'Admin', email: user.email || 'admin@myjourney.app' },
        (progress) => {
          setSendingProgress({
            sent: progress.sentCount,
            total: progress.total,
            currentName: progress.currentStudent.name,
            percent: progress.percentage,
          });
        }
      );

      setSendSuccessReceipt(result.log);
      setEmailLogs(loadEmailLogs());
      showToast(
        `Email broadcast delivered to ${result.totalSent} students!`,
        'success'
      );
    } catch (err: any) {
      showToast(`Broadcast error: ${err.message || 'Failed to dispatch'}`, 'warning');
    } finally {
      setIsSending(false);
    }
  };

  // Dispatch REAL emails directly to inboxes using Resend API
  const handleSendViaResend = async () => {
    if (!resendApiKey.trim()) {
      showToast('Please enter your Resend API Key to send real automated emails.', 'warning');
      setShowApiSettings(true);
      return;
    }
    const validRecipients = selectedStudentsList.filter((s) => s.isValidEmail);
    if (validRecipients.length === 0) {
      showToast('No valid student emails selected.', 'warning');
      return;
    }

    setIsSending(true);
    setSendSuccessReceipt(null);
    setSendingProgress({
      sent: 0,
      total: validRecipients.length,
      currentName: validRecipients[0].name,
      percent: 0,
    });

    try {
      const result = await sendRealEmailsViaResend(
        resendApiKey.trim(),
        resendFromEmail.trim() || 'onboarding@resend.dev',
        validRecipients,
        emailSubject,
        emailBody,
        activeSheet?.name || 'Class Sheet',
        { name: user.name || 'Admin', email: user.email || 'admin@myjourney.app' },
        (prog) => {
          setSendingProgress({
            sent: prog.sentCount,
            total: prog.total,
            currentName: prog.currentStudent.name,
            percent: prog.percentage,
          });
        }
      );

      setSendSuccessReceipt(result.log);
      setEmailLogs(loadEmailLogs());
      if (result.success) {
        showToast(`Real emails delivered to ${result.totalSent} student inboxes via Resend API!`, 'success');
      } else {
        showToast(`Resend API error: ${result.errors[0] || 'Failed to dispatch'}`, 'warning');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message || 'Failed to send'}`, 'warning');
    } finally {
      setIsSending(false);
    }
  };

  // Dispatch REAL emails directly via SMTP (From Email & App Password)
  const handleSendViaSmtp = async () => {
    const currentCfg = getSmtpConfig();
    if (!currentCfg.fromEmail.trim() || !currentCfg.appPassword.trim()) {
      showToast('Please enter your From Email and App Password in the SMTP settings below.', 'warning');
      setShowSmtpSettings(true);
      return;
    }
    const validRecipients = selectedStudentsList.filter((s) => s.isValidEmail);
    if (validRecipients.length === 0) {
      showToast('No valid student emails selected.', 'warning');
      return;
    }

    setIsSending(true);
    setSendSuccessReceipt(null);
    setSendingProgress({
      sent: 0,
      total: validRecipients.length,
      currentName: validRecipients[0].name,
      percent: 0,
    });

    try {
      const result = await sendBatchEmailsViaSmtp(
        validRecipients,
        emailSubject,
        emailBody,
        activeSheet?.name || 'Class Sheet',
        { name: user.name || 'Admin', email: user.email || currentCfg.fromEmail },
        currentCfg,
        (prog) => {
          setSendingProgress({
            sent: prog.sentCount,
            total: prog.total,
            currentName: prog.currentStudent.name,
            percent: prog.percentage,
          });
        }
      );

      setSendSuccessReceipt(result.log);
      setEmailLogs(loadEmailLogs());
      if (result.success) {
        showToast(
          `Delivered ${result.totalSent} live emails directly from ${currentCfg.fromEmail}!`,
          'success'
        );
      } else {
        showToast(`SMTP error: ${result.errors[0] || 'Failed to dispatch'}`, 'warning');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message || 'Failed to dispatch via SMTP'}`, 'warning');
    } finally {
      setIsSending(false);
    }
  };

  const handleLaunchGmail = () => {
    const emails = selectedStudentsList
      .filter((s) => s.isValidEmail && s.email.trim())
      .map((s) => s.email.trim());
    if (emails.length === 0) {
      showToast('No valid student emails selected.', 'warning');
      return;
    }
    const sampleStudent = selectedStudentsList[0] || { name: 'Student', email: '', rollNo: '' };
    const resolvedSubject = renderTemplate(emailSubject, sampleStudent, activeSheet?.name || '');
    const resolvedBody = renderTemplate(emailBody, sampleStudent, activeSheet?.name || '');
    const url = generateGmailComposeUrl(emails, resolvedSubject, resolvedBody);
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`Opened Gmail composer with ${emails.length} BCC recipients!`, 'info');
  };

  const handleLaunchDefaultMail = () => {
    const emails = selectedStudentsList
      .filter((s) => s.isValidEmail && s.email.trim())
      .map((s) => s.email.trim());
    if (emails.length === 0) {
      showToast('No valid student emails selected.', 'warning');
      return;
    }
    const sampleStudent = selectedStudentsList[0] || { name: 'Student', email: '', rollNo: '' };
    const resolvedSubject = renderTemplate(emailSubject, sampleStudent, activeSheet?.name || '');
    const resolvedBody = renderTemplate(emailBody, sampleStudent, activeSheet?.name || '');
    const url = generateMailtoUrl(emails, resolvedSubject, resolvedBody);
    window.location.href = url;
    showToast(`Launching default mail client for ${emails.length} students...`, 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & SECTION HERO */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 dark:from-neutral-900 dark:via-neutral-900/80 dark:to-neutral-850 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
              <GraduationCap className="w-3.5 h-3.5" />
              Student Broadcast Hub
            </span>
            <span className="text-xs text-neutral-400 font-mono">Clean Sheet Mailer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Student Sheet Mailer
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Upload your student sheet or link a Google Sheet above. The application will fetch
            and display student details in the downside, allowing you to select individual students
            or the entire cohort to send emails.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setShowUploadPanel((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{showUploadPanel ? 'Hide Sheet Upload' : 'Upload / Link Sheet'}</span>
            {showUploadPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setActiveTab((prev) => (prev === 'roster' ? 'logs' : 'roster'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{activeTab === 'roster' ? `Broadcast Logs (${emailLogs.length})` : 'Student Roster'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP UPLOAD / CONNECT SHEET CONSOLE */}
      {/* ========================================================================= */}
      {showUploadPanel && (
        <div className="bg-white dark:bg-neutral-900 border-2 border-indigo-500/30 dark:border-indigo-500/20 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Upload or Connect Student Sheet
                </h3>
                <p className="text-xs text-neutral-500">
                  Choose your source, fetch the student rows, and inspect the details below.
                </p>
              </div>
            </div>

            {sheets.length > 0 && (
              <button
                onClick={() => setShowUploadPanel(false)}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer flex items-center gap-1"
              >
                <span>Close Panel</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Error Message */}
          {fetchError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{fetchError}</div>
            </div>
          )}

          {!stagedFetch ? (
            <div className="space-y-4">
              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-semibold max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    setImportMethod('file');
                    setFetchError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                    importMethod === 'file'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Excel / CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportMethod('google-sheet');
                    setFetchError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                    importMethod === 'google-sheet'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Google Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportMethod('paste');
                    setFetchError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                    importMethod === 'paste'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Paste Rows</span>
                </button>
              </div>

              {/* Optional Custom Sheet Name */}
              <div className="max-w-md">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Sheet or Cohort Name (Optional)
                </label>
                <input
                  type="text"
                  value={customSheetName}
                  onChange={(e) => setCustomSheetName(e.target.value)}
                  placeholder="e.g. Computer Science - Year 2 Roster"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Method 1: File Upload */}
              {importMethod === 'file' && (
                <div>
                  <label className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-indigo-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-850/50">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      disabled={isFetching}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                      <UploadCloud className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {isFetching ? 'Fetching & Parsing Sheet...' : 'Click to Upload Excel (.xlsx, .xls) or CSV Sheet'}
                    </div>
                    <p className="text-[11px] text-neutral-500 max-w-sm mt-1">
                      Drag & drop your student file here. Headers and student details will be extracted automatically.
                    </p>
                  </label>
                </div>
              )}

              {/* Method 2: Google Sheets URL */}
              {importMethod === 'google-sheet' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Google Sheet Share Link *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={googleSheetUrlInput}
                        onChange={(e) => setGoogleSheetUrlInput(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs.../edit"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleFetchGoogleSheet}
                        disabled={isFetching || !googleSheetUrlInput.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                      >
                        {isFetching ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Fetching...</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Fetch Details</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200">
                    💡 Make sure your Google Sheet sharing is set to <strong>"Anyone with the link can view"</strong> so the app can fetch data.
                  </div>
                </div>
              )}

              {/* Method 3: Paste Table */}
              {importMethod === 'paste' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Paste Rows from Google Sheets or Excel *
                    </label>
                    <textarea
                      rows={5}
                      value={pastedTextInput}
                      onChange={(e) => setPastedTextInput(e.target.value)}
                      placeholder={`Name\tEmail\tRollNo\tDepartment\nAarav Patel\taarav@example.com\tCS-01\tComputer Science\nPriya Sharma\tpriya@example.com\tCS-02\tInformation Tech`}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleParsePastedRows}
                    disabled={isFetching || !pastedTextInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Process & Fetch Details</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Staging & Column Confirmation Screen */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="font-bold text-emerald-900 dark:text-emerald-100">
                      Successfully Fetched {stagedFetch.students.length} Student Records!
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Verify column mappings and click below to load them into the downside roster.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedFetch(null)}
                  className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                >
                  Change File / Link
                </button>
              </div>

              {/* Column Mapping Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Student Name *
                  </label>
                  <select
                    value={stagedFetch.mappings.name}
                    onChange={(e) => handleStagingMappingChange('name', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    {stagedFetch.rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Student Email *
                  </label>
                  <select
                    value={stagedFetch.mappings.email}
                    onChange={(e) => handleStagingMappingChange('email', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    {stagedFetch.rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Roll No / ID (Optional)
                  </label>
                  <select
                    value={stagedFetch.mappings.rollNo || ''}
                    onChange={(e) => handleStagingMappingChange('rollNo', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value="">-- None --</option>
                    {stagedFetch.rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Department (Optional)
                  </label>
                  <select
                    value={stagedFetch.mappings.department || ''}
                    onChange={(e) => handleStagingMappingChange('department', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value="">-- None --</option>
                    {stagedFetch.rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStagedFetch(null)}
                  className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommitFetchedSheet}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Load Student Details to Downside ({stagedFetch.students.length} students)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MULTI-SHEET TABS BAR (If sheets exist) */}
      {/* ========================================================================= */}
      {sheets.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-2 text-neutral-500 font-medium">
              <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
              <span>Loaded Sheets ({sheets.length})</span>
            </div>
            <button
              onClick={() => {
                setStagedFetch(null);
                setFetchError(null);
                setShowUploadPanel(true);
              }}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Another Sheet</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {sheets.map((sheet) => {
              const isActive = sheet.id === activeSheetId;
              return (
                <div
                  key={sheet.id}
                  onClick={() => setActiveSheetId(sheet.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all shrink-0 ${
                    isActive
                      ? 'bg-white dark:bg-neutral-900 border-indigo-500/80 dark:border-indigo-400/80 shadow-xs ring-1 ring-indigo-500/20 text-neutral-900 dark:text-neutral-100'
                      : 'bg-neutral-100/60 dark:bg-neutral-850/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-850'
                  }`}
                >
                  <FileSpreadsheet
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'
                    }`}
                  />
                  <span className="font-semibold max-w-[180px] truncate">{sheet.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {sheet.students.length} students
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DOWNSIDE: STUDENT DETAILS ROSTER OR LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'logs' ? (
        /* Broadcast History View */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Student Broadcast Logs</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Audit history of all email notifications sent to students.
              </p>
            </div>
            {emailLogs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all student broadcast logs?')) {
                    clearEmailLogs();
                    setEmailLogs([]);
                    showToast('Broadcast logs cleared.', 'info');
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {emailLogs.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-neutral-400">
              <Mail className="w-8 h-8 mx-auto stroke-1" />
              <div className="text-sm font-medium">No emails sent yet</div>
              <p className="text-xs max-w-sm mx-auto">
                Upload a student sheet, select students in the roster below, and send an email
                broadcast to see delivery logs here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {log.status}
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {log.subject}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(log.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 font-mono bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 line-clamp-2">
                    {log.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <div className="flex items-center gap-3">
                      <span>Sheet: <strong>{log.sheetName}</strong></span>
                      <span>•</span>
                      <span>Recipients: <strong>{log.recipientsCount} students</strong></span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Sent by {log.senderName} ({log.senderEmail})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeSheet ? (
        /* Downside: Student Details Table */
        <div className="space-y-4">
          {/* Active Sheet Toolbar & Details */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {activeSheet.name}
                    </h2>
                    <button
                      onClick={handleOpenRename}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                      title="Rename Sheet"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <span>Source: <strong className="capitalize">{activeSheet.sourceType}</strong></span>
                    <span>•</span>
                    <span>Added: {new Date(activeSheet.uploadedAt).toLocaleDateString()}</span>
                    {activeSheet.googleSheetUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={activeSheet.googleSheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>Google Sheet Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportSheetCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => handleDeleteSheet(activeSheet.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Remove this sheet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Sheet</span>
                </button>
              </div>
            </div>

            {/* Statistics Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Total Students
                </div>
                <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {activeSheet.students.length}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  <span>Valid Emails</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {activeSheet.validEmailCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Invalid / Missing</span>
                </div>
                <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300 mt-0.5">
                  {activeSheet.students.length - activeSheet.validEmailCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40">
                <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  <span>Selected for Mail</span>
                </div>
                <div className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-0.5">
                  {selectedStudentIds.size}
                </div>
              </div>
            </div>

            {/* Search & Quick Selection Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name, roll number, or email…"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {availableDepartments.length > 0 && (
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="all">All Departments ({availableDepartments.length})</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={emailStatusFilter}
                  onChange={(e) => setEmailStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Email Status</option>
                  <option value="valid">Verified Emails Only</option>
                  <option value="invalid">Invalid / Missing Only</option>
                </select>
              </div>

              {/* Select All & Select Valid controls */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={toggleSelectAllFiltered}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                >
                  {isAllFilteredSelected ? 'Deselect All' : `Select All Shown (${filteredStudents.length})`}
                </button>

                <button
                  type="button"
                  onClick={selectValidEmailsOnly}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                >
                  Select Valid Only
                </button>

                {selectedStudentIds.size > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Banner when students are selected */}
          {selectedStudentIds.size > 0 && (
            <div className="sticky top-20 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 bg-indigo-600 text-white rounded-2xl shadow-lg animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-mono font-bold text-sm">
                  {selectedStudentIds.size}
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">
                    {selectedStudentIds.size === activeSheet.students.length
                      ? 'Whole Student Cohort Selected'
                      : `${selectedStudentIds.size} Particular Students Selected`}
                  </div>
                  <div className="text-[11px] text-indigo-100">
                    Ready to send emails or copy verified recipient addresses.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyEmails}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedNotification ? 'Copied!' : 'Copy Emails'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowComposeModal(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Compose & Send Mail ({selectedStudentIds.size})</span>
                </button>
              </div>
            </div>
          )}

          {/* Student Details Roster Table */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/70 text-neutral-500 font-semibold">
                    <th className="py-3 px-4 w-12 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAllFiltered}
                        className="cursor-pointer text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title={isAllFilteredSelected ? 'Deselect all' : 'Select all'}
                      >
                        {isAllFilteredSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Roll / Student ID</th>
                    <th className="py-3 px-4">Department / Cohort</th>
                    <th className="py-3 px-4">Phone / Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        <Users className="w-8 h-8 mx-auto stroke-1 mb-2" />
                        <div className="font-semibold text-neutral-700 dark:text-neutral-300">
                          No students matched your search or filters
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = selectedStudentIds.has(student.id);
                      return (
                        <tr
                          key={student.id}
                          onClick={() => toggleSelectStudent(student.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                              : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-850/40'
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <td
                            className="py-3 px-4 text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectStudent(student.id);
                            }}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
                            )}
                          </td>

                          {/* Student Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {student.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {student.name}
                              </span>
                            </div>
                          </td>

                          {/* Email Address & Validity Badge */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono text-[11px] truncate max-w-[220px] ${
                                  student.isValidEmail
                                    ? 'text-neutral-700 dark:text-neutral-300'
                                    : 'text-rose-600 dark:text-rose-400 font-semibold'
                                }`}
                              >
                                {student.email || 'No email provided'}
                              </span>
                              {student.isValidEmail ? (
                                <span title="Verified RFC Email">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                </span>
                              ) : (
                                <span
                                  title="Invalid email syntax"
                                  className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shrink-0"
                                >
                                  Invalid
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Roll / Student ID */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                              {student.rollNo || '—'}
                            </span>
                          </td>

                          {/* Department */}
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                              {student.department || 'General'}
                            </span>
                          </td>

                          {/* Phone */}
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                            {student.phone || '—'}
                          </td>

                          {/* Action */}
                          <td
                            className="py-3 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct 1-Click Real Gmail Send */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!student.email || !student.isValidEmail) {
                                    showToast('Student does not have a valid email address.', 'warning');
                                    return;
                                  }
                                  const sub = renderTemplate(emailSubject, student, activeSheet.name);
                                  const body = renderTemplate(emailBody, student, activeSheet.name);
                                  const url = generateSingleGmailComposeUrl(student.email, sub, body);
                                  window.open(url, '_blank', 'noopener,noreferrer');
                                  showToast(`Opened Gmail composer directly to ${student.name}!`, 'info');
                                }}
                                className="px-2 py-1 rounded-md text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                title={`Send real email directly to ${student.name} using Gmail`}
                              >
                                <ExternalLink className="w-3 h-3 text-rose-500" />
                                <span>Gmail</span>
                              </button>

                              {/* Compose Modal */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentIds(new Set([student.id]));
                                  setShowComposeModal(true);
                                }}
                                className="px-2 py-1 rounded-md text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                title={`Customize message and send options for ${student.name}`}
                              >
                                Options
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between p-3 px-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 bg-neutral-50/40 dark:bg-neutral-850/40">
              <div>
                Showing <strong>{filteredStudents.length}</strong> of{' '}
                <strong>{activeSheet.students.length}</strong> students
              </div>
              <div>
                Selected: <strong>{selectedStudentIds.size}</strong>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: No sheet uploaded yet */
        <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              No Student Details Loaded Yet
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              Upload an Excel (.xlsx, .xls) or CSV sheet, or paste a Google Sheet link in the box
              above. Once fetched, all student details, selection checkboxes, and the mail composer
              will appear right here in the downside!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUploadPanel(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Open Sheet Upload Console Above</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Rename Sheet */}
      {/* ========================================================================= */}
      {showRenameModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowRenameModal(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Rename Sheet
              </h3>
              <button
                onClick={() => setShowRenameModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRename} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Sheet Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg text-neutral-600 dark:text-neutral-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                >
                  Save Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Compose & Send Mail Broadcast Studio */}
      {/* ========================================================================= */}
      {showComposeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSending) setShowComposeModal(false);
          }}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Mail className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <span>Send Mail to Selected Students</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                      {selectedStudentsList.length} Recipients
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Broadcasting to selected students in {activeSheet?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSending && setShowComposeModal(false)}
                disabled={isSending}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-Flight Sending Progress */}
            {isSending && sendingProgress && (
              <div className="py-8 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-500 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 animate-pulse">
                  <Send className="w-7 h-7 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Sending Emails... ({sendingProgress.sent} of {sendingProgress.total})
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    Currently dispatching to: {sendingProgress.currentName}
                  </div>
                </div>

                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3 max-w-md mx-auto overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-150"
                    style={{ width: `${sendingProgress.percent}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {sendingProgress.percent}% Completed
                </div>
              </div>
            )}

            {/* Delivery Success Screen */}
            {!isSending && sendSuccessReceipt && (
              <div className="py-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    Emails Sent Successfully!
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Delivered personalized email notification to{' '}
                    <strong>{sendSuccessReceipt.recipientsCount} students</strong> in{' '}
                    <strong>{sendSuccessReceipt.sheetName}</strong>.
                  </p>
                </div>

                <div className="p-3 max-w-md mx-auto rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs text-left space-y-1">
                  <div><strong>Subject:</strong> {sendSuccessReceipt.subject}</div>
                  <div><strong>Sender:</strong> {sendSuccessReceipt.senderEmail}</div>
                  <div><strong>Timestamp:</strong> {new Date(sendSuccessReceipt.sentAt).toLocaleTimeString()}</div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSendSuccessReceipt(null);
                      setShowComposeModal(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 cursor-pointer"
                  >
                    Done & Close
                  </button>
                  <button
                    onClick={() => {
                      setSendSuccessReceipt(null);
                      setActiveTab('logs');
                      setShowComposeModal(false);
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    View All Logs
                  </button>
                </div>
              </div>
            )}

            {/* Standard Composer Form */}
            {!isSending && !sendSuccessReceipt && (
              <div className="space-y-4 text-xs">
                {/* Templates Selector */}
                <div>
                  <div className="text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Preset Templates:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_EMAIL_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(tmpl.id);
                          setEmailSubject(tmpl.subject);
                          setEmailBody(tmpl.body);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          selectedTemplateId === tmpl.id
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                        }`}
                      >
                        {tmpl.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variable Tokens */}
                <div>
                  <div className="text-[11px] font-semibold text-neutral-500 mb-1">
                    Click to insert dynamic placeholder:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'name', label: '{{name}}' },
                      { key: 'rollNo', label: '{{rollNo}}' },
                      { key: 'department', label: '{{department}}' },
                      { key: 'course', label: '{{course}}' },
                      { key: 'email', label: '{{email}}' },
                      { key: 'sheetName', label: '{{sheetName}}' },
                      { key: 'date', label: '{{date}}' },
                    ].map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => setEmailBody((prev) => `${prev} {{${v.key}}}`)}
                        className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                      >
                        + {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Subject */}
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Important notice regarding examination schedule"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Message Body *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLivePreview(!showLivePreview)}
                      className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showLivePreview ? 'Hide Preview' : 'Show Live Preview for Student'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-sans rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y font-normal"
                  />
                </div>

                {/* Live Preview Box */}
                {showLivePreview && previewStudent && (
                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900 dark:text-indigo-200">
                      <span>Preview for: {previewStudent.name} ({previewStudent.email})</span>
                      <span className="text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.2 rounded">
                        Dynamic Sample
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      Subject:{' '}
                      {renderTemplate(emailSubject, previewStudent, activeSheet?.name || '')}
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed font-sans">
                      {renderTemplate(emailBody, previewStudent, activeSheet?.name || '')}
                    </div>
                  </div>
                )}

                {/* Real Delivery Configuration Drawer */}
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs flex items-center gap-1.5">
                      <span className="text-sm">🚀</span>
                      <span>Real Email Delivery Dispatcher</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSmtpSettings(!showSmtpSettings)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                      >
                        {showSmtpSettings ? 'Hide SMTP Setup' : '⚙ From Email & App Password (SMTP)'}
                      </button>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <button
                        type="button"
                        onClick={() => setShowApiSettings(!showApiSettings)}
                        className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        {showApiSettings ? 'Hide Resend' : 'Resend API'}
                      </button>
                    </div>
                  </div>

                  {/* SMTP Status banner or setup form */}
                  {smtpConfig.fromEmail && smtpConfig.appPassword && !showSmtpSettings ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-emerald-900 dark:text-emerald-200">
                          Direct SMTP Ready: Sending from <strong>{smtpConfig.fromEmail}</strong> via <strong>{smtpConfig.provider.toUpperCase()}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSmtpSettings(true)}
                        className="text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline font-semibold cursor-pointer shrink-0"
                      >
                        Edit Credentials
                      </button>
                    </div>
                  ) : showSmtpSettings || (!smtpConfig.fromEmail || !smtpConfig.appPassword) ? (
                    <div className="space-y-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Direct SMTP Delivery (Your Email & App Password)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">
                            Sender Address (From Email)
                          </label>
                          <input
                            type="email"
                            value={smtpConfig.fromEmail}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSmtpConfig((prev) => {
                                const up = { ...prev, fromEmail: val };
                                saveSmtpConfig(up);
                                return up;
                              });
                            }}
                            placeholder="your-name@gmail.com"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">
                            App Password (16-char code)
                          </label>
                          <div className="relative">
                            <input
                              type={smtpPasswordVisible ? 'text' : 'password'}
                              value={smtpConfig.appPassword}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSmtpConfig((prev) => {
                                  const up = { ...prev, appPassword: val };
                                  saveSmtpConfig(up);
                                  return up;
                                });
                              }}
                              placeholder="abcd efgh ijkl mnop"
                              className="w-full pl-2.5 pr-8 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => setSmtpPasswordVisible(!smtpPasswordVisible)}
                              className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                            >
                              {smtpPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          Provider: <strong>{smtpConfig.provider.toUpperCase()}</strong> (Generate Google App Password in{' '}
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-indigo-500"
                          >
                            Google Account Security
                          </a>
                          )
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            saveSmtpConfig(smtpConfig);
                            setShowSmtpSettings(false);
                            showToast('SMTP settings applied!', 'success');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                        >
                          Save & Apply
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Resend API configuration drawer */}
                  {showApiSettings && (
                    <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">
                          Resend API Key (<code className="font-mono text-[10px]">re_...</code>)
                        </label>
                        <input
                          type="password"
                          value={resendApiKey}
                          onChange={(e) => {
                            setResendApiKey(e.target.value);
                            localStorage.setItem('my_journey_resend_api_key', e.target.value);
                          }}
                          placeholder="re_123456789..."
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">
                          Sender Address (From)
                        </label>
                        <input
                          type="text"
                          value={resendFromEmail}
                          onChange={(e) => {
                            setResendFromEmail(e.target.value);
                            localStorage.setItem('my_journey_resend_from', e.target.value);
                          }}
                          placeholder="onboarding@resend.dev or notifications@yourdomain.com"
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500">
                        A free Resend account at <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline text-indigo-500">resend.com</a> allows automated delivery of 3,000 real emails/month directly to students' inboxes.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowComposeModal(false)}
                      className="px-3 py-2 text-xs rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleLaunchDefaultMail}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 cursor-pointer"
                      title="Launch default email app (Outlook, Apple Mail, etc.)"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Mail App</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary: Direct SMTP Delivery Button */}
                    <button
                      type="button"
                      onClick={handleSendViaSmtp}
                      disabled={!emailSubject.trim() || !emailBody.trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white shadow-md cursor-pointer transition-all"
                      title="Send real live emails to student mailboxes via Direct SMTP"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Send via SMTP ({selectedStudentsList.length})</span>
                    </button>

                    {/* Instant Gmail Web BCC Delivery button */}
                    <button
                      type="button"
                      onClick={handleLaunchGmail}
                      disabled={!emailSubject.trim() || !emailBody.trim()}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white shadow-md cursor-pointer transition-all"
                      title="Open in Gmail Web composer with all selected students in BCC"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Gmail Web ({selectedStudentsList.length} BCC)</span>
                    </button>

                    {/* Resend API delivery button if configured */}
                    {resendApiKey && (
                      <button
                        type="button"
                        onClick={handleSendViaResend}
                        disabled={!emailSubject.trim() || !emailBody.trim()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                        title="Send via Resend API"
                      >
                        <span>Resend API</span>
                      </button>
                    )}

                    {/* Simulation Log */}
                    <button
                      type="button"
                      onClick={handleSendBroadcast}
                      disabled={!emailSubject.trim() || !emailBody.trim()}
                      className="px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
                      title="Simulate and log broadcast without sending"
                    >
                      Simulate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
