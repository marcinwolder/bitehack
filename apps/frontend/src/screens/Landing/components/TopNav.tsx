export default function TopNav() {
	return (
		<header className="max-w-6xl mx-auto px-6 pt-6">
			<div className="navbar px-0">
				<div className="flex-1 items-center gap-4">
					<div className="flex gap-4">
						<span className="text-xl font-semibold tracking-wide">
							Agro-orbit
						</span>
						<span className="badge badge-outline">
							Field Intelligence
						</span>
					</div>
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
	);
}
