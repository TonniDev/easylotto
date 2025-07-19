"use client";
import {Winners, WinnersByState} from "@lib/definitions/winners";
import {STATES} from "@lib/utils/constants";
import {getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {useCallback, useMemo} from "react";
import columnSchema, {PercentageColumnKey, TotalWinnersColumnKey} from "./winners.columns";

export interface WinnersTableProps {
  winners: Winners;
}

export const WinnersTable: React.FC<WinnersTableProps> = ({winners}) => {

  const list = useMemo<WinnersByState[]>(() => (winners?.data && winners.data.length ? winners.data.filter(data => [...STATES, '--'].includes(data.state)) : []), [winners]);

  const formatCell = useCallback((value: string | number, columnKey: string, state: string): React.ReactNode => {
    if (columnKey === PercentageColumnKey && typeof value === 'number') {
      return (
        <span data-testid={`percentageCell-${state}`}>
          {value.toFixed(2)}%
        </span>
      );
    }
    if (columnKey === TotalWinnersColumnKey && typeof value === 'number') {
      return (
        <span data-testid={`totalWinnersCell-${state}`}>
          {new Intl.NumberFormat("en-US").format(value)}
        </span>
      );
    }
    return value;
  }, []);

  return (
    <Table aria-label="Winners table" data-testid="table" isStriped>
      <TableHeader columns={columnSchema}>
        {(column) => (
          <TableColumn key={column.key} className="align-middle text-center">
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={list} emptyContent="No data found.">
        {(item) => (
          <TableRow key={item.state}>
            {(columnKey) => {
              const value = getKeyValue(item, columnKey);
              return (
                <TableCell className="align-middle text-center py-2">
                  {formatCell(value, String(columnKey), item.state)}
                </TableCell>
              )
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
