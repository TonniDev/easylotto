import {Winners} from "@lib/definitions/winners";
import {winnersSchema} from "@lib/definitions/winners.schema";
import {mockFromSchema} from "@lib/utils/mocker";
import { render, screen } from "@testing-library/react";
import {expect} from "vitest";
import {StateColumnKey, PercentageColumnKey, TotalWinnersColumnKey, columnSchema} from "./winners.columns";
import { WinnersTable } from "./WinnersTable";

const baseWinners: Winners = {
  totalWinners: 0,
  totalGames: 1,
  data: [],
};

const mockWinners = mockFromSchema<Winners>(winnersSchema);

describe("WinnersTable Component", () => {

  it("Renders 'No data found' when winners data is empty", () => {
    const {getByText} = render(<WinnersTable winners={baseWinners} />);

    expect(getByText("No data found.")).toBeInTheDocument();
  });

  it("Renders the correct column schema", () => {
    const winners: Winners = {
      ...mockWinners,
      data: [
        ...mockWinners.data,
        { state: "MT", percentage: 12.34, totalWinners: 12345 },
      ],
    };

    render(<WinnersTable winners={winners} />);

    const rowHeader = screen.queryAllByRole('columnheader');

    const headersNames = columnSchema.map(column => column.name);
    const columnsObj = columnSchema.reduce((acc, curr) => {
      acc[curr.key] = curr.name;
      return acc;
    }, {} as Record<string, string>);
    const renderedNames = rowHeader.map(header => header.textContent);

    expect(rowHeader).toHaveLength(3);
    expect(renderedNames).toEqual(headersNames);

    expect(screen.getByText(columnsObj[StateColumnKey])).toBeInTheDocument();
    expect(screen.getByText(columnsObj[PercentageColumnKey])).toBeInTheDocument();
    expect(screen.getByText(columnsObj[TotalWinnersColumnKey])).toBeInTheDocument();
  });

  it("Groups invalid state names under '--'", () => {
    const winners = {
      ...baseWinners,
      data: [
        { state: "BA", percentage: 15.0, totalWinners: 2000 },
        { state: "--", percentage: 5.0, totalWinners: 1000 },
        { state: "Invalid State", percentage: 10.0, totalWinners: 500 },
        { state: "XX", percentage: 0.0, totalWinners: 0 },
      ],
    };

    render(<WinnersTable winners={winners} />);

    // Check valid state row
    expect(screen.getByText("BA")).toBeInTheDocument();

    // Invalid states grouped under '--'
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.getAllByText("--")).toHaveLength(1);
    expect(screen.queryByText("Invalid State")).not.toBeInTheDocument();
  });

  it("Formats percentage values correctly", () => {
    const winners = {
      ...baseWinners,
      data: [
        { state: "SP", percentage: 12.345, totalWinners: 1000 },
        { state: "RJ", percentage: 67.899, totalWinners: 2500 },
      ],
    };

    const {getByTestId} = render(<WinnersTable winners={winners} />);

    expect(getByTestId("percentageCell-SP").textContent).toBe("12.35%");
    expect(getByTestId("percentageCell-RJ").textContent).toBe("67.90%");
  });

  it("Formats number of winners with US number format (comma for thousands separator)", () => {
    const winners = {
      ...baseWinners,
      data: [
        { state: "MG", percentage: 10.5, totalWinners: 1234567.89 },
        { state: "AM", percentage: 20.0, totalWinners: 9876 },
      ],
    };

    render(<WinnersTable winners={winners} />);

    expect(screen.getByTestId("totalWinnersCell-MG").textContent).toBe("1,234,567.89");
    expect(screen.getByTestId("totalWinnersCell-AM").textContent).toBe("9,876");
  });
});
