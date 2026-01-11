import DashboardScreen from "./screens/Dashboard/DashboardScreen";
import { FieldRepositoryProvider } from "./data/fieldRepositoryContext";
import { createLocalFieldRepository } from "./data/localFieldRepository";

const repository = createLocalFieldRepository();

export default function App() {
	return (
		<FieldRepositoryProvider repository={repository}>
			<DashboardScreen />
		</FieldRepositoryProvider>
	);
}
