import {fetchStatistics} from "@lib/utils/fetchStatistics";
import {Generator} from "./components/Generator";

export default async function GeneratorPage() {
  const statistics = await fetchStatistics();

  return (
    <>
      <Generator statistics={statistics} />
    </>
  )
}
