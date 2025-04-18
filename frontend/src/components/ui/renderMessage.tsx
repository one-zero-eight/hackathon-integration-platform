import { Message, StreamingWord } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import { Copy, RefreshCcw, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'

export const renderMessage = (
  message: Message,
  streamingWords: StreamingWord[],
  streamingMessageId: string | null,
  completedMessages: Set<string>
) => {
  const isCompleted = completedMessages.has(message.id)

  return (
    <div
      key={message.id}
      className={cn('flex flex-col', message.type === 'user' ? 'items-end' : 'items-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          message.type === 'user'
            ? 'rounded-br-none border border-gray-200 bg-red-100'
            : 'bg-white text-gray-900'
        )}
      >
        {/* For user messages or completed system messages, render without animation */}
        {message.content && (
          <span className={message.type === 'system' && !isCompleted ? 'animate-fade-in' : ''}>
            {message.content}
          </span>
        )}

        {/* For streaming messages, render with animation */}
        {message.id === streamingMessageId && (
          <span className="inline">
            {streamingWords.map((word) => (
              <span key={word.id} className="animate-fade-in inline">
                {word.text}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Message actions */}
      {message.type === 'system' && message.completed && (
        <div className="mt-1 mb-2 flex items-center gap-2 px-4">
          <button className="hover:text-gray- cursor-pointer text-gray-400 transition-colors">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button className="hover:text-gray- cursor-pointer text-gray-400 transition-colors">
            <Copy className="h-4 w-4" />
          </button>
          <button className="hover:text-gray- cursor-pointer text-gray-400 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="hover:text-gray- cursor-pointer text-gray-400 transition-colors">
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button className="hover:text-gray- cursor-pointer text-gray-400 transition-colors">
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
