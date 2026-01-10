import { useEffect, useMemo, useState } from "react";
import { FeatureGroup, MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import area from "@turf/area";
import centroid from "@turf/centroid";
import { polygon } from "@turf/helpers";
import { useFieldRepository } from "../../data/fieldRepositoryContext";
import type { Field, LatLngTuple } from "../../data/fieldRepository";
import { createOpenMeteoWeatherService } from "../../data/weatherService";
import type { TemperaturePoint } from "../../data/weatherService";
import { getMockCropStatus, getMockHealthScore } from "../../data/mockCropMetrics";

const MOCK_USER_ID = 1;
const AREA_UNIT = "ha";
const MIN_AREA_HA = 0.05;
const WARSAW_CENTER: LatLngTuple = [52.2297, 21.0122];

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

type WeatherChartProps = {
	series: TemperaturePoint[];
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
	featureGroup: L.FeatureGroup | null;
	allowDraw: boolean;
	allowEdit: boolean;
	layerCount: number;
	onCreated: (event: L.LeafletEvent) => void;
	onEdited: (event: L.DrawEvents.Edited) => void;
};

function MapDrawControls({
	featureGroup,
	allowDraw,
	allowEdit,
	layerCount,
	onCreated,
	onEdited
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
				featureGroup,
				edit: allowEdit ? {} : false,
				remove: false
			}
		});

		map.addControl(control);
		map.on(L.Draw.Event.CREATED, onCreated);
		map.on(L.Draw.Event.EDITED, onEdited);

		return () => {
			map.off(L.Draw.Event.CREATED, onCreated);
			map.off(L.Draw.Event.EDITED, onEdited);
			map.removeControl(control);
		};
	}, [allowDraw, allowEdit, featureGroup, layerCount, map, onCreated, onEdited]);

	return null;
}

