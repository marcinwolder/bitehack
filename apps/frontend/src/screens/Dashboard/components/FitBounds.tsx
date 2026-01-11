import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngTuple } from "../../../data/fieldRepository";

type FitBoundsProps = {
	polygonPoints: LatLngTuple[] | null;
};

export default function FitBounds({ polygonPoints }: FitBoundsProps) {
	const map = useMap();

	useEffect(() => {
		if (!polygonPoints || polygonPoints.length === 0) {
			return;
		}
		const bounds = L.latLngBounds(polygonPoints);
		map.fitBounds(bounds, { padding: [24, 24] });
	}, [map, polygonPoints]);

	return null;
}
