import * as urlsApi from "@/api/urls";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateUrl } from "../../hooks/useCreateUrl";

function TestComponent() {
	const { createUrl, isCreating, data, error } = useCreateUrl();

	const handleClick = () => {
		createUrl({ original_url: "https://example.com", custom_alias: "alias" });
	};

	return (
		<div>
			<button type={"button"} onClick={handleClick} disabled={isCreating}>
				{isCreating ? "Creating..." : "Create"}
			</button>
			{data && <div data-testid="short-code">{data.short_code}</div>}
			{error && <div data-testid="error">{String(error.message)}</div>}
		</div>
	);
}

describe("useCreateUrl hook", () => {
	const mockCreateUrl = vi.spyOn(urlsApi, "createUrl");

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls API and shows result on success", async () => {
		mockCreateUrl.mockResolvedValueOnce({
			id: "1",
			short_code: "abc123",
			original_url: "https://example.com",
			custom_alias: "alias",
			created_at: new Date().toISOString(),
			expires_at: undefined,
			click_count: 0,
			is_active: true,
		});

		const user = userEvent.setup();
		render(<TestComponent />);

		const btn = screen.getByRole("button", { name: /Create/i });
		await user.click(btn);

		expect(mockCreateUrl).toHaveBeenCalledWith({
			original_url: "https://example.com",
			custom_alias: "alias",
		});

		// Wait for the result to render
		const codeEl = await screen.findByTestId("short-code");
		expect(codeEl.textContent).toBe("abc123");
	});

	it("handles API error", async () => {
		mockCreateUrl.mockRejectedValueOnce(new Error("Network error"));

		const user = userEvent.setup();
		render(<TestComponent />);

		const btn = screen.getByRole("button", { name: /Create/i });
		await user.click(btn);

		// Button should show loading state while pending
		// Then an error should be present
		const errEl = await screen.findByTestId("error");
		expect(errEl).toHaveTextContent("Network error");
	});
});
