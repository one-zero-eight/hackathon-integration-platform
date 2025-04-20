import { MessageData, Models, NewChat, ViewMessage } from '@/lib/interfaces'

export const createMessage = async (messageData: MessageData): Promise<MessageData> => {
  const h = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/chat/create_message`, h)

  if (!response.ok) throw new Error('Create message: network response was not ok')

  return response.json()
}

export const getMessages = async (dialog_id: number): Promise<ViewMessage> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_SERVER}/chat/chat_completion`)
  url.searchParams.append('dialog_id', dialog_id.toString())
  url.searchParams.append('model', Models.DEEPSEEK_DISTILLED)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) throw new Error('Get message: network response was not ok')

  return response.json()
}

export const createNewChat = async (): Promise<NewChat> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_SERVER}/dialog/create_dialog`)
  const h = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch(url.toString(), h)
  return response.json()
}

export const getDialoge = async (dialogId: number, amount = 0) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_SERVER}/chat/get_history`)
  url.searchParams.append('dialog_id', dialogId.toString())
  url.searchParams.append('amount', amount.toString()) // 0 = all messages

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch dialog history: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export const deleteMessage = async (message_id: number): Promise<void> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_SERVER}/chat/delete_message`)
  url.searchParams.append('message_id', message_id.toString())

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) throw new Error('Delete message: network response was not ok')
}

export const regenerateMessage = async (response_id: number): Promise<MessageData> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_SERVER}/chat/regenerate`)
  url.searchParams.append('message_id', response_id.toString())

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) throw new Error('Regenerate message: network response was not ok')

  return response.json()
}
