'use client';

import { useState } from 'react';
import { useNotebook } from '@/lib/notebook-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Home,
  Plus,
  Settings,
  Grid3X3,
} from 'lucide-react';

export function NotebookHeader() {
  const { notebook, setTitle } = useNotebook();
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(notebook.title);

  const handleTitleSubmit = () => {
    setTitle(titleValue || 'Untitled notebook');
    setIsEditing(false);
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Home className="h-5 w-5" />
        </Button>

        {isEditing ? (
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="h-8 w-48 text-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium hover:bg-muted px-2 py-1 rounded transition-colors"
          >
            {notebook.title}
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create notebook</span>
        </Button>

        <Button variant="ghost" size="icon" className="sm:hidden">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
          <Settings className="h-4 w-4" />
          Settings
        </Button>

        <ThemeToggle />

        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium shrink-0">
          U
        </div>
      </div>
    </header>
  );
}
