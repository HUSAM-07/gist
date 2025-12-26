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
  content: string;
  createdAt: Date;
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
