import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "../components/LoginForm";

// Mock useAuth hook
vi.mock("../hooks/useAuth", () => ({
	useAuth: vi.fn(() => ({
		login: vi.fn(),
		isLoggingIn: false,
		loginError: null,
	})),
}));

describe("LoginForm", () => {
	const mockLogin = vi.fn();

	beforeEach(async () => {
		vi.clearAllMocks();
		const { useAuth } = await import("../hooks/useAuth");
		(useAuth as unknown as vi.Mock).mockReturnValue({
			login: mockLogin,
			isLoggingIn: false,
			loginError: null,
		});
	});

	it("renders login form with all fields", () => {
		render(<LoginForm />);

		expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
	});

	it("shows validation error when submitting empty email", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const submitButton = screen.getByRole("button", { name: /Login/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
		});
		expect(mockLogin).not.toHaveBeenCalled();
	});

	it("shows validation error for invalid email format", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText(/Email/i);
		await user.clear(emailInput);
		await user.type(emailInput, "invalid-email");

		const passwordInput = screen.getByLabelText(/Password/i);
		await user.type(passwordInput, "password123"); // Add password to avoid that error

		const submitButton = screen.getByRole("button", { name: /Login/i });
		await user.click(submitButton);

		// Verify that login was not called (validation failed)
		expect(mockLogin).not.toHaveBeenCalled();

		// Verify the input has error styling
		await waitFor(() => {
			expect(emailInput).toHaveClass("border-red-500");
		});
	});

	it("shows validation error when password is empty", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText(/Email/i);
		await user.type(emailInput, "test@example.com");

		const submitButton = screen.getByRole("button", { name: /Login/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
		});
		expect(mockLogin).not.toHaveBeenCalled();
	});

	it("shows validation error when password is too short", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText(/Email/i);
		await user.type(emailInput, "test@example.com");

		const passwordInput = screen.getByLabelText(/Password/i);
		await user.type(passwordInput, "12345");

		const submitButton = screen.getByRole("button", { name: /Login/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/Password must be at least 6 characters/i),
			).toBeInTheDocument();
		});
		expect(mockLogin).not.toHaveBeenCalled();
	});

	it("submits form with valid credentials", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText(/Email/i);
		await user.type(emailInput, "test@example.com");

		const passwordInput = screen.getByLabelText(/Password/i);
		await user.type(passwordInput, "password123");

		const submitButton = screen.getByRole("button", { name: /Login/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
		});
	});

	it("disables form when logging in", async () => {
		const { useAuth } = await import("../hooks/useAuth");
		(useAuth as unknown as vi.Mock).mockReturnValue({
			login: mockLogin,
			isLoggingIn: true,
			loginError: null,
		});

		render(<LoginForm />);

		const emailInput = screen.getByLabelText(/Email/i);
		const passwordInput = screen.getByLabelText(/Password/i);
		const submitButton = screen.getByRole("button", { name: /Logging in.../i });

		expect(emailInput).toBeDisabled();
		expect(passwordInput).toBeDisabled();
		expect(submitButton).toBeDisabled();
	});

	it("displays API error message", async () => {
		const { useAuth } = await import("../hooks/useAuth");
		(useAuth as unknown as vi.Mock).mockReturnValue({
			login: mockLogin,
			isLoggingIn: false,
			loginError: new Error("Invalid credentials"),
		});

		render(<LoginForm />);

		expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
	});

	it("clears validation errors when user types", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		// Submit empty form to trigger validation
		const submitButton = screen.getByRole("button", { name: /Login/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
		});

		// Type in email field
		const emailInput = screen.getByLabelText(/Email/i);
		await user.type(emailInput, "test@example.com");

		// Validation error should be cleared
		expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument();
	});
});
