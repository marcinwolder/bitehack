export default function FeatureGrid() {
	return (
		<section id="features" className="max-w-6xl mx-auto px-6 pb-20">
			<div className="flex flex-wrap items-end justify-between gap-6">
				<div>
					<p className="text-sm uppercase tracking-wide text-stone-500">
						Features
					</p>
					<h2 className="font-display mt-3 text-3xl sm:text-4xl">
						Operational clarity for every field.
					</h2>
				</div>
				<p className="max-w-md text-sm text-stone-600">
					From moisture to microclimate, Agro-orbit turns raw signals into
					decisions that protect yield and time.
				</p>
			</div>
			<div className="mt-10 grid gap-6 md:grid-cols-3">
				<div className="card border border-white/70 bg-white/90 shadow-sm">
					<div className="card-body">
						<h3 className="font-display text-2xl">Ground truth, remotely</h3>
						<p className="text-sm text-stone-600">
							See soil moisture, canopy heat, and rainfall history without
							leaving the farmhouse.
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<span className="badge badge-outline">Moisture</span>
							<span className="badge badge-outline">Heat</span>
							<span className="badge badge-outline">Rainfall</span>
						</div>
					</div>
				</div>
				<div className="card border border-white/70 bg-white/90 shadow-sm">
					<div className="card-body">
						<h3 className="font-display text-2xl">Irrigation timing</h3>
						<p className="text-sm text-stone-600">
							Get precise alerts when the crop needs water so sprinklers run
							only when it counts.
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<span className="badge badge-outline">Alerts</span>
							<span className="badge badge-outline">Scheduling</span>
							<span className="badge badge-outline">Savings</span>
						</div>
					</div>
				</div>
				<div className="card border border-white/70 bg-white/90 shadow-sm">
					<div className="card-body">
						<h3 className="font-display text-2xl">Weather intelligence</h3>
						<p className="text-sm text-stone-600">
							Localized forecasts and wind shifts help you plan spraying,
							harvest, and labor.
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<span className="badge badge-outline">Forecasts</span>
							<span className="badge badge-outline">Wind</span>
							<span className="badge badge-outline">Planning</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
