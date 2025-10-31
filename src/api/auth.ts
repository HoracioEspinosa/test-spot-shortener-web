import type {
	AuthUser,
	LoginRequest,
	LoginResponse,
	RefreshTokenResponse,
} from "@/shared/types";
import apiClient from "./client";

/**
 * Login with email and password
 * POST /api/auth/login
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
	const { data } = await apiClient.post<LoginResponse>(
		"/auth/login",
		credentials,
	);
	return data;
}

/**
 * Logout current user
 * POST /api/auth/logout
 */
export async function logout(): Promise<void> {
	await apiClient.post("/auth/logout");
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<AuthUser> {
	const { data } = await apiClient.get<AuthUser>("/auth/me");
	return data;
}

/**
 * Refresh authentication token
 * POST /api/auth/refresh
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
	const { data } = await apiClient.post<RefreshTokenResponse>("/auth/refresh");
	return data;
}
