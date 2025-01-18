"use client";

import {Winners} from "@lib/definitions/winners";
import {Table, TableHeader, TableBody, TableColumn, TableCell, TableRow} from "@nextui-org/react";
import {useCallback} from "react";

interface TableComponentProps {
  winners: Winners;
}

const VALID_BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export const TableComponent: React.FC<TableComponentProps> = ({winners}) => {

  const {data} = winners;

  const formatPercentage = useCallback((value: number) =>
    `${value.toFixed(2)}%`, []);

  // Helper to format numbers into US style (comma for thousands, dot for decimals)
  const formatWinners = useCallback((value: number) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }), []);

  return (
    <>
      {data.length === 0 ? (
        // Renders a message if the data is empty
        <p>No data found.</p>
      ) : (
        // Renders the table with NextUI Table component
        <Table
          aria-label="Lottery Winners by State"
        >
          <TableHeader>
            <TableColumn>State</TableColumn>
            <TableColumn>Percentage</TableColumn>
            <TableColumn>Total winners</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <span data-testid="state-column">{
                    // If state is invalid, display "--", otherwise the state
                    VALID_BRAZILIAN_STATES.includes(row.state) ? row.state : "--"
                  }</span>
                </TableCell>
                <TableCell data-testid="percentage-column">
                  {
                    // Format percentage correctly
                    formatPercentage(row.percentage)
                  }
                </TableCell>
                <TableCell data-testid="winners-column">
                  {
                    // Format winners count in US number style
                    formatWinners(row.totalWinners)
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
};
