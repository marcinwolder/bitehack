import { MapContainer, Polygon, TileLayer } from "react-leaflet";
import type { Field, LatLngTuple } from "../../data/fieldRepository";
import FitBounds from "./FitBounds";

type FieldMapProps = {
	selectedField: Field;
	mapCenter: LatLngTuple;
	onEdit: () => void;
};

export default function FieldMap({
	selectedField,
	mapCenter,
	onEdit,
}: FieldMapProps) {
	return (
		<section className="flex h-full flex-col rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<div>
					<h2 className="text-lg font-semibold text-stone-800">
						Field map
					</h2>
					<p className="text-sm text-stone-500">
						{selectedField.name} boundaries and location.
					</p>
				</div>
				<button className="btn btn-outline btn-sm" onClick={onEdit}>
					Edit field
				</button>
			</div>
			<div className="h-[420px] flex-1 overflow-hidden rounded-2xl border border-emerald-100 md:h-[640px] xl:h-full">
				<MapContainer
					center={mapCenter}
					zoom={13}
					scrollWheelZoom
					className="h-full w-full"
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<Polygon
						positions={selectedField.polygon}
						pathOptions={{ color: "#0f766e" }}
					/>
					<FitBounds polygonPoints={selectedField.polygon} />
				</MapContainer>
			</div>
		</section>
	);
}
