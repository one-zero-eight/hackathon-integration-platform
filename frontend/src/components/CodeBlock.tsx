// components/CodeBlock.tsx
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' // Import any style you prefer
import React from 'react'

interface CodeBlockProps {
  language: string
  value: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  // Highlight.js may not recognize all language names, so provide a fallback
  const highlightedCode = hljs.highlightAuto(value, [language]).value

  const style: React.CSSProperties = {
    backgroundColor: '#282a36', // Background color for code block
    color: '#f8f8f2', // Text color for code
    padding: '1em',
    borderRadius: '10px',
    overflowX: 'auto' // To ensure horizontal scrolling for long lines of code
  }

  return (
    <pre style={style}>
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  )
}

export default CodeBlock
