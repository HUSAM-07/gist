'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotebook } from '@/lib/notebook-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Settings2,
  MoreVertical,
  Send,
  Loader2,
  User,
  Bot,
  Quote,
} from 'lucide-react';
import type { ChatMessage as ChatMessageType, Citation } from '@/types/notebook';

function ChatMessage({ message }: { message: ChatMessageType }) {
  return (
    <div
      className={`flex gap-3 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <p className="text-xs font-medium opacity-70">Citations:</p>
            {message.citations.map((citation, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs opacity-80"
              >
                <Quote className="h-3 w-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">{citation.sourceName}:</span>{' '}
                  <span className="italic">"{citation.text}"</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export function ChatPanel() {
  const { notebook, addMessage, setAddSourceModalOpen } = useNotebook();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [notebook.chat]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sources: notebook.sources,
          history: notebook.chat,
        }),
      });

      const data = await response.json();

      if (data.error) {
        addMessage({
          role: 'assistant',
          content: `Error: ${data.error}`,
        });
      } else {
        addMessage({
          role: 'assistant',
          content: data.response,
          citations: data.citations,
        });
      }
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = notebook.chat.length > 0;
  const hasSources = notebook.sources.length > 0;

  return (
    <div className="h-full flex flex-col bg-background min-h-0">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-sm font-medium">Chat</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {!hasMessages ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Add a source to get started</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Upload PDFs, add websites, or paste text to start chatting with your documents.
            </p>
            <Button
              variant="outline"
              onClick={() => setAddSourceModalOpen(true)}
            >
              Upload a source
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notebook.chat.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasSources ? "Ask about your sources..." : "Upload a source to get started"}
              className="min-h-[48px] max-h-32 pr-12 resize-none"
              disabled={!hasSources || isLoading}
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8"
              onClick={handleSend}
              disabled={!input.trim() || !hasSources || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {notebook.sources.length} source{notebook.sources.length !== 1 ? 's' : ''}
          </p>
          <Badge variant="outline" className="text-xs">
            <span className="text-muted-foreground">Press Enter to send</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
