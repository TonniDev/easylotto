"use client";

import {Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/react";
import {useState} from "react";
import {GeneratedGameCard} from "./GeneratedGameCard";
import { useAuth } from "@ui/providers/AuthProvider";

interface GeneratedNumbersProps {
  generatedNumbers: number[][] | null;
  sourceData: string[][];
}

export const GeneratedNumbers = ({generatedNumbers, sourceData}: GeneratedNumbersProps) => {
  const { getAuthHeaders } = useAuth();
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [groupName, setGroupName] = useState<string>("");
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
    setIsSaving(true);

    try {
      // Get the selected number sets
      const selectedNumberSets = selectedGames.map(index => generatedNumbers[index]);

      // Call the API to save the games with authentication
      const response = await fetch('/api/v1/games/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          numbers: selectedNumberSets,
          group: groupName || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveResult({
          success: true,
          message: result.message
        });
        // Clear selections after successful save
        setSelectedGames([]);
        setGroupName("");
      } else {
        setSaveResult({
          success: false,
          message: result.message || "Failed to save games"
        });
      }
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
              <p className="text-foreground/70">
                You are about to save {selectedGames.length} game(s) to your account.
              </p>
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium mb-1">
                  Group Name (Optional)
                </label>
                <Input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter a group name to organize these games"
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Group names help you organize and filter your saved games later.
                </p>
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
              Save Games
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
