const grid = new URL("@/assets/img/grid.svg", import.meta.url).href;
import { Header } from "./Header";

export function Layout({ children }: { children: React.ReactNode }) {
	// Fixed header (h-16 ~ 64px) and fixed footer (h-12 ~ 48px)
	// Main takes the remaining viewport height and scrolls internally.
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Extra fixed repeating background layer (in addition to body) */}
			<div
				aria-hidden
				className="fixed inset-0 -z-10 pointer-events-none"
				style={{
					backgroundImage: `url(${grid})`,
					backgroundRepeat: "repeat",
					backgroundSize: "40px 40px",
					backgroundPosition: "0 0",
					opacity: 1,
					backgroundColor: "hsl(var(--background))",
				}}
			/>

			{/* Fixed Header */}
			<div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
				<Header />
			</div>
			{/* Main content area (fills between header and footer) */}
			<main
				className="container mx-auto px-4"
				style={{
					height: "calc(100vh - 4rem - 3rem)",
					paddingTop: "1rem",
					paddingBottom: "1rem",
					marginTop: "4rem",
					marginBottom: "3rem",
				}}
			>
				{children}
			</main>

			{/* Fixed Footer */}
			<div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t">
				<footer className="h-12 flex items-center justify-center text-sm text-gray-500">
					© {new Date().getFullYear()} Spot2
				</footer>
			</div>
		</div>
	);
}
