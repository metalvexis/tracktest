import { initialServiceState } from "../service_store";
import { _upload } from "../commands";
import { parseStringToDate } from "../lib";
import { SIZE_UNITS, RESPONSES, COMMANDS, ABBREV } from "../constants";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set)=> ({ service: initialServiceState}));

jest.spyOn(global.console, 'log').mockImplementation(() => {});

test("1_upload", function() {
  const state = TestStore.getState(); // store.getState();
  const size = 99 * SIZE_UNITS.GB;
  _upload(state, parseStringToDate("2021-04-03 12:30"), size);
  
  expect(console.log).toHaveBeenCalledWith(RESPONSES.UPLOAD_SUCCESS(size, size, null));
  expect(state.service.allocation.storage).toBe(size);
});