import { MessageData } from '@/lib/interfaces'

export const createMessage = async (messageData: MessageData) => {
  const h = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  }

  const response = await fetch('/messages/create', h)

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return response.json()
}
