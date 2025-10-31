import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});

interface AllTheProvidersProps {
	children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
	const queryClient = createTestQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider
				router={createMemoryRouter([
					{ path: "/", element: children as React.ReactNode },
				])}
				future={
					{ v7_startTransition: true } as { v7_startTransition?: boolean }
				}
			/>
		</QueryClientProvider>
	);
};

const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
