import { ServiceState } from "../service_store";
import { _upload } from "../commands";
import { parseStringToDate } from "../lib";
import { SIZE_UNITS, RESPONSES, COMMANDS, ABBREV } from "../constants";

jest.spyOn(global.console, 'log')

test("1_upload", function() {
  const state = ServiceState.getState(); // store.getState();
  const size = 2 * SIZE_UNITS.GB;

  _upload(state, parseStringToDate("2021-04-03 12:30"), size);
  expect(state.service.allocation.storage).toBe(size);
  expect(console.log).toHaveBeenNthCalledWith(1, RESPONSES.UPLOAD_SUCCESS(size, size, null));

  _upload(state, parseStringToDate("2021-04-03 13:30"), size);
  expect(console.log).toHaveBeenNthCalledWith(2, RESPONSES.UPLOAD_SUCCESS(size*2, size*2, null));
  expect(state.service.allocation.storage).toBe(size*2);
});