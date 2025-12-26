'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';

interface PDFUploadProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

export function PDFUpload({ onUpload, isProcessing }: PDFUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-xl mx-auto space-y-4"
    >
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative group cursor-pointer transition-all duration-300 ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input {...getInputProps()} />

        {/* Outer glow on hover */}
        <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl transition-opacity duration-300 ${
          isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`} />

        {/* Main container */}
        <div className={`relative rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-300 bg-card/50 backdrop-blur-sm ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}>
          <motion.div
            animate={{
              y: isDragActive ? -5 : 0,
              scale: isDragActive ? 1.1 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          </motion.div>

          <AnimatePresence mode="wait">
            {isDragActive ? (
              <motion.p
                key="drop"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium text-primary"
              >
                Drop your PDF here...
              </motion.p>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-base font-medium mb-1">
                  Drag & drop a PDF file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse your files
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected File Card */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="shrink-0 gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Analyze</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
