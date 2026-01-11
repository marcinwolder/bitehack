type ChartLoadingCardProps = {
	title: string;
	subtitle: string;
	badgeLabel?: string;
	badgeClassName?: string;
};

export default function ChartLoadingCard({
	title,
	subtitle,
	badgeLabel,
	badgeClassName = "",
}: ChartLoadingCardProps) {
	return (
		<div className="rounded-3xl border border-stone-100 bg-white/90 p-6 shadow-sm">
			<span className="sr-only">
				Loading {title}. {subtitle}
			</span>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-2">
					<div className="skeleton h-4 w-28" />
					<div className="skeleton h-3 w-44" />
				</div>
				<div className="flex items-center gap-2">
					{badgeLabel ? (
						<span
							className={`badge badge-outline ${badgeClassName}`}
						>
							{badgeLabel}
						</span>
					) : null}
					<span className="badge badge-ghost text-stone-500">
						Loading
					</span>
				</div>
			</div>
			<div className="mt-4">
				<div className="skeleton h-40 w-full rounded-2xl" />
			</div>
			<div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
				<div className="skeleton h-3 w-10" />
				<div className="skeleton h-3 w-12" />
				<div className="skeleton h-3 w-10" />
			</div>
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
				<div className="skeleton h-3 w-16" />
				<div className="skeleton h-3 w-16" />
				<div className="skeleton h-3 w-16" />
			</div>
		</div>
	);
}
