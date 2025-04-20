import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMessage } from '@/lib/api'
import { MessageData } from '@/lib/interfaces'

export const useDeleteMessage = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (message_id: number) => deleteMessage(message_id),
    onSuccess: (_, message_id) => {
      queryClient.setQueryData<MessageData[] | undefined>(
        ['messages'],
        (oldMessages) =>
          oldMessages?.filter((message: MessageData) => message.id !== message_id) || []
      )
    },
    onError: (error) => {
      console.error('Error while deleting message:', error)
    }
  })
}
