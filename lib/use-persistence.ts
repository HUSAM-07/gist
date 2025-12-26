'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notebook, StorageStatus, StorageError, NotebookExport } from '@/types/notebook';
import { StorageErrorType } from '@/types/notebook';
import {
  saveNotebook,
  loadNotebook,
  clearStorage,
  getStorageStatus,
  getLastSavedTimestamp,
  downloadNotebookExport,
  readFileAsText,
} from './storage';
import {
  debounce,
  createExportData,
  validateImportData,
  deserializeNotebook,
} from './storage-utils';

const DEBOUNCE_MS = 500;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

export interface UsePersistenceOptions {
  debounceMs?: number;
  onError?: (error: StorageError) => void;
  onStorageWarning?: (status: StorageStatus) => void;
}

export interface UsePersistenceReturn {
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  storageStatus: StorageStatus | null;
  error: StorageError | null;
  loadFromStorage: () => Promise<Notebook | null>;
  saveToStorage: (notebook: Notebook) => void;
  exportNotebook: (notebook: Notebook) => void;
  importNotebook: (file: File) => Promise<Notebook>;
  clearAllData: () => Promise<void>;
  dismissError: () => void;
  refreshStorageStatus: () => Promise<void>;
}

export function usePersistence(options?: UsePersistenceOptions): UsePersistenceReturn {
  const { debounceMs = DEBOUNCE_MS, onError, onStorageWarning } = options || {};

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [error, setError] = useState<StorageError | null>(null);

  const retryCount = useRef(0);

  // Save with retry logic
  const saveWithRetry = useCallback(
    async (notebook: Notebook): Promise<void> => {
      setIsSaving(true);
      setError(null);

      for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
        try {
          await saveNotebook(notebook);
          setLastSaved(new Date());
          retryCount.current = 0;

          // Update storage status after save
          const status = await getStorageStatus();
          setStorageStatus(status);

          if (status.isNearLimit || status.isAtLimit) {
            onStorageWarning?.(status);
          }

          setIsSaving(false);
          return;
        } catch (err) {
          const storageError = err as StorageError;

          // Don't retry quota exceeded errors
          if (storageError.type === StorageErrorType.QUOTA_EXCEEDED) {
            setError(storageError);
            onError?.(storageError);
            setIsSaving(false);
            return;
          }

          // Retry other errors
          if (attempt < RETRY_ATTEMPTS - 1) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          } else {
            setError(storageError);
            onError?.(storageError);
          }
        }
      }

      setIsSaving(false);
    },
    [onError, onStorageWarning]
  );

  // Debounced save function
  const debouncedSave = useRef(
    debounce((notebook: Notebook) => {
      saveWithRetry(notebook);
    }, debounceMs)
  );

  // Update debounced function if debounceMs changes
  useEffect(() => {
    debouncedSave.current = debounce((notebook: Notebook) => {
      saveWithRetry(notebook);
    }, debounceMs);
  }, [debounceMs, saveWithRetry]);

  // Load from storage
  const loadFromStorage = useCallback(async (): Promise<Notebook | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const notebook = await loadNotebook();
      const savedTimestamp = getLastSavedTimestamp();
      if (savedTimestamp) {
        setLastSaved(savedTimestamp);
      }

      const status = await getStorageStatus();
      setStorageStatus(status);

      setIsLoading(false);
      return notebook;
    } catch (err) {
      const storageError = err as StorageError;
      setError(storageError);
      onError?.(storageError);
      setIsLoading(false);
      return null;
    }
  }, [onError]);

  // Initialize on mount
  useEffect(() => {
    const savedTimestamp = getLastSavedTimestamp();
    if (savedTimestamp) {
      setLastSaved(savedTimestamp);
    }

    getStorageStatus().then(setStorageStatus).catch(() => {});

    setIsLoading(false);
  }, []);

  // Save before tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      debouncedSave.current.flush();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        debouncedSave.current.flush();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      debouncedSave.current.cancel();
    };
  }, []);

  // Public save function (debounced)
  const saveToStorage = useCallback((notebook: Notebook) => {
    debouncedSave.current(notebook);
  }, []);

  // Export notebook to JSON file
  const exportNotebook = useCallback((notebook: Notebook) => {
    const exportData = createExportData(notebook);
    const jsonString = JSON.stringify(exportData, null, 2);
    const safeTitle = notebook.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `gist-${safeTitle}-${timestamp}.json`;

    downloadNotebookExport(jsonString, filename);
  }, []);

  // Import notebook from JSON file
  const importNotebook = useCallback(
    async (file: File): Promise<Notebook> => {
      try {
        const content = await readFileAsText(file);
        const data = JSON.parse(content);

        if (!validateImportData(data)) {
          throw {
            type: StorageErrorType.IMPORT_INVALID,
            message: 'Invalid notebook file format',
          } as StorageError;
        }

        const notebook = deserializeNotebook(data.notebook);

        // Save the imported notebook
        await saveNotebook(notebook);
        setLastSaved(new Date());

        const status = await getStorageStatus();
        setStorageStatus(status);

        return notebook;
      } catch (err) {
        if ((err as StorageError).type) {
          setError(err as StorageError);
          onError?.(err as StorageError);
          throw err;
        }

        const storageError: StorageError = {
          type: StorageErrorType.IMPORT_INVALID,
          message: 'Failed to import notebook. The file may be corrupted.',
          originalError: err,
        };
        setError(storageError);
        onError?.(storageError);
        throw storageError;
      }
    },
    [onError]
  );

  // Clear all data
  const clearAllData = useCallback(async () => {
    try {
      await clearStorage();
      setLastSaved(null);
      setStorageStatus({
        used: 0,
        quota: storageStatus?.quota || 0,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
      });
      setError(null);
    } catch (err) {
      const storageError = err as StorageError;
      setError(storageError);
      onError?.(storageError);
      throw storageError;
    }
  }, [onError, storageStatus?.quota]);

  // Dismiss current error
  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh storage status
  const refreshStorageStatus = useCallback(async () => {
    try {
      const status = await getStorageStatus();
      setStorageStatus(status);
    } catch {
      // Ignore errors
    }
  }, []);

  return {
    isLoading,
    isSaving,
    lastSaved,
    storageStatus,
    error,
    loadFromStorage,
    saveToStorage,
    exportNotebook,
    importNotebook,
    clearAllData,
    dismissError,
    refreshStorageStatus,
  };
}
