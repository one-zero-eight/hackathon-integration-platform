import { useMutation } from '@tanstack/react-query'
import { createMessage } from '@/lib/api'
import { MessageData } from '@/lib/interfaces'

export const useSendMessage = () => {
  return useMutation<MessageData, Error, MessageData>({ mutationFn: createMessage })
}
