'use client';

import { useNotebook } from '@/lib/notebook-context';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  FileText,
  Link2,
  Type,
  Trash2,
  PanelLeft,
} from 'lucide-react';

export function SourcesPanel() {
  const { notebook, removeSource, setAddSourceModalOpen, isSourcesPanelCollapsed, setSourcesPanelCollapsed } = useNotebook();

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'website':
        return <Link2 className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Collapsed view
  if (isSourcesPanelCollapsed) {
    return (
      <div className="h-full flex flex-col bg-card min-h-0 items-center py-4">
        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mb-4"
          onClick={() => setSourcesPanelCollapsed(false)}
          title="Expand sources panel"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>

        {/* Add source button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mb-2"
          onClick={() => setAddSourceModalOpen(true)}
          title="Add sources"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Separator className="w-6 my-2" />

        {/* Source icons */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center gap-2 py-2">
          {notebook.sources.map((source) => (
            <div
              key={source.id}
              className="p-2 rounded-lg bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors"
              title={source.name}
            >
              {getSourceIcon(source.type)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="h-full flex flex-col bg-card min-h-0">
      {/* Header */}
      <div className="p-4 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Sources</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setSourcesPanelCollapsed(true)}
            title="Collapse sources panel"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Sources Button */}
        <Button
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={() => setAddSourceModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add sources
        </Button>
      </div>

      <Separator />

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {notebook.sources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-4">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="font-medium mb-1">Saved sources will appear here</p>
            <p className="text-sm">
              Click Add source above to add PDFs, websites, text, videos, or audio files. Or import a file directly from Google Drive.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notebook.sources.map((source) => (
              <div
                key={source.id}
                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  {getSourceIcon(source.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{source.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {source.type === 'pdf' && source.metadata.pageCount
                      ? `${source.metadata.pageCount} pages`
                      : source.type}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeSource(source.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
