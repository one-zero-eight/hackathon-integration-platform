import { useCallback, useState } from 'react'
import { ActiveButton } from '../interfaces'

export function useChatHook({
  isLoading,
  isMobile,
  handleSubmit,
  saveSelection,
  restoreSelection,
  activeButton,
  setActiveButton
}: {
  isLoading: boolean
  isMobile: boolean
  handleSubmit: (e?: any) => void
  saveSelection: () => void
  restoreSelection: () => void
  activeButton: ActiveButton
  setActiveButton: React.Dispatch<React.SetStateAction<ActiveButton>>
}) {
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isLoading) return

      if (e.key === 'Enter' && e.metaKey) {
        e.preventDefault()
        handleSubmit(e)
      } else if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    },
    [isLoading, isMobile, handleSubmit]
  )

  const toggleButton = useCallback(
    (button: ActiveButton) => {
      if (isLoading) return

      saveSelection()
      setActiveButton((prev) => (prev === button ? 'none' : button))
      setTimeout(() => restoreSelection(), 0)
    },
    [isLoading, saveSelection, restoreSelection]
  )
  const handleCopy = useCallback(async (text: string, messageId: number | undefined) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }, [])

  return {
    handleKeyDown,
    toggleButton,
    activeButton,
    setActiveButton,
    copiedMessageId,
    handleCopy
  }
}
