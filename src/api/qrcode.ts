import apiClient from "./client";

/**
 * Get QR code for a shortened URL
 * GET /api/urls/:shortCode/qr
 *
 * Returns the QR code image URL or base64 data
 */
export async function fetchQrCode(shortCode: string): Promise<string> {
	const { data } = await apiClient.get<{ qr_code: string }>(
		`/urls/${shortCode}/qr`,
	);
	return data.qr_code;
}

export async function fetchQrCodeBlob(
	shortCode: string,
	options: { format?: "png" | "svg" | "webp"; size?: number } = {},
): Promise<Blob> {
	const response = await apiClient.get(`/urls/${shortCode}/qr`, {
		responseType: "blob",
		params: {
			format: options.format ?? "png",
			...(options.size ? { size: options.size } : {}),
		},
	});
	return response.data as Blob;
}

/**
 * Get QR code image URL for embedding
 */
export function getQrCodeUrl(
	shortCode: string,
	options: { format?: "png" | "svg" | "webp"; size?: number } = {},
): string {
	const baseURL = import.meta.env.VITE_API_URL || "/api";
	const params = new URLSearchParams();
	params.set("format", options.format ?? "png");
	if (options.size) params.set("size", String(options.size));
	return `${baseURL}/urls/${shortCode}/qr?${params.toString()}`;
}
