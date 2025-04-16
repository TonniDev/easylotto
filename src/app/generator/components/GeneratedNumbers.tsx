"use client";

import {Card, CardBody, CardHeader} from "@heroui/card";
import {isEven, isFibonacci, isMultipleOf3, isOdd, isPrime} from "@lib/utils/math/baseOperations";

interface GeneratedNumbersProps {
  generatedNumbers: number[][];
}

export const GeneratedNumbers = ({generatedNumbers}: GeneratedNumbersProps) => {
  if (!generatedNumbers || generatedNumbers.length === 0) {
    return null;
  }

  // Function to filter numbers by their properties
  const getNumbersByProperty = (set: number[], filterFn: (num: number) => boolean) => {
    return set.filter(filterFn);
  };

  // Function to generate the statKey format
  const generateStatKey = (set: number[]) => {
    const fibonacciCount = getNumbersByProperty(set, isFibonacci).length;
    const primeCount = getNumbersByProperty(set, isPrime).length;
    const multipleOf3Count = getNumbersByProperty(set, isMultipleOf3).length;
    const oddCount = getNumbersByProperty(set, isOdd).length;
    const evenCount = getNumbersByProperty(set, isEven).length;

    return `fr${fibonacciCount}_pr${primeCount}_mr${multipleOf3Count}_or${oddCount}_er${evenCount}`;
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {generatedNumbers.map((set, setIndex) => {
        // Get numbers by their properties
        const primeNumbers = getNumbersByProperty(set, isPrime);
        const fibonacciNumbers = getNumbersByProperty(set, isFibonacci);
        const multipleOf3Numbers = getNumbersByProperty(set, isMultipleOf3);
        const oddNumbers = getNumbersByProperty(set, isOdd);
        const evenNumbers = getNumbersByProperty(set, isEven);

        // Generate the statKey
        const statKey = generateStatKey(set);

        return (
          <Card key={setIndex} classNames={{base: "w-full"}}>
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Game {setIndex + 1}</h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {set.map((number, numberIndex) => (
                  <div 
                    key={numberIndex} 
                    className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold"
                  >
                    {number}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm">
                <div className="font-medium mb-2">Details:</div>
                <div className="grid grid-cols-1 gap-1">
                  <div>Fibonacci numbers ({fibonacciNumbers.length}): {fibonacciNumbers.join(', ')}</div>
                  <div>Prime numbers ({primeNumbers.length}): {primeNumbers.join(', ')}</div>
                  <div>Multiples of 3 ({multipleOf3Numbers.length}): {multipleOf3Numbers.join(', ')}</div>
                  <div>Odd numbers ({oddNumbers.length}): {oddNumbers.join(', ')}</div>
                  <div>Even numbers ({evenNumbers.length}): {evenNumbers.join(', ')}</div>
                </div>
                <div className="mt-2 font-medium">
                  StatKey: {statKey}
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};
