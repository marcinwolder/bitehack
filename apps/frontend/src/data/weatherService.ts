export type ForecastDay = {
	date: string;
	minTemp: number;
	maxTemp: number;
	precipitation: number;
};

export type WeatherService = {
	getForecast: (lat: number, lon: number) => Promise<ForecastDay[]>;
};

const buildForecastUrl = (lat: number, lon: number) => {
	const params = new URLSearchParams({
		latitude: lat.toString(),
		longitude: lon.toString(),
		daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
		forecast_days: "14",
		timezone: "auto"
	});
	return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
};

export const createOpenMeteoWeatherService = (): WeatherService => ({
	async getForecast(lat, lon) {
		const response = await fetch(buildForecastUrl(lat, lon));
		if (!response.ok) {
			throw new Error("Weather request failed");
		}
		const data = await response.json();
		if (!data?.daily?.time) {
			return [];
		}
		return data.daily.time.map((date: string, index: number) => ({
			date,
			minTemp: data.daily.temperature_2m_min?.[index] ?? 0,
			maxTemp: data.daily.temperature_2m_max?.[index] ?? 0,
			precipitation: data.daily.precipitation_sum?.[index] ?? 0
		}));
	}
});
