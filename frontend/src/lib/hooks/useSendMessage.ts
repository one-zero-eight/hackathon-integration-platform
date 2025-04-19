import { useMutation } from '@tanstack/react-query'
import { createMessage } from '@/lib/api'
import { MessageData, ViewMessage } from '@/lib/interfaces'

export const useSendMessage = () => {
  return useMutation<ViewMessage, Error, MessageData>({ mutationFn: createMessage })
}
