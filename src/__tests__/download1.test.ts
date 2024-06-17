import { initialServiceState } from "../service_store";
import { _upload, _download } from "../commands";
import { parseStringToDate } from "../lib";
import { RESPONSES, SIZE_UNITS } from "../constants";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set)=> ({ service: initialServiceState}));

jest.spyOn(global.console, 'log')

test("1_Download existing", function() {
  const state = TestStore.getState();
  const size = 5 * SIZE_UNITS.GB;
  const existingFileSize = 5 * SIZE_UNITS.GB;
  state.service.allocation.storage = existingFileSize;
  state.service.allocation.transfer = existingFileSize;

  _download(state, parseStringToDate("2021-04-03 13:30"), size);
  
  expect(state.service.allocation.storage).toBe(existingFileSize);
  expect(state.service.allocation.transfer).toBe(existingFileSize + size);

  expect(console.log).toHaveBeenCalledWith(
    RESPONSES.DOWNLOAD_SUCCESS(existingFileSize + size, null)
  )
});