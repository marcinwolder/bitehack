export default function Faq() {
	return (
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
	);
}
