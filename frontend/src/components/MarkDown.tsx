// components/ChatMarkdown.tsx
import 'highlight.js/styles/github-dark.css'
import React, { useState } from 'react'
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
  const [showThinking, setShowThinking] = useState(false)
  const rehypePlugins: PluggableList = [[rehypeHighlight, { ignoreMissing: true }]]

  // Extract thinking content if it exists
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>([\s\S]*)/)
  let thinkingContent = ''
  let displayContent = content

  if (thinkMatch) {
    thinkingContent = thinkMatch[1].trim()
    displayContent = thinkMatch[2].trim()
  }

  return (
    <div className="relative">
      {/* Thinking section - only shown if there's <think> content */}
      {thinkingContent && (
        <div className="mb-2">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700"
          >
            <span className="mr-1">{showThinking ? '▼' : '▶'} Thinking process</span>
            {!showThinking && (
              <span className="flex items-center">
                <span className="ml-1 flex space-x-1">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-gray-400"></span>
                  <span
                    className="h-1 w-1 animate-pulse rounded-full bg-gray-400"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="h-1 w-1 animate-pulse rounded-full bg-gray-400"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                </span>
              </span>
            )}
          </button>

          {showThinking && (
            <div className="mt-1 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={rehypePlugins}
                components={{
                  // You can customize the thinking content rendering here
                  p: ({ node, ...props }) => <p className="my-1 leading-relaxed" {...props} />
                }}
              >
                {thinkingContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
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
              <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm">
                {children}
              </code>
            )
          }
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  )
}

export default ChatMarkdown
