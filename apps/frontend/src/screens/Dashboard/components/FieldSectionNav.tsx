export type FieldSection = {
	id: string;
	label: string;
};

type FieldSectionNavProps = {
	sections: FieldSection[];
	activeSectionId: string;
	onNavigate: (sectionId: string) => void;
};

export default function FieldSectionNav({
	sections,
	activeSectionId,
	onNavigate,
}: FieldSectionNavProps) {
	return (
		<nav className="w-full lg:w-52">
			<div className="flex gap-2 overflow-x-auto rounded-2xl border border-emerald-100 bg-white/90 p-2 text-sm shadow-sm lg:sticky lg:top-8 lg:flex-col lg:overflow-visible">
				{sections.map((section) => {
					const isActive = section.id === activeSectionId;
					return (
						<button
							key={section.id}
							type="button"
							aria-current={isActive ? "true" : undefined}
							onClick={() => onNavigate(section.id)}
							className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition lg:rounded-xl lg:px-3 lg:py-2 ${
								isActive
									? "bg-emerald-600 text-white shadow-sm"
									: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
							}`}
						>
							{section.label}
						</button>
					);
				})}
			</div>
		</nav>
	);
}
