import { NextRequest, NextResponse } from "next/server";
import { SaveGameData, SaveGameResult } from "@lib/domains/userGames/repository";
import { prisma } from "@lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.email || !body.name || !body.numbers || !Array.isArray(body.numbers) || body.numbers.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields: email, name, or numbers" 
        },
        { status: 400 }
      );
    }

    // Prepare data for saving
    const saveData: SaveGameData = {
      email: body.email,
      name: body.name,
      numbers: body.numbers,
    };

    // Save games directly using Prisma
    let result: SaveGameResult;

    try {
      if (!saveData.email || !saveData.name || !saveData.numbers || saveData.numbers.length === 0) {
        result = {
          success: false,
          message: "Missing required fields: email, name, or numbers",
        };
      } else {
        const savedGames = await Promise.all(
          saveData.numbers.map(async (numberSet) => {
            // Convert numbers to strings for storage
            const stringNumbers = numberSet.map(num => num.toString());

            const savedGame = await prisma.saved_games.create({
              data: {
                email: saveData.email,
                name: saveData.name,
                listaDezenas: stringNumbers,
              },
            });

            return {
              id: savedGame.id,
              email: savedGame.email,
              name: savedGame.name,
              numbers: savedGame.listaDezenas,
            };
          })
        );

        result = {
          success: true,
          message: `Successfully saved ${savedGames.length} game(s)`,
          savedGames,
        };
      }
    } catch (error) {
      console.error("Error saving games:", error);
      result = {
        success: false,
        message: "Failed to save games",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error in save games API:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
