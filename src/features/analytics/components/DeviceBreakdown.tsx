import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import type { ClicksByDevice } from "@/shared/types";
import { formatNumber } from "@/shared/utils/formatNumber";

interface DeviceBreakdownProps {
	data: ClicksByDevice[];
}

export function DeviceBreakdown({ data }: DeviceBreakdownProps) {
	const total = Array.isArray(data)
		? data.reduce((acc, d) => acc + (d.count || 0), 0)
		: 0;
	return (
		<Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
			<CardHeader>
				<CardTitle className="text-gray-800 drop-shadow">
					Clicks by Device
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul>
					{!data || data.length === 0 ? (
						<li className="py-2">
							<div className="flex items-center justify-between">
								<span className="text-gray-500">No device data</span>
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
						data.map((d, idx) => {
							const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
							return (
								<li
									key={d.device}
									className={`py-2 ${idx !== data.length - 1 ? "border-b border-gray-100" : ""}`}
								>
									<div className="flex items-center justify-between">
										<span className="text-gray-700 capitalize">{d.device}</span>
										<span className="flex items-center gap-3">
											<span className="text-xs text-gray-500 tabular-nums">
												{pct}%
											</span>
											<span className="font-semibold tabular-nums">
												{formatNumber(d.count)}
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
