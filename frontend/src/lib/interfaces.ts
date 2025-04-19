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
  replyTo: string
}

export enum Models {
  DEEPSEEK_DISTILLED = 'deepseek-r1-distill-qwen-32b',
  QWEN_2_5_32 = 'qwen2.5-32b-instruct',
  BGE_M3 = 'bge-m3',
  MWS_GPT_ALPHA = 'mws-gpt-alpha',
  LLAMA_3_1 = 'llama-3.1-8b-instruct',
  GEMMA_3 = 'gemma-3-27b-it',
  QWEN_2_5_CODER = 'qwen2.5-coder-7b-instruct',
  LLAMA_3_3 = 'llama-3.3-70b-instruct',
  QWEN_2_5_72 = 'llama-3.3-70b-instruct'
}
