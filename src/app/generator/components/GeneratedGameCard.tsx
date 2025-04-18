import {Card, CardBody, CardHeader} from "@heroui/card";
import {Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerHeader, useDisclosure} from "@heroui/react";
import {isEven, isFibonacci, isMultipleOf3, isOdd, isPrime} from "@lib/utils/math/baseOperations";

interface GeneratedGameCardProps {
  set: number[];
  index: number;
  selectedGames: number[];
  toggleGameSelection: (index: number) => void;
}

export const GeneratedGameCard = ({set, index, selectedGames, toggleGameSelection}: GeneratedGameCardProps) => {
  // Use the useDisclosure hook to manage the drawer state
  const {isOpen, onOpen, onClose} = useDisclosure();

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

  // Get numbers by their properties
  const primeNumbers = getNumbersByProperty(set, isPrime);
  const fibonacciNumbers = getNumbersByProperty(set, isFibonacci);
  const multipleOf3Numbers = getNumbersByProperty(set, isMultipleOf3);
  const oddNumbers = getNumbersByProperty(set, isOdd);
  const evenNumbers = getNumbersByProperty(set, isEven);

  // Generate the statKey
  const statKey = generateStatKey(set);

  // Check if this game is selected
  const isSelected = selectedGames.includes(index);

  return (
    <Card classNames={{base: `w-full ${isSelected ? 'border-2 border-primary-500' : ''}`}}>
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Game {index + 1}</h3>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => toggleGameSelection(index)}
          aria-label={`Select Game ${index + 1}`}
        />
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
          <div className="mt-4 flex justify-center">
            <Button color="primary" variant="flat" size="sm" onPress={onOpen}>
              View Info
            </Button>
          </div>
        </div>
      </CardBody>

      {/* Drawer for detailed game information */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
        <DrawerContent className="bg-background dark:bg-background">
          <DrawerHeader className="border-b border-divider">Game {index + 1} Details</DrawerHeader>
          <DrawerBody>
            <div className="p-4">
              <h3 className="text-xl font-bold mb-4">Game Information</h3>
              <p className="mb-2">This is a placeholder for detailed game information.</p>
              <p className="mb-2">In the future, this drawer will contain more comprehensive statistics and analysis about this game.</p>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Game Numbers</h4>
                <div className="flex flex-wrap gap-2">
                  {set.map((number, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
                      {number}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}
