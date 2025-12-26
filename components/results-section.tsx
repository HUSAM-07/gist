'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MermaidDiagram } from './mermaid-diagram';
import { FileText, Brain, Lightbulb, CheckCircle2 } from 'lucide-react';

interface AnalysisResult {
  technicalSummary: string;
  mermaidDiagram: string;
  laymanSummary: string;
  pageCount: number;
  fileName: string;
}

interface ResultsSectionProps {
  result: AnalysisResult;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function ResultsSection({ result }: ResultsSectionProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Success Banner */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{result.fileName}</p>
                <Badge variant="secondary" className="shrink-0">
                  {result.pageCount} pages
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Analysis complete</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Summary - Highlighted */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{result.laymanSummary}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visual Diagram */}
      <motion.div variants={itemVariants}>
        <MermaidDiagram diagram={result.mermaidDiagram} />
      </motion.div>

      {/* Technical Summary */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-muted">
                <Brain className="h-4 w-4 text-muted-foreground" />
              </div>
              Technical Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {result.technicalSummary}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
