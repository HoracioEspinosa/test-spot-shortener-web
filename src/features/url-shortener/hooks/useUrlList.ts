import { fetchUrls } from "@/api/urls";
import type { PaginatedResponse, ShortenedUrl } from "@/shared/types/api.types";
import { useQuery } from "@tanstack/react-query";

interface UseUrlListOptions {
	page?: number;
	perPage?: number;
	search?: string;
	enabled?: boolean;
}

export function useUrlList(options: UseUrlListOptions = {}) {
	const { page = 1, perPage = 10, search, enabled = true } = options;

	const query = useQuery<PaginatedResponse<ShortenedUrl>>({
		queryKey: ["urls", { page, perPage, search }],
		queryFn: () => fetchUrls({ page, perPage, search }),
		enabled,
		staleTime: 30 * 1000, // 30 seconds
		retry: 2,
	});

	const paginated = query.data;

	return {
		urls: paginated?.data ?? [],
		pagination: paginated
			? {
					currentPage: paginated.meta.current_page,
					lastPage: paginated.meta.last_page,
					perPage: paginated.meta.per_page,
					total: paginated.meta.total,
				}
			: null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}
