import { NextRequest, NextResponse } from 'next/server';
import { summarizeText } from '@/lib/openrouter';
import { extractTextFromPDF } from '@/lib/pdf-parser';

export async function POST(request: NextRequest) {
  try {
    // Require API key from header
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required. Please configure your OpenRouter API key in Settings.' },
        { status: 401 }
      );
    }

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

    // Get summary and visualization from OpenRouter using user's API key
    const result = await summarizeText(truncatedText, apiKey);

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

    const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF';

    // Check for API key related errors
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your OpenRouter API key in Settings.' },
        { status: 401 }
      );
    }

    // Check for PDF parsing errors
    if (errorMessage.includes('PDF parsing failed')) {
      return NextResponse.json(
        { error: 'Failed to parse PDF. The file may be corrupted or in an unsupported format.' },
        { status: 400 }
      );
    }

    // Check for JSON parsing errors
    if (errorMessage.includes('Invalid JSON') || errorMessage.includes('JSON response')) {
      return NextResponse.json(
        { error: 'Failed to process API response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || 'Failed to process PDF. Please try again.' },
      { status: 500 }
    );
  }
}
