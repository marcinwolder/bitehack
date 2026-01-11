import DashboardScreen from "./screens/Dashboard/DashboardScreen";
import { FieldRepositoryProvider } from "./data/fieldRepositoryContext";
import { createApiFieldRepository } from "./data/apiFieldRepository";

const repository = createApiFieldRepository();

export default function App() {
	return (
		<FieldRepositoryProvider repository={repository}>
			<DashboardScreen />
		</FieldRepositoryProvider>
	);
}
