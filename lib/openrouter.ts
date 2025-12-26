import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'PDF Summarizer',
  },
});

function sanitizeMermaidDiagram(diagram: string): string {
  return diagram
    .replace(/```mermaid\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/\|>/g, '|')
    .trim();
}

export async function summarizeText(text: string) {
  const response = await openrouter.chat.completions.create({
    model: 'meta-llama/llama-3.3-70b-instruct',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that summarizes academic papers and technical documents.

Your task is to:
1. Provide a detailed technical summary
2. Create a Mermaid diagram that visualizes the key concepts
3. Provide a short layman's summary (2-3 sentences)

IMPORTANT - Mermaid Diagram Rules:
- Use ONLY valid Mermaid syntax
- Arrow syntax: A --> B (simple) or A -->|label| B (with label)
- Do NOT use -->|label|> (this is invalid)
- Do NOT include \`\`\`mermaid code fences
- Prefer simple flowchart TD or graph LR diagrams

Example valid diagram:
graph LR
    A[Input] --> B[Process]
    B -->|success| C[Output]
    B -->|failure| D[Error]

Return your response in JSON format:
{
  "technicalSummary": "detailed technical summary here",
  "mermaidDiagram": "graph LR\\n    A[Start] --> B[End]",
  "laymanSummary": "simple explanation here"
}`,
      },
      {
        role: 'user',
        content: `Please analyze and summarize the following document:\n\n${text}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from API');
  }

  const result = JSON.parse(content);

  if (result.mermaidDiagram) {
    result.mermaidDiagram = sanitizeMermaidDiagram(result.mermaidDiagram);
  }

  return result;
}
