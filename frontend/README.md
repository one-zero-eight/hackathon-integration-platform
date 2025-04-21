# Chat User Interface - AI JSON Generator

[![NextJS][Nextjs]][Next-url]
[![React][React]][react-url]
[![React Query][react-query]][rq-url]
[![Tailwind][Tailwind CSS]][Tailwind-url]
[![TypeScript][TypeScript]][ts-url]
[![ShadCN UI][Shadcnui]][shadcn-url]
[![pnpm][pnpm]][pnpm-url]
[![Prettier][prettier]][prettier-url]
[![JSON][json]][json-url]

This project is a frontend application for an interactive chat interface, potentially designed to interact with a
backend service for generating JSON or other structured data based on user prompts. It features a clean UI, markdown
rendering for responses, and chat history management.

## ✨ Features

- **Interactive Chat:** Send messages and receive responses from a backend service.
- **Markdown Rendering:** Assistant responses are rendered as Markdown, including support for:
  - Headings, lists, blockquotes, etc.
  - Code blocks with syntax highlighting (using `highlight.js`).
  - Inline code formatting.
- **"Thinking Process" Display:** Ability to show/hide the assistant's thought process if provided within `<think>` tags
  in the response.
- **Chat History:**
  - Load previous chats from a sidebar.
  - Persists current chat ID and messages in `localStorage`.
  - Fetches history from an API if not found in cache.
- **Message Actions:**
  - Regenerate the last assistant response.
  - Copy assistant messages to the clipboard.
  - Delete message pairs (user prompt + assistant response).
- **Responsive Design:** Adapts to different screen sizes, including a mobile-friendly layout with a collapsible
  sidebar.
- **Dynamic Textarea:** Input area adjusts height automatically based on content.
- **Loading Indicators:** Visual cues for when the assistant is processing or messages are loading.
- **Wavy Background Effect:** A subtle animated background using the `WavyBackground` component.

## ⚙️ Launch locally

### 1. Clone the Repository

```bash
git clone https://github.com/one-zero-eight/hackathon-integration-platform.git
```

### 2. Install dependencies and run

```bash
cd frontend
pnpm install
pnpm run dev
```

Look at the [Next 15](https://nextjs.org/blog/next-15) documentation to learn more.

Check out the [deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more information.

[NextJS]: https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white
[Next-url]: https://nextjs.org/
[Tailwind CSS]: https://img.shields.io/badge/tailwind-000000?style=for-the-badge&logo=tailwindCSS
[Tailwind-url]: https://tailwindcss.com/
[pnpm]: https://img.shields.io/badge/pnpm-000000.svg?style=for-the-badge&logo=pnpm&logoColor=f69220
[pnpm-url]: https://pnpm.io/
[TypeScript]: https://img.shields.io/badge/typescript-000000.svg?style=for-the-badge&logo=typescript&logoColor=white
[ts-url]: https://www.typescriptlang.org/
[Shadcnui]: https://img.shields.io/badge/shadcn/ui-000000.svg?style=for-the-badge&2F&logo=shadcnui&color=131316
[shadcn-url]: https://ui.shadcn.com/
[json]: https://img.shields.io/badge/json-000000.svg?style=for-the-badge&logo=json&logoColor=white
[json-url]: https://www.json.org/json-en.html
[React]: https://img.shields.io/badge/react-000000.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[react-url]: https://react.dev/
[react-query]: https://img.shields.io/badge/React_Query-000000.svg?style=for-the-badge&logo=ReactQuery&logoColor=white
[rq-url]: https://tanstack.com/query/latest/docs/framework/react/overview
[prettier]: https://img.shields.io/badge/prettier-000000.svg?style=for-the-badge&logo=prettier&logoColor=F7BA3E
[prettier-url]: https://prettier.io/
