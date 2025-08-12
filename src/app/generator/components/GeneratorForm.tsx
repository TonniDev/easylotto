"use client"

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Button, Form, Input, Select, SelectItem} from "@heroui/react";
import {zodResolver} from "@hookform/resolvers/zod";
import { GameGeneratorSchema } from "@lib/definitions/generator.schema";
import {IStatisticsResponse} from "@lib/domains/statistics/repository";
import {useCallback, useMemo, useState} from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export type LotofacilFormValues = z.infer<typeof GameGeneratorSchema>;

export interface GeneratorFormProps {
  statistics: IStatisticsResponse;
  onSubmit: (data: LotofacilFormValues) => Promise<void>;
}

export default function GeneratorForm({statistics, onSubmit}: GeneratorFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // Parse statKey to extract constraint values
  const parseStatKey = (statKey: string) => {
    const constraints: Record<string, number | null> = {
      fibonacci: null,
      prime: null,
      multipleOf3: null,
      odd: null,
      even: null
    };

    // Example statKey format: "fr4_pr5_mr5_or8_er7"
    const parts = statKey.split('_');

    parts.forEach(part => {
      const value = parseInt(part.substring(2), 10);

      if (part.startsWith('fr')) {
        constraints.fibonacci = value;
      } else if (part.startsWith('pr')) {
        constraints.prime = value;
      } else if (part.startsWith('mr')) {
        constraints.multipleOf3 = value;
      } else if (part.startsWith('or')) {
        constraints.odd = value;
      } else if (part.startsWith('er')) {
        constraints.even = value;
      }
    });

    return constraints;
  };

  // Create preset options from statistics
  const presetOptions = useMemo(() => {
    if (!statistics?.results) return [];

    return statistics.results
      .map(item => ({
        key: item.statKey,
        label: `Preset ${item.statKey} - ${item.lastoccurrence} - ${item.value} occurrences`,
        constraints: parseStatKey(item.statKey),
        occurrences: item.value
      }))
      .sort((a, b) => b.occurrences - a.occurrences); // Sort by number of occurrences (descending)
  }, [statistics]);

  const {handleSubmit, register, setValue, watch} = useForm<LotofacilFormValues>({
    mode: "onChange",
    resolver: zodResolver(GameGeneratorSchema),
    defaultValues: {
      constraints: {
        even: null,
        odd: null,
        prime: null,
        fibonacci: null,
        multipleOf3: null,
      },
      amountOfSets: undefined,
    }
  });

  // Watch form values to update inputs
  const watchedValues = watch();

  // Handle preset selection
  const handlePresetChange = useCallback((value: string) => {
    setSelectedPreset(value);

    // Find the selected preset
    const selectedOption = presetOptions.find(option => option.key === value);

    if (selectedOption) {
      // Set form values based on the selected preset
      const { constraints } = selectedOption;

      setValue("constraints.even", constraints.even);
      setValue("constraints.odd", constraints.odd);
      setValue("constraints.prime", constraints.prime);
      setValue("constraints.fibonacci", constraints.fibonacci);
      setValue("constraints.multipleOf3", constraints.multipleOf3);
    }
  }, [presetOptions, setValue]);

  const setValueAs = (v: string) => (!Number.isNaN(v) ? v : null);

  return (
    <Card classNames={{base: "w-full max-w-md"}}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>Generate numbers for your next games</CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-2">
            <Select
              label="Select a preset"
              placeholder="Choose a preset to auto-fill the form"
              selectedKeys={selectedPreset ? [selectedPreset] : []}
              onChange={(e) => handlePresetChange(e.target.value)}
              classNames={{
                popover: "bg-gray-800 text-white",
                listboxWrapper: "bg-gray-800"
              }}
            >
              {presetOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <div className="flex flex-row gap-2">
              <Input 
                type="number" 
                {...register("constraints.even", {valueAsNumber: true, setValueAs})} 
                label="Even numbers" 
                value={watchedValues.constraints?.even || ""}
              />
              <Input 
                type="number" 
                {...register("constraints.odd", {valueAsNumber: true, setValueAs})} 
                label="Odd numbers" 
                value={watchedValues.constraints?.odd || ""}
              />
            </div>

            <div className="flex flex-row gap-2">
              <Input 
                type="number" 
                {...register("constraints.prime", {valueAsNumber: true, setValueAs})} 
                label="Prime numbers" 
                value={watchedValues.constraints?.prime || ""}
              />
              <Input 
                type="number" 
                {...register("constraints.fibonacci", {valueAsNumber: true, setValueAs})} 
                label="Fibonacci numbers" 
                value={watchedValues.constraints?.fibonacci || ""}
              />
            </div>

            <div className="flex flex-row gap-2">
              <Input 
                type="number" 
                {...register("constraints.multipleOf3", {valueAsNumber: true, setValueAs})} 
                label="Numbers multiple of 3"
                value={watchedValues.constraints?.multipleOf3 || ""}
              />

              <Input 
                type="number" 
                {...register("amountOfSets", {valueAsNumber: true, setValueAs})} 
                label="Amount of games to generate" 
                value={watchedValues.amountOfSets || ""}
              />
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <Button type="submit">Generate</Button>
        </CardFooter>
      </Form>
    </Card>
  )
}
