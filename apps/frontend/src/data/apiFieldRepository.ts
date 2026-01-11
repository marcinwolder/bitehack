import type { Field, FieldRepository } from "./fieldRepository";
import { apiFetch } from "./apiClient";
import { calculateAreaHa, toGeoJsonPolygon, toLatLngRing } from "./geoUtils";

type FarmResponse = {
	id: number;
	user_id: number;
	name: string;
	crop: string;
	area: {
		type: "Polygon";
		coordinates: number[][][];
	};
};

const toField = (farm: FarmResponse): Field => {
	const polygon = toLatLngRing(farm.area.coordinates);
	const area = calculateAreaHa(polygon);
	const now = new Date().toISOString();
	return {
		id: farm.id,
		userId: farm.user_id,
		name: farm.name,
		crop: farm.crop,
		polygon,
		area,
		areaUnit: "ha",
		createdAt: now,
		updatedAt: now
	};
};

const toFarmPayload = (field: Field) => ({
	name: field.name,
	crop: field.crop,
	area: toGeoJsonPolygon(field.polygon)
});

export const createApiFieldRepository = (): FieldRepository => ({
	async list(_userId) {
		const response = await apiFetch("/api/farms");
		const data = (await response.json()) as FarmResponse[];
		return data.map(toField);
	},
	async create(field) {
		const response = await apiFetch("/api/farms", {
			method: "POST",
			body: JSON.stringify(toFarmPayload(field))
		});
		const data = (await response.json()) as FarmResponse;
		return toField(data);
	},
	async update(field) {
		const response = await apiFetch(`/api/farms/${field.id}`, {
			method: "PUT",
			body: JSON.stringify(toFarmPayload(field))
		});
		const data = (await response.json()) as FarmResponse;
		return toField(data);
	},
	async remove(id, _userId) {
		await apiFetch(`/api/farms/${id}`, { method: "DELETE" });
	}
});
