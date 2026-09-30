import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileAttachment } from '../../types';
import { getFileBlob, downloadFile } from '../../services/fileStorageService';
import { getDocumentContent, DocumentDetail } from '../../data/documentContents';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Calendar,
  HardDrive,
  Copy,
  Check,
  Printer,
  BookOpen,
  Eye,
  FileCode,
  Table as TableIcon,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileAttachment | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'reader' | 'native' | 'text'>('reader');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Determine file classifications
  const fileName = file?.name?.toLowerCase() || '';
  const fileType = file?.type?.toLowerCase() || '';
  const isPdf = fileName.endsWith('.pdf') || fileType.includes('pdf');
  const isImage =
    fileType.includes('image') ||
    /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(fileName);
  const isTextLike =
    /\.(txt|md|json|csv|js|ts|tsx|jsx|html|css|py|sh|sql|xml|yaml|yml)$/i.test(fileName) ||
    fileType.includes('text') ||
    fileType.includes('json') ||
    fileType.includes('javascript') ||
    fileType.includes('csv');
  const isWireframe = fileName.includes('wireframe') || fileName.includes('dashboard-ui');
  const isArchitecture = fileName.includes('architecture') || fileName.includes('system');

  // Structured document content
  const docDetail: DocumentDetail | null = file ? getDocumentContent(file) : null;

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (isOpen && file) {
      setLoading(true);
      setTextContent(null);
      setZoomLevel(100);

      // Default active tab:
      // If it's an image, default to native view
      // If it's a PDF or document, default to reader view
      if (isImage) {
        setActiveTab('native');
      } else if (isTextLike) {
        setActiveTab('text');
      } else {
        setActiveTab('reader');
      }

      // Check if real binary blob is saved in client IndexedDB
      getFileBlob(file.id)
        .then(async (blob) => {
          if (!active) return;

          if (blob) {
            createdUrl = URL.createObjectURL(blob);
            setViewUrl(createdUrl);

            // If text-like file, read raw text content
            if (isTextLike || blob.type.startsWith('text/') || blob.type.includes('json')) {
              try {
                const text = await blob.text();
                if (active) setTextContent(text);
              } catch (e) {
                console.warn('Could not read blob text:', e);
              }
            }
          } else {
            // No stored blob — fallback URL if provided
            if (file.url && file.url.length > 5) {
              setViewUrl(file.url);
            } else {
              setViewUrl(null);
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load file blob:', err);
          if (active) setLoading(false);
        });
    } else {
      setViewUrl(null);
      setTextContent(null);
    }

    return () => {
      active = false;
      if (createdUrl && createdUrl.startsWith('blob:')) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, file, isImage, isTextLike]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadFile(file);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenExternal = () => {
    if (viewUrl) {
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-5xl h-[94vh] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* ========================================================================= */}
        {/* TOP HEADER BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                isPdf
                  ? 'bg-rose-600'
                  : isImage
                  ? 'bg-blue-600'
                  : isTextLike
                  ? 'bg-emerald-600'
                  : 'bg-indigo-600'
              }`}
            >
              {isImage ? (
                <ImageIcon className="w-5 h-5 stroke-[2]" />
              ) : isTextLike ? (
                <FileCode className="w-5 h-5 stroke-[2]" />
              ) : (
                <FileText className="w-5 h-5 stroke-[2]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {file.name}
                </h3>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    isPdf
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                      : isImage
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                      : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {isPdf ? 'PDF' : isImage ? 'IMAGE' : isTextLike ? 'TEXT' : 'DOCUMENT'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-[11px] text-neutral-500 font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-neutral-400" />
                  {file.size}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  {file.uploadedAt ? file.uploadedAt.slice(0, 10) : 'Recent'}
                </span>
                {docDetail?.category && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {docDetail.category}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls: Mode Switcher & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle Tabs */}
            <div className="hidden md:flex items-center bg-neutral-200/70 dark:bg-neutral-800 p-0.5 rounded-lg text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('reader')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'reader'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Reader</span>
              </button>

              {(viewUrl || isImage || isPdf) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('native')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'native'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{isImage ? 'Visual' : isPdf ? 'PDF Frame' : 'Visual'}</span>
                </button>
              )}

              {textContent && (
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'text'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <FileCode className="w-3 h-3" />
                  <span>Raw Text</span>
                </button>
              )}
            </div>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Print document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Open in external tab */}
            {viewUrl && (
              <button
                type="button"
                onClick={handleOpenExternal}
                className="hidden sm:flex items-center gap-1 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Open in new window / tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Download file button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Download file to device"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 stroke-[2]" />
              )}
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEWER BODY CONTENT */}
        {/* ========================================================================= */}
        <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 overflow-y-auto min-h-0 relative">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-400 py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Opening document viewer...</span>
            </div>
          ) : activeTab === 'reader' && docDetail ? (
            /* ======================================================================= */
            /* TAB 1: STRUCTURED DOCUMENT READER (Always 100% readable & interactive)   */
            /* ======================================================================= */
            <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
              {/* Document Cover / Header Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {docDetail.category}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                      {docDetail.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500">
                      {docDetail.subtitle}
                    </p>
                  </div>

                  <div className="text-right shrink-0 space-y-1 font-mono text-[11px] text-neutral-500">
                    <div>
                      <strong>Status:</strong>{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {docDetail.status}
                      </span>
                    </div>
                    <div>
                      <strong>Version:</strong> {docDetail.version}
                    </div>
                    <div>
                      <strong>Date:</strong> {docDetail.date}
                    </div>
                  </div>
                </div>

                {/* Author & Verification Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                  <div>
                    Author / Lead: <strong>{docDetail.author}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Verified Document Attachment</span>
                  </div>
                </div>
              </div>

              {/* Wireframe Graphic (if applicable) */}
              {(isWireframe || isArchitecture) && (
                <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      <span>
                        {isWireframe ? 'Interactive UI Wireframe Blueprint' : 'System Architecture Blueprint'}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      Vector SVG Blueprint
                    </span>
                  </div>

                  {/* Render Visual Diagram */}
                  <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 overflow-x-auto">
                    {isWireframe ? (
                      /* UI Wireframe Graphic */
                      <svg
                        viewBox="0 0 760 380"
                        className="w-full h-auto min-w-[500px]"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Browser Window Frame */}
                        <rect x="2" y="2" width="756" height="376" rx="12" fill="#171717" stroke="#262626" strokeWidth="2" />
                        <rect x="2" y="2" width="756" height="36" rx="12" fill="#1F1F1F" />
                        <circle cx="20" cy="20" r="5" fill="#EF4444" />
                        <circle cx="36" cy="20" r="5" fill="#F59E0B" />
                        <circle cx="52" cy="20" r="5" fill="#10B981" />
                        <rect x="180" y="10" width="400" height="20" rx="6" fill="#262626" />
                        <text x="320" y="24" fill="#A3A3A3" fontSize="11" fontFamily="sans-serif">myjourney.app/dashboard</text>

                        {/* Sidebar */}
                        <rect x="12" y="48" width="160" height="320" rx="8" fill="#1F1F1F" stroke="#2A2A2A" />
                        <text x="24" y="75" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">⚡ My Journey</text>
                        <rect x="20" y="90" width="144" height="26" rx="6" fill="#4F46E5" />
                        <text x="32" y="107" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">📊 Dashboard</text>
                        <rect x="20" y="122" width="144" height="24" rx="6" fill="transparent" />
                        <text x="32" y="138" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">📁 Projects (4)</text>
                        <rect x="20" y="152" width="144" height="24" rx="6" fill="transparent" />
                        <text x="32" y="168" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">✉ Student Mailer</text>
                        <rect x="20" y="182" width="144" height="24" rx="6" fill="transparent" />
                        <text x="32" y="198" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">📎 Files & Vault</text>
                        <rect x="20" y="212" width="144" height="24" rx="6" fill="transparent" />
                        <text x="32" y="228" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">✅ Daily Tasks</text>

                        {/* Main Content Area */}
                        {/* Metric Cards */}
                        <rect x="184" y="48" width="175" height="74" rx="10" fill="#1F1F1F" stroke="#2A2A2A" />
                        <text x="198" y="72" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">Active Projects</text>
                        <text x="198" y="104" fill="#FFFFFF" fontSize="22" fontWeight="bold" fontFamily="sans-serif">4 Projects</text>

                        <rect x="371" y="48" width="175" height="74" rx="10" fill="#1F1F1F" stroke="#2A2A2A" />
                        <text x="385" y="72" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">Student Mailer</text>
                        <text x="385" y="104" fill="#38BDF8" fontSize="22" fontWeight="bold" fontFamily="sans-serif">145 Sent</text>

                        <rect x="558" y="48" width="188" height="74" rx="10" fill="#1F1F1F" stroke="#2A2A2A" />
                        <text x="572" y="72" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">IndexedDB Files</text>
                        <text x="572" y="104" fill="#10B981" fontSize="22" fontWeight="bold" fontFamily="sans-serif">Permanent</text>

                        {/* Milestone Timeline Panel */}
                        <rect x="184" y="134" width="362" height="234" rx="10" fill="#1F1F1F" stroke="#2A2A2A" />
                        <text x="200" y="160" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Milestones & Progress</text>
                        <rect x="200" y="176" width="330" height="8" rx="4" fill="#2A2A2A" />
                        <rect x="200" y="176" width="240" height="8" rx="4" fill="#4F46E5" />
                        <text x="200" y="210" fill="#E5E7EB" fontSize="12" fontFamily="sans-serif">✓ Q3 Architecture Specification</text>
                        <text x="200" y="235" fill="#E5E7EB" fontSize="12" fontFamily="sans-serif">✓ Google Sheet Roster Parser</text>
                        <text x="200" y="260" fill="#E5E7EB" fontSize="12" fontFamily="sans-serif">✓ Resend API & Gmail Delivery</text>
                        <text x="200" y="285" fill="#F59E0B" fontSize="12" fontFamily="sans-serif">⧗ Production Vercel Edge Rollout</text>

                        {/* Recent Activity Feed */}
                        <rect x="558" y="134" width="188" height="234" rx="10" fill="#1F1F1F" stroke="#2A2A2A" />
                        <text x="572" y="160" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Vault Status</text>
                        <rect x="572" y="180" width="160" height="42" rx="6" fill="#262626" />
                        <text x="582" y="198" fill="#10B981" fontSize="10" fontWeight="bold" fontFamily="sans-serif">● IndexedDB Active</text>
                        <text x="582" y="212" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">Persistent Binary Vault</text>
                        <rect x="572" y="232" width="160" height="42" rx="6" fill="#262626" />
                        <text x="582" y="250" fill="#38BDF8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">● Supabase Connected</text>
                        <text x="582" y="264" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">Live PostgreSQL Sync</text>
                      </svg>
                    ) : (
                      /* System Architecture Graphic */
                      <svg
                        viewBox="0 0 760 300"
                        className="w-full h-auto min-w-[500px]"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="2" y="2" width="756" height="296" rx="12" fill="#171717" stroke="#2A2A2A" strokeWidth="2" />
                        {/* Client Node */}
                        <rect x="40" y="90" width="180" height="120" rx="10" fill="#1E1B4B" stroke="#4F46E5" strokeWidth="2" />
                        <text x="60" y="125" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Client Browser</text>
                        <text x="60" y="148" fill="#A5B4FC" fontSize="11" fontFamily="sans-serif">React 19 + TypeScript</text>
                        <text x="60" y="170" fill="#34D399" fontSize="11" fontFamily="sans-serif">IndexedDB Binary Vault</text>
                        <text x="60" y="190" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">(Local-First Storage)</text>

                        {/* Arrow 1 */}
                        <path d="M225 150 L295 150" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 4" />
                        <polygon points="295,150 287,145 287,155" fill="#6366F1" />

                        {/* Edge Tier Node */}
                        <rect x="300" y="90" width="160" height="120" rx="10" fill="#1F2937" stroke="#4B5563" strokeWidth="2" />
                        <text x="320" y="125" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Edge &amp; Gateway</text>
                        <text x="320" y="148" fill="#D1D5DB" fontSize="11" fontFamily="sans-serif">Vercel Edge Network</text>
                        <text x="320" y="170" fill="#F59E0B" fontSize="11" fontFamily="sans-serif">Upstash Redis Cache</text>
                        <text x="320" y="190" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">(Sub-10ms Heartbeats)</text>

                        {/* Arrow 2 */}
                        <path d="M465 150 L535 150" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 4" />
                        <polygon points="535,150 527,145 527,155" fill="#6366F1" />

                        {/* Cloud Backend Node */}
                        <rect x="540" y="90" width="180" height="120" rx="10" fill="#064E3B" stroke="#059669" strokeWidth="2" />
                        <text x="560" y="125" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Cloud Services</text>
                        <text x="560" y="148" fill="#A7F3D0" fontSize="11" fontFamily="sans-serif">Supabase PostgreSQL 15</text>
                        <text x="560" y="170" fill="#F472B6" fontSize="11" fontFamily="sans-serif">Resend Transactional API</text>
                        <text x="560" y="190" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">(Encrypted Cloud State)</text>
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* Document Sections */}
              {docDetail.sections.map((section, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <span>{section.heading}</span>
                    </h2>
                    {section.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {section.badge}
                      </span>
                    )}
                  </div>

                  {/* Paragraphs */}
                  {section.paragraphs?.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans"
                    >
                      {p}
                    </p>
                  ))}

                  {/* Bullet Points */}
                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <ul className="space-y-1.5 pt-1 pl-1">
                      {section.bulletPoints.map((b, bIdx) => (
                        <li
                          key={bIdx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Code Block (if any) */}
                  {section.codeBlock && (
                    <div className="p-3.5 rounded-xl bg-neutral-900 dark:bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800 leading-relaxed">
                      <pre>{section.codeBlock}</pre>
                    </div>
                  )}

                  {/* Table (if any) */}
                  {section.table && (
                    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 mt-2">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                          <tr>
                            {section.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="py-2.5 px-3.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {section.table.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-2 px-3.5 ${
                                    cIdx === 0
                                      ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                                      : 'text-neutral-600 dark:text-neutral-400'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : activeTab === 'text' && textContent ? (
            /* ======================================================================= */
            /* TAB 2: RAW TEXT & CODE VIEWER (For text/JSON/CSV/code uploads)           */
            /* ======================================================================= */
            <div className="p-4 sm:p-6 max-w-4xl mx-auto h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500 pb-1">
                <span>Displaying raw content ({textContent.split('\n').length} lines)</span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-auto border border-neutral-800 shadow-inner leading-relaxed">
                <pre>{textContent}</pre>
              </div>
            </div>
          ) : (
            /* ======================================================================= */
            /* TAB 3: VISUAL / NATIVE IFRAME OR IMAGE VIEWER                           */
            /* ======================================================================= */
            <div className="w-full h-full p-2 sm:p-4 flex items-center justify-center">
              {isImage && viewUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center overflow-auto p-4">
                  <div className="flex items-center gap-2 mb-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(50, prev - 25))}
                      className="p-1 hover:text-indigo-600 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-semibold">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(250, prev + 25))}
                      className="p-1 hover:text-indigo-600 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      className="text-[11px] text-neutral-400 hover:text-neutral-600 ml-1 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <img
                    src={viewUrl}
                    alt={file.name}
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                    className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 transition-transform duration-100"
                  />
                </div>
              ) : isPdf && viewUrl ? (
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-inner">
                  <iframe
                    src={`${viewUrl}#view=FitH&toolbar=1&navpanes=1`}
                    title={file.name}
                    className="w-full h-full border-none"
                  />
                </div>
              ) : (
                /* Fallback if no binary URL available: redirect to Document Reader */
                <div className="text-center p-8 space-y-4 max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {file.name}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Switch to <strong>Reader View</strong> above to inspect the complete document text, sections, and tables!
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reader')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-xs cursor-pointer hover:bg-indigo-700"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Document Reader</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
