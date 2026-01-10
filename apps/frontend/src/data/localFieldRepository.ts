import type { Field, FieldRepository } from "./fieldRepository";

const STORAGE_KEY = "agroFields";

const readAllFields = (): Field[] => {
	if (typeof window === "undefined") {
		return [];
	}
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) {
		return [];
	}
	try {
		const parsed = JSON.parse(raw) as Field[];
		if (!Array.isArray(parsed)) {
			return [];
		}
		return parsed;
	} catch {
		return [];
	}
};

const writeAllFields = (fields: Field[]) => {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
};

export const createLocalFieldRepository = (): FieldRepository => ({
	async list(userId) {
		const fields = readAllFields();
		return fields.filter((field) => field.userId === userId);
	},
	async create(field) {
		const fields = readAllFields();
		fields.push(field);
		writeAllFields(fields);
		return field;
	},
	async update(field) {
		const fields = readAllFields();
		const nextFields = fields.map((item) => (item.id === field.id ? field : item));
		writeAllFields(nextFields);
		return field;
	},
	async remove(id, userId) {
		const fields = readAllFields();
		const nextFields = fields.filter(
			(field) => !(field.id === id && field.userId === userId)
		);
		writeAllFields(nextFields);
	}
});
