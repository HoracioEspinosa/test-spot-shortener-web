import { createUrl } from "@/api/urls";
import { useToast } from "@/shared/hooks/use-toast";
import type { CreateUrlRequest, ShortenedUrl } from "@/shared/types/api.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateUrl() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const mutation = useMutation<ShortenedUrl, Error, CreateUrlRequest>({
		mutationFn: (payload: CreateUrlRequest) => createUrl(payload),
		onSuccess: (data) => {
			// Invalidate and refetch URL list
			queryClient.invalidateQueries({ queryKey: ["urls"] });

			// Show success toast
			toast({
				title: "URL shortened successfully!",
				description: `Short code: ${data.short_code}`,
			});
		},
		onError: (error) => {
			// Show error toast
			toast({
				title: "Failed to shorten URL",
				description: error.message || "An unexpected error occurred",
				variant: "destructive",
			});
		},
	});

	return {
		createUrl: mutation.mutate,
		createUrlAsync: mutation.mutateAsync,
		isCreating: mutation.isPending,
		error: mutation.error,
		data: mutation.data,
		reset: mutation.reset,
	};
}