function FitBounds({ polygonPoints }: { polygonPoints: LatLngTuple[] | null }) {
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

function WeatherLineChart({ series }: WeatherChartProps) {
	if (series.length < 2) {
		return (
			<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
				Not enough weather data for a chart yet.
			</div>
		);
	}

	const temps = series.map((point) => point.temperature);
	const minTemp = Math.min(...temps);
	const maxTemp = Math.max(...temps);
	const range = Math.max(maxTemp - minTemp, 1);
	const padding = 20;
	const width = 640;
	const height = 240;
	const chartWidth = width - padding * 2;
	const chartHeight = height - padding * 2;

	const toPoint = (value: number, index: number) => {
		const x = padding + (index / (series.length - 1)) * chartWidth;
		const y = padding + (1 - (value - minTemp) / range) * chartHeight;
		return `${x},${y}`;
	};

	const firstForecastIndex = series.findIndex((point) => point.isForecast);
	const splitIndex = firstForecastIndex === -1 ? series.length : firstForecastIndex;
	const historical = series.slice(0, splitIndex);
	const forecast = firstForecastIndex === -1 ? [] : series.slice(Math.max(splitIndex - 1, 0));
	const historicalPath = historical.map((point, index) => toPoint(point.temperature, index)).join(" ");
	const forecastPath = forecast
		.map((point, index) => {
			const absoluteIndex = index + Math.max(splitIndex - 1, 0);
			return toPoint(point.temperature, absoluteIndex);
		})
		.join(" ");

	return (
		<div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold text-stone-800">21-day temperature pulse</h3>
					<p className="text-sm text-stone-500">Last 7 days vs. next 14 days.</p>
				</div>
				<span className="badge badge-outline border-emerald-200 text-emerald-700">Open-Meteo</span>
			</div>
			<div className="mt-4 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
				<svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
					<defs>
						<linearGradient id="tempLine" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor="#059669" />
							<stop offset="100%" stopColor="#0ea5e9" />
						</linearGradient>
					</defs>
					<rect x="0" y="0" width={width} height={height} fill="#f8fafc" />
					<polyline
						points={historicalPath}
						fill="none"
						stroke="url(#tempLine)"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					{forecast.length > 1 ? (
						<polyline
							points={forecastPath}
							fill="none"
							stroke="#0ea5e9"
							strokeWidth="3"
							strokeDasharray="6 6"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					) : null}
				</svg>
			</div>
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
				<span>Min {minTemp.toFixed(0)}°C</span>
				<span>Max {maxTemp.toFixed(0)}°C</span>
				<span>Solid = historical, dashed = forecast</span>
			</div>
		</div>
	);
}

export default function DashboardScreen() {
	const repository = useFieldRepository();
	const weatherService = useMemo(() => createOpenMeteoWeatherService(), []);
	const [fields, setFields] = useState<Field[]>([]);
	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
	const [draftField, setDraftField] = useState<DraftField | null>(null);
	const [editDraft, setEditDraft] = useState<EditFieldDraft | null>(null);
	const [draftError, setDraftError] = useState<string | null>(null);
	const [forecast, setForecast] = useState<TemperaturePoint[] | null>(null);
	const [forecastStatus, setForecastStatus] = useState<"idle" | "loading" | "error">(
		"idle"
	);
	const [mapCenter, setMapCenter] = useState<LatLngTuple>(WARSAW_CENTER);
	const [isOverlayOpen, setIsOverlayOpen] = useState(false);
	const [overlayMode, setOverlayMode] = useState<"create" | "edit">("create");
	const [overlayPolygon, setOverlayPolygon] = useState<LatLngTuple[]>([]);
	const [overlayEditEnabled, setOverlayEditEnabled] = useState(false);
	const [overlayFeatureGroup, setOverlayFeatureGroup] = useState<L.FeatureGroup | null>(null);

	useEffect(() => {
		repository.list(MOCK_USER_ID).then(setFields);
	}, [repository]);

	useEffect(() => {
		if (!navigator.geolocation) {
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setMapCenter([position.coords.latitude, position.coords.longitude]);
			},
			() => {
				setMapCenter(WARSAW_CENTER);
			},
			{ enableHighAccuracy: true, timeout: 8000 }
		);
	}, []);

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
			.getTemperatureSeries(lat, lon)
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

	const openCreateOverlay = () => {
		setOverlayMode("create");
		setDraftField({ name: "", crop: "", polygon: [], area: 0 });
		setOverlayPolygon([]);
		setDraftError(null);
		setOverlayEditEnabled(false);
		setIsOverlayOpen(true);
	};

	const openEditOverlay = (field: Field) => {
		if (!field) {
			return;
		}
		setSelectedFieldId(field.id);
		setOverlayMode("edit");
		setOverlayPolygon(field.polygon);
		setEditDraft({
			name: field.name,
			crop: field.crop,
			area: field.area.toFixed(2)
		});
		setDraftError(null);
		setOverlayEditEnabled(true);
		setIsOverlayOpen(true);
	};

	const closeOverlay = () => {
		setIsOverlayOpen(false);
		setDraftError(null);
		setOverlayEditEnabled(false);
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
		setOverlayPolygon(points);
		setDraftField((prev) =>
			prev
				? {
						...prev,
						polygon: points,
						area: calculatedArea
					}
				: prev
		);
		setEditDraft((prev) =>
			prev
				? {
						...prev,
						area: calculatedArea.toFixed(2)
					}
				: prev
		);
		setDraftError(null);
	};

	const handleEdited = (event: L.DrawEvents.Edited) => {
		const layers = event.layers;
		let updatedPolygon: LatLngTuple[] | null = null;
		layers.eachLayer((layer) => {
			if (!(layer instanceof L.Polygon)) {
				return;
			}
			const latLngs = layer.getLatLngs();
			const ring = Array.isArray(latLngs[0]) ? (latLngs[0] as L.LatLng[]) : [];
			updatedPolygon = ring.map((latLng) => [latLng.lat, latLng.lng] as LatLngTuple);
		});
		if (!updatedPolygon) {
			return;
		}
		const nextArea = calculateAreaHa(updatedPolygon);
		setOverlayPolygon(updatedPolygon);
		setDraftField((prev) => (prev ? { ...prev, polygon: updatedPolygon, area: nextArea } : prev));
		setEditDraft((prev) => (prev ? { ...prev, area: nextArea.toFixed(2) } : prev));
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
		if (draftField.polygon.length < 3 || draftField.area < MIN_AREA_HA) {
			setDraftError("Add a valid field polygon before saving.");
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
		setSelectedFieldId(newField.id);
		closeOverlay();
	};

	const handleUpdateSelected = async () => {
		if (!selectedField || !editDraft) {
			return;
		}
		const parsedArea = Number.parseFloat(editDraft.area);
		if (!editDraft.name.trim() || !editDraft.crop) {
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
			polygon: overlayPolygon.length > 0 ? overlayPolygon : selectedField.polygon,
			updatedAt: new Date().toISOString()
		};
		await repository.update(updatedField);
		setFields((prev) => prev.map((field) => (field.id === updatedField.id ? updatedField : field)));
		setSelectedFieldId(updatedField.id);
		closeOverlay();
	};

	const handleRemoveField = async (fieldId: string) => {
		await repository.remove(fieldId, MOCK_USER_ID);
		setFields((prev) => prev.filter((field) => field.id !== fieldId));
		if (selectedFieldId === fieldId) {
			setSelectedFieldId(null);
		}
	};

	const overlayTitle = overlayMode === "create" ? "Add field" : "Update field";
	const overlayCenter = overlayPolygon.length > 0 ? overlayPolygon[0] : mapCenter;

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
						Select a field to unlock a live weather pulse, crop stats, and a clean map view.
					</p>
				</header>

				<section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-stone-800">Your fields</h2>
							<p className="text-sm text-stone-500">
								Select a field to reveal map, forecast, and crop signals.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<span className="badge badge-outline border-emerald-200 text-emerald-700">
								{fields.length} fields
							</span>
							<button className="btn btn-success" type="button" onClick={openCreateOverlay}>
								Add field
							</button>
						</div>
					</div>
					<div className="mt-4 grid gap-3 md:grid-cols-2">
						{fields.length === 0 ? (
							<p className="text-sm text-stone-500">
								No fields yet. Add your first plot to get started.
							</p>
						) : (
							fields.map((field) => (
								<div
									key={field.id}
									className={`rounded-2xl border p-4 transition ${
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
									<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
										<span>Updated {new Date(field.updatedAt).toLocaleDateString()}</span>
										<div className="flex items-center gap-3">
											<button
												type="button"
												onClick={() => {
													openEditOverlay(field);
												}}
												className="font-semibold text-emerald-700 hover:text-emerald-800"
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => handleRemoveField(field.id)}
												className="font-semibold text-red-600 hover:text-red-700"
											>
												Remove
											</button>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</section>

				{selectedField ? (
					<div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
						<section className="rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
							<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
								<div>
									<h2 className="text-lg font-semibold text-stone-800">Field map</h2>
									<p className="text-sm text-stone-500">
										{selectedField.name} boundaries and location.
									</p>
								</div>
								<button
									className="btn btn-outline btn-sm"
									onClick={() => openEditOverlay(selectedField)}
								>
									Edit field
								</button>
							</div>
							<div className="h-[360px] overflow-hidden rounded-2xl border border-emerald-100 md:h-[520px]">
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
									<Polygon positions={selectedField.polygon} pathOptions={{ color: "#0f766e" }} />
									<FitBounds polygonPoints={selectedField.polygon} />
								</MapContainer>
							</div>
						</section>

						<div className="flex flex-col gap-6">
							<section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
								<h2 className="text-lg font-semibold text-stone-800">Field overview</h2>
								<p className="text-sm text-stone-500">
									{selectedField.crop} · {formatHa(selectedField.area)}
								</p>
								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm text-stone-600">
										<p className="font-semibold text-stone-700">Crop status</p>
										<p className="mt-1">
											{getMockCropStatus(selectedField.id)}
										</p>
									</div>
									<div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm text-stone-600">
										<p className="font-semibold text-stone-700">Health score</p>
										<p className="mt-1">{getMockHealthScore(selectedField.id)}</p>
									</div>
								</div>
							</section>

							<section>
								{forecastStatus === "loading" ? (
									<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
										Loading weather data...
									</div>
								) : forecastStatus === "error" ? (
									<div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
										Unable to load forecast. Check your connection and try again.
									</div>
								) : forecast && forecast.length > 0 ? (
									<WeatherLineChart series={forecast} />
								) : (
									<div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-sm text-stone-500">
										Forecast data will appear once a field is selected.
									</div>
								)}
							</section>
						</div>
					</div>
				) : null}
			</div>

			{isOverlayOpen ? (
				<div className="fixed inset-0 z-[1200] flex items-center justify-center bg-stone-900/40 p-4">
					<div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
						<div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-6 py-4">
							<div>
								<h2 className="text-xl font-semibold text-stone-800">{overlayTitle}</h2>
								<p className="text-sm text-stone-500">
									Draw or edit the polygon, then confirm the field details.
								</p>
							</div>
							<button className="btn btn-ghost" onClick={closeOverlay} type="button">
								Close
							</button>
						</div>
						<div className="grid gap-6 px-6 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
							<div className="flex flex-col gap-3">
								<div className="h-[360px] overflow-hidden rounded-2xl border border-emerald-100 md:h-[420px]">
									<MapContainer
										center={overlayCenter}
										zoom={13}
										scrollWheelZoom
										className="h-full w-full"
									>
										<TileLayer
											attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
											url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
										/>
										<FeatureGroup ref={setOverlayFeatureGroup}>
											{overlayPolygon.length > 0 ? (
												<Polygon
													positions={overlayPolygon}
													pathOptions={{ color: "#16a34a", weight: 2, fillOpacity: 0.2 }}
												/>
											) : null}
										</FeatureGroup>
										<MapDrawControls
											featureGroup={overlayFeatureGroup}
											allowDraw={overlayMode === "create"}
											allowEdit={overlayMode === "edit" ? overlayEditEnabled : overlayPolygon.length > 0}
											layerCount={overlayPolygon.length}
											onCreated={handleCreated}
											onEdited={handleEdited}
										/>
										<FitBounds polygonPoints={overlayPolygon} />
									</MapContainer>
								</div>
								{overlayMode === "edit" ? (
									<label className="flex items-center gap-3 text-sm text-stone-600">
										<input
											type="checkbox"
											className="toggle toggle-success"
											checked={overlayEditEnabled}
											onChange={(event) => setOverlayEditEnabled(event.target.checked)}
										/>
										Enable polygon editing
									</label>
								) : (
									<p className="text-sm text-stone-500">
										Click the draw tool to outline a new field polygon.
									</p>
								)}
							</div>
							<div className="flex flex-col gap-4">
								{overlayMode === "create" && draftField ? (
									<div className="flex flex-col gap-4">
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
									</div>
								) : overlayMode === "edit" && editDraft ? (
									<div className="flex flex-col gap-4">
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
									</div>
								) : null}

								{draftError ? <p className="text-sm text-red-600">{draftError}</p> : null}

								<div className="mt-auto flex flex-wrap gap-3">
									{overlayMode === "create" ? (
										<button className="btn btn-success" type="button" onClick={handleSaveDraft}>
											Save field
										</button>
									) : (
										<button
											className="btn btn-outline"
											type="button"
											onClick={handleUpdateSelected}
										>
											Save updates
										</button>
									)}
									<button className="btn btn-ghost" type="button" onClick={closeOverlay}>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
