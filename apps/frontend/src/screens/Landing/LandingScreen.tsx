import Cta from "./components/Cta";
import Faq from "./components/Faq";
import FeatureGrid from "./components/FeatureGrid";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import TopNav from "./components/TopNav";

export default function LandingScreen() {
	return (
		<div className="agro-bg min-h-screen text-stone-900">
			<div className="relative overflow-hidden">
				<div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full border border-emerald-200/60" />
				<div className="pointer-events-none absolute -right-16 top-24 h-80 w-80 rounded-full border border-amber-200/70" />
				<TopNav />
				<Hero />
			</div>
			<FeatureGrid />
			<Pricing />
			<Faq />
			<Cta />
			<Footer />
		</div>
	);
}
