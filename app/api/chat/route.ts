import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Source, ChatMessage, Citation } from '@/types/notebook';
import { createOpenRouterClient } from '@/lib/openrouter';

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
    // Require API key from header
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required. Please configure your OpenRouter API key in Settings.' },
        { status: 401 }
      );
    }

    const { message, sources, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create OpenRouter client with user's API key
    const openrouter = createOpenRouterClient(apiKey);

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

    // Check for API key related errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat';
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your OpenRouter API key in Settings.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
