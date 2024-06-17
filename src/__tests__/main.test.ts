import { initialServiceState } from "../service_store";
import {
  calcAutoShutdownDate,
  parseStringToDate,
} from "../lib";
describe("Test Cases", () => {
  test("Case 2", () => {
    const initState: ServiceState = structuredClone(initialServiceState);

    const instanceCount = 100;

    const start = parseStringToDate("2021-04-01 12:00");

    expect(
      calcAutoShutdownDate(initState, instanceCount, start).toLocaleString()
    ).toBe(
      parseStringToDate("2021-04-01 13:01").toLocaleString()
    );

    initState.limits.u = 10000;

    expect(
      calcAutoShutdownDate(initState, instanceCount, start).toLocaleString()
    ).toBe(
      parseStringToDate("2021-04-01 14:01").toLocaleString()
    );

    initState.limits.u = 50000;
  
    expect(
      calcAutoShutdownDate(initState, instanceCount, start).toLocaleString()
    ).toBe(
      parseStringToDate("2021-04-01 18:01").toLocaleString()
    );
  });
});
