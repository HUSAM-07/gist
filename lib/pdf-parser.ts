import { PDFParse } from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  let parser: PDFParse | null = null;

  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid PDF buffer: buffer is empty');
    }

    parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();

    if (!textResult || !textResult.text) {
      throw new Error('Failed to extract text from PDF');
    }

    return {
      text: textResult.text,
      pageCount: textResult.total || 0
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`PDF parsing failed: ${message}`);
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error('Error destroying PDF parser:', destroyError);
      }
    }
  }
}
