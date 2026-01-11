import area from "@turf/area";
import { polygon } from "@turf/helpers";
import type { LatLngTuple } from "./fieldRepository";

export const toLngLatRing = (polygonPoints: LatLngTuple[]) => {
	const ring = polygonPoints.map(([lat, lng]) => [lng, lat]);
	if (ring.length > 0) {
		const [firstLng, firstLat] = ring[0];
		const [lastLng, lastLat] = ring[ring.length - 1];
		if (firstLng !== lastLng || firstLat !== lastLat) {
			ring.push([firstLng, firstLat]);
		}
	}
	return ring;
};

export const toLatLngRing = (coordinates: number[][][]) => {
	const ring = coordinates[0] ?? [];
	const latLngs = ring.map(
		([lng, lat]) => [lat, lng] as LatLngTuple
	);
	if (latLngs.length > 1) {
		const [firstLat, firstLng] = latLngs[0];
		const [lastLat, lastLng] = latLngs[latLngs.length - 1];
		if (firstLat === lastLat && firstLng === lastLng) {
			latLngs.pop();
		}
	}
	return latLngs;
};

export const calculateAreaHa = (polygonPoints: LatLngTuple[]) => {
	if (polygonPoints.length < 3) {
		return 0;
	}
	const ring = toLngLatRing(polygonPoints);
	const poly = polygon([ring]);
	return area(poly) / 10000;
};

export const toGeoJsonPolygon = (polygonPoints: LatLngTuple[]) => ({
	type: "Polygon" as const,
	coordinates: [toLngLatRing(polygonPoints)]
});
