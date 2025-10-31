import { Button } from "@/shared/components/ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	siblingCount?: number;
}

function range(start: number, end: number): number[] {
	return Array.from(
		{ length: Math.max(0, end - start + 1) },
		(_, i) => start + i,
	);
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	siblingCount = 1,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	// Simple, robust algorithm without duplicates
	// Always show first and last; show siblings around current; collapse with dots
	const firstPage = 1;
	const lastPage = totalPages;

	if (totalPages <= 7) {
		const pages = range(1, totalPages);
		return (
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
				>
					First
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					Previous
				</Button>
				{pages.map((p) => (
					<Button
						key={p}
						variant="outline"
						size="sm"
						className={
							p === currentPage
								? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
								: ""
						}
						onClick={() => onPageChange(p)}
						aria-current={p === currentPage ? "page" : undefined}
					>
						{p}
					</Button>
				))}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					Next
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
				>
					Last
				</Button>
			</div>
		);
	}

	const left = Math.max(firstPage + 1, currentPage - siblingCount);
	const right = Math.min(lastPage - 1, currentPage + siblingCount);

	const pages: (number | "dots")[] = [firstPage];
	if (left > firstPage + 1) pages.push("dots");
	pages.push(...range(left, right));
	if (right < lastPage - 1) pages.push("dots");
	pages.push(lastPage);

	// Remove any accidental duplicates and collapse consecutive dots
	const items: (number | "dots")[] = [];
	for (const it of pages) {
		const prev = items[items.length - 1];
		if (it === "dots" && prev === "dots") continue;
		if (typeof it === "number" && typeof prev === "number" && it === prev)
			continue;
		items.push(it);
	}

	const firstDotsIndex = items.indexOf("dots");

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(1)}
				disabled={currentPage === 1}
			>
				First
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(Math.max(1, currentPage - 1))}
				disabled={currentPage === 1}
			>
				Previous
			</Button>

			{items.map((it, idx) =>
				it === "dots" ? (
					<span
						key={idx === firstDotsIndex ? "dots-left" : "dots-right"}
						className="px-2 text-gray-500 select-none"
					>
						···
					</span>
				) : (
					<Button
						key={it}
						variant="outline"
						size="sm"
						className={
							it === currentPage
								? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
								: ""
						}
						onClick={() => onPageChange(it)}
						aria-current={it === currentPage ? "page" : undefined}
					>
						{it}
					</Button>
				),
			)}

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
				disabled={currentPage === totalPages}
			>
				Next
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(totalPages)}
				disabled={currentPage === totalPages}
			>
				Last
			</Button>
		</div>
	);
}
