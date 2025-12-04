'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Message, Conversation, StreamingStats } from '@/lib/types';
import { generateTitle, estimateTokens } from '@/lib/utils';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import TokenStats from '@/components/TokenStats';
import ConversationSidebar from '@/components/ConversationSidebar';

export default function ChatPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingStats, setStreamingStats] = useState<StreamingStats | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);
            loadConversations(user.id);
        };
        checkUser();
    }, [router]);

    const loadConversations = async (userId: string) => {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error loading conversations:', error);
            return;
        }

        setConversations(data || []);
    };

    const loadMessages = async (conversationId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading messages:', error);
            return;
        }

        setMessages(data || []);
    };

    const createConversation = async (firstMessage: string): Promise<string | null> => {
        if (!user) return null;

        const { data, error } = await supabase
            .from('conversations')
            .insert({
                user_id: user.id,
                title: generateTitle(firstMessage),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating conversation:', error);
            return null;
        }

        await loadConversations(user.id);
        return data.id;
    };

    const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                role,
                content,
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving message:', error);
            return null;
        }

        return data;
    };

    const handleSendMessage = async (content: string) => {
        if (!user) return;

        let conversationId = currentConversationId;

        // Create new conversation if none exists
        if (!conversationId) {
            conversationId = await createConversation(content);
            if (!conversationId) return;
            setCurrentConversationId(conversationId);
        }

        // Add user message
        const userMessage = await saveMessage(conversationId, 'user', content);
        if (!userMessage) return;

        setMessages((prev) => [...prev, userMessage]);

        // Start streaming
        setIsStreaming(true);
        setStreamingStats(null);

        const startTime = Date.now();
        let accumulatedResponse = '';
        let tokenCount = 0;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Create a temporary message for streaming
            const tempId = 'temp-' + Date.now();
            setMessages((prev) => [...prev, {
                id: tempId,
                conversation_id: conversationId!,
                role: 'assistant',
                content: '',
                created_at: new Date().toISOString(),
            }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedResponse += chunk;
                tokenCount = estimateTokens(accumulatedResponse);

                // Update streaming message
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === tempId ? { ...m, content: accumulatedResponse } : m
                    )
                );

                // Update stats
                const elapsedTime = Date.now() - startTime;
                setStreamingStats({
                    tokenCount,
                    elapsedTime,
                    tokensPerSecond: (tokenCount / elapsedTime) * 1000,
                });
            }

            // Save assistant message to DB
            const assistantMessage = await saveMessage(conversationId, 'assistant', accumulatedResponse);

            // Replace temp message with real one
            if (assistantMessage) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === tempId ? assistantMessage : m
                    )
                );
            }

            // Update conversation timestamp
            await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId);

            await loadConversations(user.id);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsStreaming(false);
        }
    };

    const handleSelectConversation = (conversationId: string) => {
        setCurrentConversationId(conversationId);
        loadMessages(conversationId);
        setStreamingStats(null);
    };

    const handleNewConversation = () => {
        setCurrentConversationId(null);
        setMessages([]);
        setStreamingStats(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse-subtle">Loading...</div>
            </div>
        );
    }

    return (
        <div className="h-screen flex overflow-hidden bg-[var(--background)]">
            <ConversationSidebar
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
            />

            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-[var(--card-bg)] border-b border-[var(--border-color)] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Gemini Chatbot
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">{user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <MessageList messages={messages} isStreaming={isStreaming} />

                {/* Token Stats */}
                <TokenStats stats={streamingStats} isStreaming={isStreaming} />

                {/* Input */}
                <MessageInput onSendMessage={handleSendMessage} disabled={isStreaming} />
            </div>
        </div>
    );
}
