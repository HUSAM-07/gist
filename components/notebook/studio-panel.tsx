'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotebook } from '@/lib/notebook-context';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Pencil,
} from 'lucide-react';
import type { OutputType } from '@/types/notebook';
import { getApiKey } from '@/lib/api-key';
import { NoteEditorView } from './note-editor';
import { NoteListItem } from './note-list-item';

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
  const {
    notebook,
    addOutput,
    setActiveOutput,
    addNote,
    removeNote,
    activeNote,
    setActiveNote,
    isStudioPanelCollapsed,
    setStudioPanelCollapsed,
  } = useNotebook();
  const [generatingType, setGeneratingType] = useState<OutputType | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Auto-expand when editing a note
  useEffect(() => {
    if (activeNote && isStudioPanelCollapsed) {
      setStudioPanelCollapsed(false);
    }
  }, [activeNote, isStudioPanelCollapsed, setStudioPanelCollapsed]);

  const handleGenerate = async (type: OutputType) => {
    if (notebook.sources.length === 0 || generatingType) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      alert('Please configure your OpenRouter API key in Settings first.');
      return;
    }

    setGeneratingType(type);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          type,
          sources: notebook.sources,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Generation error:', data.error);
        alert(`Error: ${data.error}`);
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
      alert('Failed to generate output. Please try again.');
    } finally {
      setGeneratingType(null);
    }
  };

  const handleAddNote = useCallback(() => {
    const newNote = addNote();
    setActiveNote(newNote);
  }, [addNote, setActiveNote]);

  const handleEditNote = useCallback(
    (note: typeof notebook.notes[0]) => {
      setActiveNote(note);
    },
    [setActiveNote]
  );

  const handleDeleteNote = useCallback((id: string) => {
    setDeleteNoteId(id);
  }, []);

  const confirmDeleteNote = useCallback(() => {
    if (deleteNoteId) {
      removeNote(deleteNoteId);
      setDeleteNoteId(null);
    }
  }, [deleteNoteId, removeNote]);

  const hasSources = notebook.sources.length > 0;

  // Show note editor when a note is active
  if (activeNote) {
    return <NoteEditorView />;
  }

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
          title="Add note"
          onClick={handleAddNote}
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
      <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Output Types Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {outputTypes.map(({ type, icon, label, disabled }) => (
              <button
                key={type}
                onClick={() => handleGenerate(type)}
                disabled={!hasSources || disabled || generatingType !== null}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border border-border
                  transition-all text-left
                  ${
                    !hasSources || disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-muted hover:border-primary/50 cursor-pointer'
                  }
                  ${generatingType === type ? 'bg-primary/10 border-primary' : ''}
                `}
              >
                {generatingType === type ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                ) : (
                  <div className="text-muted-foreground shrink-0">{icon}</div>
                )}
                <span className="text-xs font-medium">{label}</span>
                <Pencil className="h-3 w-3 text-muted-foreground ml-auto opacity-50" />
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Notes Section */}
        <div className="p-4">
          {/* Notes List */}
          {notebook.notes.length > 0 && (
            <div className="space-y-1 mb-4">
              {notebook.notes.map((note) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {notebook.notes.length === 0 && (
            <div className="flex flex-col items-center text-center text-muted-foreground py-8">
              <StickyNote className="h-8 w-8 mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">No notes yet</p>
              <p className="text-xs">
                Click below to create your first note
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Note Button - Fixed at bottom */}
      <div className="p-4 border-t border-border shrink-0">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleAddNote}
        >
          <StickyNote className="h-4 w-4" />
          Add note
        </Button>
      </div>

      {/* Delete Note Confirmation */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeleteNote}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
