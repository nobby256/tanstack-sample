import { useMutation, useQueryClient } from "@tanstack/react-query"

type MutationFactory<TRequest, TResponse> = () => {
	mutationFn: (request: TRequest) => Promise<TResponse>
}

export function useEventMutation<TRequest, TResponse>(
	factory: MutationFactory<TRequest, TResponse>,
	invalidate: (queryClient: ReturnType<typeof useQueryClient>) => void,
) {
	const queryClient = useQueryClient()
	const mutation = useMutation<TResponse, Error, TRequest>({
		...factory(),
		onSuccess: () => {
			invalidate(queryClient)
		},
	})
	return mutation.mutateAsync
}
