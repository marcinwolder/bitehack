export type LatLngTuple = [number, number];

export type Field = {
	id: string;
	userId: number;
	name: string;
	crop: string;
	polygon: LatLngTuple[];
	area: number;
	areaUnit: "ha";
	createdAt: string;
	updatedAt: string;
};

export type FieldRepository = {
	list: (userId: number) => Promise<Field[]>;
	create: (field: Field) => Promise<Field>;
	update: (field: Field) => Promise<Field>;
	remove: (id: string, userId: number) => Promise<void>;
};
