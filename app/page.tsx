'use client';

import { NotebookLayout } from '@/components/notebook/notebook-layout';
import { SourcesPanel } from '@/components/notebook/sources-panel';
import { ChatPanel } from '@/components/notebook/chat-panel';
import { StudioPanel } from '@/components/notebook/studio-panel';
import { AddSourceModal } from '@/components/notebook/add-source-modal';
import { OutputViewer } from '@/components/notebook/output-viewer';

export default function Page() {
  return (
    <NotebookLayout>
      <SourcesPanel />
      <div className="relative">
        <ChatPanel />
        <OutputViewer />
      </div>
      <StudioPanel />
      <AddSourceModal />
    </NotebookLayout>
  );
}
