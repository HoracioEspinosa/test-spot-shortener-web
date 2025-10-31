import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import type { TopReferrer } from "@/shared/types";
import { formatNumber } from "@/shared/utils/formatNumber";

interface ReferrerListProps {
	data: TopReferrer[];
}

export function ReferrerList({ data }: ReferrerListProps) {
	const sorted = [...data].sort((a, b) => b.count - a.count);
	const total = sorted.reduce((acc, r) => acc + (r.count || 0), 0);

	return (
		<Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
			<CardHeader>
				<CardTitle className="text-gray-800">Top Referrers</CardTitle>
			</CardHeader>
			<CardContent>
				{!data || data.length === 0 ? (
					<p className="text-sm text-gray-600">No referrer data available</p>
				) : (
					<ul>
						{sorted.map((r, idx) => {
							const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
							return (
								<li
									key={`${r.referrer}-${idx}`}
									className={`py-2 ${idx !== sorted.length - 1 ? "border-b border-gray-100" : ""}`}
								>
									<div className="flex items-center justify-between">
										<span
											className="text-gray-700 truncate max-w-[60%]"
											title={r.referrer}
										>
											{r.referrer}
										</span>
										<span className="flex items-center gap-3">
											<span className="text-xs text-gray-500 tabular-nums">
												{pct}%
											</span>
											<span className="font-semibold tabular-nums">
												{formatNumber(r.count)}
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
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
