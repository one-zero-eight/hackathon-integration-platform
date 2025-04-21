// hooks/useChatSubmit.ts
import { getMessages } from '@/lib/api'
import { useSendMessage } from '@/lib/hooks/useSendMessage'
import { useStartChat } from '@/lib/hooks/useStartChat'
import type { MessageData, MessageType } from '@/lib/interfaces'
import { useCallback } from 'react'

import { Dispatch, SetStateAction } from 'react'

interface UseChatSubmitProps {
  chatID: number | undefined
  isNewChat: boolean
  inputValue: string
  setChatId: (id: number) => void
  setMessages: Dispatch<SetStateAction<MessageData[]>>
  setInputValue: (val: string) => void
  resetTextareaHeight: () => void
  setHasTyped: (val: boolean) => void
  isAssistantResponding: boolean
  setActiveButton: (btn: 'none') => void
  setIsAssistantResponding: (val: boolean) => void
  setIsLoading: (val: boolean) => void
  handleSetLocalStorage: (id: number) => void
  addChat: (id: number, title: string) => void
}
export const useChatSubmit = ({
  chatID,
  isNewChat,
  inputValue,
  setChatId,
  setMessages,
  setInputValue,
  resetTextareaHeight,
  setHasTyped,
  setActiveButton,
  setIsLoading,
  handleSetLocalStorage,
  isAssistantResponding,
  setIsAssistantResponding,
  addChat
}: UseChatSubmitProps) => {
  const startChatMutation = useStartChat()
  const sendMessageMutation = useSendMessage()

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!inputValue.trim() || isAssistantResponding) return

      setIsLoading(true)
      setIsAssistantResponding(true)

      const userMessage = inputValue.trim()
      const userMessageId = Date.now()
      const assistantMessageId = userMessageId + 1

      try {
        let dialogID = chatID

        if (!dialogID || isNewChat) {
          const { id } = await startChatMutation.mutateAsync()
          dialogID = id
          setChatId(id)
          handleSetLocalStorage(id)
          addChat(id, userMessage.slice(0, 30))
        }

        if (!dialogID) return

        setMessages((prev) => [
          ...prev,
          {
            id: userMessageId,
            dialog_id: dialogID,
            message: userMessage,
            role: 'user' as MessageType
          },
          {
            id: assistantMessageId,
            dialog_id: dialogID,
            message: '',
            role: 'assistant' as MessageType,
            isLoading: true
          }
        ])

        setInputValue('')
        resetTextareaHeight()
        setHasTyped(false)
        setActiveButton('none')

        const sendMsgResponse = await sendMessageMutation.mutateAsync({
          dialog_id: dialogID,
          message: userMessage
        })

        const response = await getMessages(dialogID)

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === userMessageId) {
              return { ...msg, id: sendMsgResponse.id }
            }
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                id: response.id,
                message: response.message,
                isLoading: false
              }
            }
            return msg
          })
        )
      } catch (err) {
        console.error('Failed to send message:', err)
      } finally {
        setIsLoading(false)
        setIsAssistantResponding(false)
      }
    },
    [
      chatID,
      isNewChat,
      inputValue,
      setChatId,
      setMessages,
      setInputValue,
      resetTextareaHeight,
      setHasTyped,
      setActiveButton,
      setIsLoading,
      handleSetLocalStorage,
      startChatMutation,
      sendMessageMutation
    ]
  )

  return { handleSubmit }
}
