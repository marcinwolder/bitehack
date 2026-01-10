import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

type MapDrawControlsProps = {
	featureGroup: L.FeatureGroup | null;
	allowDraw: boolean;
	allowEdit: boolean;
	layerSignature: string;
	onCreated: (event: L.LeafletEvent) => void;
	onEdited: (event: L.DrawEvents.Edited) => void;
};

export default function MapDrawControls({
	featureGroup,
	allowDraw,
	allowEdit,
	layerSignature,
	onCreated,
	onEdited,
}: MapDrawControlsProps) {
	const map = useMap();

	useEffect(() => {
		if (!featureGroup) {
			return;
		}

		const control = new L.Control.Draw({
			position: "topright",
			draw: {
				polygon: allowDraw
					? {
							allowIntersection: false,
							showArea: false,
							shapeOptions: { color: "#16a34a" },
					  }
					: false,
				polyline: false,
				rectangle: false,
				circle: false,
				marker: false,
				circlemarker: false,
			},
			edit: {
				featureGroup,
				edit: allowEdit ? {} : false,
				remove: false,
			},
		});

		map.addControl(control);
		map.on(L.Draw.Event.CREATED, onCreated);
		map.on(L.Draw.Event.EDITED, onEdited);

		return () => {
			map.off(L.Draw.Event.CREATED, onCreated);
			map.off(L.Draw.Event.EDITED, onEdited);
			map.removeControl(control);
		};
	}, [
		allowDraw,
		allowEdit,
		featureGroup,
		layerSignature,
		map,
		onCreated,
		onEdited,
	]);

	return null;
}
