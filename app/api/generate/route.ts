import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Source, OutputType } from '@/types/notebook';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'NotebookLM Clone',
  },
});

function buildSourcesContent(sources: Source[]): string {
  return sources
    .map((source) => `[${source.name}]\n${source.content}`)
    .join('\n\n---\n\n');
}

function sanitizeMermaidDiagram(diagram: string): string {
  return diagram
    .replace(/```mermaid\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/\|>/g, '|')
    .trim();
}

const outputPrompts: Record<OutputType, string> = {
  'mind-map': `Create a comprehensive mind map diagram of the key concepts from the sources.

Return a valid Mermaid diagram using the mindmap syntax:
mindmap
  root((Main Topic))
    Branch 1
      Sub-topic 1.1
      Sub-topic 1.2
    Branch 2
      Sub-topic 2.1

Rules:
- Use mindmap syntax (NOT flowchart or graph)
- Keep labels concise (2-4 words)
- Create 3-5 main branches
- Each branch can have 2-4 sub-topics
- Do NOT use code fences

Return JSON:
{
  "title": "Mind Map: [Topic]",
  "content": {
    "type": "mermaid",
    "diagram": "mindmap\\n  root((Topic))\\n    Branch1\\n      Detail"
  }
}`,

  report: `Create a comprehensive research report based on the sources.

Structure the report with:
1. Executive Summary
2. Key Findings (3-5 major points)
3. Detailed Analysis
4. Conclusions
5. References to sources

Return JSON:
{
  "title": "Report: [Topic]",
  "content": {
    "type": "markdown",
    "text": "# Report Title\\n\\n## Executive Summary\\n..."
  }
}`,

  flashcards: `Create educational flashcards from the key concepts in the sources.

Create 8-12 flashcards covering the most important concepts.

Return JSON:
{
  "title": "Flashcards: [Topic]",
  "content": {
    "type": "flashcards",
    "cards": [
      {"front": "Question or term", "back": "Answer or definition"},
      ...
    ]
  }
}`,

  quiz: `Create a quiz to test understanding of the sources.

Create 5-10 multiple choice questions.

Return JSON:
{
  "title": "Quiz: [Topic]",
  "content": {
    "type": "quiz",
    "questions": [
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 0,
        "explanation": "Why this is correct"
      }
    ]
  }
}`,

  'audio-overview': `Create a script for an audio overview of the sources.

Return JSON:
{
  "title": "Audio Overview: [Topic]",
  "content": {
    "type": "audio-script",
    "script": "Welcome to this overview..."
  }
}`,

  'video-overview': `Create a script for a video overview with scene descriptions.

Return JSON:
{
  "title": "Video Overview: [Topic]",
  "content": {
    "type": "video-script",
    "scenes": [
      {"narration": "text", "visual": "description"}
    ]
  }
}`,

  infographic: `Analyze the sources and create a detailed prompt for an educational infographic image.

The prompt should describe a visually appealing infographic that:
- Has a clear title related to the main topic
- Includes 3-5 key sections with statistics, facts, or concepts
- Uses visual elements like icons, charts, and data visualizations
- Has a professional, modern design aesthetic
- Arranges information in a clear visual hierarchy

Return JSON:
{
  "title": "Infographic: [Topic]",
  "content": {
    "type": "infographic",
    "prompt": "A detailed prompt describing the infographic to generate...",
    "summary": "A brief 2-3 sentence summary of the key information"
  }
}`,

  'slide-deck': `Create a slide deck presentation about the sources.

Return JSON:
{
  "title": "Slides: [Topic]",
  "content": {
    "type": "slides",
    "slides": [
      {"title": "Slide Title", "bullets": ["point1", "point2"]}
    ]
  }
}`,

  'data-table': `Extract and organize key data points from the sources into a table.

Return JSON:
{
  "title": "Data Table: [Topic]",
  "content": {
    "type": "table",
    "headers": ["Column1", "Column2"],
    "rows": [["value1", "value2"]]
  }
}`,
};

async function generateInfographic(sources: Source[]) {
  const sourcesContent = buildSourcesContent(sources);

  // Step 1: Generate a prompt for the infographic using LLM
  const promptResponse = await openrouter.chat.completions.create({
    model: 'meta-llama/llama-3.3-70b-instruct',
    messages: [
      {
        role: 'system',
        content: `You are an expert at creating educational infographic prompts for AI image generation. Analyze the sources and create a detailed, specific image generation prompt for an infographic.

The prompt should describe a beautiful, professional infographic with:
- A compelling title about the main topic
- 4-6 key data points, statistics, or facts arranged visually
- Visual elements like icons, simple charts, and decorative elements
- A clean, modern aesthetic
- Clear visual hierarchy

CRITICAL RULES FOR THE IMAGE PROMPT:
- NEVER include hex color codes (like #FF5733, #4567b7)
- NEVER include font names (like "Open Sans", "Arial", "Helvetica")
- NEVER include technical specifications or CSS-like values
- Describe colors using natural language ONLY (e.g., "soft blue", "warm orange", "deep purple", "light gray")
- Focus on the CONTENT and VISUAL LAYOUT, not technical design specs
- The prompt should read like a natural description, not a design specification

Return JSON:
{
  "title": "Infographic: [Topic Name]",
  "imagePrompt": "A detailed natural language prompt describing the infographic. Example: 'Professional infographic poster about climate change with a soft blue gradient background. The title in bold white text at the top reads Climate Change Facts. Below are 5 key statistics displayed in colorful rounded boxes arranged in a grid...'",
  "summary": "A 2-3 sentence summary of the key points"
}

IMPORTANT: Return ONLY valid JSON. No markdown code fences.`,
      },
      {
        role: 'user',
        content: `Create an infographic prompt from these sources:\n\n${sourcesContent}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 2048,
  });

  const promptContent = promptResponse.choices[0]?.message?.content;
  if (!promptContent) {
    throw new Error('Failed to generate infographic prompt');
  }

  const promptData = JSON.parse(promptContent);

  // Step 2: Generate the infographic image using bytedance-seed/seedream-4.5
  // OpenRouter requires modalities: ['image', 'text'] for image generation
  const imageResponse = await openrouter.chat.completions.create({
    model: 'bytedance-seed/seedream-4.5',
    messages: [
      {
        role: 'user',
        content: promptData.imagePrompt,
      },
    ],
    // @ts-expect-error - OpenRouter extension for image generation
    modalities: ['image', 'text'],
  });

  // Extract image URL from response.images array (OpenRouter format)
  const message = imageResponse.choices[0]?.message as Record<string, unknown>;
  let imageUrl: string | null = null;

  // OpenRouter returns images in message.images array
  if (message?.images && Array.isArray(message.images)) {
    const images = message.images as Array<{ image_url: { url: string } }>;
    if (images.length > 0 && images[0].image_url?.url) {
      imageUrl = images[0].image_url.url;
    }
  }

  if (!imageUrl) {
    console.error('Image generation response:', JSON.stringify(imageResponse, null, 2));
    throw new Error('No image URL found in response');
  }

  return {
    title: promptData.title,
    content: {
      type: 'infographic',
      imageUrl,
      summary: promptData.summary,
      prompt: promptData.imagePrompt,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const { type, sources } = await request.json();

    if (!type || !sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'Type and sources are required' },
        { status: 400 }
      );
    }

    // Handle infographic separately with image generation
    if (type === 'infographic') {
      const result = await generateInfographic(sources);
      return NextResponse.json(result);
    }

    const prompt = outputPrompts[type as OutputType];
    if (!prompt) {
      return NextResponse.json({ error: 'Invalid output type' }, { status: 400 });
    }

    const sourcesContent = buildSourcesContent(sources);

    const response = await openrouter.chat.completions.create({
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [
        {
          role: 'system',
          content: `You are an expert content generator that creates educational materials from source documents.

${prompt}

IMPORTANT: Return ONLY valid JSON. No markdown code fences around the JSON.`,
        },
        {
          role: 'user',
          content: `Generate output from these sources:\n\n${sourcesContent}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from API');
    }

    const result = JSON.parse(content);

    // Sanitize Mermaid diagram if present
    if (result.content?.type === 'mermaid' && result.content?.diagram) {
      result.content.diagram = sanitizeMermaidDiagram(result.content.diagram);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate output' },
      { status: 500 }
    );
  }
}
