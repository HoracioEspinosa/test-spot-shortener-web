import { fetchUrlByShortCode } from "@/api/urls";
import type { ShortenedUrl } from "@/shared/types/api.types";
import { useQuery } from "@tanstack/react-query";

interface UseUrlByShortCodeOptions {
	enabled?: boolean;
}

export function useUrlByShortCode(
	shortCode: string,
	options: UseUrlByShortCodeOptions = {},
) {
	const { enabled = true } = options;

	const query = useQuery<ShortenedUrl>({
		queryKey: ["url", shortCode],
		queryFn: () => fetchUrlByShortCode(shortCode),
		enabled: enabled && !!shortCode,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1,
	});

	return {
		url: query.data,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}
