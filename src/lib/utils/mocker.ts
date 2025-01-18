import {
  ZodSchema,
  ZodObject,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodArray,
  ZodOptional,
  ZodNullable,
  ZodTypeAny,
  ZodStringCheck,
} from "zod";
import { faker } from "@faker-js/faker";

const handleStringCheck = (check: ZodStringCheck) => {
  switch (check.kind) {
    case "date":
      return faker.date.recent().toISOString();
    case "url":
      return faker.internet.url();
    case "email":
      return faker.internet.email();
    case "uuid":
    case "cuid":
    case "nanoid":
    case "cuid2":
    case "ulid":
      return crypto.randomUUID();
    case "emoji":
      return faker.internet.emoji();
    default:
      return faker.lorem.word();
  }
};

type GeneratorPrimitiveOptions = {
  array?: {
    min?: number;
    max?: number;
  };
  optional?: {
    probability?: number;
  };
};

const getArrayLength = (options?: GeneratorPrimitiveOptions) => {
  return faker.number.int({
    min: options?.array?.min || 1,
    max: options?.array?.max || 10,
  });
};

export function mockFromSchema<T>(
  schema: ZodSchema<T>,
  options?: GeneratorPrimitiveOptions
): T {
  if (schema instanceof ZodString) {
    const check = schema._def.checks.find((check) => handleStringCheck(check));
    if (check) {
      return handleStringCheck(check) as T;
    }
    return faker.lorem.word() as T;
  }

  if (schema instanceof ZodNumber) {
    return faker.number.int() as T;
  }

  if (schema instanceof ZodBoolean) {
    return faker.datatype.boolean() as T;
  }

  if (schema instanceof ZodArray) {
    const arraySchema = schema.element;
    const length = getArrayLength(options);
    return Array.from({ length }).map(() =>
      mockFromSchema(arraySchema)
    ) as T;
  }

  if (schema instanceof ZodOptional || schema instanceof ZodNullable) {
    const probability = options?.optional?.probability || 0.5;
    return (
      Math.random() > probability
        ? mockFromSchema(schema.unwrap())
        : null
    ) as T;
  }

  if (schema instanceof ZodObject) {
    const shape = schema.shape;
    const result: any = {};
    for (const key in shape) {
      result[key] = mockFromSchema(shape[key] as ZodTypeAny);
    }
    return result as T;
  }

  throw new Error("Unsupported schema type", {
    cause: schema,
  });
}
