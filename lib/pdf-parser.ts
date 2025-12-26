import { getDocumentProxy, extractText } from 'unpdf';

export async function extractTextFromPDF(data: Uint8Array): Promise<{ text: string; pageCount: number }> {
  try {
    if (!data || data.length === 0) {
      throw new Error('Invalid PDF data: data is empty');
    }

    // Get PDF document proxy
    const pdf = await getDocumentProxy(data);

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
