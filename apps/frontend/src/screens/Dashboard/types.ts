import type {
	PrecipitationPoint,
	TemperaturePoint,
} from "../../data/weatherService";
import type { LatLngTuple } from "../../data/fieldRepository";

export type DraftField = {
	name: string;
	crop: string;
	polygon: LatLngTuple[];
	area: number;
};

export type EditFieldDraft = {
	name: string;
	crop: string;
	area: string;
};

export type WeatherChartProps = {
	series: TemperaturePoint[];
};

export type RainChartProps = {
	series: PrecipitationPoint[];
};

export type NdviPoint = {
	date: string;
	value: number;
	isForecast: boolean;
};

export type NdviChartProps = {
	series: NdviPoint[];
};

export type SoilMoisturePoint = {
	date: string;
	value: number;
	isForecast: boolean;
};

export type SoilMoistureChartProps = {
	series: SoilMoisturePoint[];
};
