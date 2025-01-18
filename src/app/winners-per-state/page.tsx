import {Suspense} from "react";
import {WinnersTable} from "./components/WinnersTable";
import {WinnersTableSkeleton} from "./components/WinnersTable.skeleton";
import {fetchWinners} from "@lib/utils/fetchWinners";

export default async function WinnersPage() {

  const winners = await fetchWinners();

  return (
    <Suspense fallback={<WinnersTableSkeleton />}>
      <WinnersTable winners={winners} />
    </Suspense>
  );
}
