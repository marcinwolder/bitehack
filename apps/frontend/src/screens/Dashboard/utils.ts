import centroid from "@turf/centroid";
import L from "leaflet";
import type { LatLngTuple } from "../../data/fieldRepository";
import { calculateAreaHa, toLngLatRing } from "../../data/geoUtils";

export { calculateAreaHa, toLngLatRing };

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

export const getPolygonCentroid = (polygonPoints: LatLngTuple[]) => {
	const ring = toLngLatRing(polygonPoints);
	const center = centroid({ type: "Polygon", coordinates: [ring] }).geometry
		.coordinates;
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

type ChartPoint = { x: number; y: number };

export const buildSmoothPath = (points: ChartPoint[]) => {
	if (points.length === 0) {
		return "";
	}
	if (points.length === 1) {
		return `M ${points[0].x} ${points[0].y}`;
	}
	const fmt = (value: number) => value.toFixed(2);
	let path = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
	for (let i = 0; i < points.length - 1; i += 1) {
		const p0 = points[i - 1] ?? points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[i + 2] ?? p2;
		const c1x = p1.x + (p2.x - p0.x) / 6;
		const c1y = p1.y + (p2.y - p0.y) / 6;
		const c2x = p2.x - (p3.x - p1.x) / 6;
		const c2y = p2.y - (p3.y - p1.y) / 6;
		path += ` C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(
			p2.x
		)} ${fmt(p2.y)}`;
	}
	return path;
};
