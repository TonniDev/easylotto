"use client";
import {Winners} from "@lib/definitions/winners";
import {STATES} from "@lib/utils/constants";
import {getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {JSX, useCallback, useMemo} from "react";
import columnSchema from "./winners.columns";

export interface WinnersTableProps {
  winners: Winners;
}

export const WinnersTable: React.FC<WinnersTableProps> = ({winners}) => {

  const list = useMemo(() => (winners?.data && winners.data.length ? winners.data.filter(data => [...STATES, '--'].includes(data.state)) : []), [winners]);

  const formatCell = useCallback((value: any, columnKey: any, state: string): JSX.Element => {
    if (columnKey === "percentage") {
      return (
        <span data-testid={`percentageCell-${state}`}>
          {value.toFixed(2)}%
        </span>
      );
    }
    if (columnKey === "totalWinners") {
      return (
        <span data-testid={`totalWinnersCell-${state}`}>
          {new Intl.NumberFormat("en-US").format(value)}
        </span>
      );
    }
    return value;
  }, []);

  return (
    <Table aria-label="Winners table" data-testid="table" border={1}>
      <TableHeader columns={columnSchema}>
        {(column) => (
          <TableColumn key={column.key} className="align-middle text-center">
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={list} emptyContent="No data found.">
        {(item) => (
          <TableRow key={item.state} className="odd:bg-gray-900">
            {(columnKey) => {
              const value = getKeyValue(item, columnKey);
              return (
                <TableCell className="align-middle text-center py-2">
                  {formatCell(value, columnKey, item.state)}
                </TableCell>
              )
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
