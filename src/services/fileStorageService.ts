import { FileAttachment } from '../types';
import { getDocumentContent } from '../data/documentContents';

const DB_NAME = 'my_journey_files_db';
const STORE_NAME = 'files_store';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * Persists a real File or Blob with complete metadata into client IndexedDB storage.
 */
export async function saveFileBlob(
  id: string,
  file: File | Blob,
  metadata?: { name?: string; type?: string; size?: string; linkedProjectId?: string; uploadedAt?: string }
): Promise<void> {
  try {
    const db = await getDB();
    const fileName = metadata?.name || (file as File).name || id;
    const fileType = metadata?.type || file.type || 'application/octet-stream';
    const fileSize =
      metadata?.size ||
      ((file as File).size
        ? (file as File).size < 1024 * 1024
          ? `${Math.round((file as File).size / 1024)} KB`
          : `${((file as File).size / (1024 * 1024)).toFixed(2)} MB`
        : 'Unknown size');
    const uploadedAt = metadata?.uploadedAt || new Date().toISOString();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        id,
        blob: file,
        name: fileName,
        type: fileType,
        size: fileSize,
        linkedProjectId: metadata?.linkedProjectId,
        uploadedAt,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save file blob to IndexedDB:', err);
  }
}

/**
 * Retrieves all stored files from IndexedDB to ensure persistent file records.
 */
export async function getAllStoredFileRecords(): Promise<FileAttachment[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result || [];
        const files: FileAttachment[] = records.map((r: any) => ({
          id: r.id,
          name: r.name || 'Stored File',
          type: r.type || 'application/octet-stream',
          size: r.size || (r.blob?.size ? `${Math.round(r.blob.size / 1024)} KB` : '1.0 MB'),
          uploadedAt: r.uploadedAt || new Date().toISOString(),
          linkedProjectId: r.linkedProjectId,
        }));
        resolve(files);
      };
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Failed to load file records from IndexedDB:', err);
    return [];
  }
}

/**
 * Retrieves a stored Blob by ID.
 */
export async function getFileBlob(id: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => {
        resolve(request.result ? request.result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to retrieve file blob from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes a stored file blob from IndexedDB.
 */
export async function deleteFileBlob(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete file blob from IndexedDB:', err);
  }
}

/**
 * Generates an accessible URL for viewing or previewing the file.
 * Handles PDFs, images, and documents.
 */
export async function getFileViewUrl(file: FileAttachment): Promise<string> {
  // 1. Check if we have the binary Blob stored in IndexedDB
  const blob = await getFileBlob(file.id);
  if (blob) {
    return URL.createObjectURL(blob);
  }

  // 2. Check if a direct data URL or external URL was provided
  if (file.url && file.url.length > 5) {
    return file.url;
  }

  // 3. Fallback: generate readable structured document blob
  const doc = getDocumentContent(file);
  let content = `${doc.title}\n${doc.subtitle}\nAuthor: ${doc.author} | Date: ${doc.date} | Status: ${doc.status} | Version: ${doc.version}\nCategory: ${doc.category}\n\n`;
  for (const s of doc.sections) {
    content += `======================================================\n${s.heading}\n======================================================\n\n`;
    if (s.paragraphs) {
      content += s.paragraphs.join('\n\n') + '\n\n';
    }
    if (s.bulletPoints && s.bulletPoints.length > 0) {
      content += s.bulletPoints.map((b) => `• ${b}`).join('\n') + '\n\n';
    }
    if (s.codeBlock) {
      content += s.codeBlock + '\n\n';
    }
    if (s.table) {
      content += s.table.headers.join(' | ') + '\n';
      content += s.table.headers.map(() => '---').join(' | ') + '\n';
      content += s.table.rows.map((r) => r.join(' | ')).join('\n') + '\n\n';
    }
  }
  const textBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  return URL.createObjectURL(textBlob);
}

/**
 * Triggers a browser download of the file.
 */
export async function downloadFile(file: FileAttachment): Promise<void> {
  const url = await getFileViewUrl(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up object URL if newly created
  if (url.startsWith('blob:')) {
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
