/**
 * Format number with commas (e.g., 1000 -> 1,000)
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format large numbers with abbreviations (e.g., 1000 -> 1K)
 */
export function formatCompactNumber(num: number): string {
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
		compactDisplay: "short",
	}).format(num);
}

/**
 * Format percentage (e.g., 0.75 -> 75%)
 */
export function formatPercentage(num: number, decimals = 1): string {
	return `${(num * 100).toFixed(decimals)}%`;
}
