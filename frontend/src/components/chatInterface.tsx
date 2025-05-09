'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getHistory } from '@/lib/api'
import { useChatActions } from '@/lib/hooks/useChatActions'
import { useChatHook } from '@/lib/hooks/useChatHook'
import { useChatSubmit } from '@/lib/hooks/useChatSubmit'
import { useTextArea } from '@/lib/hooks/useTextArea'
import { ActiveButton } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import {
  ArrowUp,
  Braces,
  Check,
  Copy,
  Menu,
  MessageCircleOff,
  PenSquare,
  RefreshCcw,
  Trash2,
  X
} from 'lucide-react'
import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from './MarkDown'
import { WavyBackground } from './ui/wavy-background'

export default function ChatInterface() {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shouldFocusAfterStreamingRef = useRef(false)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const [loadingChat, setLoadingChat] = useState<boolean>(true)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [activeButton, setActiveButton] = useState<ActiveButton>('none')
  const [chatList, setChatList] = useState<{ id: number; title: string }[]>([])

  const addChat = (id: number, title: string) => {
    setChatList((prev) => {
      if (prev.some((chat) => chat.id === id)) return prev
      const updated = [{ id, title }, ...prev]
      localStorage.setItem('chatHistory', JSON.stringify(updated))
      return updated
    })
  }
  const {
    chatID,
    setChatId,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    handleNewChat,
    handleRegenerateMessage,
    handleDeleteMessage,
    isAssistantResponding,
    setIsAssistantResponding
  } = useChatActions({ setChatList, addChat })
  const isNewChat = !loadingChat && (chatID === undefined || messages.length === 0)

  useEffect(() => {
    const stored = localStorage.getItem('chatHistory')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const upgraded = parsed.map((item: any) =>
          typeof item === 'number' ? { id: item, title: `Chat - ${item}` } : item
        )
        setChatList(upgraded)
        localStorage.setItem('chatHistory', JSON.stringify(upgraded))
      } catch {
        setChatList([])
      }
    }
  }, [])

  const {
    textareaRef,
    inputContainerRef,
    inputValue,
    setInputValue,
    hasTyped,
    setHasTyped,
    resetTextareaHeight,
    saveSelectionState,
    restoreSelectionState,
    focusTextarea,
    handleInputContainerClick,
    handleInputChange
  } = useTextArea(isMobile)

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e, isLoading)
  }

  useEffect(() => {
    if (chatID && messages.length > 0) {
      localStorage.setItem(`messages:${chatID}`, JSON.stringify(messages))
    }
  }, [messages, chatID])

  useEffect(() => {
    const restoreChat = async () => {
      const storedChatId = localStorage.getItem('currentChatID')
      if (storedChatId) {
        const parsedId = Number(storedChatId)
        setChatId(parsedId)

        const cachedMessages = localStorage.getItem(`messages:${parsedId}`)
        if (cachedMessages) {
          try {
            setMessages(JSON.parse(cachedMessages))
          } catch {
            console.warn('Could not parse messages from localStorage')
          }
        } else {
          try {
            const history = await getHistory(parsedId, 0)
            setMessages(history)
          } catch (err) {
            console.error('Error fetching chat history:', err)
          }
        }
      }

      setLoadingChat(false)
    }

    restoreChat()
  }, [])

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

  useEffect(() => {
    if (!isLoading && shouldFocusAfterStreamingRef.current && !isMobile) {
      focusTextarea()
      shouldFocusAfterStreamingRef.current = false
    }
  }, [isLoading, isMobile])

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

  const handleSetLocalStorage = (id: number) => {
    localStorage.setItem('currentChatID', id.toString())
  }

  const chatState = useMemo(
    () => ({
      chatID,
      isNewChat,
      inputValue,
      setChatId,
      setMessages,
      setInputValue,
      resetTextareaHeight,
      setHasTyped,
      setIsLoading,
      handleSetLocalStorage,
      setActiveButton,
      setIsAssistantResponding,
      addChat,
      isAssistantResponding
    }),
    [chatID, isNewChat, inputValue]
  )

  const { handleSubmit } = useChatSubmit(chatState)

  const { copiedMessageId, handleKeyDown, toggleButton, handleCopy } = useChatHook({
    isLoading,
    isMobile,
    handleSubmit,
    saveSelection: saveSelectionState,
    restoreSelection: restoreSelectionState,
    activeButton,
    setActiveButton,
    isAssistantResponding
  })

  const loadChatById = async (id: number) => {
    if (isMobile) {
      setMenuOpen(false)
    }
    setLoadingChat(true)
    setChatId(id)
    localStorage.setItem('currentChatID', id.toString())

    const cachedMessages = localStorage.getItem(`messages:${id}`)
    if (cachedMessages) {
      try {
        setMessages(JSON.parse(cachedMessages))
      } catch {
        setMessages([])
      }
    } else {
      try {
        const history = await getHistory(id, 0)
        setMessages(history)
      } catch {
        setMessages([])
      }
    }

    setLoadingChat(false)
  }
  return (
    <div className="flex">
      <div className="flex h-screen overflow-hidden">
        <div
          className={cn(
            'z-30 h-full overflow-hidden bg-[#eaeaea] pt-8 transition-all duration-300 ease-in-out',
            'max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:h-screen max-sm:w-full max-sm:transform max-sm:transition-all max-sm:duration-300 max-sm:ease-in-out',
            menuOpen
              ? 'max-sm:translate-x-0 max-sm:scale-100 max-sm:opacity-100'
              : 'max-sm:-translate-x-full max-sm:scale-95 max-sm:opacity-0',
            menuOpen ? 'sm:w-[350px]' : 'sm:w-0'
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-5 block cursor-pointer rounded-full p-6 sm:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <X className="!h-8 !w-8 text-black" />
          </Button>
          <div className="w-full space-y-8 px-2">
            <h3 className="flex items-center justify-center gap-2 border-b-[1px] border-black pb-3 text-center text-3xl">
              <Braces className="h-8 w-8 text-red-500" /> History
            </h3>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-full cursor-pointer rounded-md px-4 text-lg"
              onClick={handleNewChat}
            >
              <PenSquare className="h-40 w-40 text-red-500" />
              New Chat
            </Button>
            <div className="h-[1px] w-full bg-black" />
            <div>
              {chatList.length > 0 && menuOpen
                ? chatList.map(({ id, title }) => (
                    <p
                      key={id}
                      className={cn(
                        'cursor-pointer rounded-md px-4 py-2 text-xl hover:bg-gray-300',
                        chatID === id && 'hover:gray-400 bg-gray-400'
                      )}
                      onClick={() => loadChatById(id)}
                    >
                      {title}
                    </p>
                  ))
                : menuOpen && (
                    <div className="flex h-[200px] w-full flex-col items-center justify-center gap-4 text-gray-400">
                      <h3 className="text-xl">You do not have any chats</h3>
                      <MessageCircleOff />
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
      <WavyBackground
        ref={mainContainerRef}
        className="relative flex flex-col overflow-hidden"
        backgroundFill="white"
        waveOpacity={50}
        speed="slow"
        blur={10}
        colors={['rgba(227, 18, 6, 0.7)', '#eaeaea', 'rgba(227, 18, 6, 0.7)']}
        style={{ height: isMobile ? `${viewportHeight}px` : '100svh' }}
      >
        <header className="relative top-0 right-0 left-0 z-20 flex items-center bg-white px-4 py-3">
          <div className="flex w-full items-center justify-center px-2 py-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full p-6"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="!h-8 !w-8 text-black" />
              ) : (
                <Menu className="!h-8 !w-8 text-black" />
              )}
            </Button>
            <h1 className="text-3xl font-medium text-gray-800">Schema Generator</h1>
          </div>
        </header>

        <div
          ref={chatContainerRef}
          className="scrollbar-none flex-grow overflow-y-auto px-4 pt-24 pb-32"
        >
          <div className="mx-auto flex w-[90%] flex-col gap-4 xl:w-6xl">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex w-[100%] flex-col text-xl',
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
                    <div className="mt-2 mb-2 flex items-center gap-2 rounded-b-md p-1 px-4">
                      {isLastMessage && (
                        <button
                          onClick={() => handleRegenerateMessage(message.id!)}
                          className={cn(
                            'cursor-pointer text-black transition-colors hover:text-gray-600'
                          )}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(message.message, message?.id)}
                        className={cn(
                          'cursor-pointer text-black transition-colors hover:text-gray-600',
                          copiedMessageId === message.id && 'animate-pulse text-green-500'
                        )}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        className={cn(
                          'cursor-pointer text-black transition-colors hover:text-gray-600'
                        )}
                        onClick={() => {
                          const userMessageId = messages[index - 1]?.id
                          const assistantMessageId = message.id
                          userMessageId && assistantMessageId
                            ? handleDeleteMessage(userMessageId, assistantMessageId)
                            : console.error('Message ids are not found')
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {!loadingChat && (
          <div
            className={cn(
              'absolute right-0 bottom-0 left-0 p-4 transition-all duration-500 ease-in-out',
              isNewChat && 'bottom-1/2'
            )}
          >
            {isNewChat && (
              <h1 className="mb-4 text-center text-lg md:text-xl lg:text-3xl xl:text-4xl">
                Describe your JSON
              </h1>
            )}
            <form
              onSubmit={handleSubmit}
              className={cn(
                'mx-auto w-[90%] transition-all duration-500 ease-in xl:w-6xl',
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
                    placeholder={
                      isLoading || isAssistantResponding
                        ? 'Waiting for response...'
                        : 'Ask Anything'
                    }
                    className="max-h-[260px] min-h-[24px] w-full resize-none overflow-y-auto rounded-3xl border-0 bg-transparent pt-0 pr-4 pb-0 pl-2 text-base leading-tight text-gray-900 placeholder:text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={inputValue}
                    onChange={onInputChange}
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
                  <div className="flex items-center justify-end">
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
                      disabled={!inputValue.trim() || isLoading || isAssistantResponding}
                    >
                      <ArrowUp className={cn('h-4 w-4 transition-colors')} />
                      <span className="sr-only">Submit</span>
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </WavyBackground>
    </div>
  )
}
