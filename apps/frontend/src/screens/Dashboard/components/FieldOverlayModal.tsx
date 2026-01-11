import { FeatureGroup, MapContainer, Polygon, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { Dispatch, SetStateAction } from "react";
import type { LatLngTuple } from "../../data/fieldRepository";
import type { DraftField, EditFieldDraft } from "../types";
import { AREA_UNIT, CROP_OPTIONS } from "../utils";
import FitBounds from "./FitBounds";
import MapDrawControls from "./MapDrawControls";

type FieldOverlayModalProps = {
	isOpen: boolean;
	overlayTitle: string;
	overlayMode: "create" | "edit";
	overlayCenter: LatLngTuple;
	overlayPolygon: LatLngTuple[];
	overlayPolygonSignature: string;
	overlayEditEnabled: boolean;
	overlayFeatureGroup: L.FeatureGroup | null;
	draftField: DraftField | null;
	editDraft: EditFieldDraft | null;
	draftError: string | null;
	onClose: () => void;
	onSave: () => void;
	onUpdate: () => void;
	onToggleEdit: (nextValue: boolean) => void;
	onCreated: (event: L.LeafletEvent) => void;
	onEdited: (event: L.DrawEvents.Edited) => void;
	onSetOverlayFeatureGroup: (featureGroup: L.FeatureGroup | null) => void;
	setDraftField: Dispatch<SetStateAction<DraftField | null>>;
	setEditDraft: Dispatch<SetStateAction<EditFieldDraft | null>>;
};

export default function FieldOverlayModal({
	isOpen,
	overlayTitle,
	overlayMode,
	overlayCenter,
	overlayPolygon,
	overlayPolygonSignature,
	overlayEditEnabled,
	overlayFeatureGroup,
	draftField,
	editDraft,
	draftError,
	onClose,
	onSave,
	onUpdate,
	onToggleEdit,
	onCreated,
	onEdited,
	onSetOverlayFeatureGroup,
	setDraftField,
	setEditDraft,
}: FieldOverlayModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[1200] flex items-center justify-center bg-stone-900/40 p-4">
			<div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-6 py-4">
					<div>
						<h2 className="text-xl font-semibold text-stone-800">
							{overlayTitle}
						</h2>
						<p className="text-sm text-stone-500">
							Draw or edit the polygon, then confirm the field
							details.
						</p>
					</div>
					<button
						className="btn btn-ghost"
						onClick={onClose}
						type="button"
					>
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
								<FeatureGroup ref={onSetOverlayFeatureGroup}>
									{overlayPolygon.length > 0 ? (
										<Polygon
											positions={overlayPolygon}
											pathOptions={{
												color: "#16a34a",
												weight: 2,
												fillOpacity: 0.2,
											}}
										/>
									) : null}
								</FeatureGroup>
								<MapDrawControls
									featureGroup={overlayFeatureGroup}
									allowDraw={overlayMode === "create"}
									allowEdit={
										overlayMode === "edit"
											? overlayEditEnabled
											: overlayPolygon.length > 0
									}
									layerSignature={overlayPolygonSignature}
									onCreated={onCreated}
									onEdited={onEdited}
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
									onChange={(event) =>
										onToggleEdit(event.target.checked)
									}
								/>
								Enable polygon editing
							</label>
						) : (
							<p className="text-sm text-stone-500">
								Click the draw tool to outline a new field
								polygon.
							</p>
						)}
					</div>
					<div className="flex flex-col gap-4">
						{overlayMode === "create" && draftField ? (
							<div className="flex flex-col gap-4">
								<label className="form-control">
									<span className="label-text text-sm text-stone-600">
										Field name
									</span>
									<input
										className="input input-bordered"
										value={draftField.name}
										onChange={(event) =>
											setDraftField((prev) =>
												prev
													? {
															...prev,
															name: event.target
																.value,
													  }
													: prev
											)
										}
										placeholder="North pasture"
									/>
								</label>
								<label className="form-control">
									<span className="label-text text-sm text-stone-600">
										Crop
									</span>
									<select
										className="select select-bordered"
										value={draftField.crop}
										onChange={(event) =>
											setDraftField((prev) =>
												prev
													? {
															...prev,
															crop: event.target
																.value,
													  }
													: prev
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
									<span className="label-text text-sm text-stone-600">
										Field size
									</span>
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
																area: Number.parseFloat(
																	event.target
																		.value ||
																		"0"
																),
														  }
														: prev
												)
											}
										/>
										<span className="text-sm text-stone-500">
											{AREA_UNIT}
										</span>
									</div>
								</label>
							</div>
						) : overlayMode === "edit" && editDraft ? (
							<div className="flex flex-col gap-4">
								<label className="form-control">
									<span className="label-text text-sm text-stone-600">
										Field name
									</span>
									<input
										className="input input-bordered"
										value={editDraft.name}
										onChange={(event) =>
											setEditDraft((prev) =>
												prev
													? {
															...prev,
															name: event.target
																.value,
													  }
													: prev
											)
										}
									/>
								</label>
								<label className="form-control">
									<span className="label-text text-sm text-stone-600">
										Crop
									</span>
									<br />
									<select
										className="select select-bordered"
										value={editDraft.crop}
										onChange={(event) =>
											setEditDraft((prev) =>
												prev
													? {
															...prev,
															crop: event.target
																.value,
													  }
													: prev
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
									<span className="label-text text-sm text-stone-600">
										Field size
									</span>
									<div className="flex items-center gap-2">
										<input
											type="number"
											step="0.01"
											className="input input-bordered"
											value={editDraft.area}
											onChange={(event) =>
												setEditDraft((prev) =>
													prev
														? {
																...prev,
																area: event
																	.target
																	.value,
														  }
														: prev
												)
											}
										/>
										<span className="text-sm text-stone-500">
											{AREA_UNIT}
										</span>
									</div>
								</label>
							</div>
						) : null}

						{draftError ? (
							<p className="text-sm text-red-600">{draftError}</p>
						) : null}

						<div className="mt-auto flex flex-wrap gap-3">
							{overlayMode === "create" ? (
								<button
									className="btn btn-success"
									type="button"
									onClick={onSave}
								>
									Save field
								</button>
							) : (
								<button
									className="btn btn-outline"
									type="button"
									onClick={onUpdate}
								>
									Save updates
								</button>
							)}
							<button
								className="btn btn-ghost"
								type="button"
								onClick={onClose}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
