import {NextRequest, NextResponse} from "next/server";
import {GetHistoricalDataPayload, LotteryRepository} from "@lib/domains/lottery/repository";
import {AxiosService} from "@lib/Network/AxiosService";
import { Lotofacil } from "@lib/definitions/lotofacil";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const repository = new LotteryRepository(new AxiosService<
    Lotofacil,
    GetHistoricalDataPayload,
    Record<string, any>
  >());

  const data = await repository.getHistoricalData(payload);

  return NextResponse.json(data);
}
