'use client';

import { Message } from '@/lib/types';
import { formatTimestamp } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface MessageListProps {
    messages: Message[];
    isStreaming: boolean;
}

export default function MessageList({ messages, isStreaming }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center animate-fade-in">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-semibold mb-2">Start a Conversation</h2>
                    <p className="text-gray-400">
                        Send a message to begin chatting with AI
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message, index) => (
                <div
                    key={message.id || index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                    <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                ? 'bg-[var(--user-message)] text-white'
                                : 'bg-[var(--assistant-message)] border border-[var(--border-color)]'
                            }`}
                    >
                        <div className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                        <div className="text-xs opacity-50 mt-2">
                            {formatTimestamp(message.created_at)}
                        </div>
                    </div>
                </div>
            ))}

            {isStreaming && (
                <div className="flex justify-start animate-fade-in">
                    <div className="bg-[var(--assistant-message)] border border-[var(--border-color)] rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-subtle" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-subtle" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-subtle" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
