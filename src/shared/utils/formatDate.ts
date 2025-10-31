/**
 * Format ISO date string to readable format
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}

/**
 * Format ISO date string to readable datetime
 */
export function formatDateTime(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = date.getTime() - now.getTime();
	const future = diffMs > 0;
	const absSeconds = Math.abs(Math.floor(diffMs / 1000));

	if (absSeconds < 60) {
		return future ? "in a few seconds" : "just now";
	}

	const absMinutes = Math.floor(absSeconds / 60);
	if (absMinutes < 60) {
		const s = `minute${absMinutes > 1 ? "s" : ""}`;
		return future ? `in ${absMinutes} ${s}` : `${absMinutes} ${s} ago`;
	}

	const absHours = Math.floor(absMinutes / 60);
	if (absHours < 24) {
		const s = `hour${absHours > 1 ? "s" : ""}`;
		return future ? `in ${absHours} ${s}` : `${absHours} ${s} ago`;
	}

	const absDays = Math.floor(absHours / 24);
	if (absDays < 30) {
		const s = `day${absDays > 1 ? "s" : ""}`;
		return future ? `in ${absDays} ${s}` : `${absDays} ${s} ago`;
	}

	const absMonths = Math.floor(absDays / 30);
	if (absMonths < 12) {
		const s = `month${absMonths > 1 ? "s" : ""}`;
		return future ? `in ${absMonths} ${s}` : `${absMonths} ${s} ago`;
	}

	const absYears = Math.floor(absMonths / 12);
	const s = `year${absYears > 1 ? "s" : ""}`;
	return future ? `in ${absYears} ${s}` : `${absYears} ${s} ago`;
}
