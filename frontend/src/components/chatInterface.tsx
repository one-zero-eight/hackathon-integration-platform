'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getMessages } from '@/lib/api'
import { useSendMessage } from '@/lib/hooks/useSendMessage'
import { ActiveButton, MessageData, MessageType } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import { ArrowUp, Check, Copy, Menu, PenSquare, Plus, RefreshCcw } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import Markdown from './MarkDown'
import { WavyBackground } from './ui/wavy-background'

export default function ChatInterface() {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isNewChat, setNewChat] = useState<boolean>(true)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [hasTyped, setHasTyped] = useState(false)
  const [activeButton, setActiveButton] = useState<ActiveButton>('none')
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const shouldFocusAfterStreamingRef = useRef(false)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const selectionStateRef = useRef<{ start: number | null; end: number | null }>({
    start: null,
    end: null
  })

  const { mutate: sendMessage } = useSendMessage()

  useEffect(() => {
    const checkMobileAndViewport = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)

      // Capture the viewport height
      const vh = window.innerHeight
      setViewportHeight(vh)

      // Apply fixed height to main container on mobile
      if (isMobileDevice && mainContainerRef.current) {
        mainContainerRef.current.style.height = `${vh}px`
      }
    }

    checkMobileAndViewport()

    // Set initial height
    if (mainContainerRef.current) {
      mainContainerRef.current.style.height = isMobile ? `${viewportHeight}px` : '100svh'
    }

    window.addEventListener('resize', checkMobileAndViewport)

    return () => {
      window.removeEventListener('resize', checkMobileAndViewport)
    }
  }, [isMobile, viewportHeight])

  useEffect(() => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus()
    }
  }, [isMobile])

  // Set focus back to textarea after streaming ends (only on desktop)
  useEffect(() => {
    if (!isLoading && shouldFocusAfterStreamingRef.current && !isMobile) {
      focusTextarea()
      shouldFocusAfterStreamingRef.current = false
    }
  }, [isLoading, isMobile])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  useEffect(() => {
    if (inputValue === '') {
      resetTextareaHeight()
    }
  }, [inputValue])
  // Save the current selection state
  const saveSelectionState = () => {
    if (textareaRef.current) {
      selectionStateRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      }
    }
  }

  // Restore the saved selection state

  const restoreSelectionState = () => {
    const textarea = textareaRef.current
    const { start, end } = selectionStateRef.current

    if (textarea && start !== null && end !== null) {
      // Focus first, then set selection range
      textarea.focus()
      textarea.setSelectionRange(start, end)
    } else if (textarea) {
      // If no selection was saved, just focus
      textarea.focus()
    }
  }

  const focusTextarea = () => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus()
    }
  }

  const handleInputContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only focus if clicking directly on the container, not on buttons or other interactive elements
    if (
      e.target === e.currentTarget ||
      (e.currentTarget === inputContainerRef.current &&
        !(e.target as HTMLElement).closest('button'))
    ) {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value

    // Only allow input changes when not streaming
    if (!isLoading) {
      setInputValue(newValue)

      if (newValue.trim() !== '' && !hasTyped) {
        setHasTyped(true)
      } else if (newValue.trim() === '' && hasTyped) {
        setHasTyped(false)
      }

      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        const newHeight = Math.max(24, Math.min(textarea.scrollHeight, 160))
        textarea.style.height = `${newHeight}px`

        textarea.style.overflowY = newHeight >= 160 ? 'auto' : 'hidden'
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (isNewChat) setNewChat(false)

    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue.trim()
      const userMessageId = Date.now()
      const assistantMessageId = Date.now() + 1

      // Добавляем сообщение пользователя
      setMessages((prev) => [
        ...prev,
        {
          dialog_id: userMessageId,
          message: userMessage,
          role: 'user' as MessageType
        }
      ])

      // Сбрасываем ввод

      setInputValue('')
      resetTextareaHeight() // Add this line

      setHasTyped(false)
      setActiveButton('none')
      const dialogID = 1
      const messageData = {
        dialog_id: dialogID,
        message: userMessage
      }

      // Устанавливаем состояние загрузки
      setIsLoading(true)

      try {
        sendMessage(messageData, {
          onSuccess: async () => {
            try {
              setMessages((prev) => [
                ...prev,
                {
                  dialog_id: assistantMessageId,
                  message: '',
                  role: 'assistant' as MessageType,
                  isLoading: true
                }
              ])

              const serverResponse = await getMessages(dialogID)

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.dialog_id === assistantMessageId
                    ? {
                        ...msg,
                        message: serverResponse.message,
                        isLoading: false
                      }
                    : msg
                )
              )
            } catch (error) {
              console.error('Error while receiving message to the server:', error)
            }
          },
          onError: (error) => {
            console.error('OnError while sending the message:', error)
          }
        })
      } catch (error) {
        console.error('Error while sending the message:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd+Enter on both mobile and desktop
    if (!isLoading && e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      handleSubmit(e)
      return
    }

    // Only handle regular Enter key (without Shift) on desktop
    if (!isLoading && !isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleButton = (button: ActiveButton) => {
    if (!isLoading) {
      // Save the current selection state before toggling
      saveSelectionState()

      setActiveButton((prev) => (prev === button ? 'none' : button))

      // Restore the selection state after toggling
      setTimeout(() => {
        restoreSelectionState()
      }, 0)
    }
  }

  const handleCopy = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setNewChat(true)
  }

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = '24px' // Your default height
    }
  }
  return (
    <WavyBackground
      ref={mainContainerRef}
      className="flex flex-col overflow-hidden"
      backgroundFill="white"
      waveOpacity={50}
      speed="slow"
      blur={10}
      colors={['rgba(227, 18, 6, 0.7)', '#eaeaea', 'rgba(227, 18, 6, 0.7)']}
      style={{ height: isMobile ? `${viewportHeight}px` : '100svh' }}
    >
      <header className="fixed top-0 right-0 left-0 z-20 flex items-center bg-white px-4">
        <div className="flex w-full items-center justify-between px-2 py-4">
          <Button
            variant="ghost"
            disabled
            size="icon"
            className="h-16 w-16 cursor-pointer rounded-full"
          >
            <Menu className="h-16 w-16 text-black" />
            <span className="sr-only">Menu</span>
          </Button>

          <h1 className="text-base font-medium text-gray-800">JSON Generator</h1>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-auto cursor-pointer rounded-full px-4"
            onClick={handleNewChat}
          >
            <PenSquare className="h-40 w-40 text-black" />
            New Chat
          </Button>
        </div>
      </header>

      <div
        ref={chatContainerRef}
        className="scrollbar-none flex-grow overflow-y-auto px-4 pt-12 pb-32"
      >
        <div className="mx-auto flex w-[90vw] flex-col gap-4 md:w-2xl lg:w-4xl xl:w-6xl">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1
            return (
              <div
                key={message.dialog_id}
                className={cn(
                  'flex w-[100%] flex-col',
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4',
                    message.role === 'user'
                      ? 'rounded-br-none border border-gray-200 bg-red-100'
                      : 'rounded-bl-none bg-[#eaeaea] text-gray-900'
                  )}
                >
                  {message.message && (
                    <span
                      className={
                        message.role === 'assistant' && isLoading && isLastMessage
                          ? 'animate-fade-in'
                          : ''
                      }
                    >
                      <Markdown content={message.message} />
                    </span>
                  )}

                  {message.isLoading && message.role === 'assistant' && isLastMessage && (
                    <div className="flex items-center space-x-2 rounded-br-none py-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    </div>
                  )}
                </div>

                {message.role === 'assistant' && !message.isLoading && (
                  <div className="mb-2 flex items-center gap-2 rounded-b-md bg-[#eaeaea] p-1 px-4">
                    <button className="hover:text-gray- cursor-pointer text-black transition-colors">
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(message.message, message.dialog_id)}
                      className={cn(
                        'hover:text-gray- cursor-pointer text-black transition-colors',
                        copiedMessageId === message.dialog_id && 'animate-pulse text-green-500'
                      )}
                    >
                      {copiedMessageId === message.dialog_id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className={cn(
          'fixed right-0 bottom-0 left-0 p-4 transition-all duration-500 ease-in-out',
          isNewChat && 'bottom-1/2'
        )}
      >
        {isNewChat && (
          <h1 className="mb-4 text-center text-lg md:text-xl lg:text-3xl xl:text-4xl">
            Hello how can i help you ?
          </h1>
        )}
        <form
          onSubmit={handleSubmit}
          className={cn(
            'mx-auto w-[90vw] transition-all duration-500 ease-in md:w-2xl lg:w-4xl xl:w-6xl',
            isNewChat && 'md:w-xl lg:w-2xl xl:w-4xl'
          )}
        >
          <div
            ref={inputContainerRef}
            className={cn(
              'relative w-full cursor-text rounded-3xl border border-[#8A8D8F] bg-[#EFEFEF] p-3',
              isLoading && 'opacity-80'
            )}
            onClick={handleInputContainerClick}
          >
            <div className="pb-9">
              <Textarea
                ref={textareaRef}
                placeholder={isLoading ? 'Waiting for response...' : 'Ask Anything'}
                className="max-h-[260px] min-h-[24px] w-full resize-none overflow-y-auto rounded-3xl border-0 bg-transparent pt-0 pr-4 pb-0 pl-2 text-base leading-tight text-gray-900 placeholder:text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  // Ensure the textarea is scrolled into view when focused
                  if (textareaRef.current) {
                    textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }}
              />
            </div>

            <div className="absolute right-3 bottom-3 left-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                      'h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border transition-all duration-200',
                      activeButton === 'add'
                        ? 'scale-110 border-[#E30611] bg-[#E30611] text-white hover:bg-white hover:text-[#E30611]'
                        : 'border-gray-400 bg-gray-100',
                      isLoading && 'cursor-not-allowed opacity-50'
                    )}
                    onClick={() => toggleButton('add')}
                    disabled={isLoading}
                  >
                    <Plus className={cn('h-4 w-4 transition-colors')} />
                    <span className="sr-only">Add</span>
                  </Button>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border transition-all duration-200',
                    hasTyped
                      ? 'scale-110 border-[#E30611] bg-[#E30611] text-white hover:bg-white hover:text-[#E30611]'
                      : 'border-black bg-gray-100 text-black',
                    isLoading && 'cursor-not-allowed'
                  )}
                  disabled={!inputValue.trim() || isLoading}
                >
                  <ArrowUp className={cn('h-4 w-4 transition-colors')} />
                  <span className="sr-only">Submit</span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </WavyBackground>
  )
}
