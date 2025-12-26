export interface Source {
  id: string;
  type: 'pdf' | 'website' | 'text';
  name: string;
  content: string;
  metadata: {
    pageCount?: number;
    url?: string;
    addedAt: Date;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

export interface Citation {
  sourceId: string;
  sourceName: string;
  text: string;
}

export type OutputType =
  | 'audio-overview'
  | 'video-overview'
  | 'mind-map'
  | 'report'
  | 'flashcards'
  | 'quiz'
  | 'infographic'
  | 'slide-deck'
  | 'data-table';

export interface StudioOutput {
  id: string;
  type: OutputType;
  title: string;
  content: unknown;
  generatedAt: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;          // Plain text (for search, export)
  richContent: string;      // HTML from Tiptap editor
  createdAt: Date;
  updatedAt: Date;
}

export interface Notebook {
  id: string;
  title: string;
  sources: Source[];
  chat: ChatMessage[];
  outputs: StudioOutput[];
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
}

// Serialized types for storage (Dates as ISO strings)
export interface SerializedSource {
  id: string;
  type: 'pdf' | 'website' | 'text';
  name: string;
  content: string;
  metadata: {
    pageCount?: number;
    url?: string;
    addedAt: string;
  };
}

export interface SerializedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface SerializedStudioOutput {
  id: string;
  type: OutputType;
  title: string;
  content: unknown;
  generatedAt: string;
}

export interface SerializedNote {
  id: string;
  title: string;
  content: string;
  richContent: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy note format for migration
export interface LegacySerializedNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface SerializedNotebook {
  id: string;
  title: string;
  sources: SerializedSource[];
  chat: SerializedChatMessage[];
  outputs: SerializedStudioOutput[];
  notes: SerializedNote[];
  createdAt: string;
  updatedAt: string;
}

// Export format for JSON file downloads
export interface NotebookExport {
  version: number;
  exportedAt: string;
  appVersion: string;
  notebook: SerializedNotebook;
}

// Storage status tracking
export interface StorageStatus {
  used: number;
  quota: number;
  percentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

// Storage error types
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  DESERIALIZATION_ERROR = 'DESERIALIZATION_ERROR',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  IMPORT_INVALID = 'IMPORT_INVALID',
}

export interface StorageError {
  type: StorageErrorType;
  message: string;
  originalError?: unknown;
}
