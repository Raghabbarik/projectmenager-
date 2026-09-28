import { FileAttachment } from '../types';

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
 * Persists a real File or Blob into client IndexedDB storage.
 */
export async function saveFileBlob(id: string, file: File | Blob): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, blob: file, name: (file as File).name || id, type: file.type });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save file blob to IndexedDB:', err);
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

  // 3. Fallback: generate a printable sample document blob for legacy mock files
  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');
  if (isPdf) {
    // Generate minimal printable PDF blob
    const sampleText = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 145 >> stream
BT
/F1 18 Tf
50 720 Td
(${file.name.replace(/[^a-zA-Z0-9 -]/g, '')}) Tj
/F1 12 Tf
0 -30 Td
(Uploaded: ${file.uploadedAt || new Date().toISOString()}) Tj
0 -20 Td
(File Size: ${file.size}) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000463 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
542
%%EOF`;
    const fallbackBlob = new Blob([sampleText], { type: 'application/pdf' });
    return URL.createObjectURL(fallbackBlob);
  }

  // Other types fallback to a simple text blob
  const textBlob = new Blob([`File: ${file.name}\nSize: ${file.size}\nUploaded: ${file.uploadedAt}`], {
    type: 'text/plain',
  });
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
