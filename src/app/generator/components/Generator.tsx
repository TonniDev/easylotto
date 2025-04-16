"use client"

import {GameGeneratorSchema} from "@lib/definitions/generator.schema";
import {fetchGenerateNumbers} from "@lib/utils/fetchGenerateNumbers";
import {useCallback, useState} from "react";
import {GeneratedNumbers} from "./GeneratedNumbers";
import GeneratorForm, {GeneratorFormProps, LotofacilFormValues} from "./GeneratorForm";

export const Generator = ({statistics}: Pick<GeneratorFormProps, "statistics">) => {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[][] | null>(null);

  const onSubmit = useCallback(async (data: LotofacilFormValues) => {
    const validatedData = GameGeneratorSchema.safeParse(data);

    if (validatedData.success) {
      const numbers = await fetchGenerateNumbers(validatedData.data);
      setGeneratedNumbers(numbers);
    }
  }, []);

  return (
    <>
      <GeneratorForm statistics={statistics} onSubmit={onSubmit} />
      <GeneratedNumbers generatedNumbers={generatedNumbers} />
    </>
  )
}
