# Gemini Chatbot

A production-ready AI chatbot application built with Next.js, Supabase, and Google Gemini. Features real-time streaming responses, conversation history, and a beautiful, responsive UI.

🚀 **[Live Demo](https://gemini-chatbot-blush-pi.vercel.app/)**

## Features

- ✨ **AI-Powered Chat** - Streaming responses from Google Gemini
- 🔐 **Authentication** - Secure user auth with Supabase
- 💬 **Conversation History** - Save and manage multiple conversations
- 📊 **Real-time Metrics** - Track tokens/second during streaming
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🎨 **Modern UX** - Smooth animations and loading states

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **LLM Provider**: [Google Gemini](https://ai.google.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works fine)
- A Google Gemini API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gemini_chatbot.git
cd gemini_chatbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to **SQL Editor** and run the schema from `supabase-schema.sql`
3. Get your project URL and anon key from **Settings** → **API**

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
gemini_chatbot/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   ├── chat/page.tsx            # Main chat interface
│   ├── api/chat/route.ts        # Streaming API endpoint
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── AuthForm.tsx             # Reusable auth form
│   ├── MessageList.tsx          # Message display component
│   ├── MessageInput.tsx         # Message input with keyboard shortcuts
│   ├── TokenStats.tsx           # Real-time streaming stats
│   └── ConversationSidebar.tsx  # Conversation history sidebar
├── lib/
│   ├── supabaseClient.ts        # Supabase client setup
│   ├── llmClient.ts             # Abstracted LLM client
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
├── middleware.ts                # Route protection
└── supabase-schema.sql          # Database schema
```

## Database Schema

The application uses two main tables:

### `conversations`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → auth.users)
- `title`: Text (auto-generated from first message)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `messages`
- `id`: UUID (Primary Key)
- `conversation_id`: UUID (Foreign Key → conversations)
- `role`: Text ('user' | 'assistant' | 'system')
- `content`: Text
- `created_at`: Timestamp

Both tables have **Row Level Security (RLS)** enabled to ensure users can only access their own data.

## Key Features Explained

### Streaming Responses

The app uses Server-Sent Events to stream responses from Gemini token-by-token, providing a smooth, real-time chat experience. The streaming happens server-side through an Edge API route for optimal performance.

### Tokens/Second Metric

During streaming, the app displays:
- **Token count**: Estimated number of tokens in the response
- **Tokens/second**: Real-time throughput metric
- **Elapsed time**: Time taken for the response

For more details on the limitations of tokens/s as a metric, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Conversation Management

- Conversations are created automatically when you send your first message
- Titles are auto-generated from the first user message
- Switch between conversations using the sidebar
- All messages are persisted to Supabase

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

The app will be live at `https://your-app.vercel.app`

## Environment Variables in Production

Make sure to add all three environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Contributing

This is a case study project, but suggestions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini for the LLM API
- Supabase for auth and database
- Next.js team for the amazing framework
- Vercel for hosting