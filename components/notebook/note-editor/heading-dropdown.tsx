'use client';

import { Editor } from '@tiptap/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeadingDropdownProps {
  editor: Editor | null;
}

type HeadingLevel = 'paragraph' | 'h1' | 'h2' | 'h3';

const headingOptions: { value: HeadingLevel; label: string }[] = [
  { value: 'paragraph', label: 'Normal' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
];

export function HeadingDropdown({ editor }: HeadingDropdownProps) {
  if (!editor) return null;

  const getCurrentHeading = (): HeadingLevel => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };

  const handleChange = (value: HeadingLevel) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.charAt(1)) as 1 | 2 | 3;
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  return (
    <Select value={getCurrentHeading()} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-[100px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {headingOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
