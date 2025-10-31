import axios, { type AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "/api",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	timeout: 10000,
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		// Handle network errors
		if (!error.response) {
			console.error("Network error:", error.message);
			return Promise.reject({
				message: "Network error. Please check your internet connection.",
				status: 0,
				originalError: error,
			});
		}

		const { status, data } = error.response;

		// Handle specific HTTP errors
		switch (status) {
			case 401:
				// Unauthorized - clear token and redirect to login
				localStorage.removeItem("auth_token");
				window.location.href = "/login";
				break;

			case 403:
				// Forbidden
				console.error(
					"Access forbidden:",
					data?.message || "You do not have permission to perform this action",
				);
				break;

			case 404:
				// Not found
				console.error(
					"Resource not found:",
					data?.message || "The requested resource was not found",
				);
				break;

			case 422:
				// Validation error
				console.error("Validation error:", data?.errors || data?.message);
				break;

			case 429:
				// Rate limit exceeded
				console.error(
					"Rate limit exceeded:",
					data?.message || "Too many requests. Please try again later.",
				);
				break;

			case 500:
			case 502:
			case 503:
			case 504:
				// Server errors
				console.error(
					"Server error:",
					data?.message || "An unexpected server error occurred",
				);
				break;

			default:
				console.error(
					"API error:",
					data?.message || "An unexpected error occurred",
				);
		}

		// Return a standardized error object
		return Promise.reject({
			message: data?.message || error.message || "An unexpected error occurred",
			status,
			errors: data?.errors,
			originalError: error,
		});
	},
);

export default apiClient;
