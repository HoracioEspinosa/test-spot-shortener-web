import { ProtectedRoute } from "@/features/auth";
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const UrlListPage = lazy(
	() => import("@/features/url-shortener/pages/UrlListPage"),
);
const AnalyticsDetailPage = lazy(
	() => import("@/features/analytics/pages/AnalyticsDetailPage"),
);
const RedirectPage = lazy(
	() => import("@/features/redirect/pages/RedirectPage"),
);
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
import { ResponsiveLayout } from "@/shared/components/ResponsiveLayout";

import { Layout } from "@/shared/components/Layout";
// Components
import { PageWrapper } from "@/shared/components/PageWrapper";

export const router = createBrowserRouter(
	[
		{
			path: "/",
			element: (
				<ProtectedRoute>
					<Layout>
						<PageWrapper>
							<UrlListPage />
						</PageWrapper>
					</Layout>
				</ProtectedRoute>
			),
		},
		{
			path: "/urls",
			element: (
				<ProtectedRoute>
					<Layout>
						<PageWrapper>
							<UrlListPage />
						</PageWrapper>
					</Layout>
				</ProtectedRoute>
			),
		},
		{
			path: "/analytics/:shortCode",
			element: (
				<ProtectedRoute>
					<Layout>
						<PageWrapper>
							<AnalyticsDetailPage />
						</PageWrapper>
					</Layout>
				</ProtectedRoute>
			),
		},
		{
			path: "/login",
			element: (
				<PageWrapper>
					<LoginPage />
				</PageWrapper>
			),
		},
		{
			path: "/layout-demo",
			element: (
				<ProtectedRoute>
					<Layout>
						<ResponsiveLayout
							content={
								<div style={{ padding: 16 }}>
									<h2 className="text-xl font-semibold">Layout demo</h2>
									<p className="text-gray-600">
										This is a demo of the responsive layout.
									</p>
								</div>
							}
						/>
					</Layout>
				</ProtectedRoute>
			),
		},
		{
			path: "/:shortCode",
			element: (
				<PageWrapper>
					<RedirectPage />
				</PageWrapper>
			),
		},
	],
	{
		future: {
			v7_startTransition: true,
			v7_relativeSplatPath: true,
		} as { v7_startTransition?: boolean; v7_relativeSplatPath?: boolean },
	},
);
