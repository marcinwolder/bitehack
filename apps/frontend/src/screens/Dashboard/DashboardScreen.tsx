import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { FeatureGroup, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import area from "@turf/area";
import centroid from "@turf/centroid";
import { polygon } from "@turf/helpers";
import { useFieldRepository } from "../../data/fieldRepositoryContext";
import type { Field, LatLngTuple } from "../../data/fieldRepository";
import { createOpenMeteoWeatherService } from "../../data/weatherService";
import type { ForecastDay } from "../../data/weatherService";
import { getMockCropStatus, getMockHealthScore } from "../../data/mockCropMetrics";

const MOCK_USER_ID = 1;
const AREA_UNIT = "ha";
const MIN_AREA_HA = 0.05;

const CROP_OPTIONS = [
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
	"Other"
];

type DraftField = {
	name: string;
	crop: string;
	polygon: LatLngTuple[];
	area: number;
};

type EditFieldDraft = {
	name: string;
	crop: string;
	area: string;
};

const toLngLatRing = (polygonPoints: LatLngTuple[]) => {
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

const calculateAreaHa = (polygonPoints: LatLngTuple[]) => {
	if (polygonPoints.length < 3) {
		return 0;
	}
	const ring = toLngLatRing(polygonPoints);
	const poly = polygon([ring]);
	return area(poly) / 10000;
};

const getPolygonCentroid = (polygonPoints: LatLngTuple[]) => {
	const ring = toLngLatRing(polygonPoints);
	const poly = polygon([ring]);
	const center = centroid(poly).geometry.coordinates;
	return { lat: center[1], lon: center[0] };
};

const formatHa = (value: number) => `${value.toFixed(2)} ${AREA_UNIT}`;

const createId = () => {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `field-${Date.now()}`;
};

type MapDrawControlsProps = {
	featureGroupRef: MutableRefObject<L.FeatureGroup | null>;
	allowDraw: boolean;
	allowEdit: boolean;
	onCreated: (event: L.LeafletEvent) => void;
	onEdited: (event: L.DrawEvents.Edited) => void;
	onDeleted: (event: L.DrawEvents.Deleted) => void;
};

function MapDrawControls({
	featureGroupRef,
	allowDraw,
	allowEdit,
	onCreated,
	onEdited,
	onDeleted
}: MapDrawControlsProps) {
	const map = useMap();

	useEffect(() => {
		if (!featureGroupRef.current) {
			return;
		}

		const control = new L.Control.Draw({
			position: "topright",
			draw: {
				polygon: allowDraw
					? {
							allowIntersection: false,
							showArea: false,
							shapeOptions: { color: "#16a34a" }
						}
					: false,
				polyline: false,
				rectangle: false,
				circle: false,
				marker: false,
				circlemarker: false
			},
			edit: {
				featureGroup: featureGroupRef.current,
				edit: allowEdit ? {} : false,
				remove: allowEdit ? {} : false
			}
		});

		map.addControl(control);
		map.on(L.Draw.Event.CREATED, onCreated);
		map.on(L.Draw.Event.EDITED, onEdited);
		map.on(L.Draw.Event.DELETED, onDeleted);

		return () => {
			map.off(L.Draw.Event.CREATED, onCreated);
			map.off(L.Draw.Event.EDITED, onEdited);
			map.off(L.Draw.Event.DELETED, onDeleted);
			map.removeControl(control);
		};
	}, [allowDraw, allowEdit, featureGroupRef, map, onCreated, onDeleted, onEdited]);

	return null;
}

export default function DashboardScreen() {
	const repository = useFieldRepository();
	const weatherService = useMemo(() => createOpenMeteoWeatherService(), []);
	const [fields, setFields] = useState<Field[]>([]);
	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
	const [draftField, setDraftField] = useState<DraftField | null>(null);
	const [draftError, setDraftError] = useState<string | null>(null);
	const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
	const [forecastStatus, setForecastStatus] = useState<"idle" | "loading" | "error">(
		"idle"
	);
	const [editDraft, setEditDraft] = useState<EditFieldDraft | null>(null);
	const featureGroupRef = useRef<L.FeatureGroup | null>(null);
	const isDrafting = Boolean(draftField);

	useEffect(() => {
		repository.list(MOCK_USER_ID).then(setFields);
	}, [repository]);

	useEffect(() => {
		if (!featureGroupRef.current) {
			return;
		}
		const featureGroup = featureGroupRef.current;
		featureGroup.clearLayers();
		fields.forEach((field) => {
			const polygonLayer = L.polygon(field.polygon, {
				color: field.id === selectedFieldId ? "#0f766e" : "#16a34a",
				weight: field.id === selectedFieldId ? 3 : 2,
				fillOpacity: 0.2
			});
			(polygonLayer as L.Polygon & { fieldId?: string }).fieldId = field.id;
			polygonLayer.on("click", () => {
				setSelectedFieldId(field.id);
			});
			featureGroup.addLayer(polygonLayer);
		});
		if (draftField) {
			const draftLayer = L.polygon(draftField.polygon, {
				color: "#f59e0b",
				weight: 2,
				fillOpacity: 0.15,
				dashArray: "6 6"
			});
			featureGroup.addLayer(draftLayer);
		}
	}, [fields, selectedFieldId, draftField]);

	const selectedField = fields.find((field) => field.id === selectedFieldId) ?? null;

	useEffect(() => {
		if (!selectedField) {
			setForecast(null);
			setForecastStatus("idle");
			return;
		}
		const { lat, lon } = getPolygonCentroid(selectedField.polygon);
		const controller = new AbortController();
		setForecastStatus("loading");
		weatherService
			.getForecast(lat, lon)
			.then((data) => {
				if (!controller.signal.aborted) {
					setForecast(data);
					setForecastStatus("idle");
				}
			})
			.catch(() => {
				if (!controller.signal.aborted) {
					setForecast(null);
					setForecastStatus("error");
				}
			});
		return () => controller.abort();
	}, [selectedField, weatherService]);

	useEffect(() => {
		if (!selectedField) {
			setEditDraft(null);
			return;
		}
		setEditDraft({
			name: selectedField.name,
			crop: selectedField.crop,
			area: selectedField.area.toFixed(2)
		});
	}, [selectedField]);

	const resetDraft = () => {
		setDraftField(null);
		setDraftError(null);
	};

	const handleCreated = (event: L.LeafletEvent) => {
		const layer = (event as L.DrawEvents.Created).layer;
		if (!layer || !(layer instanceof L.Polygon)) {
			return;
		}
		const latLngs = layer.getLatLngs();
		const ring = Array.isArray(latLngs[0]) ? (latLngs[0] as L.LatLng[]) : [];
		const points = ring.map((latLng) => [latLng.lat, latLng.lng] as LatLngTuple);
		layer.remove();
		const calculatedArea = calculateAreaHa(points);
		if (calculatedArea < MIN_AREA_HA) {
			setDraftError("Polygon is too small. Try a larger field area.");
			return;
		}
		setDraftField({
			name: "",
			crop: "",
			polygon: points,
			area: calculatedArea
		});
		setDraftError(null);
		setSelectedFieldId(null);
	};

	const handleEdited = async (event: L.DrawEvents.Edited) => {
		const layers = event.layers;
		const updatedFields: Field[] = [];
		layers.eachLayer((layer) => {
			if (!(layer instanceof L.Polygon)) {
				return;
			}
			const fieldId = (layer as L.Polygon & { fieldId?: string }).fieldId;
			if (!fieldId) {
				return;
			}
			const latLngs = layer.getLatLngs();
			const ring = Array.isArray(latLngs[0]) ? (latLngs[0] as L.LatLng[]) : [];
			const points = ring.map((latLng) => [latLng.lat, latLng.lng] as LatLngTuple);
			const nextArea = calculateAreaHa(points);
			const existing = fields.find((field) => field.id === fieldId);
			if (!existing) {
				return;
			}
			updatedFields.push({
				...existing,
				polygon: points,
				area: nextArea,
				updatedAt: new Date().toISOString()
			});
		});
		if (updatedFields.length === 0) {
			return;
		}
		await Promise.all(updatedFields.map((field) => repository.update(field)));
		setFields((prev) =>
			prev.map((field) => updatedFields.find((item) => item.id === field.id) ?? field)
		);
	};

	const handleDeleted = async (event: L.DrawEvents.Deleted) => {
		const layers = event.layers;
		const removedIds: string[] = [];
		layers.eachLayer((layer) => {
			const fieldId = (layer as L.Polygon & { fieldId?: string }).fieldId;
			if (fieldId) {
				removedIds.push(fieldId);
			}
		});
		if (removedIds.length === 0) {
			return;
		}
		await Promise.all(removedIds.map((id) => repository.remove(id, MOCK_USER_ID)));
		setFields((prev) => prev.filter((field) => !removedIds.includes(field.id)));
		if (selectedFieldId && removedIds.includes(selectedFieldId)) {
			setSelectedFieldId(null);
		}
	};

	const handleSaveDraft = async () => {
		if (!draftField) {
			return;
		}
		if (!draftField.name.trim()) {
			setDraftError("Field name is required.");
			return;
		}
		if (!draftField.crop) {
			setDraftError("Select a crop for this field.");
			return;
		}
		if (draftField.area < MIN_AREA_HA) {
			setDraftError("Field size must be at least 0.05 ha.");
			return;
		}
		const now = new Date().toISOString();
		const newField: Field = {
			id: createId(),
			userId: MOCK_USER_ID,
			name: draftField.name.trim(),
			crop: draftField.crop,
			polygon: draftField.polygon,
			area: draftField.area,
			areaUnit: "ha",
			createdAt: now,
			updatedAt: now
		};
		await repository.create(newField);
		setFields((prev) => [...prev, newField]);
		resetDraft();
		setSelectedFieldId(newField.id);
	};

	const handleUpdateSelected = async () => {
		if (!selectedField || !editDraft) {
			return;
		}
		const parsedArea = Number.parseFloat(editDraft.area);
		if (!editDraft.name.trim()) {
			return;
		}
		if (!editDraft.crop) {
			return;
		}
		if (Number.isNaN(parsedArea) || parsedArea < MIN_AREA_HA) {
			return;
		}
		const updatedField: Field = {
			...selectedField,
			name: editDraft.name.trim(),
			crop: editDraft.crop,
			area: parsedArea,
			updatedAt: new Date().toISOString()
		};
		await repository.update(updatedField);
		setFields((prev) => prev.map((field) => (field.id === updatedField.id ? updatedField : field)));
		setSelectedFieldId(updatedField.id);
	};

	const handleRemoveField = async (fieldId: string) => {
		await repository.remove(fieldId, MOCK_USER_ID);
		setFields((prev) => prev.filter((field) => field.id !== fieldId));
		if (selectedFieldId === fieldId) {
			setSelectedFieldId(null);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-white text-stone-900">
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-10">
				<header className="flex flex-col gap-2">
					<span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
						Farm Dashboard
					</span>
					<h1 className="font-display text-4xl text-stone-900 sm:text-5xl">
						Fields, forecasts, and crop health at a glance.
					</h1>
					<p className="max-w-2xl text-base text-stone-600">
						Draw field boundaries, log your crop, and keep a 14-day weather pulse with instant
						status snapshots.
					</p>
				</header>

				<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
					<div className="rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
						<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
							<div>
								<h2 className="text-lg font-semibold text-stone-800">Field map</h2>
								<p className="text-sm text-stone-500">
									Click corners to draw a polygon. Finish to add field details.
								</p>
							</div>
							<span className="badge badge-outline border-emerald-200 text-emerald-700">
								{fields.length} fields
							</span>
						</div>
						<div className="h-[360px] overflow-hidden rounded-2xl border border-emerald-100 md:h-[520px]">
							<MapContainer
								center={[51.505, -0.09]}
								zoom={13}
								scrollWheelZoom
								className="h-full w-full"
							>
								<TileLayer
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								<FeatureGroup ref={featureGroupRef} />
								<MapDrawControls
									featureGroupRef={featureGroupRef}
									allowDraw={!isDrafting}
									allowEdit={!isDrafting}
									onCreated={handleCreated}
									onEdited={handleEdited}
									onDeleted={handleDeleted}
								/>
							</MapContainer>
						</div>
						{draftField ? (
							<p className="mt-3 text-sm text-emerald-700">
								Draft field ready. Fill out details to save or discard.
							</p>
						) : null}
						{draftError ? (
							<p className="mt-3 text-sm text-red-600">{draftError}</p>
						) : null}
					</div>

					<div className="flex flex-col gap-6">
						<section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
							<h2 className="text-lg font-semibold text-stone-800">Your fields</h2>
							<div className="mt-4 flex flex-col gap-3">
								{fields.length === 0 ? (
									<p className="text-sm text-stone-500">
										No fields yet. Draw a polygon to get started.
									</p>
								) : (
									fields.map((field) => (
										<div
											key={field.id}
											className={`rounded-2xl border p-3 ${
												field.id === selectedFieldId
													? "border-emerald-300 bg-emerald-50"
													: "border-stone-100 bg-white"
											}`}
										>
											<button
												type="button"
												onClick={() => setSelectedFieldId(field.id)}
												className="flex w-full items-start justify-between gap-3 text-left"
											>
												<div>
													<p className="text-sm font-semibold text-stone-800">{field.name}</p>
													<p className="text-xs text-stone-500">{field.crop}</p>
												</div>
												<span className="text-xs font-semibold text-emerald-700">
													{formatHa(field.area)}
												</span>
											</button>
											<div className="mt-2 flex items-center justify-between text-xs text-stone-500">
												<span>Updated {new Date(field.updatedAt).toLocaleDateString()}</span>
												<button
													type="button"
													onClick={() => handleRemoveField(field.id)}
													className="text-xs font-semibold text-red-600 hover:text-red-700"
												>
													Remove
												</button>
											</div>
										</div>
									))
								)}
							</div>
						</section>

						<section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
							{draftField ? (
								<div className="flex flex-col gap-4">
									<h2 className="text-lg font-semibold text-stone-800">New field details</h2>
									<label className="form-control">
										<span className="label-text text-sm text-stone-600">Field name</span>
										<input
											className="input input-bordered"
											value={draftField.name}
											onChange={(event) =>
												setDraftField((prev) =>
													prev ? { ...prev, name: event.target.value } : prev
												)
											}
											placeholder="North pasture"
										/>
									</label>
									<label className="form-control">
										<span className="label-text text-sm text-stone-600">Crop</span>
										<select
											className="select select-bordered"
											value={draftField.crop}
											onChange={(event) =>
												setDraftField((prev) =>
													prev ? { ...prev, crop: event.target.value } : prev
												)
											}
										>
											<option value="">Select crop</option>
											{CROP_OPTIONS.map((crop) => (
												<option key={crop} value={crop}>
													{crop}
												</option>
											))}
										</select>
									</label>
									<label className="form-control">
										<span className="label-text text-sm text-stone-600">Field size</span>
										<div className="flex items-center gap-2">
											<input
												type="number"
												step="0.01"
												className="input input-bordered"
												value={draftField.area.toFixed(2)}
												onChange={(event) =>
													setDraftField((prev) =>
														prev
															? {
																	...prev,
																	area: Number.parseFloat(event.target.value || "0")
																}
															: prev
													)
												}
											/>
											<span className="text-sm text-stone-500">{AREA_UNIT}</span>
										</div>
									</label>
									<div className="flex flex-wrap gap-3">
										<button className="btn btn-success" type="button" onClick={handleSaveDraft}>
											Save field
										</button>
										<button className="btn btn-ghost" type="button" onClick={resetDraft}>
											Discard
										</button>
									</div>
								</div>
							) : selectedField && editDraft ? (
								<div className="flex flex-col gap-5">
									<div>
										<h2 className="text-lg font-semibold text-stone-800">Field details</h2>
										<p className="text-sm text-stone-500">
											Update crop info and field size as conditions change.
										</p>
									</div>
									<div className="grid gap-4">
										<label className="form-control">
											<span className="label-text text-sm text-stone-600">Field name</span>
											<input
												className="input input-bordered"
												value={editDraft.name}
												onChange={(event) =>
													setEditDraft((prev) =>
														prev ? { ...prev, name: event.target.value } : prev
													)
												}
											/>
										</label>
										<label className="form-control">
											<span className="label-text text-sm text-stone-600">Crop</span>
											<select
												className="select select-bordered"
												value={editDraft.crop}
												onChange={(event) =>
													setEditDraft((prev) =>
														prev ? { ...prev, crop: event.target.value } : prev
													)
												}
											>
												{CROP_OPTIONS.map((crop) => (
													<option key={crop} value={crop}>
														{crop}
													</option>
												))}
											</select>
										</label>
										<label className="form-control">
											<span className="label-text text-sm text-stone-600">Field size</span>
											<div className="flex items-center gap-2">
												<input
													type="number"
													step="0.01"
													className="input input-bordered"
													value={editDraft.area}
													onChange={(event) =>
														setEditDraft((prev) =>
															prev ? { ...prev, area: event.target.value } : prev
														)
													}
												/>
												<span className="text-sm text-stone-500">{AREA_UNIT}</span>
											</div>
										</label>
										<button className="btn btn-outline" type="button" onClick={handleUpdateSelected}>
											Save updates
										</button>
									</div>
									<div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm text-stone-600">
										<p className="font-semibold text-stone-700">Crop status</p>
										<p className="text-sm text-stone-600">
											{getMockCropStatus(selectedField.id)} · Health score{" "}
											{getMockHealthScore(selectedField.id)}
										</p>
									</div>
								</div>
							) : (
								<div className="flex flex-col gap-2 text-sm text-stone-500">
									<p className="text-base font-semibold text-stone-800">Select a field</p>
									<p>Click a polygon or field card to view weather and crop status.</p>
								</div>
							)}
						</section>
					</div>
				</div>

				<section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-stone-800">14-day forecast</h2>
							<p className="text-sm text-stone-500">
								{selectedField
									? `For ${selectedField.name} (${selectedField.crop}).`
									: "Select a field to load forecast data."}
							</p>
						</div>
						{selectedField ? (
							<span className="badge badge-outline border-amber-200 text-amber-700">
								Open-Meteo
							</span>
						) : null}
					</div>
					<div className="mt-4">
						{forecastStatus === "loading" ? (
							<p className="text-sm text-stone-500">Loading weather data...</p>
						) : forecastStatus === "error" ? (
							<p className="text-sm text-red-600">
								Unable to load forecast. Check your connection and try again.
							</p>
						) : forecast && forecast.length > 0 ? (
							<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
								{forecast.map((day) => (
									<div
										key={day.date}
										className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
									>
										<p className="text-sm font-semibold text-stone-800">
											{new Date(day.date).toLocaleDateString(undefined, {
												weekday: "short",
												month: "short",
												day: "numeric"
											})}
										</p>
										<p className="text-sm text-stone-600">
											{day.minTemp.toFixed(0)}° / {day.maxTemp.toFixed(0)}°C
										</p>
										<p className="text-xs text-stone-500">
											Precipitation {day.precipitation.toFixed(1)} mm
										</p>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-stone-500">
								Forecast data will appear once a field is selected.
							</p>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
