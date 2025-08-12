import { NextRequest, NextResponse } from "next/server";
import { SaveGameData, SaveGameResult, SavedGameResponse } from "@lib/domains/userGames/repository";
import { prisma } from "@lib/prisma";
import { requireAuth } from "@lib/middleware/auth";

export const POST = requireAuth(async (request) => {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.numbers || !Array.isArray(body.numbers) || body.numbers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required field: numbers"
        },
        { status: 400 }
      );
    }

    // Use authenticated user's information
    const saveData: SaveGameData = {
      email: request.user!.email,
      name: request.user!.first_name,
      numbers: body.numbers,
      group: body.group,
    };

    // Save games directly using Prisma
    let result: SaveGameResult;

    try {
      if (!saveData.numbers || saveData.numbers.length === 0) {
        result = {
          success: false,
          message: "Missing required field: numbers",
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
                group: saveData.group,
                user_id: request.user!.id,
              },
            });

            // Map database result to API response format
            const gameResponse: SavedGameResponse = {
              id: savedGame.id,
              email: savedGame.email,
              name: savedGame.name,
              numbers: savedGame.listaDezenas,
              group: savedGame.group,
            };
            
            return gameResponse;
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
});
