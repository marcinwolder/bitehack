const STATUS_OPTIONS = [
	"Excellent",
	"Good",
	"Fair",
	"Under stress",
	"Needs attention"
];

const hashId = (value: string) => {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
};

export const getMockCropStatus = (fieldId: string) => {
	const hash = hashId(fieldId);
	return STATUS_OPTIONS[hash % STATUS_OPTIONS.length];
};

export const getMockHealthScore = (fieldId: string) => {
	const hash = hashId(fieldId);
	return 62 + (hash % 38);
};
