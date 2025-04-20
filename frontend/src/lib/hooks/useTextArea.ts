import { useRef, useState } from 'react'

export const useTextArea = (isMobile: boolean) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const selectionStateRef = useRef<{ start: number | null; end: number | null }>({
    start: null,
    end: null
  })
  const [inputValue, setInputValue] = useState('')
  const [hasTyped, setHasTyped] = useState(false)
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = '24px'
    }
  }
  const saveSelectionState = () => {
    if (textareaRef.current) {
      selectionStateRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      }
    }
  }
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
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, isLoading: boolean) => {
    const newValue = e.target.value
    if (isLoading) return

    setInputValue(newValue)

    setHasTyped(newValue.trim() !== '')

    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.max(24, Math.min(textarea.scrollHeight, 160))
      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = newHeight >= 160 ? 'auto' : 'hidden'
    }
  }

  return {
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
    handleInputChange,
    selectionStateRef
  }
}
