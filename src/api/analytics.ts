import type { ApiResponse, UrlAnalytics } from "@/shared/types";
import apiClient from "./client";
import { fetchUrlByShortCode } from "./urls";

// Type guards to avoid any casts
function hasKey<K extends PropertyKey>(
	obj: unknown,
	key: K,
): obj is Record<K, unknown> {
	return !!obj && typeof obj === "object" && key in obj;
}
function hasKeys<T extends readonly PropertyKey[]>(
	obj: unknown,
	...keys: T
): obj is Record<T[number], unknown> {
	return (
		!!obj && typeof obj === "object" && keys.every((k) => k in (obj as object))
	);
}

/**
 * Get analytics data for a shortened URL
 * GET /api/urls/:shortCode/analytics
 */
export async function fetchUrlAnalytics(
	shortCode: string,
): Promise<UrlAnalytics> {
	type ByDateItem = {
		date?: string;
		day?: string;
		ts?: string;
		count?: number;
		total?: number;
	};
	type ByCountryItem = {
		country?: string;
		code?: string;
		name?: string;
		count?: number;
		total?: number;
	};
	type ReferrerItem =
		| string
		| { referrer?: string; host?: string; count?: number; total?: number };
	type DeviceItem = {
		device?: string;
		type?: string;
		count?: number;
		total?: number;
	};
	type MinimalAnalytics = {
		short_code: string;
		total: number;
		unique_total?: number;
		by_date?: ByDateItem[] | Record<string, unknown>;
		by_country?: ByCountryItem[] | Record<string, unknown>;
		referrers?: ReferrerItem[] | Record<string, unknown>;
		by_device?: DeviceItem[];
	};
	const response = await apiClient.get<
		| UrlAnalytics
		| ApiResponse<UrlAnalytics>
		| MinimalAnalytics
		| ApiResponse<MinimalAnalytics>
	>(`/urls/${shortCode}/analytics`);
	const resData = response.data as
		| UrlAnalytics
		| ApiResponse<UrlAnalytics>
		| MinimalAnalytics
		| ApiResponse<MinimalAnalytics>;

	let raw: UrlAnalytics | MinimalAnalytics;
	if (hasKey(resData, "data")) {
		raw = (resData as { data: UrlAnalytics | MinimalAnalytics }).data;
	} else {
		raw = resData as UrlAnalytics | MinimalAnalytics;
	}

	// Shape 1: already conforms to UrlAnalytics
	if (hasKeys(raw, "url", "total_clicks")) {
		return raw as UrlAnalytics;
	}

	// Shape 2: minimal/flat analytics like
	// { short_code: string, total: number, by_date: [], by_country: [], referrers: [] }
	if (hasKeys(raw, "short_code", "total")) {
		const m = raw as MinimalAnalytics;
		// Ensure we have URL details; fetch if not present
		const url = await fetchUrlByShortCode(shortCode);

		// Normalize arrays
		// by_date can be array or object map { 'YYYY-MM-DD': count }
		const clicks_by_date = Array.isArray(m.by_date)
			? (m.by_date as ByDateItem[]).map((d: ByDateItem) => ({
					date: d.date ?? d.day ?? d.ts ?? "",
					count: Number(d.count ?? d.total ?? 0),
				}))
			: m.by_date && typeof m.by_date === "object"
				? Object.entries(m.by_date as Record<string, unknown>).map(
						([date, count]) => ({
							date,
							count: Number(count ?? 0),
						}),
					)
				: [];

		const clicks_by_country = Array.isArray(m.by_country)
			? (m.by_country as ByCountryItem[]).map((c: ByCountryItem) => ({
					country: c.country ?? c.code ?? c.name ?? "Unknown",
					count: Number(c.count ?? c.total ?? 0),
				}))
			: m.by_country && typeof m.by_country === "object"
				? Object.entries(m.by_country).map(([country, count]) => ({
						country,
						count: Number(count ?? 0),
					}))
				: [];

		// referrers can be array or object map { referrer: count }
		const top_referrers = Array.isArray(m.referrers)
			? (m.referrers as ReferrerItem[]).map((r: ReferrerItem) => {
					if (typeof r === "string") return { referrer: r, count: 0 };
					return {
						referrer: r.referrer ?? r.host ?? "Direct",
						count: Number(r.count ?? r.total ?? 0),
					};
				})
			: m.referrers && typeof m.referrers === "object"
				? Object.entries(m.referrers as Record<string, unknown>).map(
						([ref, count]) => ({
							referrer: ref || "Direct",
							count: Number(count ?? 0),
						}),
					)
				: [];

		return {
			url,
			total_clicks: Number(m.total ?? 0),
			unique_clicks: Number(m.unique_total ?? m.total ?? 0),
			clicks_by_date,
			clicks_by_country,
			clicks_by_device: Array.isArray(m.by_device)
				? (m.by_device as DeviceItem[]).map((d: DeviceItem) => ({
						device: d.device ?? d.type ?? "unknown",
						count: Number(d.count ?? d.total ?? 0),
					}))
				: [],
			top_referrers,
		};
	}

	// Fallback: return an empty normalized structure with fetched URL details
	const url = await fetchUrlByShortCode(shortCode);
	return {
		url,
		total_clicks: 0,
		unique_clicks: 0,
		clicks_by_date: [],
		clicks_by_country: [],
		clicks_by_device: [],
		top_referrers: [],
	};
}
