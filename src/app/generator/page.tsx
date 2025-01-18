import {fetchWinnersRawData} from "@lib/utils/fetchWinners";
import {TableComponent} from "./TableComponent";

export default async function ByStatePage() {

  const winners = await fetchWinnersRawData();

  return (
    <div className="flex flex-col p-2 m-auto items-center justify-center w-full h-full">
      <h1>Lottery winners by state.</h1>
      <TableComponent winners={winners} />
    </div>
  )
}
