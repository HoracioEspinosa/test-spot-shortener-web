/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
	if (!url || url.trim() === "") {
		return false;
	}

	try {
		const urlObj = new URL(url);
		// Only allow http and https protocols
		return urlObj.protocol === "http:" || urlObj.protocol === "https:";
	} catch {
		return false;
	}
}

/**
 * Validate URL and return error message if invalid
 */
export function getUrlValidationError(url: string): string | null {
	if (!url || url.trim() === "") {
		return "URL is required";
	}

	if (url.length > 2048) {
		return "URL is too long (max 2048 characters)";
	}

	if (!validateUrl(url)) {
		return "Please enter a valid URL (must start with http:// or https://)";
	}

	return null;
}
