import {GameGeneratorSchema} from "@lib/definitions/generator.schema";
import {generateRandomSets} from "@lib/utils/math/numberGenerator";
import { GenerateRandomSetsOptions } from "@lib/utils/math/types";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
  let body = null;
  let validatedData: GenerateRandomSetsOptions = {};

  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 0) {
      body = await req.json();
      const result = GameGeneratorSchema.safeParse(body);

      if (result.success) {
        validatedData = {
          ...result.data
        };
        const numbers = generateRandomSets(validatedData);
        return NextResponse.json(numbers);
      } else {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: result.error.format()
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.log("Using default parameters (empty body or parse error)", error);
  }

  const numbers = generateRandomSets(validatedData);

  return NextResponse.json(numbers);

}
