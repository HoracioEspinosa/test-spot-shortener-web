import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { ClickTimelineChart } from "../components/ClickTimelineChart";
import { DeviceBreakdown } from "../components/DeviceBreakdown";
import { GeographyMap } from "../components/GeographyMap";
import { ReferrerList } from "../components/ReferrerList";
import { useUrlAnalytics } from "../hooks/useUrlAnalytics";

export default function AnalyticsDetailPage() {
	const { shortCode } = useParams<{ shortCode: string }>();
	const navigate = useNavigate();
	const { analytics, isLoading, error } = useUrlAnalytics(shortCode || "");

	if (error) {
		return (
			<div className="max-w-6xl mx-auto">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<p className="text-red-600">
						Failed to load analytics. Please try again later.
					</p>
				</div>
				<button
					className="underline"
					onClick={() => navigate(-1)}
					type={"button"}
				>
					Go Back
				</button>
			</div>
		);
	}

	if (isLoading || !analytics) {
		return (
			<div className="min-h-[50vh] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600" />
			</div>
		);
	}

	const shortUrl = `${window.location.origin}/${analytics.url.short_code}`;

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
					Analytics · {analytics.url.short_code}
				</h1>
				<button
					type={"button"}
					className="text-sm text-blue-600 hover:text-blue-700 underline"
					onClick={() => navigate(-1)}
				>
					Back
				</button>
			</div>

			<Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
				<CardHeader>
					<CardTitle className="text-gray-800 drop-shadow">
						URL Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 text-sm">
						<div>
							<span className="font-medium">Short URL: </span>
							<a
								className="text-blue-600 underline"
								href={shortUrl}
								target="_blank"
								rel="noreferrer"
							>
								{shortUrl}
							</a>
						</div>
						<div className="truncate" title={analytics.url.original_url}>
							<span className="font-medium">Original URL: </span>
							<a
								className="text-blue-600 underline"
								href={analytics.url.original_url}
								target="_blank"
								rel="noreferrer"
							>
								{analytics.url.original_url}
							</a>
						</div>
						<div>
							<span className="font-medium">Total clicks: </span>
							{analytics.total_clicks}
						</div>
						<div>
							<span className="font-medium">Unique clicks: </span>
							{analytics.unique_clicks}
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ClickTimelineChart data={analytics.clicks_by_date} />
				<GeographyMap data={analytics.clicks_by_country} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<DeviceBreakdown data={analytics.clicks_by_device} />
				<ReferrerList data={analytics.top_referrers} />
			</div>
		</div>
	);
}
