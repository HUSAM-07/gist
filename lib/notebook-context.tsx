'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Source, ChatMessage, StudioOutput, Note, Notebook, StorageStatus, StorageError } from '@/types/notebook';
import { usePersistence } from './use-persistence';

interface NotebookContextType {
  notebook: Notebook;
  // Sources
  addSource: (source: Omit<Source, 'id' | 'metadata'> & { metadata?: Partial<Source['metadata']> }) => void;
  removeSource: (id: string) => void;
  // Chat
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  // Outputs
  addOutput: (output: Omit<StudioOutput, 'id' | 'generatedAt'>) => void;
  removeOutput: (id: string) => void;
  // Notes
  addNote: (content: string) => void;
  removeNote: (id: string) => void;
  // Notebook
  setTitle: (title: string) => void;
  resetNotebook: () => void;
  // UI State
  isAddSourceModalOpen: boolean;
  setAddSourceModalOpen: (open: boolean) => void;
  activeOutput: StudioOutput | null;
  setActiveOutput: (output: StudioOutput | null) => void;
  // Panel collapse state
  isSourcesPanelCollapsed: boolean;
  setSourcesPanelCollapsed: (collapsed: boolean) => void;
  isStudioPanelCollapsed: boolean;
  setStudioPanelCollapsed: (collapsed: boolean) => void;
  // Persistence state
  isStorageLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  storageStatus: StorageStatus | null;
  storageError: StorageError | null;
  // Persistence actions
  exportNotebook: () => void;
  importNotebook: (file: File) => Promise<void>;
  clearAllData: () => Promise<void>;
  dismissStorageError: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const createEmptyNotebook = (): Notebook => ({
  id: generateId(),
  title: 'Untitled notebook',
  sources: [],
  chat: [],
  outputs: [],
  notes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const NotebookContext = createContext<NotebookContextType | null>(null);

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [notebook, setNotebook] = useState<Notebook>(createEmptyNotebook);
  const [isAddSourceModalOpen, setAddSourceModalOpen] = useState(false);
  const [activeOutput, setActiveOutput] = useState<StudioOutput | null>(null);
  const [isSourcesPanelCollapsed, setSourcesPanelCollapsed] = useState(false);
  const [isStudioPanelCollapsed, setStudioPanelCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    isLoading: isStorageLoading,
    isSaving,
    lastSaved,
    storageStatus,
    error: storageError,
    loadFromStorage,
    saveToStorage,
    exportNotebook: exportNotebookToFile,
    importNotebook: importNotebookFromFile,
    clearAllData: clearStorageData,
    dismissError: dismissStorageError,
  } = usePersistence();

  // Load notebook from storage on mount
  useEffect(() => {
    const initializeFromStorage = async () => {
      const savedNotebook = await loadFromStorage();
      if (savedNotebook) {
        setNotebook(savedNotebook);
      }
      setIsInitialized(true);
    };

    initializeFromStorage();
  }, [loadFromStorage]);

  // Auto-save when notebook changes (after initial load)
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(notebook);
    }
  }, [notebook, isInitialized, saveToStorage]);

  const updateNotebook = useCallback((updates: Partial<Notebook>) => {
    setNotebook((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
  }, []);

  const addSource = useCallback((source: Omit<Source, 'id' | 'metadata'> & { metadata?: Partial<Source['metadata']> }) => {
    const newSource: Source = {
      ...source,
      id: generateId(),
      metadata: {
        addedAt: new Date(),
        ...source.metadata,
      },
    };
    setNotebook((prev) => ({
      ...prev,
      sources: [...prev.sources, newSource],
      updatedAt: new Date(),
    }));
  }, []);

  const removeSource = useCallback((id: string) => {
    setNotebook((prev) => ({
      ...prev,
      sources: prev.sources.filter((s) => s.id !== id),
      updatedAt: new Date(),
    }));
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    setNotebook((prev) => ({
      ...prev,
      chat: [...prev.chat, newMessage],
      updatedAt: new Date(),
    }));
  }, []);

  const clearChat = useCallback(() => {
    updateNotebook({ chat: [] });
  }, [updateNotebook]);

  const addOutput = useCallback((output: Omit<StudioOutput, 'id' | 'generatedAt'>) => {
    const newOutput: StudioOutput = {
      ...output,
      id: generateId(),
      generatedAt: new Date(),
    };
    setNotebook((prev) => ({
      ...prev,
      outputs: [...prev.outputs, newOutput],
      updatedAt: new Date(),
    }));
    return newOutput;
  }, []);

  const removeOutput = useCallback((id: string) => {
    setNotebook((prev) => ({
      ...prev,
      outputs: prev.outputs.filter((o) => o.id !== id),
      updatedAt: new Date(),
    }));
  }, []);

  const addNote = useCallback((content: string) => {
    const newNote: Note = {
      id: generateId(),
      content,
      createdAt: new Date(),
    };
    setNotebook((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote],
      updatedAt: new Date(),
    }));
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotebook((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
      updatedAt: new Date(),
    }));
  }, []);

  const setTitle = useCallback((title: string) => {
    updateNotebook({ title });
  }, [updateNotebook]);

  const resetNotebook = useCallback(() => {
    setNotebook(createEmptyNotebook());
    setActiveOutput(null);
  }, []);

  // Export current notebook
  const exportNotebook = useCallback(() => {
    exportNotebookToFile(notebook);
  }, [notebook, exportNotebookToFile]);

  // Import notebook from file
  const importNotebook = useCallback(async (file: File) => {
    const importedNotebook = await importNotebookFromFile(file);
    setNotebook(importedNotebook);
    setActiveOutput(null);
  }, [importNotebookFromFile]);

  // Clear all data
  const clearAllData = useCallback(async () => {
    await clearStorageData();
    setNotebook(createEmptyNotebook());
    setActiveOutput(null);
  }, [clearStorageData]);

  // Show loading state while initializing from storage
  const combinedLoadingState = isStorageLoading || !isInitialized;

  return (
    <NotebookContext.Provider
      value={{
        notebook,
        addSource,
        removeSource,
        addMessage,
        clearChat,
        addOutput,
        removeOutput,
        addNote,
        removeNote,
        setTitle,
        resetNotebook,
        isAddSourceModalOpen,
        setAddSourceModalOpen,
        activeOutput,
        setActiveOutput,
        isSourcesPanelCollapsed,
        setSourcesPanelCollapsed,
        isStudioPanelCollapsed,
        setStudioPanelCollapsed,
        // Persistence state
        isStorageLoading: combinedLoadingState,
        isSaving,
        lastSaved,
        storageStatus,
        storageError,
        // Persistence actions
        exportNotebook,
        importNotebook,
        clearAllData,
        dismissStorageError,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebook() {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebook must be used within a NotebookProvider');
  }
  return context;
}
