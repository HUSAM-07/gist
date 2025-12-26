'use client';

import { useNotebook } from '@/lib/notebook-context';
import { formatRelativeTime, formatBytes } from '@/lib/storage-utils';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageStatusProps {
  className?: string;
  onClick?: () => void;
}

export function StorageStatus({ className, onClick }: StorageStatusProps) {
  const { isSaving, lastSaved, storageStatus, storageError } = useNotebook();

  const getStatusContent = () => {
    if (storageError) {
      return {
        icon: <CloudOff className="h-3.5 w-3.5 text-destructive" />,
        text: 'Save failed',
        color: 'text-destructive',
      };
    }

    if (isSaving) {
      return {
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />,
        text: 'Saving...',
        color: 'text-muted-foreground',
      };
    }

    if (lastSaved) {
      return {
        icon: <Cloud className="h-3.5 w-3.5 text-green-500" />,
        text: formatRelativeTime(lastSaved),
        color: 'text-muted-foreground',
      };
    }

    return {
      icon: <Cloud className="h-3.5 w-3.5 text-muted-foreground" />,
      text: 'Not saved',
      color: 'text-muted-foreground',
    };
  };

  const status = getStatusContent();
  const showWarning = storageStatus?.isNearLimit || storageStatus?.isAtLimit;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors hover:bg-muted',
        showWarning && 'bg-yellow-500/10',
        className
      )}
      title={
        storageStatus
          ? `Storage: ${formatBytes(storageStatus.used)} / ${formatBytes(storageStatus.quota)} (${storageStatus.percentage.toFixed(1)}%)`
          : 'Click to manage storage'
      }
    >
      {status.icon}
      <span className={status.color}>{status.text}</span>
      {showWarning && (
        <span className="text-yellow-600 dark:text-yellow-500 ml-1">
          {storageStatus?.percentage.toFixed(0)}%
        </span>
      )}
    </button>
  );
}
