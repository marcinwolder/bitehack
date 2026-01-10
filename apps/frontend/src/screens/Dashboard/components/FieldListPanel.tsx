import type { Field } from "../../data/fieldRepository";
import { formatHa } from "../utils";

type FieldListPanelProps = {
	fields: Field[];
	selectedFieldId: string | null;
	onSelect: (fieldId: string) => void;
	onEdit: (field: Field) => void;
	onRemove: (fieldId: string) => void;
	onAdd: () => void;
};

export default function FieldListPanel({
	fields,
	selectedFieldId,
	onSelect,
	onEdit,
	onRemove,
	onAdd,
}: FieldListPanelProps) {
	return (
		<section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold text-stone-800">
						Your fields
					</h2>
					<p className="text-sm text-stone-500">
						Select a field to reveal map, forecast, and crop
						signals.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<span className="badge badge-outline border-emerald-200 text-emerald-700">
						{fields.length} fields
					</span>
					<button className="btn btn-success" type="button" onClick={onAdd}>
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
								onClick={() => onSelect(field.id)}
								className="flex w-full items-start justify-between gap-3 text-left"
							>
								<div>
									<p className="text-sm font-semibold text-stone-800">
										{field.name}
									</p>
									<p className="text-xs text-stone-500">
										{field.crop}
									</p>
								</div>
								<span className="text-xs font-semibold text-emerald-700">
									{formatHa(field.area)}
								</span>
							</button>
							<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
								<span>
									Updated{" "}
									{new Date(field.updatedAt).toLocaleDateString()}
								</span>
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={() => {
											onEdit(field);
										}}
										className="font-semibold text-emerald-700 hover:text-emerald-800"
									>
										Edit
									</button>
									<button
										type="button"
										onClick={() => onRemove(field.id)}
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
	);
}
