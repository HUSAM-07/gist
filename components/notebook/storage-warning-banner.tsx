'use client';

import { useNotebook } from '@/lib/notebook-context';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { formatBytes } from '@/lib/storage-utils';
import { useState } from 'react';

interface StorageWarningBannerProps {
  onManageStorage?: () => void;
}

export function StorageWarningBanner({ onManageStorage }: StorageWarningBannerProps) {
  const { storageStatus, storageError, exportNotebook, dismissStorageError } = useNotebook();
  const [isDismissed, setIsDismissed] = useState(false);

  // Show error banner
  if (storageError) {
    return (
      <Alert variant="destructive" className="mx-4 mt-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Storage Error</AlertTitle>
        <AlertDescription>
          {storageError.message}
        </AlertDescription>
        <AlertAction>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportNotebook}>
              Export Data
            </Button>
            <Button size="sm" variant="ghost" onClick={dismissStorageError}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertAction>
      </Alert>
    );
  }

  // Don't show if dismissed or no warning needed
  if (isDismissed || !storageStatus?.isNearLimit) {
    return null;
  }

  const isAtLimit = storageStatus.isAtLimit;

  return (
    <Alert
      variant={isAtLimit ? 'destructive' : 'default'}
      className={`mx-4 mt-2 ${!isAtLimit ? 'border-yellow-500/50 bg-yellow-500/10' : ''}`}
    >
      <AlertTriangle className={`h-4 w-4 ${!isAtLimit ? 'text-yellow-600' : ''}`} />
      <AlertTitle className={!isAtLimit ? 'text-yellow-700 dark:text-yellow-500' : ''}>
        {isAtLimit ? 'Storage Full' : 'Storage Nearly Full'}
      </AlertTitle>
      <AlertDescription className={!isAtLimit ? 'text-yellow-600/90 dark:text-yellow-500/90' : ''}>
        {isAtLimit
          ? 'Your storage is full. Export your data and clear some space to continue saving.'
          : `You're using ${storageStatus.percentage.toFixed(0)}% of available storage (${formatBytes(storageStatus.used)}). Consider exporting your data.`}
      </AlertDescription>
      <AlertAction>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isAtLimit ? 'default' : 'outline'}
            onClick={exportNotebook}
          >
            Export
          </Button>
          {onManageStorage && (
            <Button size="sm" variant="outline" onClick={onManageStorage}>
              Manage
            </Button>
          )}
          {!isAtLimit && (
            <Button size="sm" variant="ghost" onClick={() => setIsDismissed(true)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertAction>
    </Alert>
  );
}
