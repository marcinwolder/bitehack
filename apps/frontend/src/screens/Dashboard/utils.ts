import area from "@turf/area";
import centroid from "@turf/centroid";
import { polygon } from "@turf/helpers";
import L from "leaflet";
import type { LatLngTuple } from "../../data/fieldRepository";

export const MOCK_USER_ID = 1;
export const AREA_UNIT = "ha";
export const MIN_AREA_HA = 0.05;
export const WARSAW_CENTER: LatLngTuple = [52.2297, 21.0122];

export const CROP_OPTIONS = [
	"Wheat",
	"Corn (Maize)",
	"Soybeans",
	"Rice",
	"Barley",
	"Oats",
	"Potatoes",
	"Tomatoes",
	"Cotton",
	"Sunflower",
	"Canola (Rapeseed)",
	"Sugarcane",
	"Alfalfa",
	"Other",
];

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

export const calculateAreaHa = (polygonPoints: LatLngTuple[]) => {
	if (polygonPoints.length < 3) {
		return 0;
	}
	const ring = toLngLatRing(polygonPoints);
	const poly = polygon([ring]);
	return area(poly) / 10000;
};

export const getPolygonCentroid = (polygonPoints: LatLngTuple[]) => {
	const ring = toLngLatRing(polygonPoints);
	const poly = polygon([ring]);
	const center = centroid(poly).geometry.coordinates;
	return { lat: center[1], lon: center[0] };
};

export const formatHa = (value: number) => `${value.toFixed(2)} ${AREA_UNIT}`;

export const getNdviTone = (score: number) => {
	if (score >= 0.8) {
		return {
			label: "Excellent",
			accent: "text-emerald-700",
			border: "border-emerald-200",
			background: "from-emerald-50 via-white to-white",
			ring: "bg-emerald-400",
		};
	}
	if (score >= 0.6) {
		return {
			label: "Healthy",
			accent: "text-lime-700",
			border: "border-lime-200",
			background: "from-lime-50 via-white to-white",
			ring: "bg-lime-400",
		};
	}
	if (score >= 0.4) {
		return {
			label: "Moderate",
			accent: "text-amber-700",
			border: "border-amber-200",
			background: "from-amber-50 via-white to-white",
			ring: "bg-amber-400",
		};
	}
	return {
		label: "Low",
		accent: "text-rose-700",
		border: "border-rose-200",
		background: "from-rose-50 via-white to-white",
		ring: "bg-rose-400",
	};
};

export const createId = () => {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `field-${Date.now()}`;
};

export const getPolygonFromFeatureGroup = (
	featureGroup: L.FeatureGroup | null
) => {
	if (!featureGroup) {
		return null;
	}
	let polygonPoints: LatLngTuple[] | null = null;
	featureGroup.eachLayer((layer) => {
		if (polygonPoints || !(layer instanceof L.Polygon)) {
			return;
		}
		const latLngs = layer.getLatLngs();
		const ring = Array.isArray(latLngs[0])
			? (latLngs[0] as L.LatLng[])
			: [];
		polygonPoints = ring.map(
			(latLng) => [latLng.lat, latLng.lng] as LatLngTuple
		);
	});
	return polygonPoints;
};

export const formatShortDate = (value: string) =>
	new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
