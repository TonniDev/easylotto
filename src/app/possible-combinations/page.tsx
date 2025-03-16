"use client"
import {Card} from "@heroui/card";
import {Button} from "@heroui/react";
import {getAllPossibleConstraintCombinations} from "@lib/utils/math/gameValidator";
import {useState} from "react";
import CombinationItems from "./CombinationItems";

export default function PossibleCombinationsPage() {

  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const combinations = getAllPossibleConstraintCombinations(15, 1, 25);
  const filteredCombinations = [...combinations].filter(comb => (
    comb.fibonacci === 4 &&
      comb.prime === 5 &&
      comb.multipleOf3 === 5 &&
      comb.odd === 8 &&
      comb.even === 7
  ));

  const totalPages = Math.ceil(combinations.length / itemsPerPage);

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const paginatedCombinations = [...combinations].slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-4">
      {paginatedCombinations.map((combination, i) => (
        <Card key={`combination_${i}`}>
          <CombinationItems cardKey={`combination_${i}`} combination={combination} />
        </Card>
      ))}
      <div>
        <Button onPress={handlePrevPage} disabled={page === 0}>
          Prev
        </Button>
        <Button onPress={handleNextPage} disabled={page === totalPages - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}
