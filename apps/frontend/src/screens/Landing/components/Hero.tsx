export default function Hero() {
	return (
		<section className="max-w-6xl mx-auto grid items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr]">
			<div>
				<div className="badge border-amber-200 bg-amber-50 text-amber-900">
					Premium field control
				</div>
				<h1 className="font-display mt-5 text-4xl leading-tight sm:text-5xl lg:text-6xl">
					Know every field. Act before the crop asks.
				</h1>
				<p className="mt-6 text-lg text-stone-700">
					Agro-orbit gives farmers a live understanding of soil moisture, crop
					stress, and weather shifts without walking the rows. Get clear
					notifications that tell you when to irrigate and when to wait.
				</p>
				<div className="mt-8 flex flex-wrap items-center gap-4">
					<button className="btn border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800">
						Start now
					</button>
					<span className="text-sm text-stone-600">
						No hardware overhaul required.
					</span>
				</div>
				<div className="mt-10 grid gap-4 sm:grid-cols-3">
					<div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
						<p className="text-xs uppercase tracking-wide text-stone-500">
							Response time
						</p>
						<p className="font-display mt-2 text-2xl">10 min</p>
						<p className="mt-1 text-sm text-stone-600">Field alerts delivered</p>
					</div>
					<div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
						<p className="text-xs uppercase tracking-wide text-stone-500">
							Moisture visibility
						</p>
						<p className="font-display mt-2 text-2xl">95%</p>
						<p className="mt-1 text-sm text-stone-600">Coverage across zones</p>
					</div>
					<div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
						<p className="text-xs uppercase tracking-wide text-stone-500">
							Irrigation savings
						</p>
						<p className="font-display mt-2 text-2xl">20%</p>
						<p className="mt-1 text-sm text-stone-600">Less water waste</p>
					</div>
				</div>
			</div>

			<div className="orbit-sheen rounded-3xl border border-white/70 bg-white/90 p-6 shadow-2xl">
				<div className="flex items-center justify-between">
					<p className="text-sm uppercase tracking-wide text-stone-500">
						Field snapshot
					</p>
					<span className="badge bg-emerald-100 text-emerald-800">Live</span>
				</div>
				<h2 className="font-display mt-4 text-2xl">North Orchard</h2>
				<div className="mt-6 grid gap-4">
					<div className="rounded-2xl bg-stone-900/90 p-4 text-white">
						<div className="flex items-center justify-between text-sm">
							<span>Soil moisture</span>
							<span className="font-semibold">41%</span>
						</div>
						<div className="mt-3 h-2 w-full rounded-full bg-white/20">
							<div className="h-2 w-3/5 rounded-full bg-emerald-400" />
						</div>
						<p className="mt-3 text-xs text-white/70">
							Below optimal. Irrigate within 6 hours.
						</p>
					</div>
					<div className="rounded-2xl border border-stone-200 bg-white p-4">
						<p className="text-sm font-semibold text-stone-800">Weather alert</p>
						<p className="mt-2 text-sm text-stone-600">
							Wind shift expected at 16:00. Adjust spray plans to avoid drift.
						</p>
					</div>
					<div className="rounded-2xl border border-stone-200 bg-white p-4">
						<p className="text-sm font-semibold text-stone-800">
							Crop health index
						</p>
						<div className="mt-3 flex items-center gap-3">
							<div className="h-2 flex-1 rounded-full bg-emerald-100">
								<div className="h-2 w-4/5 rounded-full bg-emerald-500" />
							</div>
							<span className="text-sm font-semibold text-emerald-700">
								82
							</span>
						</div>
						<p className="mt-2 text-xs text-stone-600">
							Stable growth, monitor canopy heat.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
