'use client'
import { useChatHistory } from '@/lib/hooks/useChatHistory'
import { useCallback, useState } from 'react'
import { MessageData } from '../interfaces'
import { useCreateChat } from './useCreateChat'
import { useDeleteMessage } from './useDeleteMessage'
import { useRegenMessage } from './useRegenMessage'
export function useChatActions() {
  const [chatID, setChatId] = useState<number | undefined>()
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { addChat } = useChatHistory()

  const createChatMutation = useCreateChat((id) => {
    setChatId(id)
    localStorage.setItem('currentChatID', id.toString())
    setMessages([])
  })

  const regenMessageMutation = useRegenMessage()
  const deleteMessageMutation = useDeleteMessage()

  const handleNewChat = () => {
    if (chatID) {
      localStorage.removeItem(`messages:${chatID}`)
      localStorage.removeItem('currentChatID')
    }

    setMessages([])
    setChatId(undefined)

    createChatMutation.mutate(undefined, {
      onSuccess: (res) => {
        const id = res.id
        setChatId(id)
        setMessages([])
        localStorage.setItem('currentChatID', id.toString())
        addChat(id)
      }
    })
  }

  const handleRegenerateMessage = useCallback(
    async (message_id: number) => {
      try {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message_id ? { ...msg, message: '', isLoading: true } : msg
          )
        )
        setIsLoading(true)

        const regenMessage = await regenMessageMutation.mutateAsync(message_id)

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message_id
              ? {
                  ...msg,
                  id: regenMessage.id,
                  message: regenMessage.message,
                  isLoading: false
                }
              : msg
          )
        )
      } catch (error) {
        console.error('Error regenerating message:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [regenMessageMutation]
  )
  const handleDeleteMessage = useCallback(
    async (userMessageId: number, assistantMessageId: number) => {
      try {
        await deleteMessageMutation.mutateAsync(userMessageId)

        setMessages((prev) => {
          const updated = prev.filter((m) => m.id !== userMessageId && m.id !== assistantMessageId)

          if (updated.length <= 0 && chatID) {
            localStorage.removeItem(`messages:${chatID}`)
          }

          return updated
        })
      } catch (error) {
        console.error('Failed to delete messages:', error)
      }
    },
    [chatID, deleteMessageMutation]
  )
  return {
    chatID,
    setChatId,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    handleNewChat,
    handleRegenerateMessage,
    handleDeleteMessage
  }
}
