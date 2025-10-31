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
});
