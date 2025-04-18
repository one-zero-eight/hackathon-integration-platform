export type ActiveButton = 'none' | 'add' | 'deepSearch' | 'think'
export type MessageType = 'user' | 'system' | 'assistant'

export interface Message {
  id: string
  content: string
  type: MessageType
  completed?: boolean
  newSection?: boolean
}

export interface MessageSection {
  id: string
  messages: Message[]
  isNewSection: boolean
  isActive?: boolean
  sectionIndex: number
}

export interface StreamingWord {
  id: number
  text: string
}

export interface Messages {
  id: string // Unique identifier for each message
  type: MessageType
  content: string // The content of the message (text)
  isLoading?: boolean
}

export interface MessageData {
  dialogId: string
  type: MessageType
  comment: string
}
