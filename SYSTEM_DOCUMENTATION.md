# TermoPhysics — Full System Documentation

**Version:** 1.0  
**Last Updated:** February 2026  
**Platform URL:** https://termophysics.lovable.app

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [System Architecture](#5-system-architecture)
6. [Database Schema](#6-database-schema)
7. [API Reference](#7-api-reference)
8. [Component Documentation](#8-component-documentation)
9. [Authentication & Security](#9-authentication--security)
10. [AI Integration](#10-ai-integration)
11. [Design System](#11-design-system)
12. [User Guide](#12-user-guide)
13. [Developer Guide](#13-developer-guide)
14. [Deployment Guide](#14-deployment-guide)
15. [Troubleshooting](#15-troubleshooting)
16. [Glossary](#16-glossary)

---

## 1. Executive Summary

**TermoPhysics** is an AI-powered physics tutoring web platform that provides real-time, conversational explanations of physics concepts accompanied by AI-generated illustrations. The system leverages large language models (Google Gemini) for text generation and DALL-E 3 for visual diagram creation, delivering an interactive learning experience across all major physics domains.

### 1.1 Purpose

To democratize physics education by providing an accessible, intelligent tutoring system that:
- Answers physics questions with detailed, formatted explanations
- Generates professional scientific illustrations for every response
- Supports persistent conversation history for registered users
- Delivers real-time streaming responses for a responsive user experience

### 1.2 Target Audience

- **Primary:** Students (high school, undergraduate, and graduate level)
- **Secondary:** Physics educators, self-learners, and science enthusiasts
- **Tertiary:** Researchers seeking quick conceptual refreshers

---

## 2. System Overview

### 2.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 + TypeScript | UI rendering and state management |
| **Build Tool** | Vite | Development server and production bundling |
| **Styling** | Tailwind CSS + shadcn/ui | Design system and UI components |
| **Routing** | React Router v6 | Client-side navigation |
| **State Management** | React Query + React hooks | Server state and local state |
| **Backend** | Lovable Cloud (Supabase) | Database, auth, edge functions |
| **AI Text Generation** | Google Gemini 3 Flash Preview | Physics explanations |
| **AI Image Generation** | DALL-E 3 | Scientific illustrations |
| **Markdown Rendering** | react-markdown | Rich text display |
| **Testing** | Vitest | Unit and integration testing |

### 2.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                   │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │ React   │  │ Auth     │  │ Streaming SSE      │  │
│  │ UI      │  │ Module   │  │ Parser             │  │
│  └────┬────┘  └────┬─────┘  └────────┬───────────┘  │
│       │            │                 │               │
└───────┼────────────┼─────────────────┼───────────────┘
        │            │                 │
        ▼            ▼                 ▼
┌─────────────────────────────────────────────────────┐
│                 Lovable Cloud Backend                 │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ Database │  │ Auth      │  │ Edge Function:   │  │
│  │ (Postgres)│ │ Service   │  │ physics-chat     │  │
│  └──────────┘  └───────────┘  └───────┬──────────┘  │
│                                       │              │
└───────────────────────────────────────┼──────────────┘
                                        │
                          ┌─────────────┼──────────────┐
                          │    AI Gateway (Lovable AI)   │
                          │  ┌─────────┐ ┌───────────┐  │
                          │  │ Gemini  │ │ DALL-E 3  │  │
                          │  │ 3 Flash │ │ (Images)  │  │
                          │  └─────────┘ └───────────┘  │
                          └─────────────────────────────┘
```

---

## 3. Functional Requirements

### 3.1 Core Features

#### FR-01: Physics Q&A Chat
- **Description:** Users can ask physics questions in natural language and receive detailed, formatted responses.
- **Input:** Text question via chat input
- **Output:** Streaming markdown-formatted response with physics explanations
- **Priority:** Critical
- **Status:** ✅ Implemented

#### FR-02: AI-Generated Illustrations
- **Description:** Every physics response is accompanied by a professionally generated scientific diagram.
- **Input:** The user's physics question (auto-processed)
- **Output:** DALL-E 3 generated image embedded in the chat response
- **Priority:** High
- **Status:** ✅ Implemented

#### FR-03: Real-Time Streaming Responses
- **Description:** AI responses stream in real-time via Server-Sent Events (SSE), providing immediate feedback.
- **Input:** User question submission
- **Output:** Incremental text chunks rendered as they arrive
- **Priority:** Critical
- **Status:** ✅ Implemented

#### FR-04: User Authentication
- **Description:** Users can create accounts and sign in using email/password.
- **Input:** Email and password
- **Output:** Authenticated session with JWT token
- **Priority:** High
- **Status:** ✅ Implemented

#### FR-05: Conversation Persistence
- **Description:** Authenticated users' chat conversations are automatically saved to the database.
- **Input:** Chat messages during an authenticated session
- **Output:** Persistent conversation records retrievable across sessions
- **Priority:** High
- **Status:** ✅ Implemented

#### FR-06: Conversation History Sidebar
- **Description:** Authenticated users can browse, select, and delete past conversations.
- **Input:** User interaction with sidebar
- **Output:** Loaded conversation messages or deletion of selected conversation
- **Priority:** Medium
- **Status:** ✅ Implemented

#### FR-07: Suggested Questions
- **Description:** The landing page displays pre-configured physics questions for quick access.
- **Input:** User click on a suggested question card
- **Output:** The selected question is submitted to the AI
- **Questions:** Thermodynamics, Electromagnetic Waves, Quantum Mechanics, Nuclear Fusion
- **Priority:** Medium
- **Status:** ✅ Implemented

#### FR-08: Markdown & Equation Rendering
- **Description:** AI responses render with full markdown support including headers, lists, bold, code blocks, and inline equations.
- **Input:** Markdown-formatted AI response text
- **Output:** Rich HTML rendering with styled elements
- **Priority:** High
- **Status:** ✅ Implemented

### 3.2 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-01 | Student | Ask a physics question | I can understand complex concepts |
| US-02 | Student | See visual diagrams | I can better visualize physics concepts |
| US-03 | User | Create an account | My conversations are saved |
| US-04 | Registered user | View past conversations | I can review previous explanations |
| US-05 | Registered user | Delete conversations | I can manage my chat history |
| US-06 | New user | Click suggested questions | I can quickly explore common topics |
| US-07 | User | See real-time typing | I know the AI is generating a response |
| US-08 | User | Use the app on mobile | I can learn physics on any device |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target | Status |
|----|------------|--------|--------|
| NFR-01 | Time to First Byte (TTFB) for streaming | < 2 seconds | ✅ Met |
| NFR-02 | Initial page load (LCP) | < 3 seconds | ✅ Met |
| NFR-03 | Chat input responsiveness | < 100ms | ✅ Met |
| NFR-04 | Image generation time | < 30 seconds | ✅ Met |
| NFR-05 | Concurrent user support | 100+ simultaneous users | ✅ Met (serverless) |

### 4.2 Security

| ID | Requirement | Implementation | Status |
|----|------------|---------------|--------|
| NFR-06 | Row Level Security (RLS) | All tables have RLS policies | ✅ Implemented |
| NFR-07 | User data isolation | Users can only access own data | ✅ Implemented |
| NFR-08 | Password security | Min 6 characters, hashed via bcrypt | ✅ Implemented |
| NFR-09 | API key protection | All keys stored as server-side secrets | ✅ Implemented |
| NFR-10 | CORS configuration | Proper headers on edge functions | ✅ Implemented |
| NFR-11 | JWT authentication | Session-based auth with auto-refresh | ✅ Implemented |

### 4.3 Reliability

| ID | Requirement | Implementation | Status |
|----|------------|---------------|--------|
| NFR-12 | Error handling | Graceful error messages with toast notifications | ✅ Implemented |
| NFR-13 | Rate limit handling | 429 status detection with user-friendly messaging | ✅ Implemented |
| NFR-14 | Credit limit handling | 402 status detection with upgrade prompt | ✅ Implemented |
| NFR-15 | Image fallback | Chat continues without image if generation fails | ✅ Implemented |
| NFR-16 | Stream error recovery | Partial JSON buffer handling with retry logic | ✅ Implemented |

### 4.4 Usability

| ID | Requirement | Implementation | Status |
|----|------------|---------------|--------|
| NFR-17 | Responsive design | Mobile-first with breakpoints at sm/md/lg | ✅ Implemented |
| NFR-18 | Dark mode support | Full dark theme via CSS variables | ✅ Implemented |
| NFR-19 | Loading states | Animated dots during AI generation | ✅ Implemented |
| NFR-20 | Auto-scroll | Chat auto-scrolls to latest message | ✅ Implemented |
| NFR-21 | Keyboard shortcuts | Enter to send, Shift+Enter for newline | ✅ Implemented |

### 4.5 Scalability

| ID | Requirement | Implementation |
|----|------------|---------------|
| NFR-22 | Serverless architecture | Edge functions auto-scale with traffic |
| NFR-23 | Stateless backend | No server-side session storage required |
| NFR-24 | CDN delivery | Static assets served via global CDN |
| NFR-25 | Database scaling | Managed PostgreSQL with connection pooling |

### 4.6 Maintainability

| ID | Requirement | Implementation |
|----|------------|---------------|
| NFR-26 | TypeScript throughout | Full type safety on frontend and backend |
| NFR-27 | Component modularity | Small, focused React components |
| NFR-28 | Design system | Centralized tokens in CSS variables and Tailwind config |
| NFR-29 | Auto-generated types | Database types generated from schema |

---

## 5. System Architecture

### 5.1 Frontend Architecture

```
src/
├── App.tsx                      # Root component with providers and routing
├── main.tsx                     # Entry point
├── index.css                    # Design tokens and global styles
├── pages/
│   ├── Index.tsx                # Main chat page (hero + chat interface)
│   └── NotFound.tsx             # 404 page
├── components/
│   ├── Header.tsx               # Top navigation bar with auth controls
│   ├── ChatMessage.tsx          # Individual message bubble with markdown
│   ├── ChatInput.tsx            # Text input with send button
│   ├── SuggestedQuestions.tsx   # Pre-configured question cards
│   ├── AuthModal.tsx            # Sign in / sign up dialog
│   ├── ConversationsSidebar.tsx # Chat history sidebar
│   ├── PhysicsIcon.tsx          # Animated atom icon
│   ├── NavLink.tsx              # Navigation link component
│   └── ui/                      # shadcn/ui component library (40+ components)
├── hooks/
│   ├── useAuth.tsx              # Authentication context and hooks
│   ├── useConversation.ts       # Conversation CRUD operations
│   ├── use-toast.ts             # Toast notification hook
│   └── use-mobile.tsx           # Mobile detection hook
├── lib/
│   ├── physics-chat.ts          # SSE streaming client
│   └── utils.ts                 # Utility functions (cn helper)
├── integrations/
│   └── supabase/
│       ├── client.ts            # Supabase client instance (auto-generated)
│       └── types.ts             # Database type definitions (auto-generated)
└── assets/
    └── hero-bg.jpg              # Hero section background image
```

### 5.2 Backend Architecture

```
supabase/
├── config.toml                  # Supabase project configuration
├── functions/
│   └── physics-chat/
│       └── index.ts             # Edge function: AI chat + image generation
└── migrations/                  # Database migration files (auto-managed)
```

### 5.3 Data Flow

#### Chat Request Flow

```
User types question
       │
       ▼
ChatInput.tsx ──onSend──► Index.tsx (handleSend)
                              │
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
              Add message  Create/get  Save message
              to UI state  conversation to database
                    │         (if auth'd)
                    ▼
            streamPhysicsChat()
                    │
                    ▼ (HTTP POST)
         Edge Function: physics-chat
                    │
           ┌────────┼────────┐
           ▼                 ▼
    Gemini 3 Flash      DALL-E 3
    (text stream)     (image gen)
           │                 │
           ▼                 ▼
    SSE stream ◄──── Image URL injected
    to client         at end of stream
           │
           ▼
    ChatMessage.tsx renders
    markdown + embedded image
```

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│   auth.users     │       │   profiles       │
│──────────────────│       │──────────────────│
│ id (uuid) PK     │◄──┐  │ id (uuid) PK     │
│ email            │   │  │ user_id (uuid) FK │──►│
│ ...              │   │  │ email (text)      │
└──────────────────┘   │  │ display_name      │
                       │  │ created_at        │
                       │  │ updated_at        │
                       │  └──────────────────┘
                       │
                       │  ┌──────────────────┐
                       ├──│ conversations    │
                       │  │──────────────────│
                       │  │ id (uuid) PK     │
                       │  │ user_id (uuid)   │──►│
                       │  │ title (text)     │
                       │  │ created_at       │
                       │  │ updated_at       │
                       │  └───────┬──────────┘
                       │          │
                       │          │ 1:N
                       │          ▼
                       │  ┌──────────────────┐
                       │  │   messages       │
                       │  │──────────────────│
                       │  │ id (uuid) PK     │
                       │  │ conversation_id  │──► conversations.id
                       │  │ role (text)      │
                       │  │ content (text)   │
                       │  │ created_at       │
                       │  └──────────────────┘
                       │
                       │  ┌──────────────────┐
                       └──│ user_roles       │
                          │──────────────────│
                          │ id (uuid) PK     │
                          │ user_id (uuid)   │
                          │ role (app_role)  │
                          └──────────────────┘
```

### 6.2 Table Specifications

#### `profiles`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | — | References auth.users |
| email | text | Yes | — | User email (cached) |
| display_name | text | Yes | — | User display name |
| created_at | timestamptz | No | now() | Record creation time |
| updated_at | timestamptz | No | now() | Last update time |

#### `conversations`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | — | Owner of the conversation |
| title | text | No | 'New Conversation' | Auto-generated from first message |
| created_at | timestamptz | No | now() | Record creation time |
| updated_at | timestamptz | No | now() | Last message time |

#### `messages`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| conversation_id | uuid | No | — | FK → conversations.id |
| role | text | No | — | 'user' or 'assistant' |
| content | text | No | — | Message text (markdown) |
| created_at | timestamptz | No | now() | Message timestamp |

#### `user_roles`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | — | References auth.users |
| role | app_role | No | 'user' | Enum: 'admin' \| 'user' |

### 6.3 Row Level Security (RLS) Policies

| Table | Operation | Policy | Rule |
|-------|-----------|--------|------|
| profiles | SELECT | Users can view own profile | `auth.uid() = user_id` |
| profiles | INSERT | Users can insert own profile | `auth.uid() = user_id` |
| profiles | UPDATE | Users can update own profile | `auth.uid() = user_id` |
| conversations | SELECT | Users can view own conversations | `auth.uid() = user_id` |
| conversations | INSERT | Users can create own conversations | `auth.uid() = user_id` |
| conversations | UPDATE | Users can update own conversations | `auth.uid() = user_id` |
| conversations | DELETE | Users can delete own conversations | `auth.uid() = user_id` |
| messages | SELECT | Users can view messages from own conversations | Subquery on conversations |
| messages | INSERT | Users can insert messages to own conversations | Subquery on conversations |
| user_roles | SELECT | Users can view own roles | `auth.uid() = user_id` |

### 6.4 Database Functions & Triggers

#### `handle_new_user()` — Trigger Function
- **Trigger:** On INSERT to `auth.users`
- **Action:** Creates a profile record and assigns 'user' role
- **Fields populated:** `user_id`, `email`, `display_name` (from email prefix)

#### `update_updated_at_column()` — Trigger Function
- **Trigger:** On UPDATE to tables with `updated_at`
- **Action:** Sets `updated_at` to `now()`

#### `has_role(_user_id, _role)` — Utility Function
- **Returns:** boolean
- **Purpose:** Checks if a user has a specific role

---

## 7. API Reference

### 7.1 Edge Function: `physics-chat`

**Endpoint:** `POST /functions/v1/physics-chat`

#### Request

```json
{
  "messages": [
    { "role": "user", "content": "What is Newton's second law?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "Can you explain it with an example?" }
  ]
}
```

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer `<anon-key>` | Yes |

#### Response

**Content-Type:** `text/event-stream`

**Stream format (SSE):**
```
data: {"choices":[{"delta":{"content":"Newton's second law "}}]}

data: {"choices":[{"delta":{"content":"states that..."}}]}

...

data: {"choices":[{"delta":{"content":"\n\n![Physics Illustration](https://...)"}}]}

data: [DONE]
```

#### Error Responses

| Status | Body | Meaning |
|--------|------|---------|
| 429 | `{"error": "Rate limit exceeded..."}` | Too many requests |
| 402 | `{"error": "AI usage limit reached..."}` | Credit limit hit |
| 500 | `{"error": "AI service not configured"}` | Missing API key |
| 500 | `{"error": "AI service error"}` | Upstream AI failure |

#### Internal Flow

1. Receives chat messages array
2. **Parallel processing:**
   - Sends messages to Gemini 3 Flash Preview for streaming text response
   - Generates an image prompt via Gemini 2.5 Flash
   - Generates illustration via DALL-E 3
3. Streams text response chunks as SSE
4. After text completes, injects image markdown
5. Sends `[DONE]` signal

---

## 8. Component Documentation

### 8.1 Page Components

#### `Index.tsx` — Main Page
- **Path:** `/`
- **States:** Hero (no messages) | Chat (has messages)
- **Responsibilities:**
  - Manages message state array
  - Handles send flow (create conversation → save message → stream AI → save response)
  - Controls sidebar and auth modal visibility
  - Auto-scrolls on new messages

### 8.2 Feature Components

#### `Header.tsx`
- Fixed top navigation bar with blur backdrop
- Shows TermoPhysics brand logo (Atom icon)
- Authenticated: shows user email dropdown with sign out
- Unauthenticated: shows Sign In button
- Menu button visible only when authenticated

#### `ChatMessage.tsx`
- Renders individual chat bubbles (user vs assistant styling)
- User messages: orange background, right-aligned
- Assistant messages: card background, left-aligned
- Renders markdown via `react-markdown` with custom component overrides
- Image rendering: rounded container with "AI-generated illustration" label
- Loading state: animated three-dot pulse

#### `ChatInput.tsx`
- Auto-resizing textarea (52px–200px)
- Send button with disabled states
- Enter to send, Shift+Enter for newline
- Disabled during AI response generation

#### `SuggestedQuestions.tsx`
- 2×2 grid of pre-configured physics questions
- Four topics: Thermodynamics, Electromagnetism, Quantum Mechanics, Nuclear Fusion
- Each card has an icon and hover effects
- Clicking submits the question directly

#### `AuthModal.tsx`
- Dialog-based sign in / sign up form
- Toggles between sign in and sign up modes
- Fields: email, password (min 6 chars)
- Shows loading spinner during submission
- Toast notifications for success/error

#### `ConversationsSidebar.tsx`
- Slide-in sidebar (left, below header)
- Mobile: overlay with backdrop click to close
- "New Chat" button at top
- Scrollable list of past conversations
- Shows title, date, delete button (on hover)
- Active conversation highlighted

### 8.3 Utility Components

#### `PhysicsIcon.tsx`
- Animated SVG atom icon for the hero section
- Uses `animate-float` CSS animation

---

## 9. Authentication & Security

### 9.1 Authentication Flow

```
User clicks "Sign In"
       │
       ▼
AuthModal opens
       │
       ├── Sign Up: supabase.auth.signUp(email, password)
       │       │
       │       ▼
       │   Email verification sent
       │   Profile auto-created via trigger
       │   Role 'user' auto-assigned
       │
       └── Sign In: supabase.auth.signInWithPassword(email, password)
               │
               ▼
         JWT session stored in localStorage
         Auth state propagated via React Context
         Sidebar becomes available
         Messages start persisting to database
```

### 9.2 Session Management

- **Storage:** localStorage (persistent across tabs)
- **Auto-refresh:** Enabled — tokens refresh before expiry
- **State listener:** `onAuthStateChange` keeps UI in sync
- **Sign out:** Clears session and resets UI state

### 9.3 Security Measures

1. **API keys never in client code** — All AI keys stored as server-side secrets
2. **RLS on all tables** — PostgreSQL enforces data isolation at the database level
3. **RESTRICTIVE policies** — All RLS policies use `RESTRICTIVE` mode (deny by default)
4. **No anonymous access** — Only authenticated users can persist data
5. **CORS headers** — Edge functions include proper CORS configuration
6. **Input validation** — Password minimum length enforced
7. **Security Definer functions** — Database functions run with elevated privileges where needed

---

## 10. AI Integration

### 10.1 Text Generation

| Property | Value |
|----------|-------|
| Model | google/gemini-3-flash-preview |
| Endpoint | https://ai.gateway.lovable.dev/v1/chat/completions |
| Mode | Streaming (SSE) |
| System prompt | Physics tutor persona with markdown guidelines |

**System Prompt Summary:**
- Expert AI physics tutor named "TermoPhysics"
- Covers: Classical Mechanics, Thermodynamics, Electromagnetism, Quantum Mechanics, Nuclear Physics, Relativity, Waves & Optics, Astrophysics
- Uses markdown formatting, emojis, real-world examples
- Keeps responses focused and educational

### 10.2 Image Prompt Generation

| Property | Value |
|----------|-------|
| Model | google/gemini-2.5-flash |
| Purpose | Converts user question into a detailed image prompt |
| Output | < 200 word prompt optimized for DALL-E 3 |

### 10.3 Image Generation

| Property | Value |
|----------|-------|
| Model | dall-e-3 |
| Endpoint | https://ai.gateway.lovable.dev/v1/images/generations |
| Resolution | 1024×1024 |
| Quality | HD |
| Style | Clean scientific illustration, blue/orange on white |

### 10.4 Pipeline

```
User Question
     │
     ├──────────────────────┐
     ▼                      ▼
Gemini 3 Flash          Gemini 2.5 Flash
(streaming text)        (image prompt)
     │                      │
     │                      ▼
     │                  DALL-E 3
     │                  (illustration)
     │                      │
     ▼                      ▼
SSE text chunks ◄──── Image URL appended
     │
     ▼
Client renders markdown + image
```

---

## 11. Design System

### 11.1 Color Palette

#### Light Mode
| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | 215 30% 97% | Page background |
| `--foreground` | 215 50% 15% | Primary text |
| `--primary` | 212 55% 25% | Deep blue (brand) |
| `--secondary` | 36 91% 55% | Orange (accent) |
| `--card` | 0 0% 100% | Card backgrounds |
| `--muted` | 215 20% 92% | Subtle backgrounds |
| `--destructive` | 0 84.2% 60.2% | Error states |
| `--termo-deep-blue` | 212 55% 25% | Brand deep blue |
| `--termo-light-orange` | 36 91% 55% | Brand orange |

#### Dark Mode
| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | 212 60% 8% | Dark page background |
| `--primary` | 36 91% 55% | Orange becomes primary |
| `--card` | 212 55% 12% | Dark card backgrounds |

### 11.2 Typography

| Element | Font Family | Weights |
|---------|-------------|---------|
| Body text | Inter | 300–700 |
| Headings (h1–h6) | Space Grotesk | 400–700 |

### 11.3 Animations

| Class | Effect | Duration |
|-------|--------|----------|
| `animate-float` | Vertical hover (±10px) | 6s infinite |
| `animate-pulse-soft` | Opacity pulse (1→0.7→1) | 3s infinite |
| `animate-fade-up` | Slide up + fade in | 0.6s once |
| `animate-slide-in` | Slide right + fade in | 0.4s once |

### 11.4 Custom CSS Classes

| Class | Purpose |
|-------|---------|
| `.termo-gradient-text` | Orange gradient text effect |
| `.termo-hero-gradient` | Hero section gradient background |
| `.termo-card` | Card with gradient and shadow |
| `.termo-glow` | Orange glow shadow effect |
| `.termo-input-glow` | Focus glow on inputs |

---

## 12. User Guide

### 12.1 Getting Started

1. **Visit** the platform at https://termophysics.lovable.app
2. **Ask a question** by typing in the chat input or clicking a suggested question
3. **View the response** — text streams in real-time followed by an illustration
4. **Sign up** (optional) to save your conversation history

### 12.2 Asking Questions

- Type any physics question in natural language
- Examples:
  - "What is the second law of thermodynamics?"
  - "Explain electromagnetic induction with examples"
  - "How does quantum tunneling work?"
  - "Derive the Schrödinger equation"
- Press **Enter** to send, **Shift+Enter** for a new line
- Wait for the full response including the illustration

### 12.3 Managing Conversations (Authenticated Users)

1. **Sign In** — Click "Sign In" in the header, enter email and password
2. **View History** — Click the menu icon (☰) to open the sidebar
3. **Resume a Chat** — Click any conversation in the sidebar to load it
4. **Start New Chat** — Click "New Chat" in the sidebar
5. **Delete a Chat** — Hover over a conversation and click the trash icon
6. **Sign Out** — Click your email in the header → "Sign Out"

### 12.4 Tips for Best Results

- ✅ Be specific: "Explain Faraday's law of electromagnetic induction" is better than "explain electricity"
- ✅ Ask follow-up questions in the same conversation for context-aware responses
- ✅ Each response includes an AI-generated illustration
- ❌ The AI is focused on physics — non-physics questions may receive limited responses

---

## 13. Developer Guide

### 13.1 Local Development Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### 13.2 Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| VITE_SUPABASE_URL | Auto-generated (.env) | Backend API base URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Auto-generated (.env) | Public API key |
| LOVABLE_API_KEY | Server secret | AI gateway authentication |

### 13.3 Project Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest test suite |

### 13.4 Adding a New Suggested Question

Edit `src/components/SuggestedQuestions.tsx`:

```typescript
const suggestions = [
  {
    icon: Flame,          // Lucide icon
    question: "Your question here?",
    color: "text-termo-light-orange",
  },
  // ... more suggestions
];
```

### 13.5 Modifying the AI System Prompt

Edit `supabase/functions/physics-chat/index.ts`:

```typescript
const PHYSICS_SYSTEM_PROMPT = `Your updated prompt here...`;
```

The edge function will auto-deploy after changes are pushed.

### 13.6 Adding a New Database Table

1. Use the database migration tool to create the table with RLS policies
2. The types file will auto-update after migration
3. Use the Supabase client to query: `import { supabase } from "@/integrations/supabase/client"`

---

## 14. Deployment Guide

### 14.1 Frontend Deployment

1. Open the Lovable editor
2. Click **Publish** (top right)
3. Click **Update** to deploy frontend changes
4. Access at: https://termophysics.lovable.app

### 14.2 Backend Deployment

- **Edge functions:** Auto-deploy on code push
- **Database migrations:** Applied via migration tool with user approval
- **Secrets:** Managed via Lovable Cloud settings

### 14.3 Custom Domain

1. Navigate to Project > Settings > Domains
2. Click "Connect Domain"
3. Follow DNS configuration instructions
4. Requires a paid Lovable plan

---

## 15. Troubleshooting

### 15.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "AI service not configured" | Missing LOVABLE_API_KEY | Verify secret is set in Cloud settings |
| Image not showing | DALL-E 3 generation failure | Check edge function logs; image falls back gracefully |
| Raw JSON in chat | Image endpoint misconfigured | Ensure `/v1/images/generations` endpoint is used |
| "Rate limit exceeded" | Too many requests | Wait a moment and retry |
| "AI usage limit reached" | Credit limit hit | Add credits to continue |
| Conversations not saving | User not authenticated | Sign in to enable persistence |
| Blank sidebar | No past conversations | Start a new chat while signed in |
| Auth error on sign up | Email already exists | Use sign in instead |

### 15.2 Checking Logs

- **Frontend console:** Browser DevTools → Console tab
- **Edge function logs:** Available via Lovable Cloud monitoring
- **Database queries:** Use the Cloud SQL runner

---

## 16. Glossary

| Term | Definition |
|------|-----------|
| **SSE** | Server-Sent Events — protocol for streaming server→client updates |
| **RLS** | Row Level Security — PostgreSQL feature that restricts data access per-row |
| **Edge Function** | Serverless function running at the network edge (Deno runtime) |
| **JWT** | JSON Web Token — compact token format for authentication |
| **LLM** | Large Language Model — AI model trained on text data |
| **DALL-E 3** | OpenAI's image generation model |
| **Gemini** | Google's family of multimodal AI models |
| **shadcn/ui** | React component library built on Radix UI primitives |
| **Tailwind CSS** | Utility-first CSS framework |
| **Vite** | Modern frontend build tool with HMR support |
| **HMR** | Hot Module Replacement — instant updates during development |

---

*This document is maintained as part of the TermoPhysics project codebase. For questions or updates, refer to the project repository.*
