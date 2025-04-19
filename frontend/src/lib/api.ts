import { MessageData, ViewMessage } from '@/lib/interfaces'

export const createMessage = async (messageData: MessageData): Promise<ViewMessage> => {
  const h = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/messages/create`, h)

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return response.json()
}
