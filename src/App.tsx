import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { Toaster } from "./shared/components/ui/toaster";

function App() {
	return (
		<ErrorBoundary>
			<RouterProvider router={router} />
			<Toaster />
		</ErrorBoundary>
	);
}

export default App;
