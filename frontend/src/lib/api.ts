import { MessageData, Models } from '@/lib/interfaces'

export const createMessage = async (messageData: MessageData): Promise<MessageData> => {
  const h = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/chat/create_message`, h)

  if (!response.ok) {
    throw new Error('Create message: network response was not ok')
  }

  return response.json()
}

export const getMessages = async (dialog_id: number): Promise<MessageData> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_SERVER}/chat/chat_completion`)
  url.searchParams.append('dialog_id', dialog_id.toString())
  url.searchParams.append('model', Models.DEEPSEEK_DISTILLED)

  const h = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const response = await fetch(url.toString(), h)

  if (!response.ok) {
    throw new Error('Get message: network response was not ok')
  }

  return response.json()
}

export const deleteMessage = async (message_id: number): Promise<void> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_SERVER}/chat/delete_message`)
  url.searchParams.append('message_id', message_id.toString())

  const h = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const response = await fetch(url.toString(), h)

  if (!response.ok) {
    throw new Error('Delete message: network response was not ok')
  }
}
