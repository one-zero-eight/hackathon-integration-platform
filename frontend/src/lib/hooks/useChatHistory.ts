import { useCallback, useEffect, useState } from 'react'

export function useChatHistory() {
  const [chatList, setChatList] = useState<number[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('chatHistory')
    if (stored) setChatList(JSON.parse(stored))
  }, [])

  const addChat = useCallback((id: number) => {
    setChatList((prev) => {
      const updated = [...new Set([id, ...prev])]
      localStorage.setItem('chatHistory', JSON.stringify(updated))
      return updated
    })
  }, [])

  return { chatList, addChat }
}
