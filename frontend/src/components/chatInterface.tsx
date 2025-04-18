'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { responses } from '@/lib/constants'
import { ActiveButton, Message, MessageSection, MessageType, StreamingWord } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import { ArrowUp, Lightbulb, Menu, PenSquare, Plus, Search } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { renderMessage } from './ui/renderMessage'
import { WavyBackground } from './ui/wavy-background'

const WORD_DELAY = 40 // ms per word
const CHUNK_SIZE = 2 // Number of words to add at once

export default function ChatInterface() {
  const [isNewChat, setNewChat] = useState<boolean>(true)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const newSectionRef = useRef<HTMLDivElement>(null)
  const [hasTyped, setHasTyped] = useState(false)
  const [activeButton, setActiveButton] = useState<ActiveButton>('none')
  const [isMobile, setIsMobile] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageSections, setMessageSections] = useState<MessageSection[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingWords, setStreamingWords] = useState<StreamingWord[]>([])
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [viewportHeight, setViewportHeight] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set())
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const shouldFocusAfterStreamingRef = useRef(false)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  // Store selection state
  const selectionStateRef = useRef<{ start: number | null; end: number | null }>({
    start: null,
    end: null
  })

  // Constants for layout calculations to account for the padding values
  const HEADER_HEIGHT = 48 // 12px height + padding
  const INPUT_AREA_HEIGHT = 100 // Approximate height of input area with padding
  const TOP_PADDING = 48 // pt-12 (3rem = 48px)
  const BOTTOM_PADDING = 128 // pb-32 (8rem = 128px)
  const ADDITIONAL_OFFSET = 16 // Reduced offset for fine-tuning

  // Check if device is mobile and get viewport height
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

    // Update on resize
    window.addEventListener('resize', checkMobileAndViewport)

    return () => {
      window.removeEventListener('resize', checkMobileAndViewport)
    }
  }, [isMobile, viewportHeight])

  // Organize messages into sections
  useEffect(() => {
    if (messages.length === 0) {
      setMessageSections([])
      setActiveSectionId(null)
      return
    }

    const sections: MessageSection[] = []
    let currentSection: MessageSection = {
      id: `section-${Date.now()}-0`,
      messages: [],
      isNewSection: false,
      sectionIndex: 0
    }

    messages.forEach((message) => {
      if (message.newSection) {
        // Start a new section
        if (currentSection.messages.length > 0) {
          // Mark previous section as inactive
          sections.push({
            ...currentSection,
            isActive: false
          })
        }

        // Create new active section
        const newSectionId = `section-${Date.now()}-${sections.length}`
        currentSection = {
          id: newSectionId,
          messages: [message],
          isNewSection: true,
          isActive: true,
          sectionIndex: sections.length
        }

        // Update active section ID
        setActiveSectionId(newSectionId)
      } else {
        // Add to current section
        currentSection.messages.push(message)
      }
    })

    // Add the last section if it has messages
    if (currentSection.messages.length > 0) {
      sections.push(currentSection)
    }

    setMessageSections(sections)
  }, [messages])

  // Scroll to maximum position when new section is created, but only for sections after the first
  useEffect(() => {
    if (messageSections.length > 1) {
      setTimeout(() => {
        const scrollContainer = chatContainerRef.current

        if (scrollContainer) {
          // Scroll to maximum possible position
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [messageSections])

  // Focus the textarea on component mount (only on desktop)
  useEffect(() => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus()
    }
  }, [isMobile])

  // Set focus back to textarea after streaming ends (only on desktop)
  useEffect(() => {
    if (!isStreaming && shouldFocusAfterStreamingRef.current && !isMobile) {
      focusTextarea()
      shouldFocusAfterStreamingRef.current = false
    }
  }, [isStreaming, isMobile])

  // Calculate available content height (viewport minus header and input)
  const getContentHeight = () => {
    // Calculate available height by subtracting the top and bottom padding from viewport height
    return viewportHeight - TOP_PADDING - BOTTOM_PADDING - ADDITIONAL_OFFSET
  }

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

  const simulateTextStreaming = async (text: string) => {
    // Split text into words
    const words = text.split(' ')
    let currentIndex = 0
    setStreamingWords([])
    setIsStreaming(true)

    return new Promise<void>((resolve) => {
      const streamInterval = setInterval(() => {
        if (currentIndex < words.length) {
          // Add a few words at a time
          const nextIndex = Math.min(currentIndex + CHUNK_SIZE, words.length)
          const newWords = words.slice(currentIndex, nextIndex)

          setStreamingWords((prev) => [
            ...prev,
            {
              id: Date.now() + currentIndex,
              text: newWords.join(' ') + ' '
            }
          ])

          currentIndex = nextIndex
        } else {
          clearInterval(streamInterval)
          resolve()
        }
      }, WORD_DELAY)
    })
  }

  const getAIResponse = (userMessage: string) => {
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const simulateAIResponse = async (userMessage: string) => {
    const response = getAIResponse(userMessage)

    // Create a new message with empty content
    const messageId = Date.now().toString()
    setStreamingMessageId(messageId)

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        content: '',
        type: 'system'
      }
    ])

    // Add a delay before the second vibration
    setTimeout(() => {
      // Add vibration when streaming begins
      navigator.vibrate(50)
    }, 200) // 200ms delay to make it distinct from the first vibration

    // Stream the text
    await simulateTextStreaming(response)

    // Update with complete message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: response, completed: true } : msg
      )
    )

    // Add to completed messages set to prevent re-animation
    setCompletedMessages((prev) => new Set(prev).add(messageId))

    // Add vibration when streaming ends
    navigator.vibrate(50)

    // Reset streaming state
    setStreamingWords([])
    setStreamingMessageId(null)
    setIsStreaming(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value

    // Only allow input changes when not streaming
    if (!isStreaming) {
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
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (isNewChat) setNewChat(false)
    e.preventDefault()
    if (inputValue.trim() && !isStreaming) {
      // Add vibration when message is submitted
      navigator.vibrate(50)

      const userMessage = inputValue.trim()

      // Add as a new section if messages already exist
      const shouldAddNewSection = messages.length > 0

      const newUserMessage = {
        id: `user-${Date.now()}`,
        content: userMessage,
        type: 'user' as MessageType,
        newSection: shouldAddNewSection
      }

      // Reset input before starting the AI response
      setInputValue('')
      setHasTyped(false)
      setActiveButton('none')

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }

      // Add the message after resetting input
      setMessages((prev) => [...prev, newUserMessage])

      // Only focus the textarea on desktop, not on mobile
      if (!isMobile) {
        focusTextarea()
      } else {
        // On mobile, blur the textarea to dismiss the keyboard
        if (textareaRef.current) {
          textareaRef.current.blur()
        }
      }

      // Start AI response
      simulateAIResponse(userMessage)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd+Enter on both mobile and desktop
    if (!isStreaming && e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      handleSubmit(e)
      return
    }

    // Only handle regular Enter key (without Shift) on desktop
    if (!isStreaming && !isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleButton = (button: ActiveButton) => {
    if (!isStreaming) {
      // Save the current selection state before toggling
      saveSelectionState()

      setActiveButton((prev) => (prev === button ? 'none' : button))

      // Restore the selection state after toggling
      setTimeout(() => {
        restoreSelectionState()
      }, 0)
    }
  }

  const shouldApplyHeight = (sectionIndex: number) => {
    return sectionIndex > 0
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
      <header className="fixed top-0 right-0 left-0 z-20 flex h-12 items-center bg-gray-50 px-4">
        <div className="flex w-full items-center justify-between px-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Menu className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Menu</span>
          </Button>

          <h1 className="text-base font-medium text-gray-800">v0 Chat</h1>

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <PenSquare className="h-5 w-5 text-gray-700" />
            <span className="sr-only">New Chat</span>
          </Button>
        </div>
      </header>

      <div ref={chatContainerRef} className="flex-grow overflow-y-auto px-4 pt-12 pb-32">
        <div className="mx-auto max-w-3xl space-y-4">
          {messageSections.map((section, sectionIndex) => (
            <div
              key={section.id}
              ref={
                sectionIndex === messageSections.length - 1 && section.isNewSection
                  ? newSectionRef
                  : null
              }
            >
              {section.isNewSection && (
                <div
                  style={
                    section.isActive && shouldApplyHeight(section.sectionIndex)
                      ? { height: `${getContentHeight()}px` }
                      : {}
                  }
                  className="flex flex-col justify-start pt-4"
                >
                  {section.messages.map((message) =>
                    renderMessage(message, streamingWords, streamingMessageId, completedMessages)
                  )}
                </div>
              )}

              {!section.isNewSection && (
                <div>
                  {section.messages.map((message) =>
                    renderMessage(message, streamingWords, streamingMessageId, completedMessages)
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className={cn(
          'fixed right-0 bottom-0 left-0 p-4 transition-all duration-500 ease-in-out',
          isNewChat && 'bottom-1/2'
        )}
      >
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div
            ref={inputContainerRef}
            className={cn(
              'relative w-full cursor-text rounded-3xl border border-gray-200 bg-white p-3',
              isStreaming && 'opacity-80'
            )}
            onClick={handleInputContainerClick}
          >
            <div className="pb-9">
              <Textarea
                ref={textareaRef}
                placeholder={isStreaming ? 'Waiting for response...' : 'Ask Anything'}
                className="max-h-[160px] min-h-[24px] w-full resize-none overflow-y-auto rounded-3xl border-0 bg-transparent pt-0 pr-4 pb-0 pl-2 text-base leading-tight text-gray-900 placeholder:text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                      'h-8 w-8 flex-shrink-0 rounded-full border-gray-200 p-0 transition-colors',
                      activeButton === 'add' && 'border-gray-300 bg-gray-100'
                    )}
                    onClick={() => toggleButton('add')}
                    disabled={isStreaming}
                  >
                    <Plus
                      className={cn(
                        'h-4 w-4 text-gray-500',
                        activeButton === 'add' && 'text-gray-700'
                      )}
                    />
                    <span className="sr-only">Add</span>
                  </Button>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-8 w-8 flex-shrink-0 rounded-full border-0 transition-all duration-200',
                    hasTyped ? 'scale-110 bg-black' : 'bg-gray-200'
                  )}
                  disabled={!inputValue.trim() || isStreaming}
                >
                  <ArrowUp
                    className={cn(
                      'h-4 w-4 transition-colors',
                      hasTyped ? 'text-white' : 'text-gray-500'
                    )}
                  />
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
