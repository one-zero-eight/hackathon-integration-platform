import { Message } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import { Copy, RefreshCcw } from 'lucide-react'

export const renderMessage = (
  message: Message,
  loadingMessageId: string | null,
  completedMessages: Set<string>
) => {
  const isCompleted = completedMessages.has(message.id)
  const isLoading = message.id === loadingMessageId

  return (
    <div
      key={message.id}
      className={cn(
        'flex w-[100%] flex-col',
        message.type === 'user' ? 'items-end' : 'items-start'
      )}
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
          <span
            className={
              message.type === 'system' && !isCompleted && !isLoading ? 'animate-fade-in' : ''
            }
          >
            {message.content}
          </span>
        )}

        {/* Show loading animation for system messages */}
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
          </div>
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
        </div>
      )}
    </div>
  )
}
