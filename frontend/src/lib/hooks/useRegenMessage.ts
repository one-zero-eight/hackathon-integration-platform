import { MessageData } from '@/lib/interfaces'
import { regenerateMessage } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'

export const useRegenMessage = () => {
  return useMutation<MessageData, Error, number>({
    mutationFn: (message_id) => regenerateMessage(message_id)
  })
}
