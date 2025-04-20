import { useMutation } from '@tanstack/react-query'
import { createNewChat } from '@/lib/api'

export const useCreateChat = (onSuccess: (id: number) => void) => {
  return useMutation({
    mutationFn: createNewChat,
    onMutate: () => {},
    onSuccess: (data) => {
      console.log('New chat created with ID:', data.id)
      onSuccess(data.id)
    },
    onError: (error) => {
      console.error('Error creating new chat:', error)
    }
  })
}
