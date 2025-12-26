'use client';

import { ReactNode, useState } from 'react';
import { NotebookProvider, useNotebook } from '@/lib/notebook-context';
import { NotebookHeader } from './notebook-header';
import { StorageWarningBanner } from './storage-warning-banner';
import { StorageManagementModal } from './storage-management-modal';

interface NotebookLayoutProps {
  children: ReactNode;
}

function NotebookLayoutInner({ children }: NotebookLayoutProps) {
  const { isSourcesPanelCollapsed, isStudioPanelCollapsed } = useNotebook();
  const [isStorageModalOpen, setStorageModalOpen] = useState(false);

  const sourcesWidth = isSourcesPanelCollapsed ? '56px' : '280px';
  const studioWidth = isStudioPanelCollapsed ? '56px' : '300px';

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <NotebookHeader />
      <StorageWarningBanner onManageStorage={() => setStorageModalOpen(true)} />
      <div
        className="flex-1 grid divide-x divide-border overflow-hidden min-h-0 grid-cols-1"
        style={{
          gridTemplateColumns: `${sourcesWidth} 1fr ${studioWidth}`,
        }}
      >
        {children}
      </div>
      <StorageManagementModal
        open={isStorageModalOpen}
        onOpenChange={setStorageModalOpen}
      />
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
