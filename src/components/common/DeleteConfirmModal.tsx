import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteConfirm, closeDeleteConfirm } = useJourney();

  if (!deleteConfirm.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {deleteConfirm.title}
            </h3>
          </div>
          <button
            onClick={closeDeleteConfirm}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
          {deleteConfirm.message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeDeleteConfirm}
            className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              deleteConfirm.onConfirm();
              closeDeleteConfirm();
            }}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
          >
            {deleteConfirm.confirmLabel || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
