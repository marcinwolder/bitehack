import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { useFieldRepository } from "../../data/fieldRepositoryContext";
import type { Field, LatLngTuple } from "../../data/fieldRepository";
import { createOpenMeteoWeatherService } from "../../data/weatherService";
import type { DailyWeatherSeries } from "../../data/weatherService";
import { getMockSoilMoistureSeries } from "../../data/mockCropMetrics";
import { createNdviService } from "../../data/ndviService";
import FieldListPanel from "./components/FieldListPanel";
import FieldMap from "./components/FieldMap";
import FieldOverlayModal from "./components/FieldOverlayModal";
import FieldSummaryPanel from "./components/FieldSummaryPanel";
import WeatherPanels from "./components/WeatherPanels";
import type { DraftField, EditFieldDraft, NdviPoint } from "./types";
import {
	MIN_AREA_HA,
	MOCK_USER_ID,
	WARSAW_CENTER,
	calculateAreaHa,
	getNdviTone,
	getPolygonCentroid,
	getPolygonFromFeatureGroup,
} from "./utils";
import NdviLineChart from "./components/NdviLineChart";
import FieldSectionNav from "./components/FieldSectionNav";
import SoilMoistureLineChart from "./components/SoilMoistureLineChart";
import ChartLoadingCard from "./components/ChartLoadingCard";

const FIELD_SECTION_DEFS = [
	{ id: "section-map", label: "Map" },
	{ id: "section-temperature", label: "Temperature" },
	{ id: "section-rain", label: "Rainfall" },
	{ id: "section-ndvi", label: "NDVI" },
	{ id: "section-ai-model", label: "Soil moisture" },
];

