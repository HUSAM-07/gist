'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotebook } from '@/lib/notebook-context';
import { formatBytes, estimateSize } from '@/lib/storage-utils';
import { getApiKey, setApiKey, clearApiKey, maskApiKey, isValidApiKeyFormat } from '@/lib/api-key';
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
import { Input } from '@/components/ui/input';
import {
  Download,
  Upload,
  Trash2,
  MessageSquare,
  FileText,
  Sparkles,
  StickyNote,
  AlertTriangle,
  Key,
  HardDrive,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

type SettingsTab = 'api' | 'storage';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const {
    notebook,
    storageStatus,
    exportNotebook,
    importNotebook,
    clearAllData,
    clearChat,
    resetNotebook,
  } = useNotebook();

  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearType, setClearType] = useState<'chat' | 'all' | 'reset'>('chat');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Key state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing API key on mount
  useEffect(() => {
    if (open) {
      const existingKey = getApiKey();
      setHasExistingKey(!!existingKey);
      setApiKeyInput(existingKey || '');
      setSaveSuccess(false);
    }
  }, [open]);

  // Calculate sizes for each section
  const sourcesSize = estimateSize(notebook.sources);
  const chatSize = estimateSize(notebook.chat);
  const outputsSize = estimateSize(notebook.outputs);
  const notesSize = estimateSize(notebook.notes);

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

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;

    setIsSaving(true);
    try {
      setApiKey(apiKeyInput.trim());
      setHasExistingKey(true);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setApiKeyInput('');
    setHasExistingKey(false);
    setShowApiKey(false);
  };

  const isValidKey = apiKeyInput.trim().length > 0 && isValidApiKeyFormat(apiKeyInput);

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
          <AlertDialogTitle>Settings</AlertDialogTitle>
          <AlertDialogDescription>
            Configure your API key and manage storage.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'api'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
            <span className="sm:hidden">API</span>
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'storage'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            Storage
          </button>
        </div>

        {/* API Keys Tab */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">OpenRouter API Key</label>
                {hasExistingKey && (
                  <span className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Configured
                  </span>
                )}
              </div>

              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={showApiKey ? apiKeyInput : (hasExistingKey && !apiKeyInput ? maskApiKey(getApiKey() || '') : apiKeyInput)}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  {hasExistingKey && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={handleClearApiKey}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  openrouter.ai/keys
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <Button
              onClick={handleSaveApiKey}
              disabled={!isValidKey || isSaving}
              className="w-full gap-2"
            >
              {saveSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : isSaving ? (
                'Saving...'
              ) : (
                'Save API Key'
              )}
            </Button>

            {!hasExistingKey && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-500">
                  An API key is required to use AI features. The key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="space-y-4">
            {/* Storage Usage */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">
                  {storageStatus
                    ? `${formatBytes(storageStatus.used)} / ${formatBytes(storageStatus.quota)}`
                    : formatBytes(sourcesSize + chatSize + outputsSize + notesSize)}
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
            <div className="space-y-2">
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
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
