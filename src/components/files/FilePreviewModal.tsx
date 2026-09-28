import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileAttachment } from '../../types';
import { getFileViewUrl, downloadFile } from '../../services/fileStorageService';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Calendar,
  HardDrive,
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
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (isOpen && file) {
      setLoading(true);
      getFileViewUrl(file)
        .then((url) => {
          if (!active) return;
          createdUrl = url;
          setViewUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load file preview:', err);
          if (active) setLoading(false);
        });
    } else {
      setViewUrl(null);
    }

    return () => {
      active = false;
      if (createdUrl && createdUrl.startsWith('blob:')) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, file]);

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

  const isPdf =
    file.name.toLowerCase().endsWith('.pdf') ||
    file.type.toLowerCase().includes('pdf');
  const isImage =
    file.type.toLowerCase().includes('image') ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                isPdf
                  ? 'bg-rose-600'
                  : isImage
                  ? 'bg-blue-600'
                  : 'bg-indigo-600'
              }`}
            >
              {isImage ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {file.name}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    isPdf
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      : isImage
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {isPdf ? 'PDF Document' : isImage ? 'Image' : file.type.split('/')[1] || 'FILE'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {file.size}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {file.uploadedAt ? file.uploadedAt.slice(0, 10) : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {viewUrl && (
              <button
                onClick={handleOpenExternal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Open in new window / tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={isDownloading || loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              title="Download file"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 p-2 sm:p-4 overflow-hidden flex items-center justify-center min-h-0">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-400 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Loading preview...</span>
            </div>
          ) : !viewUrl ? (
            <div className="text-center p-8 space-y-3">
              <FileText className="w-12 h-12 text-neutral-400 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Preview not available
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
              >
                Download File Instead
              </button>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-inner">
              <iframe
                src={`${viewUrl}#view=FitH&toolbar=1&navpanes=1`}
                title={file.name}
                className="w-full h-full border-none"
              />
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
              <img
                src={viewUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800"
              />
            </div>
          ) : (
            <div className="text-center p-8 space-y-4 max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {file.name}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  This document format is best viewed by downloading or opening in an external app.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ({file.size})</span>
                </button>
                <button
                  onClick={handleOpenExternal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
