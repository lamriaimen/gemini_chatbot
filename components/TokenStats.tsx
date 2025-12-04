'use client';

import { StreamingStats } from '@/lib/types';

interface TokenStatsProps {
  stats: StreamingStats | null;
  isStreaming: boolean;
}

export default function TokenStats({ stats, isStreaming }: TokenStatsProps) {
  if (!stats && !isStreaming) return null;

  return (
    <div className="px-4 py-2 bg-[var(--card-bg)] border-t border-[var(--border-color)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-400">
        <div className="flex gap-4">
          {stats && (
            <>
              <span>
                <span className="font-medium text-gray-300">{stats.tokenCount}</span> tokens
              </span>
              <span>
                <span className="font-medium text-gray-300">{stats.tokensPerSecond.toFixed(1)}</span> tokens/s
              </span>
              <span>
                <span className="font-medium text-gray-300">{(stats.elapsedTime / 1000).toFixed(2)}</span>s
              </span>
            </>
          )}
          {isStreaming && <span className="animate-pulse-subtle">Streaming...</span>}
        </div>
      </div>
    </div>
  );
}
