import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { FieldRepository } from "./fieldRepository";

const FieldRepositoryContext = createContext<FieldRepository | null>(null);

type FieldRepositoryProviderProps = {
	repository: FieldRepository;
	children: ReactNode;
};

export function FieldRepositoryProvider({
	repository,
	children
}: FieldRepositoryProviderProps) {
	return (
		<FieldRepositoryContext.Provider value={repository}>
			{children}
		</FieldRepositoryContext.Provider>
	);
}

export function useFieldRepository() {
	const repository = useContext(FieldRepositoryContext);
	if (!repository) {
		throw new Error("FieldRepositoryProvider is missing");
	}
	return repository;
}
