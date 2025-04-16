import z from 'zod';

export const GameGeneratorSchema = z.object({
  constraints: z.object({
    even: z.nullable(z.number().positive().optional()),
    odd: z.nullable(z.number().positive().optional()),
    prime: z.nullable(z.number().positive().optional()),
    fibonacci: z.nullable(z.number().positive().optional()),
    multipleOf3: z.nullable(z.number().positive().optional()),
  }).optional(),
  amountOfSets: z.number().positive().optional(),
  itemsInSet: z.number().positive().optional(),
  startEnd: z.array(z.number()).min(0).max(2).optional(),
});
