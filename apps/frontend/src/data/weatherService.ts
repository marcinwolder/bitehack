export type TemperaturePoint = {
	date: string;
	temperature: number;
	isForecast: boolean;
};

export type PrecipitationPoint = {
	date: string;
	precipitation: number;
	isForecast: boolean;
};

export type DailyWeatherSeries = {
	temperature: TemperaturePoint[];
	precipitation: PrecipitationPoint[];
};

export type WeatherService = {
	getDailySeries: (lat: number, lon: number) => Promise<DailyWeatherSeries>;
};

const HISTORICAL_DAYS = 7;
const FORECAST_DAYS = 14;

const buildTemperatureUrl = (lat: number, lon: number) => {
	const params = new URLSearchParams({
		latitude: lat.toString(),
		longitude: lon.toString(),
		daily: "temperature_2m_mean,precipitation_sum",
		past_days: HISTORICAL_DAYS.toString(),
		forecast_days: FORECAST_DAYS.toString(),
		timezone: "auto"
	});
	return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
};

export const createOpenMeteoWeatherService = (): WeatherService => ({
	async getDailySeries(lat, lon) {
		const response = await fetch(buildTemperatureUrl(lat, lon));
		if (!response.ok) {
			throw new Error("Weather request failed");
		}
		const data = await response.json();
		if (!data?.daily?.time) {
			return { temperature: [], precipitation: [] };
		}
		const temperature = data.daily.time.map((date: string, index: number) => ({
			date,
			temperature: data.daily.temperature_2m_mean?.[index] ?? 0,
			isForecast: index >= HISTORICAL_DAYS
		}));
		const precipitation = data.daily.time.map((date: string, index: number) => ({
			date,
			precipitation: data.daily.precipitation_sum?.[index] ?? 0,
			isForecast: index >= HISTORICAL_DAYS
		}));
		return { temperature, precipitation };
	}
});
