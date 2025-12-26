'use client';

import { useState } from 'react';
import { useNotebook } from '@/lib/notebook-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  AudioLines,
  Video,
  Network,
  FileText,
  LayoutGrid,
  HelpCircle,
  BarChart3,
  Presentation,
  Table2,
  Plus,
  Loader2,
  Sparkles,
  PanelRight,
  StickyNote,
} from 'lucide-react';
import type { OutputType } from '@/types/notebook';

const outputTypes: { type: OutputType; icon: React.ReactNode; iconSmall: React.ReactNode; label: string; disabled?: boolean }[] = [
  { type: 'audio-overview', icon: <AudioLines className="h-5 w-5" />, iconSmall: <AudioLines className="h-4 w-4" />, label: 'Audio Overview', disabled: true },
  { type: 'video-overview', icon: <Video className="h-5 w-5" />, iconSmall: <Video className="h-4 w-4" />, label: 'Video Overview', disabled: true },
  { type: 'mind-map', icon: <Network className="h-5 w-5" />, iconSmall: <Network className="h-4 w-4" />, label: 'Mind Map' },
  { type: 'report', icon: <FileText className="h-5 w-5" />, iconSmall: <FileText className="h-4 w-4" />, label: 'Reports' },
  { type: 'flashcards', icon: <LayoutGrid className="h-5 w-5" />, iconSmall: <LayoutGrid className="h-4 w-4" />, label: 'Flashcards' },
  { type: 'quiz', icon: <HelpCircle className="h-5 w-5" />, iconSmall: <HelpCircle className="h-4 w-4" />, label: 'Quiz', disabled: true },
  { type: 'infographic', icon: <BarChart3 className="h-5 w-5" />, iconSmall: <BarChart3 className="h-4 w-4" />, label: 'Infographic' },
  { type: 'slide-deck', icon: <Presentation className="h-5 w-5" />, iconSmall: <Presentation className="h-4 w-4" />, label: 'Slide Deck', disabled: true },
  { type: 'data-table', icon: <Table2 className="h-5 w-5" />, iconSmall: <Table2 className="h-4 w-4" />, label: 'Data Table', disabled: true },
];

export function StudioPanel() {
  const { notebook, addOutput, setActiveOutput, addNote, isStudioPanelCollapsed, setStudioPanelCollapsed } = useNotebook();
  const [generatingType, setGeneratingType] = useState<OutputType | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const handleGenerate = async (type: OutputType) => {
    if (notebook.sources.length === 0 || generatingType) return;

    setGeneratingType(type);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          sources: notebook.sources,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Generation error:', data.error);
      } else {
        const output = addOutput({
          type,
          title: data.title,
          content: data.content,
        });
        setActiveOutput(output as any);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setGeneratingType(null);
    }
  };

  const handleAddNote = () => {
    if (noteInput.trim()) {
      addNote(noteInput.trim());
      setNoteInput('');
    }
  };

  const hasSources = notebook.sources.length > 0;

  // Collapsed view
  if (isStudioPanelCollapsed) {
    return (
      <div className="h-full flex flex-col bg-card min-h-0 items-center py-4">
        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mb-4"
          onClick={() => setStudioPanelCollapsed(false)}
          title="Expand studio panel"
        >
          <PanelRight className="h-4 w-4" />
        </Button>

        <Separator className="w-6 my-2" />

        {/* Output type icons */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1 py-2">
          {outputTypes.map(({ type, iconSmall, label, disabled }) => (
            <Button
              key={type}
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${!hasSources || disabled ? 'opacity-50 cursor-not-allowed' : ''} ${generatingType === type ? 'bg-primary/10' : ''}`}
              onClick={() => handleGenerate(type)}
              disabled={!hasSources || disabled || generatingType !== null}
              title={label}
            >
              {generatingType === type ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <div className="text-muted-foreground">{iconSmall}</div>
              )}
            </Button>
          ))}
        </div>

        <Separator className="w-6 my-2" />

        {/* Notes icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Notes"
        >
          <StickyNote className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="h-full flex flex-col bg-card min-h-0">
      {/* Header */}
      <div className="p-4 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-medium">Studio</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setStudioPanelCollapsed(true)}
          title="Collapse studio panel"
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Output Types Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2">
          {outputTypes.map(({ type, icon, label, disabled }) => (
            <button
              key={type}
              onClick={() => handleGenerate(type)}
              disabled={!hasSources || disabled || generatingType !== null}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg border border-border
                transition-all text-center
                ${
                  !hasSources || disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted hover:border-primary/50 cursor-pointer'
                }
                ${generatingType === type ? 'bg-primary/10 border-primary' : ''}
              `}
            >
              {generatingType === type ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="text-muted-foreground">{icon}</div>
              )}
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Generated Outputs */}
      {notebook.outputs.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Generated</h3>
          <div className="space-y-2">
            {notebook.outputs.map((output) => (
              <button
                key={output.id}
                onClick={() => setActiveOutput(output)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left transition-colors"
              >
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm truncate">{output.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Empty State */}
      {notebook.outputs.length === 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-col items-center text-center text-muted-foreground p-6">
            <Sparkles className="h-8 w-8 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">Studio output will be saved here.</p>
            <p className="text-xs">
              After adding sources, click to add Audio Overview, Study Guide, Mind Map, and more!
            </p>
          </div>
        </div>
      )}

      <Separator />

      {/* Notes Section */}
      <div className="p-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">Notes</h3>
          <span className="text-xs text-muted-foreground">{notebook.notes.length}</span>
        </div>

        {notebook.notes.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {notebook.notes.map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm"
              >
                <StickyNote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs line-clamp-2">{note.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Add a note..."
            className="min-h-[60px] text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleAddNote}
          disabled={!noteInput.trim()}
        >
          <Plus className="h-4 w-4" />
          Add note
        </Button>
      </div>
    </div>
  );
}
