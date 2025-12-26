# PDF Summarizer

A beautiful Next.js application that extracts content from PDF documents, summarizes them using Google's Gemini AI models via OpenRouter, and visualizes key concepts using Mermaid diagrams.

## Features

- Upload PDF documents via drag-and-drop or file selection
- Extract and analyze PDF content
- Generate AI-powered summaries using Gemini 2.0 Flash
- Visualize document concepts with Mermaid diagrams
- Get both technical and layman's term summaries
- Beautiful UI built with shadcn/ui components
- Responsive design with modern styling

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **shadcn/ui** - Beautiful UI components built on Radix UI
- **Tailwind CSS** - Utility-first CSS framework
- **OpenRouter** - API gateway for AI models
- **Gemini 2.0 Flash** - Google's latest AI model
- **pdf-parse** - PDF text extraction
- **Mermaid.js** - Diagram generation and visualization
- **react-dropzone** - File upload handling

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenRouter API key (get one at [https://openrouter.ai/keys](https://openrouter.ai/keys))

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd pdf-summarizer
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Edit `.env.local` and add your OpenRouter API key:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click or drag-and-drop a PDF file onto the upload area
2. Click "Analyze PDF" to process the document
3. View the results:
   - **Quick Summary**: A simple, layman's explanation
   - **Visual Representation**: Mermaid diagram showing key concepts
   - **Technical Summary**: Detailed analysis of the document

## Project Structure

```
pdf-summarizer/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # API endpoint for PDF processing
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main application page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── mermaid-diagram.tsx       # Mermaid diagram renderer
│   └── pdf-upload.tsx            # PDF upload component
├── lib/
│   ├── openrouter.ts             # OpenRouter client configuration
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## API Routes

### POST /api/analyze

Accepts a PDF file and returns an analysis including:
- Technical summary
- Mermaid diagram code
- Layman's summary
- Page count and file information

**Request**: FormData with `file` field containing the PDF
**Response**: JSON with analysis results

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key (required)
- `NEXT_PUBLIC_APP_URL` - Your application URL for OpenRouter headers (optional)

## Model Configuration

The application uses `google/gemini-2.0-flash-exp:free` by default. You can change this in `lib/openrouter.ts` to use other models available on OpenRouter.

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
