import type { Field } from "../../data/fieldRepository";
import NdviLineChart from "./NdviLineChart";
import type { NdviPoint } from "../types";
import { formatHa } from "../utils";

type FieldSummaryPanelProps = {
	selectedField: Field;
	ndviSeries: NdviPoint[];
};

export default function FieldSummaryPanel({
	selectedField,
	ndviSeries,
}: FieldSummaryPanelProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="rounded-3xl border border-stone-100 bg-white/90 p-5 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
					Crop
				</p>
				<p className="mt-2 text-lg font-semibold text-stone-800">
					{selectedField.crop}
				</p>
				<p className="mt-1 text-sm text-stone-500">
					{selectedField.name}
				</p>
			</div>
			<div className="rounded-3xl border border-stone-100 bg-white/90 p-5 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
					Size
				</p>
				<p className="mt-2 text-3xl font-semibold text-stone-800">
					{formatHa(selectedField.area)}
				</p>
				<p className="mt-1 text-sm text-stone-500">
					Current planted area
				</p>
			</div>
		</div>
	);
}
