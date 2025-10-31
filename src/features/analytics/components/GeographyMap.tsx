import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import type { ClicksByCountry } from "@/shared/types";
import { formatNumber } from "@/shared/utils/formatNumber";

interface GeographyMapProps {
	data: ClicksByCountry[];
}

export function GeographyMap({ data }: GeographyMapProps) {
	const total = Array.isArray(data)
		? data.reduce((acc, c) => acc + (c.count || 0), 0)
		: 0;
	return (
		<Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
			<CardHeader>
				<CardTitle className="text-gray-800 drop-shadow">
					Clicks by Country
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul>
					{!data || data.length === 0 ? (
						<li className="py-2">
							<div className="flex items-center justify-between">
								<span className="text-gray-500">No country data</span>
								<span className="flex items-center gap-3">
									<span className="text-xs text-gray-400 tabular-nums">0%</span>
									<span className="font-semibold tabular-nums text-gray-400">
										0
									</span>
								</span>
							</div>
							<div className="mt-2 h-1.5 rounded bg-gray-100">
								<div
									className="h-1.5 rounded bg-blue-200"
									style={{ width: "0%" }}
								/>
							</div>
						</li>
					) : (
						data.map((c, idx) => {
							const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
							return (
								<li
									key={c.country}
									className={`py-2 ${idx !== data.length - 1 ? "border-b border-gray-100" : ""}`}
								>
									<div className="flex items-center justify-between">
										<span className="text-gray-700">{c.country}</span>
										<span className="flex items-center gap-3">
											<span className="text-xs text-gray-500 tabular-nums">
												{pct}%
											</span>
											<span className="font-semibold tabular-nums">
												{formatNumber(c.count)}
											</span>
										</span>
									</div>
									<div className="mt-2 h-1.5 rounded bg-gray-100">
										<div
											className="h-1.5 rounded bg-blue-500"
											style={{ width: `${pct}%` }}
										/>
									</div>
								</li>
							);
						})
					)}
				</ul>
			</CardContent>
		</Card>
	);
}
