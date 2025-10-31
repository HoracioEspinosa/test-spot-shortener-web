const grid = new URL("@/assets/img/grid.svg", import.meta.url).href;
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	// Redirect to home if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	return (
		<div
			className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
			style={{
				backgroundImage: `url(${grid})`,
				backgroundRepeat: "repeat",
				backgroundSize: "auto",
			}}
		>
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Spot2</h1>
					<p className="text-gray-600">URL Shortener Service</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}
