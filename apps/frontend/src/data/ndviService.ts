import { apiFetch } from "./apiClient";
import type { NdviPoint } from "../screens/Dashboard/types";

type NdviPointResponse = {
	date: string;
	value: number;
	is_forecast: boolean;
};

export type NdviService = {
	getScore: (farmId: number, signal?: AbortSignal) => Promise<number>;
	getSeries: (farmId: number, signal?: AbortSignal) => Promise<NdviPoint[]>;
};

export const createNdviService = (): NdviService => ({
	async getScore(farmId, signal) {
		const response = await apiFetch(`/api/farms/${farmId}/ndvi`, {
			signal
		});
		return (await response.json()) as number;
	},
	async getSeries(farmId, signal) {
		const response = await apiFetch(`/api/farms/${farmId}/ndvi-series`, {
			signal
		});
		const data = (await response.json()) as NdviPointResponse[];
		return data.map((point) => ({
			date: point.date,
			value: point.value,
			isForecast: point.is_forecast
		}));
	}
});
