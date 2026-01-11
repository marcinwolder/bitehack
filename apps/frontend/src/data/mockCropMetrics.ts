const STATUS_OPTIONS = [
	"Excellent",
	"Good",
	"Fair",
	"Under stress",
	"Needs attention"
];

const hashId = (value: string | number) => {
	let hash = 0;
	const str = value.toString();
	for (let i = 0; i < str.length; i += 1) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
};

export const getMockCropStatus = (fieldId: string | number) => {
	const hash = hashId(fieldId);
	return STATUS_OPTIONS[hash % STATUS_OPTIONS.length];
};

export const getMockHealthScore = (fieldId: string | number) => {
	const hash = hashId(fieldId);
	return 62 + (hash % 38);
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const buildDateSeries = (historicalDays: number, forecastDays: number) => {
	const today = new Date();
	const total = historicalDays + forecastDays;
	return Array.from({ length: total }, (_, index) => {
		const date = new Date(today);
		date.setDate(today.getDate() - (historicalDays - 1 - index));
		return date.toISOString().slice(0, 10);
	});
};

export const getMockNdviSeries = (fieldId: string | number) => {
	const hash = hashId(fieldId);
	const base = 0.35 + (hash % 45) / 100;
	const drift = ((hash % 17) - 8) / 500;
	const dates = buildDateSeries(7, 14);
	return dates.map((date, index) => {
		const seasonal = Math.sin((index / 20) * Math.PI) * 0.08;
		const noise = (((hash + index * 31) % 100) - 50) / 1000;
		const value = clamp(base + seasonal + drift * index + noise, 0.1, 0.95);
		return {
			date,
			value,
			isForecast: index >= 7
		};
	});
};

export const getMockNdviScore = (fieldId: string | number) => {
	const series = getMockNdviSeries(fieldId);
	const recent = series.slice(4, 7);
	const average = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
	return clamp(Number(average.toFixed(2)), 0, 1);
};

export const getMockSoilMoistureSeries = (fieldId: string | number) => {
	const hash = hashId(`${fieldId}-soil`);
	const base = 0.25 + (hash % 50) / 100;
	const drift = ((hash % 13) - 6) / 600;
	const dates = buildDateSeries(7, 14);
	return dates.map((date, index) => {
		const seasonal = Math.cos((index / 18) * Math.PI) * 0.09;
		const noise = (((hash + index * 23) % 100) - 50) / 1100;
		const value = clamp(base + seasonal + drift * index + noise, 0.1, 0.95);
		return {
			date,
			value,
			isForecast: index >= 7
		};
	});
};
