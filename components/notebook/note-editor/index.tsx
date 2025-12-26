'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useNotebook } from '@/lib/notebook-context';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, FileText } from 'lucide-react';
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
import { NoteEditorHeader } from './note-editor-header';
import { NoteTitleInput } from './note-title-input';
import { RichTextToolbar } from './rich-text-toolbar';
import { TiptapEditor, Editor } from './tiptap-editor';
import { debounce } from '@/lib/storage-utils';

export function NoteEditorView() {
  const { activeNote, setActiveNote, updateNote, removeNote, addSource } = useNotebook();
  const editorRef = useRef<Editor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((id: string, richContent: string, content: string) => {
      updateNote(id, { richContent, content });
    }, 500),
    [updateNote]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  const handleBack = useCallback(() => {
    // Flush any pending saves
    debouncedSave.flush();
    setActiveNote(null);
  }, [debouncedSave, setActiveNote]);

  const handleTitleChange = useCallback(
    (title: string) => {
      if (activeNote) {
        updateNote(activeNote.id, { title });
      }
    },
    [activeNote, updateNote]
  );

  const handleContentUpdate = useCallback(
    (html: string, text: string) => {
      if (activeNote) {
        debouncedSave(activeNote.id, html, text);
      }
    },
    [activeNote, debouncedSave]
  );

  const handleDelete = useCallback(() => {
    if (activeNote) {
      removeNote(activeNote.id);
      setActiveNote(null);
    }
    setShowDeleteConfirm(false);
  }, [activeNote, removeNote, setActiveNote]);

  const handleConvertToSource = useCallback(() => {
    if (!activeNote || !editorRef.current) return;

    const plainText = editorRef.current.getText();
    if (!plainText.trim()) {
      alert('Cannot convert an empty note to source.');
      return;
    }

    addSource({
      type: 'text',
      name: activeNote.title || 'Note',
      content: plainText,
    });

    // Could show a toast here, but for now just use the browser alert
    alert(`Note "${activeNote.title}" has been added to sources.`);
  }, [activeNote, addSource]);

  if (!activeNote) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-card min-h-0">
      {/* Header */}
      <NoteEditorHeader onBack={handleBack} />

      {/* Title Row */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <NoteTitleInput
          value={activeNote.title}
          onChange={handleTitleChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => setShowDeleteConfirm(true)}
          title="Delete note"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <RichTextToolbar editor={editorRef.current} />

      {/* Editor Content */}
      <TiptapEditor
        content={activeNote.richContent}
        onUpdate={handleContentUpdate}
        editorRef={editorRef}
        placeholder="Start writing..."
      />

      {/* Footer */}
      <div className="p-4 border-t border-border shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleConvertToSource}
        >
          <FileText className="h-4 w-4" />
          Convert to source
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{activeNote.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
