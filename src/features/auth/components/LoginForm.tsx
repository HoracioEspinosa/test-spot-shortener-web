import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<{ email?: string; password?: string }>(
		{},
	);

	const { login, isLoggingIn, loginError } = useAuth();

	const validateForm = (): boolean => {
		const newErrors: { email?: string; password?: string } = {};

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Invalid email format";
		}

		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		login({ email, password });
	};

	return (
		<Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm rounded-xl">
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form noValidate onSubmit={handleSubmit} className="space-y-4">
					{/* Email Field */}
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setErrors((prev) => ({ ...prev, email: undefined }));
							}}
							disabled={isLoggingIn}
							className={errors.email ? "border-red-500" : ""}
						/>
						{errors.email && (
							<p className="text-sm text-red-500">{errors.email}</p>
						)}
					</div>

					{/* Password Field */}
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								setErrors((prev) => ({ ...prev, password: undefined }));
							}}
							disabled={isLoggingIn}
							className={errors.password ? "border-red-500" : ""}
						/>
						{errors.password && (
							<p className="text-sm text-red-500">{errors.password}</p>
						)}
					</div>

					{/* API Error */}
					{loginError && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">
								{loginError instanceof Error
									? loginError.message
									: "Login failed. Please try again."}
							</p>
						</div>
					)}

					{/* Submit Button */}
					<Button type="submit" className="w-full" disabled={isLoggingIn}>
						{isLoggingIn ? "Logging in..." : "Login"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
