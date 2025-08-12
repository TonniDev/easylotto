"use client";

import {Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/react";
import {useState} from "react";
import {GeneratedSetCard} from "./GeneratedSetCard";
import { useAuth } from "@ui/providers/AuthProvider";

interface GeneratedSetsProps {
  generatedSets: {
    groups: {
      name: string;
      numbers: number[][];
    }[];
  };
  sourceData: string[][];
}

export const GeneratedSets = ({generatedSets, sourceData}: GeneratedSetsProps) => {
  const { getAuthHeaders } = useAuth();
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  const {isOpen, onOpen, onClose} = useDisclosure();

  if (!generatedSets || generatedSets.groups.length === 0) {
    return null;
  }

  // Function to toggle group selection
  const toggleGroupSelection = (index: number) => {
    setSelectedGroups(prev => {
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
      // Get all games from selected groups
      const allGamesToSave: number[][] = [];
      const groupNames: string[] = [];

      selectedGroups.forEach(groupIndex => {
        const group = generatedSets.groups[groupIndex];
        groupNames.push(group.name);

        // Add all games from this group
        group.numbers.forEach(game => {
          allGamesToSave.push(game);
        });
      });

      // Save each group separately with authentication
      const savePromises = [];

      for (let groupIndex = 0; groupIndex < selectedGroups.length; groupIndex++) {
        const selectedGroupIndex = selectedGroups[groupIndex];
        const group = generatedSets.groups[selectedGroupIndex];

        // Save all games in this group together
        const savePromise = fetch('/api/v1/games/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            numbers: group.numbers,
            group: group.name,
          }),
        }).then(response => response.json());

        savePromises.push(savePromise);
      }

      // Wait for all saves to complete
      const results = await Promise.all(savePromises);

      // Count total saved games
      const totalSavedGames = results.reduce((total, result) => {
        return total + (result.savedGames ? result.savedGames.length : 0);
      }, 0);

      setSaveResult({
        success: true,
        message: `Successfully saved ${totalSavedGames} game(s) in ${selectedGroups.length} group(s).`
      });

      // Clear selections after successful save
      setSelectedGroups([]);
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
      {/* Save button - appears when at least one group is selected */}
      {selectedGroups.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button
            color="primary"
            onClick={handleSaveClick}
          >
            Save Selected Groups ({selectedGroups.length})
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

      {/* Display groups */}
      <div className="mt-8 space-y-8">
        {generatedSets.groups.map((group, groupIndex) => (
          <GeneratedSetCard
            key={`group_${groupIndex}`}
            group={group}
            index={groupIndex}
            selectedGroups={selectedGroups}
            toggleGroupSelection={toggleGroupSelection}
            sourceData={sourceData}
          />
        ))}
      </div>

      {/* Modal for entering email and name */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Save Selected Groups</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-foreground/70">
                You are about to save {selectedGroups.length} group(s) with all their games to your account.
              </p>
              <div className="bg-foreground/5 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Selected Groups:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedGroups.map(groupIndex => (
                    <li key={groupIndex} className="text-sm">
                      {generatedSets.groups[groupIndex].name} ({generatedSets.groups[groupIndex].numbers.length} games)
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-foreground/60">
                Each group will be saved with its original name for easy organization.
              </p>
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
              Save All Groups
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