export default function DashboardScreen() {
	const repository = useFieldRepository();
	const weatherService = useMemo(() => createOpenMeteoWeatherService(), []);
	const ndviService = useMemo(() => createNdviService(), []);
	const [fields, setFields] = useState<Field[]>([]);
	const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
	const [draftField, setDraftField] = useState<DraftField | null>(null);
	const [editDraft, setEditDraft] = useState<EditFieldDraft | null>(null);
	const [draftError, setDraftError] = useState<string | null>(null);
	const [weatherSeries, setWeatherSeries] =
		useState<DailyWeatherSeries | null>(null);
	const [forecastStatus, setForecastStatus] = useState<
		"idle" | "loading" | "error"
	>("idle");
	const [mapCenter, setMapCenter] = useState<LatLngTuple>(WARSAW_CENTER);
	const [isOverlayOpen, setIsOverlayOpen] = useState(false);
	const [overlayMode, setOverlayMode] = useState<"create" | "edit">("create");
	const [overlayPolygon, setOverlayPolygon] = useState<LatLngTuple[]>([]);
	const [overlayEditEnabled, setOverlayEditEnabled] = useState(false);
	const [overlayFeatureGroup, setOverlayFeatureGroup] =
		useState<L.FeatureGroup | null>(null);
	const [activeSectionId, setActiveSectionId] = useState(
		FIELD_SECTION_DEFS[0].id
	);
	const [ndviSeries, setNdviSeries] = useState<NdviPoint[]>([]);
	const [ndviScore, setNdviScore] = useState(0);
	const [aiModelStatus, setAiModelStatus] = useState<
		"idle" | "loading" | "error"
	>("idle");
	const overlayPolygonSignature = useMemo(
		() => overlayPolygon.map(([lat, lng]) => `${lat},${lng}`).join("|"),
		[overlayPolygon]
	);

	useEffect(() => {
		repository.list(MOCK_USER_ID).then(setFields);
	}, [repository]);

	useEffect(() => {
		if (selectedFieldId || fields.length === 0) {
			return;
		}
		setSelectedFieldId(fields[0].id);
	}, [fields, selectedFieldId]);

	useEffect(() => {
		if (!navigator.geolocation) {
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setMapCenter([
					position.coords.latitude,
					position.coords.longitude,
				]);
			},
			() => {
				setMapCenter(WARSAW_CENTER);
			},
			{ enableHighAccuracy: true, timeout: 8000 }
		);
	}, []);

	const selectedField =
		fields.find((field) => field.id === selectedFieldId) ?? null;
	const soilMoistureSeries = selectedField
		? getMockSoilMoistureSeries(selectedField.id)
		: [];
	const ndviTone = getNdviTone(ndviScore);
	const isNdviExcellent = ndviScore >= 0.8;
	const aiModelLoading = aiModelStatus === "loading";
	const aiModelError = aiModelStatus === "error";

	useEffect(() => {
		if (!selectedField) {
			setWeatherSeries(null);
			setForecastStatus("idle");
			return;
		}
		const { lat, lon } = getPolygonCentroid(selectedField.polygon);
		const controller = new AbortController();
		setForecastStatus("loading");
		weatherService
			.getDailySeries(lat, lon)
			.then((data) => {
				if (!controller.signal.aborted) {
					setWeatherSeries(data);
					setForecastStatus("idle");
				}
			})
			.catch(() => {
				if (!controller.signal.aborted) {
					setWeatherSeries(null);
					setForecastStatus("error");
				}
			});
		return () => controller.abort();
	}, [selectedField, weatherService]);

	useEffect(() => {
		if (!selectedField) {
			setNdviSeries([]);
			setNdviScore(0);
			setAiModelStatus("idle");
			return;
		}
		const controller = new AbortController();
		setAiModelStatus("loading");
		setNdviSeries([]);
		ndviService
			.getScore(selectedField.id, controller.signal)
			.then((score) => {
				if (!controller.signal.aborted) {
					setNdviScore(score);
					setAiModelStatus("idle");
				}
			})
			.catch(() => {
				if (!controller.signal.aborted) {
					setNdviScore(0);
					setAiModelStatus("error");
				}
			});
		return () => controller.abort();
	}, [ndviService, selectedField]);

	useEffect(() => {
		if (!selectedField) {
			setEditDraft(null);
			return;
		}
		setEditDraft({
			name: selectedField.name,
			crop: selectedField.crop,
			area: selectedField.area.toFixed(2),
		});
	}, [selectedField]);

	useEffect(() => {
		if (selectedField) {
			setActiveSectionId(FIELD_SECTION_DEFS[0].id);
		}
	}, [selectedField]);

	useEffect(() => {
		if (!selectedField) {
			return;
		}
		const ratios = new Map<string, number>();
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					ratios.set(
						entry.target.id,
						entry.isIntersecting ? entry.intersectionRatio : 0
					);
				});
				let nextId = FIELD_SECTION_DEFS[0].id;
				let nextRatio = -1;
				FIELD_SECTION_DEFS.forEach(({ id }) => {
					const ratio = ratios.get(id) ?? 0;
					if (ratio > nextRatio) {
						nextRatio = ratio;
						nextId = id;
					}
				});
				if (nextRatio > 0) {
					setActiveSectionId((prev) =>
						prev === nextId ? prev : nextId
					);
				}
			},
			{
				root: null,
				rootMargin: "-20% 0px -55% 0px",
				threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
			}
		);
		FIELD_SECTION_DEFS.forEach(({ id }) => {
			const element = document.getElementById(id);
			if (element) {
				ratios.set(id, 0);
				observer.observe(element);
			}
		});
		return () => observer.disconnect();
	}, [selectedField]);

	const handleNavigateSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (!element) {
			return;
		}
		element.scrollIntoView({ behavior: "smooth", block: "start" });
	};

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
			area: field.area.toFixed(2),
		});
		setDraftError(null);
		setOverlayEditEnabled(true);
		setIsOverlayOpen(true);
	};

	const closeOverlay = () => {
		setIsOverlayOpen(false);
		setDraftError(null);
		setOverlayEditEnabled(false);
		setOverlayPolygon([]);
		setOverlayFeatureGroup(null);
	};

	const handleCreated = (event: L.LeafletEvent) => {
		const layer = (event as L.DrawEvents.Created).layer;
		if (!layer || !(layer instanceof L.Polygon)) {
			return;
		}
		const latLngs = layer.getLatLngs();
		const ring = Array.isArray(latLngs[0])
			? (latLngs[0] as L.LatLng[])
			: [];
		const points = ring.map(
			(latLng) => [latLng.lat, latLng.lng] as LatLngTuple
		);
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
						area: calculatedArea,
				  }
				: prev
		);
		setEditDraft((prev) =>
			prev
				? {
						...prev,
						area: calculatedArea.toFixed(2),
				  }
				: prev
		);
		setDraftError(null);
	};

	const handleEdited = (event: L.LeafletEvent) => {
		const layers = (event as L.DrawEvents.Edited).layers;
		let updatedPolygon: LatLngTuple[] | null = null;
		layers.eachLayer((layer) => {
			if (!(layer instanceof L.Polygon)) {
				return;
			}
			const latLngs = layer.getLatLngs();
			const ring = Array.isArray(latLngs[0])
				? (latLngs[0] as L.LatLng[])
				: [];
			updatedPolygon = ring.map(
				(latLng) => [latLng.lat, latLng.lng] as LatLngTuple
			);
		});
		if (!updatedPolygon) {
			return;
		}
		const safePolygon = updatedPolygon;
		const nextArea = calculateAreaHa(safePolygon);
		setOverlayPolygon(safePolygon);
		setDraftField((prev) =>
			prev ? { ...prev, polygon: safePolygon, area: nextArea } : prev
		);
		setEditDraft((prev) =>
			prev ? { ...prev, area: nextArea.toFixed(2) } : prev
		);
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
			id: 0,
			userId: MOCK_USER_ID,
			name: draftField.name.trim(),
			crop: draftField.crop,
			polygon: draftField.polygon,
			area: draftField.area,
			areaUnit: "ha",
			createdAt: now,
			updatedAt: now,
		};
		const createdField = await repository.create(newField);
		setFields((prev) => [...prev, createdField]);
		setSelectedFieldId(createdField.id);
		closeOverlay();
	};

	const handleUpdateSelected = async () => {
		if (!selectedField || !editDraft) {
			return;
		}
		if (!editDraft.name.trim()) {
			setDraftError("Field name is required.");
			return;
		}
		if (!editDraft.crop) {
			setDraftError("Select a crop for this field.");
			return;
		}
		const featurePolygon = getPolygonFromFeatureGroup(overlayFeatureGroup);
		const polygonToSave: LatLngTuple[] =
			featurePolygon && Array.isArray(featurePolygon)
				? featurePolygon
				: overlayPolygon.length > 0
				? overlayPolygon
				: selectedField.polygon;
		if (polygonToSave.length < 3) {
			setDraftError("Add a valid field polygon before saving.");
			return;
		}
		const polygonArea = calculateAreaHa(polygonToSave);
		if (polygonArea < MIN_AREA_HA) {
			setDraftError("Polygon is too small. Try a larger field area.");
			return;
		}
		const manualArea = Number.parseFloat(editDraft.area);
		if (!Number.isFinite(manualArea) || manualArea <= 0) {
			setDraftError("Enter a valid field size.");
			return;
		}
		const updatedField: Field = {
			...selectedField,
			name: editDraft.name.trim(),
			crop: editDraft.crop,
			area: manualArea,
			polygon: polygonToSave,
			updatedAt: new Date().toISOString(),
		};
		const savedField = await repository.update(updatedField);
		setFields((prev) =>
			prev.map((field) =>
				field.id === updatedField.id ? savedField : field
			)
		);
		setSelectedFieldId(savedField.id);
		setEditDraft((prev) =>
			prev ? { ...prev, area: manualArea.toFixed(2) } : prev
		);
		setDraftError(null);
		closeOverlay();
	};

	const handleRemoveField = async (fieldId: number) => {
		await repository.remove(fieldId, MOCK_USER_ID);
		setFields((prev) => prev.filter((field) => field.id !== fieldId));
		if (selectedFieldId === fieldId) {
			setSelectedFieldId(null);
		}
	};

	const overlayTitle =
		overlayMode === "create" ? "Add field" : "Update field";
	const overlayCenter =
		overlayPolygon.length > 0 ? overlayPolygon[0] : mapCenter;

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-white text-stone-900">
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-10">
				<header className="flex flex-col gap-6">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
							Farm Dashboard
						</span>
						<div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 shadow-sm">
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
								M
							</div>
							<div className="text-sm">
								<p className="font-semibold text-stone-800">
									Marcin
								</p>
								<p className="text-xs text-stone-500">
									Signed in
								</p>
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<h1 className="font-display text-4xl text-stone-900 sm:text-5xl">
							Fields, forecasts, and crop health at a glance.
						</h1>
						<p className="max-w-2xl text-base text-stone-600">
							Select a field to unlock a live weather pulse, crop
							stats, and a clean map view.
						</p>
					</div>
				</header>

				<FieldListPanel
					fields={fields}
					selectedFieldId={selectedFieldId}
					onSelect={(fieldId) => setSelectedFieldId(fieldId)}
					onEdit={openEditOverlay}
					onRemove={handleRemoveField}
					onAdd={openCreateOverlay}
				/>

				{selectedField ? (
					<div className="relative flex flex-col gap-6">
						<div className="lg:fixed lg:top-1/2 lg:z-20 lg:-translate-y-1/2 lg:left-[max(1.5rem,calc(50%-36rem-14rem))]">
							<FieldSectionNav
								sections={FIELD_SECTION_DEFS}
								activeSectionId={activeSectionId}
								onNavigate={handleNavigateSection}
							/>
						</div>
						<div className="flex min-w-0 flex-1 flex-col gap-8">
							<section id="section-map" className="scroll-mt-24">
								<div className="grid gap-8 lg:grid-cols-3">
									<div className="lg:col-span-2">
										<FieldMap
											selectedField={selectedField}
											mapCenter={mapCenter}
											onEdit={() =>
												openEditOverlay(selectedField)
											}
										/>
									</div>
									<FieldSummaryPanel
										selectedField={selectedField}
										ndviScore={ndviScore}
										ndviTone={ndviTone}
										isNdviExcellent={isNdviExcellent}
										isNdviLoading={aiModelLoading}
									/>
								</div>
							</section>

							<div className="grid gap-8">
								<WeatherPanels
									forecastStatus={forecastStatus}
									weatherSeries={weatherSeries}
									temperatureSectionId="section-temperature"
									rainSectionId="section-rain"
								/>
								<section
									id="section-ndvi"
									className="scroll-mt-24"
								>
									{aiModelLoading ? (
										<ChartLoadingCard
											title="NDVI"
											subtitle="Vegetation strength trend."
											badgeLabel="AI Model"
											badgeClassName="border-emerald-200 text-emerald-700"
										/>
									) : aiModelError ? (
										<div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
											Unable to load NDVI data. Try again in a
											moment.
										</div>
									) : (
										<NdviLineChart series={ndviSeries} />
									)}
								</section>
								<section
									id="section-ai-model"
									className="scroll-mt-24"
								>
									{aiModelLoading ? (
										<ChartLoadingCard
											title="Soil moisture"
											subtitle="Soil moisture trend."
											badgeLabel="AI Model"
											badgeClassName="border-cyan-200 text-cyan-700"
										/>
									) : aiModelError ? (
										<div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
											Unable to load soil moisture insights.
											Try again in a moment.
										</div>
									) : (
										<SoilMoistureLineChart
											series={soilMoistureSeries}
										/>
									)}
								</section>
							</div>
						</div>
					</div>
				) : null}
			</div>

			<FieldOverlayModal
				isOpen={isOverlayOpen}
				overlayTitle={overlayTitle}
				overlayMode={overlayMode}
				overlayCenter={overlayCenter}
				overlayPolygon={overlayPolygon}
				overlayPolygonSignature={overlayPolygonSignature}
				overlayEditEnabled={overlayEditEnabled}
				overlayFeatureGroup={overlayFeatureGroup}
				draftField={draftField}
				editDraft={editDraft}
				draftError={draftError}
				onClose={closeOverlay}
				onSave={handleSaveDraft}
				onUpdate={handleUpdateSelected}
				onToggleEdit={setOverlayEditEnabled}
				onCreated={handleCreated}
				onEdited={handleEdited}
				onSetOverlayFeatureGroup={setOverlayFeatureGroup}
				setDraftField={setDraftField}
				setEditDraft={setEditDraft}
			/>
			<div className="h-screen" />
		</div>
	);
}
