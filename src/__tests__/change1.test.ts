import { ServiceState } from "../service_store";
import { _launch, _upgrade, _fastForward } from "../commands";
import { parseStringToDate } from "../lib";
import { FEE_RATES, SIZE_UNITS, RESPONSES, COMMANDS, ABBREV } from "../constants";

jest.spyOn(global.console, 'log')

test("1_change value t", function() {
  const store = ServiceState.getState();
  const state = store.service;
  _upgrade(store, parseStringToDate("2021-04-03 12:00"), 10000); // 10000 yen

  expect(state.limits.t).toBe(100 * SIZE_UNITS.GB);
  expect(state.limits.s).toBe(100 * SIZE_UNITS.GB);
  expect(state.limits.u).toBe(10000);

});