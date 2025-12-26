'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, Maximize2 } from 'lucide-react';

interface NoteEditorHeaderProps {
  onBack: () => void;
  onExpand?: () => void;
}

export function NoteEditorHeader({ onBack, onExpand }: NoteEditorHeaderProps) {
  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Studio
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Note</span>
      </div>

      {onExpand && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onExpand}
          title="Expand"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
