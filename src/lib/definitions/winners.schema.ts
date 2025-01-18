import z from 'zod';

export const winnersSchema = z.object({
  totalWinners: z.number(),
  totalGames: z.number(),
  data: z.array(z.object({
    state: z.string(),
    totalWinners: z.number(),
    percentage: z.number(),
  })),
});
