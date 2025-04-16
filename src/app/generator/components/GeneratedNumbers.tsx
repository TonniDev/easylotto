"use client";

import {Card, CardBody, CardHeader} from "@heroui/card";
import {Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/react";
import {isEven, isFibonacci, isMultipleOf3, isOdd, isPrime} from "@lib/utils/math/baseOperations";
import {useState} from "react";
import {saveGames} from "@lib/utils/saveGames";

interface GeneratedNumbersProps {
  generatedNumbers: number[][] | null;
}

export const GeneratedNumbers = ({generatedNumbers}: GeneratedNumbersProps) => {
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveResult, setSaveResult] = useState<{success: boolean; message: string} | null>(null);

  const {isOpen, onOpen, onClose} = useDisclosure();

  if (!generatedNumbers || generatedNumbers.length === 0) {
    return null;
  }

  // Function to toggle game selection
  const toggleGameSelection = (index: number) => {
    setSelectedGames(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Function to handle save button click
  const handleSaveClick = () => {
    onOpen();
  };

  // Function to handle save confirmation
  const handleSaveConfirm = async () => {
    if (!email || !name) {
      setSaveResult({
        success: false,
        message: "Email and name are required"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Get the selected number sets
      const selectedNumberSets = selectedGames.map(index => generatedNumbers[index]);

      // Call the API to save the games
      const response = await fetch('/api/v1/games/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          numbers: selectedNumberSets,
        }),
      });

      const result = await response.json();

      setSaveResult({
        success: result.success,
        message: result.message
      });

      if (result.success) {
        // Reset form and selection on success
        setEmail("");
        setName("");
        setSelectedGames([]);
        onClose();
      }
    } catch (error) {
      console.error("Error saving games:", error);
      setSaveResult({
        success: false,
        message: "An error occurred while saving games"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to close the toast
  const closeToast = () => {
    setSaveResult(null);
  };

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
    <>
      {/* Save button - appears when at least one game is selected */}
      {selectedGames.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button 
            color="primary" 
            onClick={handleSaveClick}
          >
            Save Selected Games ({selectedGames.length})
          </Button>
        </div>
      )}

      {/* Toast notification for success/error messages */}
      {saveResult && (
        <div 
          className={`mb-4 p-4 rounded-md flex justify-between items-center ${
            saveResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <span>{saveResult.message}</span>
          <button 
            onClick={closeToast}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Grid of game cards */}
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

          // Check if this game is selected
          const isSelected = selectedGames.includes(setIndex);

          return (
            <Card key={setIndex} classNames={{base: `w-full ${isSelected ? 'border-2 border-primary-500' : ''}`}}>
              <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Game {setIndex + 1}</h3>
                <Checkbox
                  isSelected={isSelected}
                  onValueChange={() => toggleGameSelection(setIndex)}
                  aria-label={`Select Game ${setIndex + 1}`}
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
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Modal for entering email and name */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Save Selected Games</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name for this set <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Give a name to these games"
                  required
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onClick={handleSaveConfirm}
              isLoading={isSaving}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
