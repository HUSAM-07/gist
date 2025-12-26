'use client';

import { useState } from 'react';
import { useNotebook } from '@/lib/notebook-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { MermaidDiagram } from '@/components/mermaid-diagram';
import ReactMarkdown from 'react-markdown';
import type { StudioOutput } from '@/types/notebook';

interface FlashcardContent {
  type: 'flashcards';
  cards: { front: string; back: string }[];
}

interface MarkdownContent {
  type: 'markdown';
  text: string;
}

interface MermaidContent {
  type: 'mermaid';
  diagram: string;
}

interface InfographicContent {
  type: 'infographic';
  imageUrl: string;
  summary: string;
  prompt?: string;
}

type OutputContent = FlashcardContent | MarkdownContent | MermaidContent | InfographicContent | Record<string, unknown>;

function FlashcardsViewer({ cards }: { cards: { front: string; back: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const goNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full cursor-pointer perspective-1000"
        >
          <div
            className={`
              relative min-h-[280px] rounded-2xl
              transition-all duration-500 transform-style-preserve-3d
              ${isFlipped ? 'rotate-y-180' : ''}
            `}
          >
            {/* Front face - Question */}
            <div className="absolute inset-0 p-8 rounded-2xl border-2 bg-gradient-to-br from-card to-muted/30 shadow-lg backface-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Question</span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center px-4">
                <p className="text-xl font-medium leading-relaxed">{card.front}</p>
              </div>
            </div>

            {/* Back face - Answer */}
            <div className="absolute inset-0 p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg backface-hidden rotate-y-180 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Answer</span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center px-4">
                <p className="text-xl font-medium leading-relaxed">{card.back}</p>
              </div>
            </div>
          </div>
        </div>

        {/* See answer button */}
        <div className="mt-6">
          <Button
            variant={isFlipped ? "secondary" : "default"}
            size="lg"
            onClick={() => setIsFlipped(!isFlipped)}
            className="gap-2 min-w-[160px]"
          >
            <RotateCcw className={`h-4 w-4 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />
            {isFlipped ? 'See question' : 'See answer'}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tabular-nums">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={goNext}
          disabled={currentIndex === cards.length - 1}
          className="gap-2"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Card indicator dots */}
      <div className="mt-4 flex justify-center gap-1.5 flex-wrap max-w-md mx-auto">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsFlipped(false);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              idx === currentIndex
                ? 'bg-primary scale-125'
                : idx < currentIndex
                  ? 'bg-primary/40'
                  : 'bg-muted hover:bg-muted-foreground/30'
            }`}
            title={`Go to card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function MarkdownViewer({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto max-h-[60vh] p-4 rounded-lg bg-muted/30">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}

function MindMapViewer({ diagram }: { diagram: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 overflow-auto max-h-[70vh]">
      <MermaidDiagram diagram={diagram} />
    </div>
  );
}

function GenericViewer({ content }: { content: unknown }) {
  return (
    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

function InfographicViewer({ imageUrl, summary }: { imageUrl: string; summary: string }) {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'infographic.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <>
      {/* Summary card with thumbnail */}
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/30 border">
          <h3 className="text-sm font-medium mb-2">Summary</h3>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>

        <div
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer group relative rounded-lg overflow-hidden border hover:border-primary transition-colors"
        >
          <img
            src={imageUrl}
            alt="Generated Infographic"
            className="w-full max-h-[400px] object-contain bg-muted/30"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-medium">Click to view full size</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="flex-1 gap-2">
            View Full Size
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Full-screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 text-white hover:bg-white/20 z-10"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Download button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="absolute top-4 right-16 h-10 w-10 text-white hover:bg-white/20 z-10"
          >
            <Download className="h-6 w-6" />
          </Button>

          {/* Image container */}
          <div className="w-full h-full flex items-center justify-center p-8">
            <img
              src={imageUrl}
              alt="Generated Infographic"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </>
  );
}

export function OutputViewer() {
  const { activeOutput, setActiveOutput } = useNotebook();

  if (!activeOutput) return null;

  const content = activeOutput.content as OutputContent;

  const renderContent = () => {
    if (!content || typeof content !== 'object') {
      return <p className="text-muted-foreground">No content available</p>;
    }

    switch (content.type) {
      case 'flashcards':
        return <FlashcardsViewer cards={(content as FlashcardContent).cards || []} />;
      case 'markdown':
        return <MarkdownViewer text={(content as MarkdownContent).text || ''} />;
      case 'mermaid':
        return <MindMapViewer diagram={(content as MermaidContent).diagram || ''} />;
      case 'infographic':
        return (
          <InfographicViewer
            imageUrl={(content as InfographicContent).imageUrl || ''}
            summary={(content as InfographicContent).summary || ''}
          />
        );
      default:
        return <GenericViewer content={content} />;
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-background flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
        <h2 className="font-semibold truncate">{activeOutput.title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setActiveOutput(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
}
