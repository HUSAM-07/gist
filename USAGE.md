# Quick Start Guide

## Setup

1. **Get an OpenRouter API Key**
   - Visit https://openrouter.ai/keys
   - Sign up or log in
   - Create a new API key
   - Copy the key

2. **Configure Environment Variables**

   Open `.env.local` and add your API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   - Navigate to http://localhost:3000
   - You should see the PDF Summarizer interface

## Using the App

1. **Upload a PDF**
   - Drag and drop a PDF file onto the upload area
   - Or click to browse and select a PDF file

2. **Analyze**
   - Click the "Analyze PDF" button
   - Wait for the AI to process your document (usually 10-30 seconds)

3. **View Results**
   - **Quick Summary**: A simple explanation anyone can understand
   - **Visual Representation**: A Mermaid diagram showing key concepts
   - **Technical Summary**: Detailed analysis for technical readers

## Features

- Supports PDF files of any size (automatically truncated to 50,000 characters for analysis)
- Uses Google's Gemini 2.0 Flash model via OpenRouter
- Beautiful, responsive UI
- Real-time processing feedback
- Automatic diagram generation

## Troubleshooting

**Issue**: "No API key" error
- **Solution**: Make sure you've added your OPENROUTER_API_KEY to .env.local

**Issue**: PDF upload fails
- **Solution**: Ensure the file is a valid PDF

**Issue**: Analysis takes too long
- **Solution**: For very large PDFs, only the first 50,000 characters are analyzed

## Production Build

To create a production build:

```bash
npm run build
npm start
```

The production server will run on http://localhost:3000
