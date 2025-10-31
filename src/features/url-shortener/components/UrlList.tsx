import { Pagination } from "@/shared/components/Pagination";
import type { ShortenedUrl } from "@/shared/types/api.types";
// import { useState } from 'react'
import { UrlListItem } from "./UrlListItem";

interface UrlListProps {
	urls: ShortenedUrl[];
	isLoading?: boolean;
	onDelete: (id: string) => void;
	isDeletingId?: string | null;
	pagination?: {
		currentPage: number;
		lastPage: number;
		perPage: number;
		total: number;
	} | null;
	onPageChange?: (page: number) => void;
	onSearch?: (searchTerm: string) => void;
	perPage?: number;
	onPerPageChange?: (n: number) => void;
	onCreateClick?: () => void;
	onOpenAnalytics?: (shortCode: string) => void;
}

export function UrlList({
	urls,
	isLoading,
	onDelete,
	isDeletingId,
	pagination,
	onPageChange,
	onSearch: _onSearch,
	onOpenAnalytics,
}: Readonly<UrlListProps>) {
	// TODO: Implement search functionality
	// const [searchTerm, setSearchTerm] = useState('')
	// const handleSearchChange = (value: string) => {
	//   setSearchTerm(value)
	//   onSearch?.(value)
	// }

	// Loading state
	if (isLoading) {
		return (
			<div className="w-full asdas">
				<div className="pt-6">
					<div className="flex items-center justify-center py-12 border rounded-xl bg-white">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
							<p className="text-gray-600">Loading URLs...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Empty state
	if (!urls || urls.length === 0) {
		return (
			<div className="w-full">
				<div className="pt-6">
					<div className="text-center py-12 border rounded-xl bg-white">
						<p className="text-gray-600 text-lg mb-2">No shortened URLs yet</p>
						<p className="text-gray-500 text-sm">
							Create your first shortened URL to get started!
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			{/* Header with title and count */}
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-lg font-semibold text-gray-800">
					Your Shortened URLs
				</h2>
				<span className="text-sm text-gray-600">{urls.length} URLs</span>
			</div>
			{/* Grid of cards */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-6">
				{urls.map((url) => (
					<UrlListItem
						key={url.id}
						url={url}
						onDelete={onDelete}
						isDeleting={
							isDeletingId === url.short_code || isDeletingId === url.id
						}
						onOpenAnalytics={onOpenAnalytics}
					/>
				))}
			</div>

			{/* Pagination footer */}
			{pagination && onPageChange && (
				<>
					<div className="mt-4 flex items-center justify-between text-sm text-gray-600">
						<div>
							Showing {urls.length} of {pagination.total} URLs
						</div>
						<div>
							Page {pagination.currentPage} of {pagination.lastPage}
						</div>
					</div>
					<div className="mt-3">
						<Pagination
							currentPage={pagination.currentPage}
							totalPages={pagination.lastPage}
							onPageChange={onPageChange}
						/>
					</div>
				</>
			)}
		</div>
	);
}
