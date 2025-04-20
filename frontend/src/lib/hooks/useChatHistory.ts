import { useEffect, useState } from 'react'

export function useChatHistory() {
  const [chatList, setChatList] = useState<number[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('chatHistory')
    if (stored) {
      try {
        setChatList(JSON.parse(stored))
      } catch {
        setChatList([])
      }
    }
  }, [])

  const addChat = (id: number) => {
    setChatList((prev) => {
      if (prev.includes(id)) return prev
      const updated = [id, ...prev]
      localStorage.setItem('chatHistory', JSON.stringify(updated))
      return updated
    })
  }

  return { chatList, addChat }
}
