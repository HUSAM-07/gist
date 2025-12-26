'use client';

import { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Link,
  ListOrdered,
  List,
  RemoveFormatting,
} from 'lucide-react';
import { HeadingDropdown } from './heading-dropdown';
import { LinkDialog } from './link-dialog';

interface RichTextToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  disabled,
  isActive,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${isActive ? 'bg-muted text-foreground' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    setLinkDialogOpen(true);
  }, [editor]);

  const handleSetLink = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    },
    [editor]
  );

  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  }, [editor]);

  const getCurrentLinkUrl = (): string => {
    if (!editor) return '';
    const attrs = editor.getAttributes('link');
    return attrs.href || '';
  };

  if (!editor) {
    return (
      <div className="h-10 border-b border-border flex items-center px-2 gap-1 bg-muted/30">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-border flex items-center px-2 py-1 gap-1 bg-muted/30 flex-wrap">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Heading Dropdown */}
        <HeadingDropdown editor={editor} />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        {/* Link */}
        <ToolbarButton
          onClick={openLinkDialog}
          isActive={editor.isActive('link')}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Ordered List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        {/* Bullet List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Clear Formatting */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Link Dialog */}
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialUrl={getCurrentLinkUrl()}
        onSubmit={handleSetLink}
        onRemove={editor.isActive('link') ? handleRemoveLink : undefined}
      />
    </>
  );
}
