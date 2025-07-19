import {fetchLotofacilAllGames} from "@lib/utils/fetchLotofacilAllGames";
import {fetchStatistics} from "@lib/utils/fetchStatistics";
import {Generator} from "./components/Generator";

export default async function GeneratorPage() {
  const statistics = await fetchStatistics();
  const allGames = await fetchLotofacilAllGames();

  return (
    <>
      <Generator statistics={statistics} allGames={allGames} />
    </>
  )
}
