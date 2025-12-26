'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  onSubmit: (url: string) => void;
  onRemove?: () => void;
}

export function LinkDialog({
  open,
  onOpenChange,
  initialUrl = '',
  onSubmit,
  onRemove,
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // Add https:// if no protocol specified
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      onSubmit(finalUrl);
      onOpenChange(false);
      setUrl('');
    }
  };

  const handleRemove = () => {
    onRemove?.();
    onOpenChange(false);
    setUrl('');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {initialUrl ? 'Edit Link' : 'Add Link'}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
            />
          </div>

          <AlertDialogFooter className="mt-4">
            {initialUrl && onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                Remove
              </Button>
            )}
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit" size="sm" disabled={!url.trim()}>
              {initialUrl ? 'Update' : 'Add'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
