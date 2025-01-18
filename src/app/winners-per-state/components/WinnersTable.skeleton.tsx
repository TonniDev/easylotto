import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import columnSchema from "./winners.columns";

export const WinnersTableSkeleton = () => (
  <div className="skeleton-container">
    <Table aria-label="Loading winners" border={1}>
      <TableHeader columns={columnSchema}>
        {(column) => (
          <TableColumn key={column.key} className="align-middle text-center">
            <div className="skeleton skeleton-header" />
          </TableColumn>
        )}
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, idx) => (
          <TableRow key={idx}>
            <TableCell>
              <div className="skeleton skeleton-row" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
