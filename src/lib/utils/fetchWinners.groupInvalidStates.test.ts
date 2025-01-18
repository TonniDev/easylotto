import {Winners} from "@lib/definitions/winners";
import {winnersSchema} from "@lib/definitions/winners.schema";
import {groupInvalidStates} from "@lib/utils/fetchWinners";
import {mockFromSchema} from "@lib/utils/mocker";
import {describe, it, expect} from "vitest";

const mockData = mockFromSchema<Winners>(winnersSchema);

describe("groupInvalidStates", () => {
  it('should group invalid Brazilian states as "--"', () => {

    const validState = {state: 'RJ', totalWinners: 0, percentage: 0};
    const invalidState = {state: 'Invalid', totalWinners: 0, percentage: 0};
    const mockedWinners = {
      ...mockData,
      data: [validState, ...mockData.data, invalidState],
    };

    const list1 = groupInvalidStates(mockData.data);
    const list2 = groupInvalidStates(mockedWinners.data);

    expect(list1.length).toBe(1);
    expect(list1[0].state).toBe('--');

    expect(list2).toHaveLength(2);
    expect(list2).toContain(validState);
    expect(list2).toContainEqual(expect.objectContaining({state: '--'}));
    expect(list2).not.toContainEqual(expect.objectContaining({state: 'Invalid'}));
  });

  it('should sum the values for percentage and totalWinners fields', () => {
    const mockList = [
      {state: 'Invalid', totalWinners: 2300, percentage: 26.7},
      {state: 'JJ', totalWinners: 740, percentage: 3.1},
      {state: 'XX', totalWinners: 60, percentage: 1.2},
    ];
    const data = groupInvalidStates(mockList);
    expect(data[0].totalWinners).toBe(3100);
    expect(data[0].percentage).toBe(31);
  });
});
