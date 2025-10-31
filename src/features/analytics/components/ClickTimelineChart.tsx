import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import type { ClicksByDate } from "@/shared/types";
import { formatNumber } from "@/shared/utils/formatNumber";

interface ClickTimelineChartProps {
	data: ClicksByDate[];
}

export function ClickTimelineChart({ data }: ClickTimelineChartProps) {
	return (
		<Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
			<CardHeader>
				<CardTitle className="text-gray-800 drop-shadow">
					Clicks Over Time
				</CardTitle>
			</CardHeader>
			<CardContent>
				{!data || data.length === 0 ? (
					<p className="text-sm text-gray-600">No click data available</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{data.map((d) => (
							<div
								key={d.date}
								className="flex items-center justify-between border rounded p-3"
							>
								<span className="text-gray-600">
									{new Date(d.date).toLocaleDateString()}
								</span>
								<span className="font-semibold">{formatNumber(d.count)}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
