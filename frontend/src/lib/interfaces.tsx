export type ActiveButton = 'none' | 'add' | 'deepSearch' | 'think'
export type MessageType = 'user' | 'system'

export interface MessagesMock {
  id: string // Unique identifier for each message
  type: MessageType
  content: string // The content of the message (text)
  isLoading?: boolean
}
