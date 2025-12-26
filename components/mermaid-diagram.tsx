'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MermaidDiagramProps {
  diagram: string;
}

export function MermaidDiagram({ diagram }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Figtree, sans-serif',
    });

    const renderDiagram = async () => {
      if (containerRef.current && diagram) {
        try {
          containerRef.current.innerHTML = '';

          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, diagram);

          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Error rendering Mermaid diagram:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="text-destructive p-4 border border-destructive rounded-md">
                <p class="font-semibold mb-2">Failed to render diagram</p>
                <p class="text-sm">Please check the diagram syntax</p>
              </div>
            `;
          }
        }
      }
    };

    renderDiagram();
  }, [diagram]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Representation</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="flex items-center justify-center p-4 bg-background rounded-lg overflow-auto"
        />
      </CardContent>
    </Card>
  );
}
