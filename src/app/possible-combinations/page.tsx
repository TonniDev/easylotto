"use client"
import {Card} from "@heroui/card";
import {Button} from "@heroui/react";
import {getAllPossibleConstraintCombinations} from "@lib/utils/math/gameValidator";
import {useCallback, useEffect, useMemo, useState} from "react";
import CombinationItems from "./CombinationItems";

export default function PossibleCombinationsPage() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalCombinations, setTotalCombinations] = useState(0);
  const [paginatedCombinations, setPaginatedCombinations] = useState([]);

  const itemsPerPage = 20; // Increased from 10 to 20 to show more items per page

  // Calculate total pages based on total combinations
  const totalPages = useMemo(() => 
    Math.ceil(totalCombinations / itemsPerPage), 
    [totalCombinations, itemsPerPage]
  );

  // Handle pagination
  const handleNextPage = useCallback(() => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (page > 0) {
      setPage(page - 1);
    }
  }, [page]);

  // Load combinations for the current page
  useEffect(() => {
    setLoading(true);

    // Use setTimeout to avoid blocking the UI
    const timer = setTimeout(() => {
      // This is a performance optimization to avoid calculating all combinations at once
      // Instead, we calculate only the combinations needed for the current page
      const allCombinations = getAllPossibleConstraintCombinations(15, 1, 25, page * itemsPerPage, itemsPerPage);

      // Set the total combinations count (this is returned by the optimized function)
      setTotalCombinations(allCombinations.totalCount);

      // Set the paginated combinations for the current page
      setPaginatedCombinations(allCombinations.combinations);

      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [page, itemsPerPage]);

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedCombinations.map((combination, i) => (
              <Card key={`combination_${i}`} className="w-full">
                <CombinationItems cardKey={`combination_${i}`} combination={combination} />
              </Card>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm">
              Showing page {page + 1} of {totalPages.toLocaleString()} | Total combinations: {totalCombinations.toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button onPress={handlePrevPage} disabled={page === 0 || loading}>
                Prev
              </Button>
              <Button onPress={handleNextPage} disabled={page === totalPages - 1 || loading}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
