import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { useFieldRepository } from "../../data/fieldRepositoryContext";
import type { Field, LatLngTuple } from "../../data/fieldRepository";
import { createOpenMeteoWeatherService } from "../../data/weatherService";
import type { DailyWeatherSeries } from "../../data/weatherService";
import {
	getMockNdviScore,
	getMockNdviSeries,
} from "../../data/mockCropMetrics";
import FieldListPanel from "./components/FieldListPanel";
import FieldMap from "./components/FieldMap";
import FieldOverlayModal from "./components/FieldOverlayModal";
import FieldSummaryPanel from "./components/FieldSummaryPanel";
import WeatherPanels from "./components/WeatherPanels";
import type { DraftField, EditFieldDraft } from "./types";
import {
	MIN_AREA_HA,
	MOCK_USER_ID,
	WARSAW_CENTER,
	calculateAreaHa,
	createId,
	getNdviTone,
	getPolygonCentroid,
	getPolygonFromFeatureGroup,
} from "./utils";
import NdviLineChart from "./components/NdviLineChart";
import FieldSectionNav from "./components/FieldSectionNav";

const FIELD_SECTION_DEFS = [
	{ id: "section-map", label: "Map" },
	{ id: "section-temperature", label: "Temperature" },
	{ id: "section-rain", label: "Rain" },
	{ id: "section-ndvi", label: "NDVI" },
];

export default function DashboardScreen() {
	const repository = useFieldRepository();
	const weatherService = useMemo(() => createOpenMeteoWeatherService(), []);
	const [fields, setFields] = useState<Field[]>([]);
	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
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
	const overlayPolygonSignature = useMemo(
		() => overlayPolygon.map(([lat, lng]) => `${lat},${lng}`).join("|"),
		[overlayPolygon]
	);

	useEffect(() => {
		repository.list(MOCK_USER_ID).then(setFields);
	}, [repository]);

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
	const ndviSeries = selectedField ? getMockNdviSeries(selectedField.id) : [];
	const ndviScore = selectedField ? getMockNdviScore(selectedField.id) : 0;
	const ndviTone = getNdviTone(ndviScore);
	const isNdviExcellent = ndviScore >= 0.8;

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

	const handleEdited = (event: L.DrawEvents.Edited) => {
		const layers = event.layers;
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
		const nextArea = calculateAreaHa(updatedPolygon);
		setOverlayPolygon(updatedPolygon);
		setDraftField((prev) =>
			prev ? { ...prev, polygon: updatedPolygon, area: nextArea } : prev
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
			id: createId(),
			userId: MOCK_USER_ID,
			name: draftField.name.trim(),
			crop: draftField.crop,
			polygon: draftField.polygon,
			area: draftField.area,
			areaUnit: "ha",
			createdAt: now,
			updatedAt: now,
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
		if (!editDraft.name.trim()) {
			setDraftError("Field name is required.");
			return;
		}
		if (!editDraft.crop) {
			setDraftError("Select a crop for this field.");
			return;
		}
		const featurePolygon = getPolygonFromFeatureGroup(overlayFeatureGroup);
		const polygonToSave =
			featurePolygon && featurePolygon.length > 0
				? featurePolygon
				: overlayPolygon.length > 0
				? overlayPolygon
				: selectedField.polygon;
		if (polygonToSave.length < 3) {
			setDraftError("Add a valid field polygon before saving.");
			return;
		}
		const nextArea = calculateAreaHa(polygonToSave);
		if (nextArea < MIN_AREA_HA) {
			setDraftError("Polygon is too small. Try a larger field area.");
			return;
		}
		const updatedField: Field = {
			...selectedField,
			name: editDraft.name.trim(),
			crop: editDraft.crop,
			area: nextArea,
			polygon: polygonToSave,
			updatedAt: new Date().toISOString(),
		};
		await repository.update(updatedField);
		setFields((prev) =>
			prev.map((field) =>
				field.id === updatedField.id ? updatedField : field
			)
		);
		setSelectedFieldId(updatedField.id);
		setEditDraft((prev) =>
			prev ? { ...prev, area: nextArea.toFixed(2) } : prev
		);
		setDraftError(null);
		closeOverlay();
	};

	const handleRemoveField = async (fieldId: string) => {
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
				<header className="flex flex-col gap-2">
					<span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
						Farm Dashboard
					</span>
					<h1 className="font-display text-4xl text-stone-900 sm:text-5xl">
						Fields, forecasts, and crop health at a glance.
					</h1>
					<p className="max-w-2xl text-base text-stone-600">
						Select a field to unlock a live weather pulse, crop
						stats, and a clean map view.
					</p>
				</header>

				<FieldListPanel
					fields={fields}
					selectedFieldId={selectedFieldId}
					onSelect={setSelectedFieldId}
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
								<section id="section-ndvi" className="scroll-mt-24">
									<NdviLineChart series={ndviSeries} />
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
		</div>
	);
}
