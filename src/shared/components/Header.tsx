import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
	Link,
	NavLink,
	useLocation,
	useNavigate,
	useSearchParams,
} from "react-router-dom";

export function Header() {
	const { user, logout, isLoggingOut } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const handleOpenCreate = () => {
		const next = new URLSearchParams(searchParams);
		next.set("create", "1");

		// If we're already on /urls, just update the query string
		if (location.pathname === "/urls") {
			navigate(
				{ pathname: "/urls", search: `?${next.toString()}` },
				{ replace: false },
			);
		} else {
			// Navigate to /urls with the create param
			navigate({ pathname: "/urls", search: `?${next.toString()}` });
		}
	};

	return (
		<header className="bg-white border-b">
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				<div className="flex items-center gap-6">
					<Link to="/" className="font-bold text-lg">
						Spot2
					</Link>
					<nav className="hidden md:flex items-center gap-4 text-sm">
						<span className="text-gray-300">•</span>
						<NavLink
							to="/urls"
							className={({ isActive }) =>
								isActive
									? "text-blue-600 font-semibold"
									: "text-gray-700 hover:text-blue-600"
							}
						>
							My URLs
						</NavLink>
					</nav>
				</div>

				<div className="flex items-center gap-2">
					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="flex items-center gap-2">
									<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
										{user.name?.slice(0, 1)?.toUpperCase() ||
											user.email.slice(0, 1).toUpperCase()}
									</span>
									<span className="hidden sm:block max-w-[160px] truncate text-left">
										{user.name || user.email}
									</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<a href="mailto:support@example.com">Support</a>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => logout()}
									disabled={isLoggingOut}
								>
									{isLoggingOut ? "Logging out..." : "Logout"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild>
							<Link to="/login">Login</Link>
						</Button>
					)}
				</div>
			</div>

			<div className="row bg-gray-100 mx-auto px-4">
				<div className="flex items-center justify-between gap-3 py-4 mx-auto px-4 container">
					<h1 className="text-2xl md:text-3xl font-bold">My URLs</h1>

					<div>
						<div className="hidden sm:flex">
							<Button
								onClick={handleOpenCreate}
								style={{ width: "12rem" }}
								type={"button"}
							>
								Crear
							</Button>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
