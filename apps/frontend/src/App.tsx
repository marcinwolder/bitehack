export default function App() {
	return (
		<div className="agro-bg min-h-screen text-stone-900">
			<div className="relative overflow-hidden">
				<div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full border border-emerald-200/60" />
				<div className="pointer-events-none absolute -right-16 top-24 h-80 w-80 rounded-full border border-amber-200/70" />
				<header className="max-w-6xl mx-auto px-6 pt-6">
					<div className="navbar px-0">
						<div className="flex-1 items-center gap-3">
							<span className="text-xl font-semibold tracking-wide">Agro-orbit</span>
							<span className="badge badge-outline">Field Intelligence</span>
						</div>
						<div className="hidden md:flex gap-6 text-sm">
							<a className="link link-hover" href="#features">
								Features
							</a>
							<a className="link link-hover" href="#pricing">
								Pricing
							</a>
							<a className="link link-hover" href="#faq">
								FAQ
							</a>
						</div>
						<div className="flex-none ml-6">
							<button className="btn border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800">
								Start now
							</button>
						</div>
					</div>
				</header>

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
							<span className="badge bg-emerald-100 text-emerald-800">
								Live
							</span>
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
								<p className="text-sm font-semibold text-stone-800">
									Weather alert
								</p>
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
			</div>

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

			<section id="faq" className="max-w-6xl mx-auto px-6 pb-24">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<div>
						<p className="text-sm uppercase tracking-wide text-stone-500">FAQ</p>
						<h2 className="font-display mt-3 text-3xl sm:text-4xl">
							Answers for the field team.
						</h2>
					</div>
					<p className="max-w-md text-sm text-stone-600">
						Need more detail? We can tailor the dashboard to your crop mix and
						irrigation style.
					</p>
				</div>
				<div className="mt-10 grid gap-4">
					<div className="collapse collapse-plus rounded-2xl border border-stone-200 bg-white">
						<input type="radio" name="agro-faq" defaultChecked />
						<div className="collapse-title text-lg font-semibold">
							How does Agro-orbit read my field conditions?
						</div>
						<div className="collapse-content text-sm text-stone-600">
							We blend sensor inputs, satellite imagery, and localized weather
							data to model moisture and crop stress in real time.
						</div>
					</div>
					<div className="collapse collapse-plus rounded-2xl border border-stone-200 bg-white">
						<input type="radio" name="agro-faq" />
						<div className="collapse-title text-lg font-semibold">
							Can I set alerts for specific fields?
						</div>
						<div className="collapse-content text-sm text-stone-600">
							Yes. Create rules per field and crop type so your team receives the
							right notification at the right time.
						</div>
					</div>
					<div className="collapse collapse-plus rounded-2xl border border-stone-200 bg-white">
						<input type="radio" name="agro-faq" />
						<div className="collapse-title text-lg font-semibold">
							Does it work with my existing irrigation system?
						</div>
						<div className="collapse-content text-sm text-stone-600">
							Agro-orbit delivers recommendations you can apply manually or route
							into most modern irrigation controllers.
						</div>
					</div>
				</div>
			</section>

			<section className="max-w-6xl mx-auto px-6 pb-24">
				<div className="rounded-3xl border border-emerald-100 bg-emerald-900 px-8 py-12 text-white shadow-xl sm:px-12">
					<div className="flex flex-wrap items-center justify-between gap-6">
						<div>
							<p className="text-sm uppercase tracking-wide text-emerald-200">
								Ready to launch
							</p>
							<h2 className="font-display mt-4 text-3xl sm:text-4xl">
								Move from inspection to insight.
							</h2>
							<p className="mt-4 max-w-xl text-sm text-emerald-100">
								Start monitoring your fields today and keep crews focused on the
								work that matters most.
							</p>
						</div>
						<button className="btn border-white bg-white text-emerald-900 hover:bg-emerald-50">
							Start now
						</button>
					</div>
				</div>
			</section>

			<footer className="border-t border-white/60">
				<div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-stone-600">
					<span>Agro-orbit. Precision visibility for modern farms.</span>
					<span>Field-ready intelligence, all season.</span>
				</div>
			</footer>
		</div>
	);
}
