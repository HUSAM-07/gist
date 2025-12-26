import { getDocumentProxy, extractText } from 'unpdf';

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid PDF buffer: buffer is empty');
    }

    // Get PDF document proxy
    const pdf = await getDocumentProxy(buffer);

    // Extract text from all pages
    const { text, totalPages } = await extractText(pdf, { mergePages: true });

    if (!text || text.trim() === '') {
      throw new Error('Failed to extract text from PDF');
    }

    return {
      text: text.trim(),
      pageCount: totalPages || 0
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`PDF parsing failed: ${message}`);
  }
}
