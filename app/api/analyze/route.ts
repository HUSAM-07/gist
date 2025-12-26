import { NextRequest, NextResponse } from 'next/server';
import { summarizeText } from '@/lib/openrouter';
import { extractTextFromPDF } from '@/lib/pdf-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const { text, pageCount } = await extractTextFromPDF(buffer);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    // Limit text length to avoid token limits
    const maxChars = 50000;
    const truncatedText = text.slice(0, maxChars);

    // Get summary and visualization from OpenRouter
    const result = await summarizeText(truncatedText);

    return NextResponse.json({
      success: true,
      data: {
        technicalSummary: result.technicalSummary,
        mermaidDiagram: result.mermaidDiagram,
        laymanSummary: result.laymanSummary,
        pageCount,
        fileName: file.name,
      },
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF. Please try again.' },
      { status: 500 }
    );
  }
}
