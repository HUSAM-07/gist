'use client';

import { ReactNode } from 'react';
import { NotebookProvider, useNotebook } from '@/lib/notebook-context';
import { NotebookHeader } from './notebook-header';

interface NotebookLayoutProps {
  children: ReactNode;
}

function NotebookLayoutInner({ children }: NotebookLayoutProps) {
  const { isSourcesPanelCollapsed, isStudioPanelCollapsed } = useNotebook();

  const getGridCols = () => {
    const leftCol = isSourcesPanelCollapsed ? '56px' : '280px';
    const rightCol = isStudioPanelCollapsed ? '56px' : '300px';
    const leftColXl = isSourcesPanelCollapsed ? '56px' : '320px';
    const rightColXl = isStudioPanelCollapsed ? '56px' : '340px';

    return {
      md: `grid-cols-[${leftCol}_1fr]`,
      lg: `grid-cols-[${leftCol}_1fr_${rightCol}]`,
      xl: `grid-cols-[${leftColXl}_1fr_${rightColXl}]`,
    };
  };

  const sourcesWidth = isSourcesPanelCollapsed ? '56px' : '280px';
  const sourcesWidthXl = isSourcesPanelCollapsed ? '56px' : '320px';
  const studioWidth = isStudioPanelCollapsed ? '56px' : '300px';
  const studioWidthXl = isStudioPanelCollapsed ? '56px' : '340px';

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <NotebookHeader />
      <div
        className="flex-1 grid divide-x divide-border overflow-hidden min-h-0 grid-cols-1"
        style={{
          gridTemplateColumns: `${sourcesWidth} 1fr ${studioWidth}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function NotebookLayout({ children }: NotebookLayoutProps) {
  return (
    <NotebookProvider>
      <NotebookLayoutInner>{children}</NotebookLayoutInner>
    </NotebookProvider>
  );
}
