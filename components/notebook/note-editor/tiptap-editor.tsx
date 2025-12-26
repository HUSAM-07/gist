'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback, useRef } from 'react';

interface TiptapEditorProps {
  content: string;
  onUpdate: (html: string, text: string) => void;
  editorRef?: React.MutableRefObject<Editor | null>;
  placeholder?: string;
}

export function TiptapEditor({
  content,
  onUpdate,
  editorRef,
  placeholder = 'Start writing...',
}: TiptapEditorProps) {
  const isInitialMount = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onUpdate(html, text);
    },
  });

  // Store editor reference for parent access
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
    return () => {
      if (editorRef) {
        editorRef.current = null;
      }
    };
  }, [editor, editorRef]);

  // Update content when it changes externally (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}

// Export editor type for external use
export type { Editor };
