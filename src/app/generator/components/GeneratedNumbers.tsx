"use client";

import {Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/react";
import {saveGames} from "@lib/utils/saveGames";
import {useState} from "react";
import {GeneratedGameCard} from "./GeneratedGameCard";

interface GeneratedNumbersProps {
  generatedNumbers: number[][] | null;
  sourceData: string[][];
}

export const GeneratedNumbers = ({generatedNumbers, sourceData}: GeneratedNumbersProps) => {
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

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
      const result = await saveGames({
        email,
        name,
        numbers: selectedNumberSets,
      });

      setSaveResult({
        success: true,
        message: `Successfully saved ${result.length} game(s).`
      });
    } catch (error) {
      console.error("Error saving games:", error);
      setSaveResult({
        success: false,
        message: "An error occurred while saving games"
      });
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  // Function to close the toast
  const closeToast = () => {
    setSaveResult(null);
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
          const key = `game_${setIndex}-${set.join('_')}`;
          return (
            <GeneratedGameCard
              key={key}
              set={set}
              index={setIndex}
              selectedGames={selectedGames}
              toggleGameSelection={toggleGameSelection}
              sourceData={sourceData}
            />);
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
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveConfirm}
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
