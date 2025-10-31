import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { CreateUrlRequest } from "@/shared/types/api.types";
import { getUrlValidationError, validateUrl } from "@/shared/utils/validateUrl";
import { useState } from "react";

interface CreateUrlFormProps {
	onSubmit: (data: CreateUrlRequest) => void;
	isLoading?: boolean;
	error?: Error | null;
	showCard?: boolean;
	formId?: string;
	showActions?: boolean;
	onMountResetRef?: (reset: () => void) => void;
}

export function CreateUrlForm({
	onSubmit,
	isLoading = false,
	error = null,
	showCard = true,
	formId,
	showActions = true,
	onMountResetRef,
}: CreateUrlFormProps) {
	const [originalUrl, setOriginalUrl] = useState("");
	const [customAlias, setCustomAlias] = useState("");
	const [expiresAt, setExpiresAt] = useState("");
	const [errors, setErrors] = useState<{
		originalUrl?: string;
		customAlias?: string;
		expiresAt?: string;
	}>({});

	const validateForm = (): boolean => {
		const newErrors: {
			originalUrl?: string;
			customAlias?: string;
			expiresAt?: string;
		} = {};

		// Validate original URL (required)
		if (!originalUrl.trim()) {
			newErrors.originalUrl = "URL is required";
		} else if (!validateUrl(originalUrl)) {
			const validationError = getUrlValidationError(originalUrl);
			newErrors.originalUrl = validationError || "Invalid URL format";
		}

		// Validate custom alias (optional, but must be alphanumeric if provided)
		if (customAlias && !/^[a-zA-Z0-9_-]{3,20}$/.test(customAlias)) {
			newErrors.customAlias =
				"Alias must be 3-20 alphanumeric characters (including _ and -)";
		}

		// Validate expiration date (optional, but must be in the future if provided)
		if (expiresAt) {
			const expirationDate = new Date(expiresAt);
			const now = new Date();

			if (expirationDate <= now) {
				newErrors.expiresAt = "Expiration date must be in the future";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Prepare data for submission
		const data: CreateUrlRequest = {
			original_url: originalUrl.trim(),
		};

		if (customAlias.trim()) {
			data.custom_alias = customAlias.trim();
		}

		if (expiresAt) {
			data.expires_at = new Date(expiresAt).toISOString();
		}

		onSubmit(data);
	};

	const handleReset = () => {
		setOriginalUrl("");
		setCustomAlias("");
		setExpiresAt("");
		setErrors({});
	};

	// Expose reset to parent if needed
	if (onMountResetRef) {
		onMountResetRef(handleReset);
	}

	const formContent = (
		<form noValidate onSubmit={handleSubmit} className="space-y-4" id={formId}>
			{/* Original URL Field */}
			<div className="space-y-2">
				<Label htmlFor="originalUrl">
					URL to Shorten <span className="text-red-500">*</span>
				</Label>
				<Input
					id="originalUrl"
					type="url"
					placeholder="https://example.com/very-long-url"
					value={originalUrl}
					onChange={(e) => {
						setOriginalUrl(e.target.value);
						setErrors((prev) => ({ ...prev, originalUrl: undefined }));
					}}
					disabled={isLoading}
					className={errors.originalUrl ? "border-red-500" : ""}
				/>
				{errors.originalUrl && (
					<p className="text-sm text-red-500">{errors.originalUrl}</p>
				)}
			</div>

			{/* Custom Alias Field (Optional) */}
			<div className="space-y-2">
				<Label htmlFor="customAlias">Custom Alias (Optional)</Label>
				<Input
					id="customAlias"
					type="text"
					placeholder="my-custom-link"
					value={customAlias}
					onChange={(e) => {
						setCustomAlias(e.target.value);
						setErrors((prev) => ({ ...prev, customAlias: undefined }));
					}}
					disabled={isLoading}
					className={errors.customAlias ? "border-red-500" : ""}
				/>
				{errors.customAlias && (
					<p className="text-sm text-red-500">{errors.customAlias}</p>
				)}
				<p className="text-sm text-gray-500">
					Leave empty for auto-generated short code (3-20 alphanumeric
					characters)
				</p>
			</div>

			{/* Expiration Date Field (Optional) */}
			<div className="space-y-2">
				<Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
				<Input
					id="expiresAt"
					type="datetime-local"
					value={expiresAt}
					onChange={(e) => {
						setExpiresAt(e.target.value);
						setErrors((prev) => ({ ...prev, expiresAt: undefined }));
					}}
					disabled={isLoading}
					className={errors.expiresAt ? "border-red-500" : ""}
				/>
				{errors.expiresAt && (
					<p className="text-sm text-red-500">{errors.expiresAt}</p>
				)}
				<p className="text-sm text-gray-500">
					Leave empty for links that never expire
				</p>
			</div>

			{/* API Error */}
			{error && (
				<div className="p-3 bg-red-50 border border-red-200 rounded-md">
					<p className="text-sm text-red-600">
						{error instanceof Error
							? error.message
							: "Failed to create shortened URL. Please try again."}
					</p>
				</div>
			)}

			{/* Action Buttons */}
			{showActions && (
				<div className="flex gap-3 pt-2">
					<Button type="submit" className="flex-1" disabled={isLoading}>
						{isLoading ? "Creating..." : "Shorten URL"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleReset}
						disabled={isLoading}
					>
						Reset
					</Button>
				</div>
			)}
		</form>
	);

	if (!showCard) {
		return formContent;
	}

	return (
		<div className="w-full max-w-2xl bg-white border border-gray-200 shadow-sm rounded-xl p-6">
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-800">Shorten a URL</h3>
				<p className="text-sm text-gray-500">
					Create a short link for your URL
				</p>
			</div>
			{formContent}
		</div>
	);
}
