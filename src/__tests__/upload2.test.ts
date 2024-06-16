import { initialServiceState } from "../service_store";
import { _upload } from "../commands";
import { parseStringToDate } from "../lib";
import { SIZE_UNITS, RESPONSES, COMMANDS, ABBREV } from "../constants";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set)=> ({ service: initialServiceState}));

jest.spyOn(global.console, 'log')

test("2_upload usage overrun", function() {
  const state = TestStore.getState(); // store.getState();
  const size = state.service.fee_tiers.free_storage + (11 * SIZE_UNITS.GB);
  state.service.limits.u = 10; // 10 Yen is 10 GB extra storage
  _upload(state, parseStringToDate("2021-04-03 12:30"), size);
  
  expect(state.service.allocation.storage).toBe(0);
  expect(console.log).toHaveBeenCalledWith(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.UPLOAD));
});