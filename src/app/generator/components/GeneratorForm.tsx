"use client"

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Button, Form, Input} from "@heroui/react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useCallback} from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const lotofacilFormSchema = z.object({
  constraints: z.object({
    even: z.nullable(z.number().optional()),
    odd: z.nullable(z.number().optional()),
    prime: z.nullable(z.number().optional()),
    fibonacci: z.nullable(z.number().optional()),
    multipleOf3: z.nullable(z.number().optional()),
  }).optional(),
  amountOfSets: z.nullable(z.number().optional()),
});

type LotofacilFormValues = z.infer<typeof lotofacilFormSchema>;

export default function GeneratorForm() {

  const {handleSubmit, register} = useForm<LotofacilFormValues>({
    mode: "onChange",
    resolver: zodResolver(lotofacilFormSchema),
    defaultValues: {
      constraints: {
        even: null,
        odd: null,
        prime: null,
        fibonacci: null,
        multipleOf3: null,
      },
      amountOfSets: null,
    }
  });

  const onSubmit = useCallback(async (data: LotofacilFormValues) => {
    console.log("@tonni", data);
  }, []);

  const setValueAs = (v: string) => (!Number.isNaN(v) ? v : null);

  return (
    <Card classNames={{base: "w-full max-w-md"}}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>Generate numbers for your next games</CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Input type="number" {...register("constraints.even", {valueAsNumber: true, setValueAs})} label="Even numbers" />
              <Input type="number" {...register("constraints.odd", {valueAsNumber: true})} label="Odd numbers" />
            </div>

            <div className="flex flex-row gap-2">
              <Input type="number" {...register("constraints.prime", {valueAsNumber: true})} label="Prime numbers" />
              <Input type="number" {...register("constraints.fibonacci", {valueAsNumber: true})} label="Fibonacci numbers" />
            </div>

            <div className="flex flex-row gap-2">
              <Input type="number" {...register("constraints.multipleOf3", {valueAsNumber: true})} label="Numbers multiple of 3"/>

              <Input type="number" {...register("amountOfSets", {valueAsNumber: true})} label="Amount of games to generate" />
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
