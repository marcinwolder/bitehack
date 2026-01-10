import type { WeatherChartProps } from "../types";
import { formatShortDate } from "../utils";

export default function WeatherLineChart({ series }: WeatherChartProps) {
	if (series.length < 2) {
		return (
			<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
				Not enough weather data for a chart yet.
			</div>
		);
	}

	const temps = series.map((point) => point.temperature);
	const minTemp = Math.min(...temps);
	const maxTemp = Math.max(...temps);
	const range = Math.max(maxTemp - minTemp, 1);
	const padding = 20;
	const width = 640;
	const height = 240;
	const chartWidth = width - padding * 2;
	const chartHeight = height - padding * 2;

	const toPoint = (value: number, index: number) => {
		const x = padding + (index / (series.length - 1)) * chartWidth;
		const y = padding + (1 - (value - minTemp) / range) * chartHeight;
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
		.map((point, index) => toPoint(point.temperature, index))
		.join(" ");
	const forecastPath = forecast
		.map((point, index) => {
			const absoluteIndex = index + Math.max(splitIndex - 1, 0);
			return toPoint(point.temperature, absoluteIndex);
		})
		.join(" ");
	const midIndex = Math.floor(series.length / 2);

	return (
		<div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold text-stone-800">
						Temperature
					</h3>
					<p className="text-sm text-stone-500">
						Last 7 days vs. next 14 days.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="badge badge-outline border-emerald-200 text-emerald-700">
						Open-Meteo
					</span>
					<span className="badge badge-ghost text-stone-500">°C</span>
				</div>
			</div>
			<div className="mt-4 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
				<svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
					<defs>
						<linearGradient
							id="tempLine"
							x1="0"
							y1="0"
							x2="1"
							y2="1"
						>
							<stop offset="0%" stopColor="#059669" />
							<stop offset="100%" stopColor="#0ea5e9" />
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
						stroke="url(#tempLine)"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					{forecast.length > 1 ? (
						<polyline
							points={forecastPath}
							fill="none"
							stroke="#0ea5e9"
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
				<span>Min {minTemp.toFixed(0)}°C</span>
				<span>Max {maxTemp.toFixed(0)}°C</span>
				<span>Solid = historical, dashed = forecast</span>
			</div>
		</div>
	);
}
