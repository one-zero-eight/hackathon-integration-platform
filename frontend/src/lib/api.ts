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

export const getLlmMessage = async (dialog_id: string) => {
  const model = 'deepseek-r1-distill-qwen-32b'
  const h = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dialog_id: dialog_id,
      model: model
    })
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/messages/receive`, h)

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return response.json()
}

export const getMessages = async (dialog_id: string, amount: number): Promise<ViewMessage[]> => {
  const h = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dialog_id: dialog_id,
      amount: amount
    })
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/messages/get`, h)

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return response.json()
}