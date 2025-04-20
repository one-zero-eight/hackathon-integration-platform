import {useMutation} from "@tanstack/react-query";
import { NewChat } from "@/lib/interfaces";
import {createNewChat} from "@/lib/api";

export const useStartChat = () => {
    return useMutation<NewChat, Error, void>({
        mutationFn: createNewChat
    })
}