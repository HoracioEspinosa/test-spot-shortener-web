import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function RedirectPage() {
	const { shortCode } = useParams<{ shortCode: string }>();
	const [secondsLeft, setSecondsLeft] = useState(3);

	useEffect(() => {
		if (!shortCode) return;

		// Always use same-origin /api proxy to avoid loops if VITE_API_URL is misconfigured
		// Nginx is configured to proxy /api -> backend and strip the prefix
		const target = `/api/${shortCode}`;

		const interval = setInterval(() => {
			setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
		}, 1000);

		const timer = setTimeout(() => {
			window.location.replace(target);
		}, 3000);

		return () => {
			clearInterval(interval);
			clearTimeout(timer);
		};
	}, [shortCode]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
				<p className="text-lg text-gray-600">
					Redirecting{secondsLeft > 0 ? ` in ${secondsLeft}s` : "..."}
				</p>
			</div>
		</div>
	);
}
