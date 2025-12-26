import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type {
  Notebook,
  SerializedNotebook,
  StorageStatus,
  StorageError,
  StorageErrorType,
} from '@/types/notebook';
import {
  serializeNotebook,
  deserializeNotebook,
  estimateSize,
} from './storage-utils';

const DB_NAME = 'gist-notebook';
const DB_VERSION = 1;
const NOTEBOOK_KEY = 'current';
const METADATA_KEY = 'meta';

// localStorage keys for quick metadata access
const LS_LAST_SAVED = 'gist-last-saved';
const LS_SIZE = 'gist-size';

interface GistDBSchema extends DBSchema {
  notebook: {
    key: string;
    value: SerializedNotebook;
  };
  metadata: {
    key: string;
    value: {
      lastSaved: string;
      size: number;
    };
  };
}

let dbInstance: IDBPDatabase<GistDBSchema> | null = null;

// Check if IndexedDB is available
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

// Get or create database connection
async function getDB(): Promise<IDBPDatabase<GistDBSchema>> {
  if (dbInstance) return dbInstance;

  if (!isIndexedDBAvailable()) {
    throw createStorageError(
      'BROWSER_NOT_SUPPORTED' as StorageErrorType,
      'IndexedDB is not available in this browser'
    );
  }

  dbInstance = await openDB<GistDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notebook')) {
        db.createObjectStore('notebook');
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    },
  });

  return dbInstance;
}

// Create a storage error object
function createStorageError(
  type: StorageErrorType,
  message: string,
  originalError?: unknown
): StorageError {
  return { type, message, originalError };
}

// Save notebook to IndexedDB
export async function saveNotebook(notebook: Notebook): Promise<void> {
  try {
    const db = await getDB();
    const serialized = serializeNotebook(notebook);
    const size = estimateSize(serialized);
    const now = new Date().toISOString();

    await db.put('notebook', serialized, NOTEBOOK_KEY);
    await db.put('metadata', { lastSaved: now, size }, METADATA_KEY);

    // Update localStorage for quick access
    try {
      localStorage.setItem(LS_LAST_SAVED, now);
      localStorage.setItem(LS_SIZE, size.toString());
    } catch {
      // localStorage might be full, ignore
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw createStorageError(
        'QUOTA_EXCEEDED' as StorageErrorType,
        'Storage quota exceeded. Please export your data and clear some space.',
        error
      );
    }
    throw createStorageError(
      'DATABASE_ERROR' as StorageErrorType,
      'Failed to save notebook to storage',
      error
    );
  }
}

// Load notebook from IndexedDB
export async function loadNotebook(): Promise<Notebook | null> {
  try {
    const db = await getDB();
    const serialized = await db.get('notebook', NOTEBOOK_KEY);

    if (!serialized) return null;

    return deserializeNotebook(serialized);
  } catch (error) {
    throw createStorageError(
      'DATABASE_ERROR' as StorageErrorType,
      'Failed to load notebook from storage',
      error
    );
  }
}

// Clear all stored data
export async function clearStorage(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('notebook', NOTEBOOK_KEY);
    await db.delete('metadata', METADATA_KEY);

    try {
      localStorage.removeItem(LS_LAST_SAVED);
      localStorage.removeItem(LS_SIZE);
    } catch {
      // Ignore localStorage errors
    }
  } catch (error) {
    throw createStorageError(
      'DATABASE_ERROR' as StorageErrorType,
      'Failed to clear storage',
      error
    );
  }
}

// Get storage status
export async function getStorageStatus(): Promise<StorageStatus> {
  try {
    // Use Storage API if available
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;

      return {
        used,
        quota,
        percentage,
        isNearLimit: percentage > 80,
        isAtLimit: percentage > 95,
      };
    }

    // Fallback: estimate from our stored size
    const sizeStr = localStorage.getItem(LS_SIZE);
    const used = sizeStr ? parseInt(sizeStr, 10) : 0;
    // Assume 50MB quota as conservative estimate
    const quota = 50 * 1024 * 1024;
    const percentage = quota > 0 ? (used / quota) * 100 : 0;

    return {
      used,
      quota,
      percentage,
      isNearLimit: percentage > 80,
      isAtLimit: percentage > 95,
    };
  } catch {
    return {
      used: 0,
      quota: 0,
      percentage: 0,
      isNearLimit: false,
      isAtLimit: false,
    };
  }
}

// Get last saved timestamp from localStorage (quick access)
export function getLastSavedTimestamp(): Date | null {
  try {
    const timestamp = localStorage.getItem(LS_LAST_SAVED);
    return timestamp ? new Date(timestamp) : null;
  } catch {
    return null;
  }
}

// Check if there's any saved data
export async function hasSavedData(): Promise<boolean> {
  try {
    const db = await getDB();
    const data = await db.get('notebook', NOTEBOOK_KEY);
    return data !== undefined;
  } catch {
    return false;
  }
}

// Export the current notebook as a downloadable file
export function downloadNotebookExport(exportData: string, filename: string): void {
  const blob = new Blob([exportData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Read a file as text for import
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
