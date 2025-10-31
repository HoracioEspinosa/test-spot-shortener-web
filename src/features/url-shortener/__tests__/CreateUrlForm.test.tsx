import type { CreateUrlRequest } from "@/shared/types/api.types";
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateUrlForm } from "../components/CreateUrlForm";

describe("CreateUrlForm", () => {
	const mockOnSubmit = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders form with all fields", () => {
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		expect(screen.getByLabelText(/URL to Shorten/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Custom Alias/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Expiration Date/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Shorten URL/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();
	});

	it("shows validation error when submitting empty URL", async () => {
		const user = userEvent.setup();
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/URL is required/i)).toBeInTheDocument();
		});
		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	it("shows validation error for invalid URL format", async () => {
		const user = userEvent.setup();
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		const urlInput = screen.getByLabelText(/URL to Shorten/i);
		await user.clear(urlInput);
		await user.type(urlInput, "not-a-valid-url");

		const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
		await user.click(submitButton);

		// Verify that onSubmit was not called (validation failed)
		expect(mockOnSubmit).not.toHaveBeenCalled();

		// Verify the input has error styling
		await waitFor(() => {
			expect(urlInput).toHaveClass("border-red-500");
		});
	});

	it("shows validation error for invalid custom alias", async () => {
		const user = userEvent.setup();
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		const urlInput = screen.getByLabelText(/URL to Shorten/i);
		await user.type(urlInput, "https://example.com");

		const aliasInput = screen.getByLabelText(/Custom Alias/i);
		await user.type(aliasInput, "ab"); // Too short

		const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/Alias must be 3-20 alphanumeric characters/i),
			).toBeInTheDocument();
		});
		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	it("submits form with valid URL only", async () => {
		const user = userEvent.setup();
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		const urlInput = screen.getByLabelText(/URL to Shorten/i);
		await user.type(urlInput, "https://example.com/test");

		const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				original_url: "https://example.com/test",
			} as CreateUrlRequest);
		});
	});

	it("submits form with all fields filled", async () => {
		const user = userEvent.setup();
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		const urlInput = screen.getByLabelText(/URL to Shorten/i);
		await user.type(urlInput, "https://example.com/test");

		const aliasInput = screen.getByLabelText(/Custom Alias/i);
		await user.type(aliasInput, "my-link");

		const expiresInput = screen.getByLabelText(/Expiration Date/i);
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 7);
		const dateString = futureDate.toISOString().slice(0, 16);
		await user.type(expiresInput, dateString);

		const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith(
				expect.objectContaining({
					original_url: "https://example.com/test",
					custom_alias: "my-link",
					expires_at: expect.any(String),
				}),
			);
		});
	});

	it("resets form when reset button is clicked", async () => {
		const user = userEvent.setup();
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		const urlInput = screen.getByLabelText(
			/URL to Shorten/i,
		) as HTMLInputElement;
		await user.type(urlInput, "https://example.com");

		const aliasInput = screen.getByLabelText(
			/Custom Alias/i,
		) as HTMLInputElement;
		await user.type(aliasInput, "my-link");

		const resetButton = screen.getByRole("button", { name: /Reset/i });
		await user.click(resetButton);

		expect(urlInput.value).toBe("");
		expect(aliasInput.value).toBe("");
	});

	it("disables form when loading", () => {
		render(<CreateUrlForm onSubmit={mockOnSubmit} isLoading={true} />);

		const urlInput = screen.getByLabelText(/URL to Shorten/i);
		const submitButton = screen.getByRole("button", { name: /Creating.../i });

		expect(urlInput).toBeDisabled();
		expect(submitButton).toBeDisabled();
	});

	it("displays API error message", () => {
		const error = new Error("Network error");
		render(<CreateUrlForm onSubmit={mockOnSubmit} error={error} />);

		expect(screen.getByText(/Network error/i)).toBeInTheDocument();
	});

	it("clears validation errors when user types", async () => {
		const user = userEvent.setup();
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		// Submit empty form to trigger validation
		const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/URL is required/i)).toBeInTheDocument();
		});

		// Type in URL field
		const urlInput = screen.getByLabelText(/URL to Shorten/i);
		await user.type(urlInput, "https://example.com");

		// Validation error should be cleared
		expect(screen.queryByText(/URL is required/i)).not.toBeInTheDocument();
	});

	it("validates expiration date is in the future", async () => {
		const user = userEvent.setup();
		render(<CreateUrlForm onSubmit={mockOnSubmit} />);

		const urlInput = screen.getByLabelText(/URL to Shorten/i);
		await user.type(urlInput, "https://example.com");

		const expiresInput = screen.getByLabelText(/Expiration Date/i);
		const pastDate = new Date();
		pastDate.setDate(pastDate.getDate() - 1);
		const dateString = pastDate.toISOString().slice(0, 16);
		await user.type(expiresInput, dateString);

		const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/Expiration date must be in the future/i),
			).toBeInTheDocument();
		});
		expect(mockOnSubmit).not.toHaveBeenCalled();
	});
});
