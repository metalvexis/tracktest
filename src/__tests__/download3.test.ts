import { initialServiceState } from "../service_store";
import { _download, _upload } from "../commands";
import { parseStringToDate } from "../lib";
import { RESPONSES, SIZE_UNITS, COMMANDS, ABBREV } from "../constants";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set)=> ({ service: initialServiceState}));

jest.spyOn(global.console, 'log')

test("3_Download Exceed transfer limit", function() {
  const state = TestStore.getState();
  const size = 100 * SIZE_UNITS.GB;
  const existingFileSize = 100 * SIZE_UNITS.GB;
  state.service.allocation.storage = existingFileSize;
  state.service.allocation.transfer = existingFileSize;

  _download(state, parseStringToDate("2021-04-03 13:30"), size);
  
  expect(state.service.allocation.transfer).toBe(existingFileSize);

  expect(console.log).toHaveBeenCalledWith(
    RESPONSES.EXCEED_LIMIT(COMMANDS.DOWNLOAD, ABBREV.t)
  )
});