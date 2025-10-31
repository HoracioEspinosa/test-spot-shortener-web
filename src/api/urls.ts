import type {
	ApiResponse,
	CreateUrlRequest,
	PaginatedResponse,
	ShortenedUrl,
	UpdateUrlRequest,
} from "@/shared/types";
import apiClient from "./client";

function hasKey<K extends PropertyKey>(
	obj: unknown,
	key: K,
): obj is Record<K, unknown> {
	return !!obj && typeof obj === "object" && key in obj;
}

function isPaginated<T>(obj: unknown): obj is PaginatedResponse<T> {
	return (
		!!obj &&
		typeof obj === "object" &&
		hasKey(obj, "data") &&
		Array.isArray((obj as { data: unknown }).data) &&
		hasKey(obj, "meta")
	);
}

function isWrappedPaginated<T>(
	obj: unknown,
): obj is { data: PaginatedResponse<T> } {
	return (
		!!obj &&
		typeof obj === "object" &&
		hasKey(obj, "data") &&
		isPaginated<T>((obj as { data: unknown }).data)
	);
}

function isFlatPage<T>(obj: unknown): obj is {
	items: T[];
	total: number;
	per_page: number;
	current_page: number;
} {
	return (
		!!obj &&
		typeof obj === "object" &&
		Array.isArray((obj as { items: unknown }).items) &&
		hasKey(obj, "total") &&
		hasKey(obj, "per_page") &&
		hasKey(obj, "current_page")
	);
}

interface FetchUrlsParams {
	page?: number;
	perPage?: number;
	search?: string;
}

/**
 * Create a new shortened URL
 * POST /api/urls
 */
export async function createUrl(
	payload: CreateUrlRequest,
): Promise<ShortenedUrl> {
	const response = await apiClient.post<
		ApiResponse<ShortenedUrl> | ShortenedUrl
	>("/urls", payload);
	// Support both wrapped and unwrapped responses
	// Wrapped: { data: ShortenedUrl }
	// Unwrapped: ShortenedUrl
	const body = response.data as ApiResponse<ShortenedUrl> | ShortenedUrl;
	return hasKey(body, "data")
		? (body as ApiResponse<ShortenedUrl>).data
		: (body as ShortenedUrl);
}

/**
 * Get list of shortened URLs (paginated)
 * GET /api/urls
 */
export async function fetchUrls(
	params: FetchUrlsParams = {},
): Promise<PaginatedResponse<ShortenedUrl>> {
	const { page = 1, perPage = 10, search } = params;

	const { data } = await apiClient.get<
		| PaginatedResponse<ShortenedUrl>
		| { data: PaginatedResponse<ShortenedUrl> }
		| {
				items: ShortenedUrl[];
				total: number;
				per_page: number;
				current_page: number;
		  }
	>("/urls", {
		params: {
			page,
			per_page: perPage,
			search,
		},
	});

	// Normalize various backend shapes to a standard PaginatedResponse
	// Shape A (unwrapped Laravel-like): { data: T[], links, meta }
	// Shape B (wrapped): { data: { data: T[], links, meta } }
	// Shape C (flat): { items: T[], total, per_page, current_page }
	let paginated: PaginatedResponse<ShortenedUrl>;

	if (isPaginated<ShortenedUrl>(data)) {
		// Shape A
		paginated = data;
	} else if (isWrappedPaginated<ShortenedUrl>(data)) {
		// Shape B
		paginated = data.data;
	} else if (isFlatPage<ShortenedUrl>(data)) {
		// Shape C
		const total = Number(data.total ?? 0);
		const perPage = Number(data.per_page ?? 10);
		const currentPage = Number(data.current_page ?? 1);
		const lastPage = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
		paginated = {
			data: data.items,
			links: { first: null, last: null, prev: null, next: null },
			meta: {
				current_page: currentPage,
				from: null,
				last_page: lastPage,
				path: "/urls",
				per_page: perPage,
				to: null,
				total,
			},
		};
	} else {
		paginated = data;
	}

	return paginated;
}

/**
 * Get a single shortened URL by short code
 * GET /api/urls/:shortCode
 */
export async function fetchUrlByShortCode(
	shortCode: string,
): Promise<ShortenedUrl> {
	const response = await apiClient.get<
		ApiResponse<ShortenedUrl> | ShortenedUrl
	>(`/urls/${shortCode}`);
	const body = response.data as ApiResponse<ShortenedUrl> | ShortenedUrl;
	// Support both wrapped ({ data: ShortenedUrl }) and plain (ShortenedUrl)
	return hasKey(body, "data")
		? (body as ApiResponse<ShortenedUrl>).data
		: (body as ShortenedUrl);
}

/**
 * Update a shortened URL
 * PUT /api/urls/:shortCode (Note: Backend might use PATCH, adjust if needed)
 */
export async function updateUrl(
	shortCode: string,
	data: UpdateUrlRequest,
): Promise<ShortenedUrl> {
	const response = await apiClient.put<ApiResponse<ShortenedUrl>>(
		`/urls/${shortCode}`,
		data,
	);
	return response.data.data;
}

/**
 * Delete a shortened URL
 * DELETE /api/urls/:shortCode
 */
export async function deleteUrl(shortCode: string): Promise<void> {
	await apiClient.delete(`/urls/${shortCode}`);
}
