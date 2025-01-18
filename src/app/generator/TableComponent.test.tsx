// TableComponent.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { TableComponent } from "./TableComponent";

// Mock valid Brazilian states
const VALID_BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Utility function to format numbers as US style
const formatUSNumber = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });


describe("TableComponent", () => {
  test("renders table with three specified columns (State, Percentage, Total winners)", () => {
    const mockWinners = {
      totalWinners: 2,
      totalGames: 1,
      data: [
        { state: "SP", percentage: 50.235, totalWinners: 12345 },
        { state: "RJ", percentage: 30.567, totalWinners: 6789 },
      ],
    };

    render(<TableComponent winners={mockWinners} />);

    // Check column headers
    expect(screen.getByText("State")).toBeInTheDocument();
    expect(screen.getByText("Percentage")).toBeInTheDocument();
    expect(screen.getByText("Total winners")).toBeInTheDocument();
  });

  test("renders State column with only valid Brazilian states, allowing '--' as the only invalid state", () => {
    const mockWinners = {
      totalWinners: 3,
      totalGames: 1,
      data: [
        { state: "SP", percentage: 50.235, totalWinners: 12345 },
        { state: "RJ", percentage: 30.567, totalWinners: 6789 },
        { state: "XX", percentage: 10.0, totalWinners: 345 }, // Invalid state
      ],
    };

    render(<TableComponent winners={mockWinners} />);

    const states = screen.getAllByTestId("state-column").map((item) => item.textContent);

    states.forEach((state) => {
      expect(
        VALID_BRAZILIAN_STATES.includes(state || "") || state === "--"
      ).toBe(true);
    });
  });

  test("formats the Percentage column to 2 decimal places with % appended", () => {
    const mockWinners = {
      totalWinners: 1,
      totalGames: 1,
      data: [
        { state: "SP", percentage: 50.235, totalWinners: 12345 },
      ],
    };

    render(<TableComponent winners={mockWinners} />);

    // Check the formatted percentage
    const percentageCell = screen.getByTestId("percentage-column");
    const expectedPercentage = `${mockWinners.data[0].percentage.toFixed(2)}%`
    expect(percentageCell.textContent).toBe(expectedPercentage);
  });

  test("formats the Total winners column as a US number format", () => {
    const mockWinners = {
      totalWinners: 1,
      totalGames: 1,
      data: [
        { state: "SP", percentage: 50.235, totalWinners: 12345.67 },
      ],
    };

    render(<TableComponent winners={mockWinners} />);

    // Check formatted winners count
    const winnersCell = screen.getByTestId("winners-column");
    expect(winnersCell.textContent).toBe("12,345.67");
  });

  test("displays 'No data found.' message when winners list is empty", () => {
    const mockWinners = {
      totalWinners: 0,
      totalGames: 1,
      data: [],
    };

    render(<TableComponent winners={mockWinners} />);

    // Check for no data message
    expect(screen.getByText("No data found.")).toBeInTheDocument();
  });
});
