'use client';

import { useState, useRef } from 'react';
import { useNotebook } from '@/lib/notebook-context';
import { formatBytes, estimateSize } from '@/lib/storage-utils';
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
import { Button } from '@/components/ui/button';
import {
  Download,
  Upload,
  Trash2,
  MessageSquare,
  FileText,
  Sparkles,
  StickyNote,
  AlertTriangle,
} from 'lucide-react';

interface StorageManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StorageManagementModal({ open, onOpenChange }: StorageManagementModalProps) {
  const {
    notebook,
    storageStatus,
    exportNotebook,
    importNotebook,
    clearAllData,
    clearChat,
    resetNotebook,
  } = useNotebook();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearType, setClearType] = useState<'chat' | 'all' | 'reset'>('chat');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate sizes for each section
  const sourcesSize = estimateSize(notebook.sources);
  const chatSize = estimateSize(notebook.chat);
  const outputsSize = estimateSize(notebook.outputs);
  const notesSize = estimateSize(notebook.notes);
  const totalSize = sourcesSize + chatSize + outputsSize + notesSize;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importNotebook(file);
      onOpenChange(false);
    } catch {
      // Error is handled by the context
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = async () => {
    switch (clearType) {
      case 'chat':
        clearChat();
        break;
      case 'reset':
        resetNotebook();
        break;
      case 'all':
        await clearAllData();
        break;
    }
    setShowClearConfirm(false);
  };

  const openClearConfirm = (type: 'chat' | 'all' | 'reset') => {
    setClearType(type);
    setShowClearConfirm(true);
  };

  const getClearConfirmMessage = () => {
    switch (clearType) {
      case 'chat':
        return 'This will permanently delete all chat messages. Your sources and generated outputs will be kept.';
      case 'reset':
        return 'This will reset the current notebook to a blank state. All sources, chat, outputs, and notes will be cleared.';
      case 'all':
        return 'This will permanently delete all data from storage, including all notebooks. This action cannot be undone.';
    }
  };

  if (showClearConfirm) {
    return (
      <AlertDialog open={true} onOpenChange={() => setShowClearConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getClearConfirmMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleClear}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Storage Management</AlertDialogTitle>
          <AlertDialogDescription>
            Manage your notebook data and storage usage.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Storage Usage */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="font-medium">
              {storageStatus
                ? `${formatBytes(storageStatus.used)} / ${formatBytes(storageStatus.quota)}`
                : formatBytes(totalSize)}
            </span>
          </div>

          {storageStatus && (
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  storageStatus.isAtLimit
                    ? 'bg-destructive'
                    : storageStatus.isNearLimit
                    ? 'bg-yellow-500'
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(storageStatus.percentage, 100)}%` }}
              />
            </div>
          )}

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>Sources: {formatBytes(sourcesSize)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat: {formatBytes(chatSize)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Outputs: {formatBytes(outputsSize)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5" />
              <span>Notes: {formatBytes(notesSize)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={exportNotebook} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportClick}
              disabled={isImporting}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-muted-foreground mb-2">Clear Data</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openClearConfirm('chat')}
                disabled={notebook.chat.length === 0}
                className="gap-1.5 text-xs"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Clear Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openClearConfirm('reset')}
                className="gap-1.5 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Reset Notebook
              </Button>
            </div>
          </div>

          <div className="border-t pt-2 mt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openClearConfirm('all')}
              className="w-full gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Clear All Storage
            </Button>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
