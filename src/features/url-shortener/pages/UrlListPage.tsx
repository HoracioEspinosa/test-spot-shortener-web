import { ClickTimelineChart } from "@/features/analytics/components/ClickTimelineChart";
import { DeviceBreakdown } from "@/features/analytics/components/DeviceBreakdown";
import { GeographyMap } from "@/features/analytics/components/GeographyMap";
import { ReferrerList } from "@/features/analytics/components/ReferrerList";
import { useUrlAnalytics } from "@/features/analytics/hooks/useUrlAnalytics";
import { Pagination } from "@/shared/components/Pagination";
import {
	SideSheet,
	SideSheetBody,
	SideSheetFooter,
	SideSheetHeader,
} from "@/shared/components/SideSheet";
import { Button } from "@/shared/components/ui/button";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import type { CreateUrlRequest } from "@/shared/types/api.types";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CreateUrlForm } from "../components/CreateUrlForm";
import { UrlList } from "../components/UrlList";
import { useCreateUrl } from "../hooks/useCreateUrl";
import { useDeleteUrl } from "../hooks/useDeleteUrl";
import { useUrlList } from "../hooks/useUrlList";

export default function UrlListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialPage = Number(searchParams.get("page") || 1);
	const initialPerPage = Number(searchParams.get("perPage") || 5);

	const [currentPage, setCurrentPage] = useState(initialPage);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearch = useDebounce(searchTerm, 500);

	const [perPage, setPerPage] = useLocalStorage<number>(
		"urls_per_page",
		initialPerPage,
	);

	useEffect(() => {
		const next = new URLSearchParams(searchParams);
		next.set("page", String(currentPage));
		next.set("perPage", String(perPage));
		setSearchParams(next, { replace: true });
	}, [currentPage, perPage, searchParams, setSearchParams]);

	const { urls, pagination, isLoading, error } = useUrlList({
		page: currentPage,
		perPage,
		search: debouncedSearch,
	});

	const { deleteUrl, isDeleting } = useDeleteUrl();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handlePerPageChange = (next: number) => {
		setPerPage(next);
		setCurrentPage(1);
		// Optionally refetch is handled by hook deps
	};

	const handleSearch = (search: string) => {
		setSearchTerm(search);
		// Reset to page 1 when searching
		setCurrentPage(1);
	};

	const handleDelete = (id: string) => {
		setDeletingId(id);
		deleteUrl(id);
	};

	if (error) {
		return (
			<div className="max-w-6xl mx-auto">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600">
						Failed to load URLs. Please try again later.
					</p>
				</div>
			</div>
		);
	}

	// SideSheet state synced with URL
	const isCreateOpen = searchParams.get("create") === "1";
	const analyticsCode = searchParams.get("analytics") || "";

	const { createUrlAsync, isCreating, error: createError } = useCreateUrl();
	const {
		analytics,
		isLoading: isLoadingAnalytics,
		error: analyticsError,
	} = useUrlAnalytics(analyticsCode || "", { enabled: !!analyticsCode });

	const openCreate = () => {
		const next = new URLSearchParams(searchParams);
		next.set("create", "1");
		setSearchParams(next, { replace: false });
	};
	const closeCreate = () => {
		const next = new URLSearchParams(searchParams);
		next.delete("create");
		// Reset pagination params to defaults
		next.set("page", "1");
		next.set("perPage", "5");
		setSearchParams(next, { replace: false });
	};

	const openAnalytics = (code: string) => {
		const next = new URLSearchParams(searchParams);
		next.set("analytics", code);
		setSearchParams(next, { replace: false });
	};
	const closeAnalytics = () => {
		const next = new URLSearchParams(searchParams);
		next.delete("analytics");
		// Reset pagination params to defaults
		next.set("page", "1");
		next.set("perPage", "5");
		setSearchParams(next, { replace: false });
	};

	const handleCreateSubmit = async (data: CreateUrlRequest) => {
		try {
			await createUrlAsync(data);
			closeCreate();
			// No need to call refetch() - TanStack Query invalidates automatically
		} catch (err) {
			// Error is already handled by the hook (toast notification)
			console.error("Failed to create URL:", err);
		}
	};

	return (
		<div className="w-full mt-20">
			{/* Content */}
			<div className="relative">
				<UrlList
					urls={urls}
					isLoading={isLoading}
					onDelete={handleDelete}
					isDeletingId={isDeleting ? deletingId : null}
					pagination={pagination}
					onPageChange={handlePageChange}
					onSearch={handleSearch}
					perPage={perPage}
					onPerPageChange={handlePerPageChange}
					onCreateClick={openCreate}
					onOpenAnalytics={openAnalytics}
				/>
			</div>

			{/* Fixed pagination above footer */}
			{pagination && (
				<div className="fixed bottom-12 left-0 right-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t h-14">
					<div className="h-full px-4 flex items-center justify-between gap-3 w-full">
						<div className="hidden md:block text-sm text-gray-700">
							Page {pagination.currentPage} of {pagination.lastPage}
						</div>
						<div className="flex items-center gap-3">
							<div className="hidden md:flex items-center gap-2 text-sm">
								<label htmlFor="per-page-footer" className="text-gray-600">
									Per page
								</label>
								<select
									id="per-page-footer"
									className="border rounded px-2 py-1 text-sm bg-white"
									value={perPage}
									onChange={(e) => handlePerPageChange(Number(e.target.value))}
								>
									{[5, 10, 20, 50].map((n) => (
										<option key={n} value={n}>
											{n}
										</option>
									))}
								</select>
							</div>
							<div className="flex items-center gap-3">
								<Pagination
									currentPage={pagination.currentPage}
									totalPages={pagination.lastPage}
									onPageChange={handlePageChange}
								/>
								<form
									className="hidden lg:flex items-center gap-2 text-sm"
									onSubmit={(e) => {
										e.preventDefault();
										const form = e.target as HTMLFormElement;
										const input = form.elements.namedItem(
											"go-page-footer",
										) as HTMLInputElement;
										const value = Math.max(
											1,
											Math.min(Number(input.value || 1), pagination.lastPage),
										);
										handlePageChange(value);
									}}
								>
									<label htmlFor="go-page-footer" className="text-gray-600">
										Go to
									</label>
									<input
										type="number"
										id="go-page-footer"
										name="go-page-footer"
										min={1}
										max={pagination.lastPage}
										defaultValue={pagination.currentPage}
										className="w-20 border rounded px-2 py-1"
									/>
									<Button type="submit" variant="outline" size="sm">
										Go
									</Button>
								</form>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* SideSheets fixed to page (overlay viewport) */}
			<SideSheet
				open={isCreateOpen}
				onOpenChange={(o) => (o ? openCreate() : closeCreate())}
				side="left"
				closeOnOutsideClick={false}
				showCloseButton={false}
				closeOnEscape={false}
			>
				<SideSheetHeader
					title="Crear Shortcode"
					description="Completa los datos y guarda para crear el enlace corto"
				/>
				<SideSheetBody>
					<CreateUrlForm
						onSubmit={handleCreateSubmit}
						isLoading={isCreating}
						error={createError || null}
						showCard={false}
						formId="create-url-form"
						showActions={false}
					/>
				</SideSheetBody>
				<SideSheetFooter>
					<Button type="submit" form="create-url-form" disabled={isCreating}>
						Guardar
					</Button>
					<Button variant="outline" onClick={closeCreate} disabled={isCreating}>
						Cancelar
					</Button>
				</SideSheetFooter>
			</SideSheet>

			<SideSheet
				open={!!analyticsCode}
				onOpenChange={(o) =>
					o ? openAnalytics(analyticsCode) : closeAnalytics()
				}
				side="right"
				closeOnEscape
			>
				<SideSheetHeader title={`Analytics · ${analyticsCode}`} />
				<SideSheetBody>
					{analyticsError ? (
						<div className="p-3 bg-red-50 border border-red-200 rounded">
							No se pudieron cargar los analytics.
						</div>
					) : isLoadingAnalytics || !analytics ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600" />
						</div>
					) : (
						<div className="space-y-6">
							<ClickTimelineChart data={analytics.clicks_by_date} />
							<GeographyMap data={analytics.clicks_by_country} />
							<DeviceBreakdown data={analytics.clicks_by_device} />
							<ReferrerList data={analytics.top_referrers} />
						</div>
					)}
				</SideSheetBody>
				<SideSheetFooter>
					<Button variant="outline" onClick={closeAnalytics}>
						Cerrar
					</Button>
				</SideSheetFooter>
			</SideSheet>

			{/* Floating Create button on mobile */}
			<div className="sm:hidden fixed bottom-20 right-6 z-40">
				<button
					type="button"
					onClick={openCreate}
					className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white text-3xl shadow-lg hover:bg-blue-700 transition pb-1"
					style={{
						marginBottom: "3rem",
						boxShadow: "0px 0px 14px #585c63",
						borderRadius: "50%",
					}}
				>
					+
				</button>
			</div>
		</div>
	);
}
