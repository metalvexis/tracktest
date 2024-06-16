import { initialServiceState } from "../service_store";
import { _upload } from "../commands";
import { parseStringToDate } from "../lib";
import { SIZE_UNITS, RESPONSES, COMMANDS, ABBREV } from "../constants";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set)=> ({ service: initialServiceState}));

jest.spyOn(global.console, 'log').mockImplementation(() => {});

test("3_upload exceed storage limit", function() {
  const state = TestStore.getState();
  const size = state.service.limits.s + (1 * SIZE_UNITS.GB);
  _upload(state, parseStringToDate("2021-04-03 12:30"), size);
  
  expect(state.service.allocation.storage).toBe(0);
  expect(console.log).toHaveBeenCalledWith(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.s));
});