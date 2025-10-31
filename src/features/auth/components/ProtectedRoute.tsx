import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoadingUser } = useAuth();

	// Show loading state while checking authentication
	if (isLoadingUser) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// Render children if authenticated
	return <>{children}</>;
}
