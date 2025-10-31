import { deleteUrl } from "@/api/urls";
import { useToast } from "@/shared/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteUrl() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const mutation = useMutation<void, Error, string>({
		mutationFn: (id: string) => deleteUrl(id),
		onSuccess: () => {
			// Invalidate and refetch URL list
			queryClient.invalidateQueries({ queryKey: ["urls"] });

			// Show success toast
			toast({
				title: "URL deleted successfully",
				description: "The shortened URL has been removed",
			});
		},
		onError: (error) => {
			// Show error toast
			toast({
				title: "Failed to delete URL",
				description: error.message || "An unexpected error occurred",
				variant: "destructive",
			});
		},
	});

	return {
		deleteUrl: mutation.mutate,
		deleteUrlAsync: mutation.mutateAsync,
		isDeleting: mutation.isPending,
		error: mutation.error,
	};
}
