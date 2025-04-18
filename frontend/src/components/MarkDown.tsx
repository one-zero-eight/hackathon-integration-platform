// components/Markdown.tsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import CodeBlock from './CodeBlock'

interface MarkdownProps {
  text: string // Text to render as Markdown
}

const Markdown: React.FC<MarkdownProps> = ({ text }) => {
  return (
    <ReactMarkdown
      children={text}
      components={{
        // Custom rendering for code blocks
        code({ className, children, ...props }) {
          const language = className ? className.replace('language-', '') : ''
          const match = /language-(\w+)/.exec(className || '')

          return !match ? (
            <CodeBlock language={language} value={String(children).replace(/\n$/, '')} />
          ) : (
            <code {...props}>{children}</code>
          )
        }
      }}
    />
  )
}

export default Markdown
