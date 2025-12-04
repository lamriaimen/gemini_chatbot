'use client';

import { Conversation } from '@/lib/types';
import { useState } from 'react';

interface ConversationSidebarProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
    onNewConversation: () => void;
}

export default function ConversationSidebar({
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
}: ConversationSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[var(--card-bg)] border-r border-[var(--border-color)] flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="p-4 border-b border-[var(--border-color)]">
                    <button
                        onClick={() => {
                            onNewConversation();
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        + New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm mt-8">
                            No conversations yet
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => {
                                    onSelectConversation(conversation.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${currentConversationId === conversation.id
                                        ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/30'
                                        : 'hover:bg-[var(--background)]'
                                    }`}
                            >
                                <div className="font-medium text-sm truncate">
                                    {conversation.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(conversation.updated_at).toLocaleDateString()}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
