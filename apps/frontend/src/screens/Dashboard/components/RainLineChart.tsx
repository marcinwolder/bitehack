import type { RainChartProps } from "../types";
import { formatShortDate } from "../utils";

export default function RainLineChart({ series }: RainChartProps) {
	if (series.length < 2) {
		return (
			<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
				Not enough rain data for a chart yet.
			</div>
		);
	}

	const values = series.map((point) => point.precipitation);
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const range = Math.max(maxValue - minValue, 1);
	const padding = 20;
	const width = 640;
	const height = 240;
	const chartWidth = width - padding * 2;
	const chartHeight = height - padding * 2;

	const toPoint = (value: number, index: number) => {
		const x = padding + (index / (series.length - 1)) * chartWidth;
		const y = padding + (1 - (value - minValue) / range) * chartHeight;
		return `${x},${y}`;
	};

	const firstForecastIndex = series.findIndex((point) => point.isForecast);
	const splitIndex =
		firstForecastIndex === -1 ? series.length : firstForecastIndex;
	const historical = series.slice(0, splitIndex);
	const forecast =
		firstForecastIndex === -1
			? []
			: series.slice(Math.max(splitIndex - 1, 0));
	const historicalPath = historical
		.map((point, index) => toPoint(point.precipitation, index))
		.join(" ");
	const forecastPath = forecast
		.map((point, index) => {
			const absoluteIndex = index + Math.max(splitIndex - 1, 0);
			return toPoint(point.precipitation, absoluteIndex);
		})
		.join(" ");
	const midIndex = Math.floor(series.length / 2);

	return (
		<div className="rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold text-stone-800">
						Rainfall
					</h3>
					<p className="text-sm text-stone-500">
						Last 7 days vs. next 14 days.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="badge badge-outline border-sky-200 text-sky-700">
						Open-Meteo
					</span>
					<span className="badge badge-ghost text-stone-500">mm</span>
				</div>
			</div>
			<div className="mt-4 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
				<svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
					<defs>
						<linearGradient
							id="rainLine"
							x1="0"
							y1="0"
							x2="1"
							y2="1"
						>
							<stop offset="0%" stopColor="#0ea5e9" />
							<stop offset="100%" stopColor="#38bdf8" />
						</linearGradient>
					</defs>
					<rect
						x="0"
						y="0"
						width={width}
						height={height}
						fill="#f8fafc"
					/>
					<polyline
						points={historicalPath}
						fill="none"
						stroke="url(#rainLine)"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					{forecast.length > 1 ? (
						<polyline
							points={forecastPath}
							fill="none"
							stroke="#38bdf8"
							strokeWidth="3"
							strokeDasharray="6 6"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					) : null}
				</svg>
			</div>
			<div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
				<span>{formatShortDate(series[0].date)}</span>
				<span>{formatShortDate(series[midIndex].date)}</span>
				<span>{formatShortDate(series[series.length - 1].date)}</span>
			</div>
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
				<span>Min {minValue.toFixed(1)} mm</span>
				<span>Max {maxValue.toFixed(1)} mm</span>
				<span>Solid = historical, dashed = forecast</span>
			</div>
		</div>
	);
}
