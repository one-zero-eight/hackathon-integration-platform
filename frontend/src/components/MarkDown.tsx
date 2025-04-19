// components/ChatMarkdown.tsx
import 'highlight.js/styles/github-dark.css'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import type { PluggableList } from 'unified'

interface ChatMarkdownProps {
  content: string
}

interface CodeProps {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ content }) => {
  const rehypePlugins: PluggableList = [[rehypeHighlight, { ignoreMissing: true }]]

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={rehypePlugins}
      components={{
        h1: ({ node, ...props }) => <h1 className="my-4 text-2xl font-bold" {...props} />,
        h2: ({ node, ...props }) => <h2 className="my-3 text-xl font-bold" {...props} />,
        h3: ({ node, ...props }) => <h3 className="my-2 text-lg font-bold" {...props} />,
        p: ({ node, ...props }) => <p className="my-3 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="my-3 list-disc pl-5" {...props} />,
        ol: ({ node, ...props }) => <ol className="my-3 list-decimal pl-5" {...props} />,
        li: ({ node, ...props }) => <li className="my-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="my-3 border-l-4 border-gray-300 pl-4 italic" {...props} />
        ),
        code({ inline, className, children, ...props }: CodeProps) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline ? (
            <div className="my-4 overflow-hidden rounded-lg bg-gray-800">
              {match && (
                <div className="bg-gray-700 px-4 py-2 text-xs text-gray-400">{match[1]}</div>
              )}
              <pre className="overflow-x-auto">
                <code className={`hljs ${className}`} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          ) : (
            <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm">{children}</code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default ChatMarkdown
