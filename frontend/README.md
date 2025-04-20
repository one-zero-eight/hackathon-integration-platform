# Chat Interface Frontend - JSON Generator

This project is a frontend application for an interactive chat interface, potentially designed to interact with a backend service for generating JSON or other structured data based on user prompts. It features a clean UI, markdown rendering for responses, and chat history management.

## Features

- **Interactive Chat:** Send messages and receive responses from a backend service.
- **Markdown Rendering:** Assistant responses are rendered as Markdown, including support for:
  - Headings, lists, blockquotes, etc.
  - Code blocks with syntax highlighting (using `highlight.js`).
  - Inline code formatting.
- **"Thinking Process" Display:** Ability to show/hide the assistant's thought process if provided within `<think>` tags in the response.
- **Chat History:**
  - Load previous chats from a sidebar.
  - Persists current chat ID and messages in `localStorage`.
  - Fetches history from an API if not found in cache.
- **Message Actions:**
  - Regenerate the last assistant response.
  - Copy assistant messages to the clipboard.
  - Delete message pairs (user prompt + assistant response).
- **Responsive Design:** Adapts to different screen sizes, including a mobile-friendly layout with a collapsible sidebar.
- **Dynamic Textarea:** Input area adjusts height automatically based on content.
- **Loading Indicators:** Visual cues for when the assistant is processing or messages are loading.
- **Wavy Background Effect:** A subtle animated background using the `WavyBackground` component.

## Tech Stack

- **Framework:** React (with Next.js, inferred from `'use client'`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, `cn` for utility class merging
- **Markdown:** `react-markdown`, `rehype-highlight`, `remark-gfm`
- **Icons:** `lucide-react`
- **State Management:** React Hooks (`useState`, `useEffect`, `useRef`, `useMemo`), custom hooks for logic separation.
- **Data Fetching:** Likely `fetch` and or `react-query` (used within custom hooks like `useSendMessage`, `useStartChat`, `getHistory`).

## Prerequisites

- Node.js (v18 or later recommended)
- pnpm

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd frontend
pnpm run dev
```
