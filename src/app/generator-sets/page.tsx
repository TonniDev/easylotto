import {fetchLotofacilAllGames} from "@lib/utils/fetchLotofacilAllGames";
import {fetchStatistics} from "@lib/utils/fetchStatistics";
import {GeneratorSets} from "./components/GeneratorSets";

export default async function GeneratorSetsPage() {
  const statistics = await fetchStatistics();
  const allGames = await fetchLotofacilAllGames();

  return (
    <>
      <GeneratorSets statistics={statistics} allGames={allGames} />
    </>
  )
}
