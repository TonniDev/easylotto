import {Constraints} from "@lib/utils/math/types";

interface CombinationItemsProps {
  cardKey: string;
  combination: Constraints;
}
export default function CombinationItems({cardKey, combination}: CombinationItemsProps) {
  const l = Object.entries(combination).map(([key, value]) => ({key, value}));

  return l.map((item, i) => {
    return <p key={`${cardKey}-${item.key}${i}`}>
      {item.key}: {item.value}
    </p>
  })
}
