'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StickyNote, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/storage-utils';
import type { Note } from '@/types/notebook';

interface NoteListItemProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteListItem({ note, onEdit, onDelete }: NoteListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(note);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(note.id);
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
      onClick={() => onEdit(note)}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <StickyNote className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{note.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(note.updatedAt)}
        </p>
      </div>

      {/* Menu */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
