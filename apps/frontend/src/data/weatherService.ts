export type TemperaturePoint = {
	date: string;
	temperature: number;
	isForecast: boolean;
};

export type WeatherService = {
	getTemperatureSeries: (lat: number, lon: number) => Promise<TemperaturePoint[]>;
};

const HISTORICAL_DAYS = 7;
const FORECAST_DAYS = 14;

const buildTemperatureUrl = (lat: number, lon: number) => {
	const params = new URLSearchParams({
		latitude: lat.toString(),
		longitude: lon.toString(),
		daily: "temperature_2m_mean",
		past_days: HISTORICAL_DAYS.toString(),
		forecast_days: FORECAST_DAYS.toString(),
		timezone: "auto"
	});
	return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
};

export const createOpenMeteoWeatherService = (): WeatherService => ({
	async getTemperatureSeries(lat, lon) {
		const response = await fetch(buildTemperatureUrl(lat, lon));
		if (!response.ok) {
			throw new Error("Weather request failed");
		}
		const data = await response.json();
		if (!data?.daily?.time) {
			return [];
		}
		return data.daily.time.map((date: string, index: number) => ({
			date,
			temperature: data.daily.temperature_2m_mean?.[index] ?? 0,
			isForecast: index >= HISTORICAL_DAYS
		}));
	}
});
