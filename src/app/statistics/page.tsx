import { fetchLotofacilAllGames } from "@lib/utils/fetchLotofacilAllGames";
import PaginatedCardsViewer from "./components/PaginatedCardsViewer";

export default async function StatisticsPage() {
  // Fetch all games using the server-side function
  const allGames = await fetchLotofacilAllGames();

  return (
    <div>
      {/* Pass the games data to the client component for pagination */}
      <PaginatedCardsViewer games={allGames} />
    </div>
  );
}
