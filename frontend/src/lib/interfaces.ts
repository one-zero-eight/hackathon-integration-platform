export type ActiveButton = 'none' | 'add' | 'deepSearch' | 'think'
export type MessageType = 'user' | 'system' | 'assistant'

export interface MessageData {
  dialog_id: string
  role: MessageType
  content: string
  isLoading?: boolean
}

export interface ViewMessage {
  id: string
  dialog_id: string
  role: MessageType
  content: string
  createdAt: string
}
