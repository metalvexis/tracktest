import { ServiceState } from "../service_store";
import { _delete } from "../commands";
import { parseStringToDate } from "../lib";
import { RESPONSES, SIZE_UNITS } from "../constants";
import { createStore } from "zustand";

jest.spyOn(global.console, 'log')

test("1_Delete existing", function() {
  const state = ServiceState.getState(); // store.getState();
  const size = 2 * SIZE_UNITS.GB;
  const existingFileSize = 2 * SIZE_UNITS.GB;
  state.service.allocation.storage = existingFileSize;
  state.service.allocation.transfer = existingFileSize;

  _delete(state, parseStringToDate("2021-04-03 13:30"), size);
  
  expect(state.service.allocation.storage).toBe(existingFileSize - size);

  expect(console.log).toHaveBeenCalledWith(
    RESPONSES.DELETE_SUCCESS(existingFileSize - size, null)
  )
});