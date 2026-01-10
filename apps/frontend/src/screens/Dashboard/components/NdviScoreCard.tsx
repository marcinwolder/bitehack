type NdviTone = {
	label: string;
	accent: string;
	border: string;
	background: string;
	ring: string;
};

type NdviScoreCardProps = {
	ndviScore: number;
	ndviTone: NdviTone;
	isNdviExcellent: boolean;
};

export default function NdviScoreCard({
	ndviScore,
	ndviTone,
	isNdviExcellent,
}: NdviScoreCardProps) {
	return (
		<div
			className={`rounded-3xl border ${ndviTone.border} bg-gradient-to-br ${ndviTone.background} p-6 shadow-sm lg:col-span-3`}
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-sm text-stone-500">NDVI score</p>
					<p
						className={`mt-2 text-3xl font-semibold ${ndviTone.accent}`}
					>
						{ndviScore.toFixed(2)}
					</p>
					<p className={`text-sm font-semibold ${ndviTone.accent}`}>
						{ndviTone.label}
					</p>
				</div>
				<div className="relative flex h-12 w-12 items-center justify-center">
					<span
						className={`absolute h-10 w-10 rounded-full ${ndviTone.ring} opacity-20 ${
							isNdviExcellent ? "animate-pulse" : ""
						}`}
					/>
					<span
						className={`relative h-3 w-3 rounded-full ${ndviTone.ring}`}
					/>
				</div>
			</div>
			<div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
				<span>Scale 0.00 - 1.00</span>
				<span>High vegetation vigor</span>
			</div>
		</div>
	);
}
