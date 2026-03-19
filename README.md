# NeXreply AI - Frontend Module

A WhatsApp-style chat interface for the NeXreply AI system with complete system segregation.

## Architecture

This is the **Frontend (UI/Demo Layer)** of the NeXreply AI system, designed to be completely independent from the Backend and LLM Engine modules.

## Features

- WhatsApp-inspired chat interface
- Real-time message exchange
- Conversation history persistence with Supabase
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Loading states and error handling

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Database for conversation history
- **Axios** - API communication
- **Lucide React** - Icons

## Project Structure

```
/src
  /components
    ChatHeader.tsx      - Chat header with bot info
    ChatBox.tsx         - Main chat container with input
    MessageBubble.tsx   - Individual message display
  /services
    api.ts              - Backend API communication
    database.ts         - Supabase database operations
  /lib
    supabase.ts         - Supabase client configuration
  App.tsx               - Main application component
  main.tsx              - Application entry point
```

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

## Database Schema

The application uses Supabase with the following tables:

### conversations
- `id` (uuid) - Primary key
- `user_id` (text) - Session-based user identifier
- `title` (text) - Conversation title
- `created_at`, `updated_at` (timestamptz)

### messages
- `id` (uuid) - Primary key
- `conversation_id` (uuid) - Foreign key to conversations
- `text` (text) - Message content
- `is_user` (boolean) - User or bot message
- `created_at` (timestamptz)

## API Integration

The frontend connects to the backend via a REST API:

**Endpoint:** `POST /chat`

**Request:**
```json
{
  "message": "What is the price of iPhone 14?",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "reply": "The iPhone 14 starts at $799"
}
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Features Implemented

1. **Chat UI** - Clean, WhatsApp-style interface
2. **Message History** - Persistent conversation storage
3. **Real-time Updates** - Smooth message flow
4. **Error Handling** - Graceful error messages
5. **Loading States** - Visual feedback during API calls
6. **Auto-scroll** - Automatic scroll to latest message
7. **Session Management** - Unique user ID per browser

## Next Steps

To complete the NeXreply AI system:

1. **Backend Module** - Build the API server with business logic
2. **LLM Engine Module** - Integrate AI capabilities
3. **Connect Modules** - Wire all three components together
