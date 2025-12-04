# Architecture Overview

This document explains the key architectural decisions, system design, and technical rationale for the Gemini Chatbot application.

## System Architecture

### High-Level Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │◄───────►│   Next.js    │◄───────►│  Supabase   │
│  (Browser)  │         │  App Router  │         │  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               │
                               ▼
                        ┌──────────────┐
                        │    Gemini    │
                        │  LLM API     │
                        └──────────────┘
```

### Component Breakdown

#### Frontend Layer
- **Framework**: Next.js 16 with App Router
- **Rendering**: Client-side for interactive components, server-side for auth checks
- **State Management**: React hooks (useState, useEffect) for local state
- **Styling**: Tailwind CSS with custom animations

#### API Layer
- **Runtime**: Edge Runtime for streaming API route
- **Endpoint**: `/api/chat` handles LLM streaming
- **Data Flow**: Receives messages → Streams to Gemini → Returns chunked text

#### Database Layer
- **Provider**: Supabase (PostgreSQL)
- **Tables**: `conversations` and `messages`
- **Security**: Row Level Security (RLS) policies ensure users only access their data

#### Authentication
- **Provider**: Supabase Auth
- **Flow**: Email/password authentication
- **Protection**: Middleware intercepts routes and validates session

## Key Design Decisions

### 1. Why Next.js App Router?

**Rationale:**
- Server Components reduce client-side JavaScript bundle size
- Built-in middleware for route protection
- Edge Runtime enables low-latency streaming responses
- Excellent TypeScript support
- Easy deployment to Vercel

### 2. Why Supabase?

**Rationale:**
- All-in-one solution for auth + database
- PostgreSQL provides robust relational data model
- Row Level Security (RLS) ensures data privacy at the database level
- Real-time capabilities (not used here, but available for future features)
- Generous free tier for demos

**Alternative considered**: Firebase was considered but Supabase's PostgreSQL is more familiar and provides better query flexibility.

### 3. Why Gemini over other LLMs?

**Rationale:**
- Free API key with generous limits
- Fast streaming performance
- Good quality responses for general chat
- Easy to swap (abstracted behind `LLMClient` interface)

**Abstraction**: The `llmClient.ts` can be swapped for OpenAI, Claude, or any other provider without changing the app logic.

### 4. Streaming Architecture

**How Streaming Works:**

1. **Client** sends message to `/api/chat`
2. **API Route** forwards to Gemini with conversation history
3. **Gemini** returns streaming response (async generator)
4. **Server** encodes chunks as text stream
5. **Client** reads stream using `ReadableStream` API
6. **UI** updates message in real-time, character by character

**Why Edge Runtime?**
- Lower latency (deployed to edge locations)
- Better for streaming workloads
- No cold start issues

### 5. Database Schema Rationale

**Conversations Table:**
- Stores metadata about chat sessions
- `title` is auto-generated from first message for UX
- `updated_at` enables sorting by recent activity

**Messages Table:**
- Stores individual messages
- `role` field supports 'user', 'assistant', 'system' for future system prompts
- Foreign key cascade ensures messages are deleted when conversation is deleted

**Why Two Tables?**
- Separation of concerns (conversation metadata vs. message content)
- Enables efficient queries (load conversation list without full message history)
- Scalable (can add conversation settings, sharing, etc. later)

**Indexes:**
- `conversations(user_id)` - Fast lookup of user's conversations
- `conversations(updated_at DESC)` - Fast sorting by recent
- `messages(conversation_id)` - Fast message retrieval per conversation

## Security Considerations

### 1. API Key Protection
- Gemini API key is **only** in server-side environment variables
- Never exposed to client
- API route acts as proxy

### 2. Row Level Security (RLS)
- Users can only read/write their own conversations and messages
- Enforced at database level, not just application level
- Even if application has a bug, database prevents unauthorized access

### 3. Authentication Flow
- Middleware validates session on every protected route
- Sessions stored in HTTP-only cookies (not accessible via JS)
- Supabase handles password hashing and security best practices

## Performance Optimizations

### 1. Streaming
- Reduces time-to-first-token (user sees response immediately)
- Better perceived performance than waiting for full response

### 2. Edge Runtime
- API route runs on Vercel Edge Network
- Closer to users globally
- No cold starts

### 3. Optimistic UI Updates
- Messages appear in UI before database confirmation
- Temporary IDs replaced with real IDs after save
- Smooth UX even on slow connections

### 4. Lazy Loading
- Conversations loaded on demand
- Messages only loaded when conversation is selected
- Reduces initial page load time

## Tokens/Second as a Performance Metric

### What We Track

During streaming, the app displays:
- **Total tokens**: Estimated count of tokens in the response
- **Elapsed time**: Time since streaming started  
- **Tokens/second**: `totalTokens / (elapsedTime / 1000)`

### Major Limitations of Tokens/Second

#### 1. **Ignores Latency (Time-to-First-Token)**

Tokens/second only measures throughput, not responsiveness. A model might have:
- High tokens/s but take 5 seconds to start
- Low tokens/s but start in 100ms

**User Impact**: Users care more about when they see the first word than overall throughput. A model that streams 20 tokens/s starting immediately feels faster than 50 tokens/s starting after 3 seconds.

#### 2. **Doesn't Measure Answer Quality**

A model generating 100 tokens/s of nonsense is worse than 20 tokens/s of accurate, helpful content.

**Business Impact**: Optimizing purely for tokens/s could lead to:
- Shorter, less helpful responses
- Lower quality models that are faster but less accurate
- Poor user satisfaction despite "good" metrics

#### 3. **Sensitive to Output Length**

Longer responses naturally have more stable tokens/s measurements. Short responses (e.g., "Yes" = 1 token) can show wild variance.

**Example**:
- 100-token response in 5s = 20 tokens/s
- 5-token response in 0.5s = 10 tokens/s (appears slower, but actually faster to complete)

#### 4. **Network and Infrastructure Noise**

Tokens/s is affected by:
- Network latency between server and LLM API
- Regional differences (API proximity)
- Time of day (API load)
- Bandwidth fluctuations

**Result**: Same prompt can show different tokens/s each time, making it unreliable for comparison.

#### 5. **May Encourage Wrong Optimizations**

Focusing on tokens/s might push teams to:
- Use cheaper, faster models with worse quality
- Reduce safety checks to save time
- Prioritize throughput over reliability (risk of incomplete responses)

**Cost Impact**: Faster models often use more compute. Higher tokens/s might mean higher API costs with no UX benefit if latency is the real bottleneck.

#### 6. **Doesn't Account for User Experience**

Real UX depends on:
- Relevance of the answer
- Formatting quality (code blocks, lists, etc.)
- Error rates
- Consistency across prompts

Tokens/s measures none of these.

### Better Metrics to Consider

1. **Time-to-First-Token (TTFT)**: How quickly users see something
2. **Total Response Time**: Full answer latency
3. **User Satisfaction**: Thumbs up/down, conversation length
4. **Answer Quality**: Human eval, accuracy on benchmarks
5. **Cost per Query**: Balance speed with expense
6. **Error Rate**: Incomplete or failed streams

### Conclusion

Tokens/s is a useful **diagnostic tool** for debugging streaming performance, but it should never be the primary success metric. It's one data point among many, and optimizing for it alone can harm user experience, quality, and cost-effectiveness.

**In this app**, we display tokens/s to satisfy the assignment requirement and to give users insight into streaming performance, but we acknowledge its limitations as a real-world KPI.

## Future Improvements

Potential enhancements (out of scope for this case study):

1. **Real-time Collaboration**: Multiple users chatting with same bot
2. **Conversation Sharing**: Share chat links with others
3. **Model Selection**: Let users choose between different LLMs
4. **Prompt Templates**: Pre-built prompts for common tasks
5. **Voice Input**: Speech-to-text integration
6. **Export**: Download conversations as PDF/Markdown
7. **Advanced Analytics**: Track token usage, costs, etc.

## Conclusion

This architecture prioritizes:
- **User Experience**: Fast, smooth, responsive
- **Security**: RLS, server-side API keys, auth middleware
- **Maintainability**: Clean separation of concerns, TypeScript
- **Scalability**: Database indexes, lazy loading, edge runtime

The tech stack (Next.js + Supabase + Gemini) is proven, well-documented, and suitable for production use with minimal operational overhead.
