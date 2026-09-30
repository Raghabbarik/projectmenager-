import React, { useState, useRef, useMemo } from 'react';
import { useJourney } from '../context/JourneyContext';
import { FileAttachment } from '../types';
import { INITIAL_FILES } from '../data/mockData';
import { saveFileBlob, downloadFile, getAllStoredFileRecords } from '../services/fileStorageService';
import { FilePreviewModal } from '../components/files/FilePreviewModal';
import {
  Paperclip,
  Upload,
  FileText,
  Image as ImageIcon,
  FolderGit2,
  Trash2,
  Search,
  Download,
  Eye,
  CheckCircle2,
  FileCode,
  HardDrive,
  Calendar,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const FilesPage: React.FC = () => {
  const {
    files,
    projects,
    deletedFileIds,
    addFile,
    deleteFile,
    removeProjectPlanFile,
    requestDelete,
    navigateTo,
    showToast,
  } = useJourney();

  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all plan files attached across all projects
  const allProjectPlanFiles: FileAttachment[] = useMemo(() => {
    const list: FileAttachment[] = [];
    projects.forEach((proj) => {
      (proj.planFiles || []).forEach((pf) => {
        const isPdf = pf.name.toLowerCase().endsWith('.pdf');
        const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(pf.name);
        list.push({
          id: pf.id,
          name: pf.name,
          type: pf.type || (isPdf ? 'application/pdf' : isImg ? 'image/png' : 'application/octet-stream'),
          size: pf.size || '1.2 MB',
          url: pf.url,
          fileData: pf.fileData,
          linkedProjectId: proj.id,
          uploadedAt: pf.addedAt ? `${pf.addedAt}T00:00:00Z` : new Date().toISOString(),
        });
      });
    });
    return list;
  }, [projects]);

  // Combined, resilient file universe:
  // 1. Initial/previous built-in files (excluding deleted ones)
  // 2. All project plan files & attachments (excluding deleted ones)
  // 3. Current user-uploaded files from state and IndexedDB (excluding deleted ones)
  const allFiles: FileAttachment[] = useMemo(() => {
    const deletedSet = new Set(deletedFileIds || []);
    const map = new Map<string, FileAttachment>();

    // 1. Baseline initial files
    INITIAL_FILES.forEach((f) => {
      if (!deletedSet.has(f.id)) {
        map.set(f.id, f);
      }
    });

    // 2. Project plan files
    allProjectPlanFiles.forEach((pf) => {
      if (!deletedSet.has(pf.id) && !map.has(pf.id)) {
        map.set(pf.id, pf);
      }
    });

    // 3. User files in state (highest priority)
    files.forEach((f) => {
      if (!deletedSet.has(f.id)) {
        map.set(f.id, f);
      }
    });

    return Array.from(map.values());
  }, [files, allProjectPlanFiles, deletedFileIds]);

  const processFiles = async (uploadedFiles: FileList | File[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const f = uploadedFiles[i];
      const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
      const displaySize =
        f.size < 1024 * 1024
          ? `${Math.round(f.size / 1024)} KB`
          : `${sizeMB} MB`;

      // 1. Generate unique file ID
      const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      // 2. Persist real File/PDF Blob with complete metadata in client IndexedDB storage
      await saveFileBlob(fileId, f, {
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: displaySize,
        linkedProjectId: selectedProjectId || undefined,
        uploadedAt: new Date().toISOString(),
      });

      // 3. Add file metadata to JourneyContext — pass the same fileId used for IndexedDB blob
      addFile({
        id: fileId,
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: displaySize,
        linkedProjectId: selectedProjectId || undefined,
      });

      showToast(`Uploaded "${f.name}" successfully!`, 'success');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDownload = async (e: React.MouseEvent, file: FileAttachment) => {
    e.stopPropagation();
    setDownloadingId(file.id);
    try {
      await downloadFile(file);
      showToast(`Downloading "${file.name}"...`, 'info');
    } catch (err) {
      console.error('Download error:', err);
      showToast(`Failed to download ${file.name}`, 'warning');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredFiles = allFiles.filter((f) => {
    if (selectedProjectId && f.linkedProjectId !== selectedProjectId) return false;
    if (search.trim() && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Paperclip className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Files &amp; Attachments
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {allFiles.length} files
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Upload PDFs, design mockups, and documents. View PDFs directly or download anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 scale-[1.01]'
            : 'border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-neutral-50/50 dark:bg-neutral-900/40'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
          <Upload className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Click to upload or drag &amp; drop PDF and files here
          </span>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Supports PDF, DOCX, PNG, JPG, ZIP, and other documents
          </p>
        </div>
      </div>

      {/* Controls & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search filenames..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <EmptyState
          icon={Paperclip}
          title="No files found"
          description="Upload your project PDFs, architecture docs, or receipts."
          actionLabel="Upload First File"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFiles.map((file) => {
            const isPdf =
              file.name.toLowerCase().endsWith('.pdf') ||
              file.type.toLowerCase().includes('pdf');
            const isImage =
              file.type.toLowerCase().includes('image') ||
              /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
            const linkedProject = projects.find((p) => p.id === file.linkedProjectId);

            return (
              <div
                key={file.id}
                onClick={() => setPreviewFile(file)}
                className="group relative p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-xs hover:shadow-md flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 shadow-sm ${
                        isPdf
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : isImage
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {isPdf ? (
                        <FileText className="w-5 h-5" />
                      ) : isImage ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : (
                        <FileCode className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate flex-1">
                          {file.name}
                        </h4>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                            isPdf
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : isImage
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          {isPdf ? 'PDF' : isImage ? 'IMG' : file.type.split('/')[1] || 'DOC'}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center gap-2">
                        <span>{file.size}</span>
                        <span>·</span>
                        <span>{file.uploadedAt ? file.uploadedAt.slice(0, 10) : 'Recent'}</span>
                      </div>

                      {linkedProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('project-detail', linkedProject.id);
                          }}
                          className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-2 font-medium truncate"
                        >
                          <FolderGit2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{linkedProject.name}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: View / Download / Delete */}
                <div className="mt-3.5 pt-2.5 border-t border-neutral-150 dark:border-neutral-800/80 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                      title="Preview / View file"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={(e) => handleDownload(e, file)}
                      disabled={downloadingId === file.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete({
                        title: 'Delete File?',
                        message: `Permanently remove ${file.name}?`,
                        confirmLabel: 'Delete File',
                        onConfirm: () => {
                          deleteFile(file.id);
                          if (file.linkedProjectId) {
                            removeProjectPlanFile(file.linkedProjectId, file.id);
                          }
                        },
                      });
                    }}
                    className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF & File Preview Modal */}
      <FilePreviewModal
        isOpen={Boolean(previewFile)}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
