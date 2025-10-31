import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes (formerly cacheTime)
			retry: 2,
			refetchOnWindowFocus: false,
		},
	},
});

const rootEl = document.getElementById("root");
if (rootEl)
	ReactDOM.createRoot(rootEl).render(
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</React.StrictMode>,
	);
