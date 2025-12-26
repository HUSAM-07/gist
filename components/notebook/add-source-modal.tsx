'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNotebook } from '@/lib/notebook-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  X,
  Upload,
  Link2,
  Cloud,
  FileText,
  Loader2,
} from 'lucide-react';
import { getApiKey } from '@/lib/api-key';

type Tab = 'upload' | 'websites' | 'drive' | 'text';

export function AddSourceModal() {
  const { isAddSourceModalOpen, setAddSourceModalOpen, addSource } = useNotebook();
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Website state
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Text state
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      alert('Please configure your OpenRouter API key in Settings first.');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formData,
      });

      let data: any;

      try {
        const text = await response.text();

        if (!text || text.trim() === '') {
          throw new Error('Empty response from server');
        }

        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(
          `Server returned invalid response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze PDF');
      }

      if (data.success) {
        addSource({
          type: 'pdf',
          name: selectedFile.name,
          content: data.data.technicalSummary + '\n\n' + data.data.laymanSummary,
          metadata: {
            pageCount: data.data.pageCount,
          },
        });
        handleClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddWebsite = async () => {
    if (!websiteUrl.trim()) return;
    setIsProcessing(true);

    try {
      // For now, just add the URL as a source
      // In production, we'd scrape the website content
      addSource({
        type: 'website',
        name: new URL(websiteUrl).hostname,
        content: `Content from ${websiteUrl}`,
        metadata: {
          url: websiteUrl,
        },
      });
      handleClose();
    } catch {
      console.error('Invalid URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddText = () => {
    if (!textContent.trim()) return;

    addSource({
      type: 'text',
      name: textTitle.trim() || 'Copied text',
      content: textContent,
    });
    handleClose();
  };

  const handleClose = () => {
    setAddSourceModalOpen(false);
    setSelectedFile(null);
    setWebsiteUrl('');
    setTextContent('');
    setTextTitle('');
  };

  if (!isAddSourceModalOpen) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload files', icon: <Upload className="h-4 w-4" /> },
    { id: 'websites', label: 'Websites', icon: <Link2 className="h-4 w-4" /> },
    { id: 'drive', label: 'Drive', icon: <Cloud className="h-4 w-4" /> },
    { id: 'text', label: 'Copied text', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold">
              Create Audio and Video Overviews from
            </h2>
            <p className="text-primary">websites</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Drop Zone / Content Area */}
        <div className="px-6 pb-6">
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8">
            {/* Tabs */}
            <p className="text-center text-lg mb-6">or drop your files here</p>

            <div className="flex justify-center gap-3">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'secondary'}
                  className="gap-2"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'upload' && (
                <div>
                  <div
                    {...getRootProps()}
                    className={`
                      p-8 rounded-lg border-2 border-dashed cursor-pointer
                      transition-colors text-center
                      ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    {selectedFile ? (
                      <p className="font-medium">{selectedFile.name}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        Drag & drop a PDF or click to browse
                      </p>
                    )}
                  </div>
                  {selectedFile && (
                    <Button
                      className="w-full mt-4"
                      onClick={handleUploadFile}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Add source'
                      )}
                    </Button>
                  )}
                </div>
              )}

              {activeTab === 'websites' && (
                <div className="space-y-4">
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-12"
                  />
                  <Button
                    className="w-full"
                    onClick={handleAddWebsite}
                    disabled={!websiteUrl.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add website'
                    )}
                  </Button>
                </div>
              )}

              {activeTab === 'drive' && (
                <div className="text-center py-8 text-muted-foreground">
                  <Cloud className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Google Drive integration coming soon</p>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="space-y-4">
                  <Input
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    placeholder="Title (optional)"
                  />
                  <Textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste your text here..."
                    className="min-h-[150px]"
                  />
                  <Button
                    className="w-full"
                    onClick={handleAddText}
                    disabled={!textContent.trim()}
                  >
                    Add text
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Upload a source to get started</p>
            <p>0 sources</p>
          </div>
        </div>
      </div>
    </div>
  );
}
