import { useState } from "react";
import type { WeatherChartProps } from "../types";
import { formatShortDate } from "../utils";

export default function WeatherLineChart({ series }: WeatherChartProps) {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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
	const xAxisY = padding + chartHeight;

	const toPoint = (value: number, index: number) => {
		const x = padding + (index / (series.length - 1)) * chartWidth;
		const y = padding + (1 - (value - minTemp) / range) * chartHeight;
		return { x, y };
	};
	const toPointString = (value: number, index: number) => {
		const point = toPoint(value, index);
		return `${point.x},${point.y}`;
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
		.map((point, index) => toPointString(point.temperature, index))
		.join(" ");
	const forecastPath = forecast
		.map((point, index) => {
			const absoluteIndex = index + Math.max(splitIndex - 1, 0);
			return toPointString(point.temperature, absoluteIndex);
		})
		.join(" ");
	const midIndex = Math.floor(series.length / 2);
	const hoverPoint =
		hoverIndex !== null ? toPoint(series[hoverIndex].temperature, hoverIndex) : null;
	const hoverLabel =
		hoverIndex !== null
			? `${series[hoverIndex].temperature.toFixed(1)}°C`
			: null;
	const hoverLabelWidth =
		hoverLabel !== null ? hoverLabel.length * 7 + 12 : 0;
	const hoverLabelHeight = 20;
	const hoverDateLabel =
		hoverIndex !== null ? formatShortDate(series[hoverIndex].date) : null;
	const hoverDateLabelWidth =
		hoverDateLabel !== null ? hoverDateLabel.length * 7 + 12 : 0;
	const hoverDateLabelHeight = 18;

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
			<div className="mt-4 aspect-[8/3] overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
				<svg
					viewBox={`0 0 ${width} ${height}`}
					preserveAspectRatio="xMidYMid meet"
					className="h-full w-full"
					onMouseLeave={() => setHoverIndex(null)}
					onMouseMove={(event) => {
						const bounds = event.currentTarget.getBoundingClientRect();
						const x = event.clientX - bounds.left;
						const svgX = (x / bounds.width) * width;
						const ratio = (svgX - padding) / chartWidth;
						const nextIndex = Math.min(
							series.length - 1,
							Math.max(0, Math.round(ratio * (series.length - 1)))
						);
						setHoverIndex(nextIndex);
					}}
				>
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
					{hoverPoint && hoverLabel ? (
						<g>
							<line
								x1={hoverPoint.x}
								y1={hoverPoint.y}
								x2={hoverPoint.x}
								y2={xAxisY}
								stroke="#a7f3d0"
								strokeWidth="1.5"
								strokeDasharray="4 4"
							/>
							<circle
								cx={hoverPoint.x}
								cy={hoverPoint.y}
								r="5"
								fill="#ffffff"
								stroke="#059669"
								strokeWidth="2"
							/>
							<rect
								x={Math.min(
									Math.max(hoverPoint.x + 10, 6),
									width - hoverLabelWidth - 6
								)}
								y={Math.max(hoverPoint.y - hoverLabelHeight - 6, 6)}
								width={hoverLabelWidth}
								height={hoverLabelHeight}
								rx="6"
								fill="#ffffff"
								stroke="#d1fae5"
							/>
							<text
								x={Math.min(
									Math.max(hoverPoint.x + 10, 6),
									width - hoverLabelWidth - 6
								) + hoverLabelWidth / 2}
								y={Math.max(hoverPoint.y - hoverLabelHeight - 6, 6) + 14}
								textAnchor="middle"
								fontSize="11"
								fill="#065f46"
							>
								{hoverLabel}
							</text>
							{hoverDateLabel ? (
								<g>
									<rect
										x={Math.min(
											Math.max(hoverPoint.x - hoverDateLabelWidth / 2, 6),
											width - hoverDateLabelWidth - 6
										)}
										y={Math.min(
											xAxisY + 4,
											height - hoverDateLabelHeight - 2
										)}
										width={hoverDateLabelWidth}
										height={hoverDateLabelHeight}
										rx="6"
										fill="#ffffff"
										stroke="#d1fae5"
									/>
									<text
										x={Math.min(
											Math.max(hoverPoint.x - hoverDateLabelWidth / 2, 6),
											width - hoverDateLabelWidth - 6
										) + hoverDateLabelWidth / 2}
										y={
											Math.min(
												xAxisY + 4,
												height - hoverDateLabelHeight - 2
											) + 12
										}
										textAnchor="middle"
										fontSize="10"
										fill="#065f46"
									>
										{hoverDateLabel}
									</text>
								</g>
							) : null}
						</g>
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
