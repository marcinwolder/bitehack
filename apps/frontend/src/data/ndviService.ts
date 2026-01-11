import { apiFetch } from "./apiClient";
import type { NdviPoint } from "../screens/Dashboard/types";

type NdviPointResponse = {
	date: string;
	ndvi: number;
};

const HISTORICAL_DAYS = 7;
const FORECAST_DAYS = 14;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const parseDateMs = (value: string) => new Date(`${value}T00:00:00Z`).getTime();

const buildDateWindow = (historicalDays: number, forecastDays: number) => {
	const totalDays = historicalDays + forecastDays;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const start = new Date(today);
	start.setDate(today.getDate() - (historicalDays - 1));
	return Array.from({ length: totalDays }, (_, index) => {
		const date = new Date(start.getTime() + index * MS_IN_DAY);
		return toIsoDate(date);
	});
};

const interpolateNdviSeries = (points: NdviPointResponse[]) => {
	if (points.length === 0) {
		return [];
	}
	const windowDates = buildDateWindow(HISTORICAL_DAYS, FORECAST_DAYS);
	const windowStart = parseDateMs(windowDates[0]);
	const windowEnd = parseDateMs(windowDates[windowDates.length - 1]);
	const sortedPoints = points
		.map((point) => ({
			date: point.date,
			value: point.ndvi,
			ms: parseDateMs(point.date),
		}))
		.filter((point) => !Number.isNaN(point.ms))
		.filter((point) => point.ms >= windowStart && point.ms <= windowEnd)
		.sort((a, b) => a.ms - b.ms);
	if (sortedPoints.length === 0) {
		return [];
	}
	const valueByDate = new Map(
		sortedPoints.map((point) => [point.date, point.value])
	);
	return windowDates.map((date, index) => {
		const existingValue = valueByDate.get(date);
		const targetMs = parseDateMs(date);
		if (existingValue !== undefined) {
			return {
				date,
				value: clamp(existingValue, 0, 1),
				isForecast: index >= HISTORICAL_DAYS,
			};
		}
		let previous = null as null | { value: number; ms: number };
		let next = null as null | { value: number; ms: number };
		for (const point of sortedPoints) {
			if (point.ms <= targetMs) {
				previous = point;
			}
			if (point.ms >= targetMs) {
				next = point;
				break;
			}
		}
		let interpolated = 0;
		if (previous && next && previous.ms !== next.ms) {
			const ratio = (targetMs - previous.ms) / (next.ms - previous.ms);
			interpolated =
				previous.value + ratio * (next.value - previous.value);
		} else if (previous) {
			interpolated = previous.value;
		} else if (next) {
			interpolated = next.value;
		}
		return {
			date,
			value: clamp(interpolated, 0, 1),
			isForecast: index >= HISTORICAL_DAYS,
		};
	});
};

export type NdviService = {
	getScore: (farmId: number, signal?: AbortSignal) => Promise<number>;
	getSeries: (farmId: number, signal?: AbortSignal) => Promise<NdviPoint[]>;
};

export const createNdviService = (): NdviService => ({
	async getScore(farmId, signal) {
		const response = await apiFetch(`/api/farms/${farmId}/ndvi`, {
			signal,
		});
		return (await response.json()) as number;
	},
	async getSeries(farmId, signal) {
		const response = await apiFetch(`/api/farms/${farmId}/ndvi-chart`, {
			signal,
		});
		const data = (await response.json()) as NdviPointResponse[];
		data.forEach((element) => {
			console.log(element.date, element.ndvi);
		});
		return interpolateNdviSeries(data);
	},
});
