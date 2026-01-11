declare module "@turf/area" {
	const area: (input: { geometry: { coordinates: number[][][] } } | unknown) => number;
	export default area;
}

declare module "@turf/centroid" {
	const centroid: (input: { geometry: { coordinates: number[][][] } } | unknown) => {
		geometry: { coordinates: [number, number] };
	};
	export default centroid;
}

declare module "@turf/helpers" {
	export function polygon(coordinates: number[][][]): {
		geometry: { coordinates: number[][][] };
	};
}
