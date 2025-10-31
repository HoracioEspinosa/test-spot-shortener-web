import { fetchUrlAnalytics } from "@/api/analytics";
import type { UrlAnalytics } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export function useUrlAnalytics(
	shortCode: string,
	options: { enabled?: boolean } = {},
) {
	const { enabled = true } = options;

	const query = useQuery<UrlAnalytics>({
		queryKey: ["analytics", shortCode],
		queryFn: () => fetchUrlAnalytics(shortCode),
		enabled: enabled && !!shortCode,
		staleTime: 30 * 1000, // 30 seconds
		retry: 2,
	});

	return {
		analytics: query.data,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}
