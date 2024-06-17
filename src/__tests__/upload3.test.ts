import { ServiceState } from "../service_store";
import { _upload } from "../commands";
import { parseStringToDate } from "../lib";
import { SIZE_UNITS, RESPONSES, COMMANDS, ABBREV } from "../constants";

jest.spyOn(global.console, 'log')

test("3_upload exceed s", function() {
  const state = ServiceState.getState();
  state.service.limits.t = 100 * SIZE_UNITS.GB;
  const size = state.service.fee_tiers.free_storage + (1 * SIZE_UNITS.GB);
  _upload(state, parseStringToDate("2021-04-03 12:30"), size);
  console.log("state", state)
  expect(state.service.allocation.storage).toBe(0);
  expect(console.log).toHaveBeenCalledWith(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.s));
});