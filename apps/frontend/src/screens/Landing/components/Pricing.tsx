export default function Pricing() {
	return (
		<section id="pricing" className="max-w-6xl mx-auto px-6 pb-20">
			<div className="flex flex-wrap items-end justify-between gap-6">
				<div>
					<p className="text-sm uppercase tracking-wide text-stone-500">
						Pricing
					</p>
					<h2 className="font-display mt-3 text-3xl sm:text-4xl">
						Plans that fit your acreage.
					</h2>
				</div>
				<p className="max-w-md text-sm text-stone-600">
					Start lean or scale across the entire operation. Every plan
					includes real-time field alerts.
				</p>
			</div>
			<div className="mt-10 grid gap-6 lg:grid-cols-3">
				<div className="card border border-stone-200 bg-white shadow-sm">
					<div className="card-body">
						<h3 className="font-display text-2xl">Starter</h3>
						<p className="text-sm text-stone-600">Up to 3 fields.</p>
						<p className="mt-6 text-4xl font-semibold">$39</p>
						<p className="text-sm text-stone-500">per month</p>
						<ul className="mt-6 space-y-2 text-sm text-stone-600">
							<li>Field moisture alerts</li>
							<li>Weather notifications</li>
							<li>Mobile dashboard</li>
						</ul>
						<div className="card-actions mt-6">
							<button className="btn w-full border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800">
								Start now
							</button>
						</div>
					</div>
				</div>
				<div className="card border border-emerald-200 bg-white shadow-lg">
					<div className="card-body">
						<div className="flex items-center justify-between">
							<h3 className="font-display text-2xl">Professional</h3>
							<span className="badge bg-emerald-100 text-emerald-800">
								Most popular
							</span>
						</div>
						<p className="text-sm text-stone-600">Up to 12 fields.</p>
						<p className="mt-6 text-4xl font-semibold">$89</p>
						<p className="text-sm text-stone-500">per month</p>
						<ul className="mt-6 space-y-2 text-sm text-stone-600">
							<li>Advanced moisture mapping</li>
							<li>Crop stress alerts</li>
							<li>Team access</li>
						</ul>
						<div className="card-actions mt-6">
							<button className="btn w-full border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800">
								Start now
							</button>
						</div>
					</div>
				</div>
				<div className="card border border-stone-200 bg-white shadow-sm">
					<div className="card-body">
						<h3 className="font-display text-2xl">Enterprise</h3>
						<p className="text-sm text-stone-600">Unlimited fields.</p>
						<p className="mt-6 text-4xl font-semibold">Custom</p>
						<p className="text-sm text-stone-500">annual billing</p>
						<ul className="mt-6 space-y-2 text-sm text-stone-600">
							<li>Dedicated agronomy insights</li>
							<li>Workflow automation</li>
							<li>On-site support</li>
						</ul>
						<div className="card-actions mt-6">
							<button className="btn w-full border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800">
								Start now
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
