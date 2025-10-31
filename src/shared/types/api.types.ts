// ============================================================================
// Shortened URL Types
// ============================================================================

export interface ShortenedUrl {
	id: string;
	short_code: string;
	original_url: string;
	custom_alias?: string;
	created_at: string;
	expires_at?: string;
	click_count: number;
	is_active: boolean;
	qr_code_url?: string;
}

export interface CreateUrlRequest {
	original_url: string;
	custom_alias?: string;
	expires_at?: string;
}

export interface UpdateUrlRequest {
	original_url?: string;
	custom_alias?: string;
	expires_at?: string;
	is_active?: boolean;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface ClicksByDate {
	date: string;
	count: number;
}

export interface ClicksByCountry {
	country: string;
	count: number;
}

export interface ClicksByDevice {
	device: string;
	count: number;
}

export interface TopReferrer {
	referrer: string;
	count: number;
}

export interface UrlAnalytics {
	url: ShortenedUrl;
	total_clicks: number;
	unique_clicks: number;
	clicks_by_date: ClicksByDate[];
	clicks_by_country: ClicksByCountry[];
	clicks_by_device: ClicksByDevice[];
	top_referrers: TopReferrer[];
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	created_at: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	user: AuthUser;
}

export interface RefreshTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationMeta {
	current_page: number;
	from: number | null;
	last_page: number;
	path: string;
	per_page: number;
	to: number | null;
	total: number;
}

export interface PaginationLinks {
	first: string | null;
	last: string | null;
	prev: string | null;
	next: string | null;
}

export interface PaginatedResponse<T> {
	data: T[];
	links: PaginationLinks;
	meta: PaginationMeta;
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
	data: T;
}

export interface ApiErrorResponse {
	message: string;
	errors?: Record<string, string[]>;
}
