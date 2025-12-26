import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Source, ChatMessage, Citation } from '@/types/notebook';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'NotebookLM Clone',
  },
});

function buildSourcesContext(sources: Source[]): string {
  if (sources.length === 0) return '';

  return sources
    .map((source, index) => {
      return `[Source ${index + 1}: ${source.name}]
${source.content}
---`;
    })
    .join('\n\n');
}

function buildChatHistory(
  history: ChatMessage[]
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return history.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const { message, sources, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const sourcesContext = buildSourcesContext(sources || []);
    const chatHistory = buildChatHistory(history || []);

    const systemPrompt = `You are a knowledgeable research assistant that helps users understand and analyze their sources. You have access to the following sources:

${sourcesContext || 'No sources have been added yet.'}

Instructions:
- Answer questions based on the provided sources
- When referencing information from a source, cite it using [Source N: Name] format
- Be helpful, accurate, and concise
- If the question cannot be answered from the sources, say so clearly
- You can make reasonable inferences but distinguish between direct quotes and interpretations

When citing sources, include the exact quote or paraphrase and the source name.

Respond in JSON format:
{
  "response": "your response text here with [Source N: Name] citations inline",
  "citations": [
    {"sourceId": "source-id", "sourceName": "Source Name", "text": "quoted or paraphrased text"}
  ]
}`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: message },
    ];

    const response = await openrouter.chat.completions.create({
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from API');
    }

    const result = JSON.parse(content);

    // Map citations to actual source IDs if sources are provided
    const citations: Citation[] = (result.citations || []).map(
      (citation: { sourceId?: string; sourceName: string; text: string }, index: number) => {
        const matchedSource = sources?.find(
          (s: Source) =>
            s.name === citation.sourceName ||
            citation.sourceName?.includes(s.name) ||
            s.name?.includes(citation.sourceName)
        );
        return {
          sourceId: matchedSource?.id || `source-${index}`,
          sourceName: citation.sourceName || `Source ${index + 1}`,
          text: citation.text || '',
        };
      }
    );

    return NextResponse.json({
      response: result.response,
      citations,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat' },
      { status: 500 }
    );
  }
}
