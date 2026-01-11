export default function Cta() {
	return (
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
	);
}
