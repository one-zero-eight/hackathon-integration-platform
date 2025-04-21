'use client'
import { useCallback, useState } from 'react'
import { MessageData } from '../interfaces'
import { useCreateChat } from './useCreateChat'
import { useDeleteMessage } from './useDeleteMessage'
import { useRegenMessage } from './useRegenMessage'

interface UseChatActionsParams {
  addChat: (id: number, title: string) => void
  setChatList: (list: { id: number; title: string }[]) => void
  removeChat?: (id: number) => void
}

export function useChatActions({ addChat, setChatList }: UseChatActionsParams) {
  const [chatID, setChatId] = useState<number | undefined>()
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAssistantResponding, setIsAssistantResponding] = useState(false)

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
        addChat(id, 'New Chat')
      }
    })
  }

  const handleRegenerateMessage = useCallback(
    async (message_id: number) => {
      try {
        setIsAssistantResponding(true)

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
        setIsAssistantResponding(false)
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
            localStorage.removeItem('currentChatID')

            const stored = localStorage.getItem('chatHistory')
            const parsed: { id: number; title: string }[] = stored ? JSON.parse(stored) : []
            const newList = parsed.filter((chat) => chat.id !== chatID)
            localStorage.setItem('chatHistory', JSON.stringify(newList))

            setChatList(newList)

            setChatId(undefined)
          } else if (chatID) {
            localStorage.setItem(`messages:${chatID}`, JSON.stringify(updated))
          }

          return updated
        })
      } catch (error) {
        console.error('Failed to delete messages:', error)
      }
    },
    [chatID, deleteMessageMutation, setChatList]
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
    handleDeleteMessage,
    isAssistantResponding,
    setIsAssistantResponding
  }
}
