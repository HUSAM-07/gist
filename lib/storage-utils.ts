import type {
  Notebook,
  SerializedNotebook,
  Source,
  SerializedSource,
  ChatMessage,
  SerializedChatMessage,
  StudioOutput,
  SerializedStudioOutput,
  Note,
  SerializedNote,
  NotebookExport,
} from '@/types/notebook';

const APP_VERSION = '1.0.0';

// Serialize a Source object (Date -> string)
function serializeSource(source: Source): SerializedSource {
  return {
    ...source,
    metadata: {
      ...source.metadata,
      addedAt: source.metadata.addedAt.toISOString(),
    },
  };
}

// Deserialize a Source object (string -> Date)
function deserializeSource(source: SerializedSource): Source {
  return {
    ...source,
    metadata: {
      ...source.metadata,
      addedAt: new Date(source.metadata.addedAt),
    },
  };
}

// Serialize a ChatMessage object
function serializeChatMessage(message: ChatMessage): SerializedChatMessage {
  return {
    ...message,
    timestamp: message.timestamp.toISOString(),
  };
}

// Deserialize a ChatMessage object
function deserializeChatMessage(message: SerializedChatMessage): ChatMessage {
  return {
    ...message,
    timestamp: new Date(message.timestamp),
  };
}

// Serialize a StudioOutput object
function serializeStudioOutput(output: StudioOutput): SerializedStudioOutput {
  return {
    ...output,
    generatedAt: output.generatedAt.toISOString(),
  };
}

// Deserialize a StudioOutput object
function deserializeStudioOutput(output: SerializedStudioOutput): StudioOutput {
  return {
    ...output,
    generatedAt: new Date(output.generatedAt),
  };
}

// Serialize a Note object
function serializeNote(note: Note): SerializedNote {
  return {
    ...note,
    createdAt: note.createdAt.toISOString(),
  };
}

// Deserialize a Note object
function deserializeNote(note: SerializedNote): Note {
  return {
    ...note,
    createdAt: new Date(note.createdAt),
  };
}

// Serialize a complete Notebook for storage
export function serializeNotebook(notebook: Notebook): SerializedNotebook {
  return {
    id: notebook.id,
    title: notebook.title,
    sources: notebook.sources.map(serializeSource),
    chat: notebook.chat.map(serializeChatMessage),
    outputs: notebook.outputs.map(serializeStudioOutput),
    notes: notebook.notes.map(serializeNote),
    createdAt: notebook.createdAt.toISOString(),
    updatedAt: notebook.updatedAt.toISOString(),
  };
}

// Deserialize a Notebook from storage
export function deserializeNotebook(data: SerializedNotebook): Notebook {
  return {
    id: data.id,
    title: data.title,
    sources: data.sources.map(deserializeSource),
    chat: data.chat.map(deserializeChatMessage),
    outputs: data.outputs.map(deserializeStudioOutput),
    notes: data.notes.map(deserializeNote),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

// Estimate the size of data in bytes
export function estimateSize(data: unknown): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}

// Format bytes to human-readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Create export data structure
export function createExportData(notebook: Notebook): NotebookExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    notebook: serializeNotebook(notebook),
  };
}

// Validate import data structure
export function validateImportData(data: unknown): data is NotebookExport {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') return false;
  if (typeof obj.exportedAt !== 'string') return false;
  if (typeof obj.appVersion !== 'string') return false;
  if (!obj.notebook || typeof obj.notebook !== 'object') return false;

  const notebook = obj.notebook as Record<string, unknown>;

  if (typeof notebook.id !== 'string') return false;
  if (typeof notebook.title !== 'string') return false;
  if (!Array.isArray(notebook.sources)) return false;
  if (!Array.isArray(notebook.chat)) return false;
  if (!Array.isArray(notebook.outputs)) return false;
  if (!Array.isArray(notebook.notes)) return false;
  if (typeof notebook.createdAt !== 'string') return false;
  if (typeof notebook.updatedAt !== 'string') return false;

  return true;
}

// Debounce utility - simplified for our use case
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
): ((...args: TArgs) => void) & { flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const debounced = (...args: TArgs) => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (lastArgs) fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      if (lastArgs) fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}

// Format relative time for "Last saved: X ago"
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}
