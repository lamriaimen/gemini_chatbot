/**
 * Generate a conversation title from the first user message
 */
export function generateTitle(message: string): string {
    const maxLength = 50;
    const cleanMessage = message.trim();

    if (cleanMessage.length <= maxLength) {
        return cleanMessage;
    }

    return cleanMessage.substring(0, maxLength - 3) + '...';
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit'
        });
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token on average
    return Math.ceil(text.length / 4);
}
