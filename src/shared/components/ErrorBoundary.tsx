import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch React errors
 * Displays a fallback UI when an error occurs
 */
export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
	};

	public static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.setState({
			error,
			errorInfo,
		});

		// TODO: Send error to logging service (Sentry, Bugsnag, etc.)
	}

	private handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center p-4">
					<Card className="w-full max-w-2xl">
						<CardHeader>
							<CardTitle className="text-red-600">
								Something went wrong
							</CardTitle>
							<CardDescription>
								An unexpected error occurred. Please try again.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{import.meta.env.DEV && this.state.error && (
								<div className="p-4 bg-gray-100 rounded-lg">
									<p className="font-mono text-sm text-red-600 mb-2">
										{this.state.error.toString()}
									</p>
									{this.state.errorInfo && (
										<pre className="text-xs text-gray-700 overflow-auto max-h-64">
											{this.state.errorInfo.componentStack}
										</pre>
									)}
								</div>
							)}

							<div className="flex gap-3">
								<Button type={"button"} onClick={this.handleReset}>
									Try Again
								</Button>
								<Button
									variant="outline"
									onClick={() => window.location.assign("/")}
								>
									Go Home
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
