import type { DailyWeatherSeries } from "../../data/weatherService";
import RainLineChart from "./RainLineChart";
import WeatherLineChart from "./WeatherLineChart";

type WeatherPanelsProps = {
	forecastStatus: "idle" | "loading" | "error";
	weatherSeries: DailyWeatherSeries | null;
};

export default function WeatherPanels({
	forecastStatus,
	weatherSeries,
}: WeatherPanelsProps) {
	const temperaturePanel =
		forecastStatus === "loading" ? (
			<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
				Loading weather data...
			</div>
		) : forecastStatus === "error" ? (
			<div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
				Unable to load forecast. Check your connection and try again.
			</div>
		) : weatherSeries && weatherSeries.temperature.length > 0 ? (
			<WeatherLineChart series={weatherSeries.temperature} />
		) : (
			<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
				Forecast data will appear once a field is selected.
			</div>
		);
	const rainPanel =
		forecastStatus === "loading" ? (
			<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
				Loading weather data...
			</div>
		) : forecastStatus === "error" ? (
			<div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
				Unable to load forecast. Check your connection and try again.
			</div>
		) : weatherSeries && weatherSeries.precipitation.length > 0 ? (
			<RainLineChart series={weatherSeries.precipitation} />
		) : (
			<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
				Rain data will appear once a field is selected.
			</div>
		);

	return (
		<>
			{temperaturePanel}
			{rainPanel}
		</>
	);
}
