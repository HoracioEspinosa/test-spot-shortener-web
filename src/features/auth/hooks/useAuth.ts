import { getCurrentUser, login, logout } from "@/api/auth";
import type { AuthUser, LoginRequest } from "@/shared/types/api.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const AUTH_TOKEN_KEY = "auth_token";

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Get token from localStorage
	const getToken = (): string | null => {
		return localStorage.getItem(AUTH_TOKEN_KEY);
	};

	// Check if user is authenticated
	const isAuthenticated = (): boolean => {
		return !!getToken();
	};

	// Fetch current user data
	const {
		data: user,
		isLoading: isLoadingUser,
		error: userError,
	} = useQuery<AuthUser | null>({
		queryKey: ["auth", "user"],
		queryFn: async () => {
			if (!isAuthenticated()) {
				return null;
			}

			try {
				return await getCurrentUser();
			} catch (error) {
				// If token is invalid, clear it
				localStorage.removeItem(AUTH_TOKEN_KEY);
				return null;
			}
		},
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Login mutation
	const loginMutation = useMutation({
		mutationFn: (credentials: LoginRequest) => login(credentials),
		onSuccess: (response) => {
			// Store token
			localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);

			// Invalidate and refetch user data
			queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

			// Redirect to home page
			navigate("/");
		},
		onError: (error) => {
			console.error("Login failed:", error);
		},
	});

	// Logout mutation
	const logoutMutation = useMutation({
		mutationFn: logout,
		onSuccess: () => {
			// Clear token
			localStorage.removeItem(AUTH_TOKEN_KEY);

			// Clear all queries
			queryClient.clear();

			// Redirect to login page
			navigate("/login");
		},
		onError: () => {
			// Even if API call fails, clear local data
			localStorage.removeItem(AUTH_TOKEN_KEY);
			queryClient.clear();
			navigate("/login");
		},
	});

	return {
		// State
		user,
		isAuthenticated: isAuthenticated(),
		isLoadingUser,
		userError,

		// Actions
		login: loginMutation.mutate,
		logout: logoutMutation.mutate,
		isLoggingIn: loginMutation.isPending,
		isLoggingOut: logoutMutation.isPending,
		loginError: loginMutation.error,
		logoutError: logoutMutation.error,

		// Utilities
		getToken,
	};
}
