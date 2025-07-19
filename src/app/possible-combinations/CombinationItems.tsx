import {Constraints} from "@lib/utils/math/types";
import {CardBody, CardHeader} from "@heroui/card";

interface CombinationItemsProps {
  cardKey: string;
  combination: Constraints;
}

export default function CombinationItems({cardKey, combination}: CombinationItemsProps) {
  const items = Object.entries(combination).map(([key, value]) => ({key, value}));

  // Generate a unique ID for this combination
  const combinationId = `${combination.even}_${combination.odd}_${combination.prime}_${combination.fibonacci}_${combination.multipleOf3}`;

  return (
    <>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium">Combination {cardKey.split('_')[1]}</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-1 text-sm">
          {items.map((item, i) => (
            <div key={`${cardKey}-${item.key}${i}`} className="flex justify-between">
              <span className="font-medium capitalize">{item.key}:</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          ID: {combinationId}
        </div>
      </CardBody>
    </>
  );
}
