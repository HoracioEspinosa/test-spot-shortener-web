import type { ShortenedUrl } from "@/shared/types/api.types";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UrlList } from "../components/UrlList";

describe("UrlList", () => {
	const mockOnDelete = vi.fn();
	const mockOnPageChange = vi.fn();

	const mockUrls: ShortenedUrl[] = [
		{
			id: "1",
			short_code: "abc123",
			original_url: "https://example.com/test1",
			custom_alias: undefined,
			created_at: "2025-10-30T10:00:00Z",
			expires_at: undefined,
			click_count: 42,
			is_active: true,
		},
		{
			id: "2",
			short_code: "xyz789",
			original_url: "https://example.com/test2",
			custom_alias: "my-link",
			created_at: "2025-10-29T10:00:00Z",
			expires_at: "2025-11-30T10:00:00Z",
			click_count: 15,
			is_active: true,
		},
	];

	const mockPagination = {
		currentPage: 1,
		lastPage: 3,
		perPage: 10,
		total: 25,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders loading state", () => {
		render(<UrlList urls={[]} isLoading={true} onDelete={mockOnDelete} />);

		expect(screen.getByText(/Loading URLs.../i)).toBeInTheDocument();
	});

	it("renders empty state when no URLs", () => {
		render(<UrlList urls={[]} isLoading={false} onDelete={mockOnDelete} />);

		expect(screen.getByText(/No shortened URLs yet/i)).toBeInTheDocument();
		expect(
			screen.getByText(/Create your first shortened URL to get started!/i),
		).toBeInTheDocument();
	});

	it("renders list of URLs", () => {
		render(
			<UrlList urls={mockUrls} isLoading={false} onDelete={mockOnDelete} />,
		);

		expect(screen.getByText(/Your Shortened URLs/i)).toBeInTheDocument();
		expect(screen.getByText(/2 URLs/i)).toBeInTheDocument();
	});

	it("renders pagination when provided", () => {
		render(
			<UrlList
				urls={mockUrls}
				isLoading={false}
				onDelete={mockOnDelete}
				pagination={mockPagination}
				onPageChange={mockOnPageChange}
			/>,
		);

		expect(screen.getByText(/Showing 2 of 25 URLs/i)).toBeInTheDocument();
		expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Previous/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
	});

	it("disables previous button on first page", () => {
		render(
			<UrlList
				urls={mockUrls}
				isLoading={false}
				onDelete={mockOnDelete}
				pagination={mockPagination}
				onPageChange={mockOnPageChange}
			/>,
		);

		const previousButton = screen.getByRole("button", { name: /Previous/i });
		expect(previousButton).toBeDisabled();
	});

	it("disables next button on last page", () => {
		const lastPagePagination = { ...mockPagination, currentPage: 3 };

		render(
			<UrlList
				urls={mockUrls}
				isLoading={false}
				onDelete={mockOnDelete}
				pagination={lastPagePagination}
				onPageChange={mockOnPageChange}
			/>,
		);

		const nextButton = screen.getByRole("button", { name: /Next/i });
		expect(nextButton).toBeDisabled();
	});

	it("calls onPageChange when next button is clicked", async () => {
		const user = userEvent.setup();

		render(
			<UrlList
				urls={mockUrls}
				isLoading={false}
				onDelete={mockOnDelete}
				pagination={mockPagination}
				onPageChange={mockOnPageChange}
			/>,
		);

		const nextButton = screen.getByRole("button", { name: /Next/i });
		await user.click(nextButton);

		expect(mockOnPageChange).toHaveBeenCalledWith(2);
	});

	it("calls onPageChange when previous button is clicked", async () => {
		const user = userEvent.setup();
		const page2Pagination = { ...mockPagination, currentPage: 2 };

		render(
			<UrlList
				urls={mockUrls}
				isLoading={false}
				onDelete={mockOnDelete}
				pagination={page2Pagination}
				onPageChange={mockOnPageChange}
			/>,
		);

		const previousButton = screen.getByRole("button", { name: /Previous/i });
		await user.click(previousButton);

		expect(mockOnPageChange).toHaveBeenCalledWith(1);
	});

	it("does not render pagination when only one page", () => {
		const singlePagePagination = { ...mockPagination, lastPage: 1 };

		render(
			<UrlList
				urls={mockUrls}
				isLoading={false}
				onDelete={mockOnDelete}
				pagination={singlePagePagination}
				onPageChange={mockOnPageChange}
			/>,
		);

		expect(
			screen.queryByRole("button", { name: /Previous/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Next/i }),
		).not.toBeInTheDocument();
	});

	it("renders correct number of URL items", () => {
		render(
			<UrlList urls={mockUrls} isLoading={false} onDelete={mockOnDelete} />,
		);

		// Check that both URLs are rendered by looking for their original URLs
		expect(screen.getByText(/example\.com\/test1/i)).toBeInTheDocument();
		expect(screen.getByText(/example\.com\/test2/i)).toBeInTheDocument();
	});
});
