const DEFAULT_API_URL = "http://localhost:5000";

export const API_BASE_URL =
	import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export const apiFetch = async (
	path: string,
	options: RequestInit = {}
) => {
	const headers = new Headers(options.headers);
	if (!headers.has("Content-Type") && options.body) {
		headers.set("Content-Type", "application/json");
	}
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers
	});
	if (!response.ok) {
		throw new Error(`Request failed: ${response.status}`);
	}
	return response;
};
