import { initialServiceState } from "../service_store";
import { _launch } from "../commands";
import { parseStringToDate } from "../lib";
import { RESPONSES, SIZE_UNITS } from "../constants";
import { addMinutes } from "date-fns";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set) => ({
  service: initialServiceState,
}));

jest.spyOn(global.console, "log");

test("2_Launch 1 before end-of-month", function () {
  const state = TestStore.getState();
  const instanceCount = 1;
  const date1 = parseStringToDate("2021-04-29 12:00");

  _launch(state, date1, instanceCount);
  expect(console.log).toHaveBeenNthCalledWith(
    1,
    RESPONSES.LAUNCH_SUCCESS(instanceCount, null)
  );
  // console.log("date1", state.service.instances.auto_stop.toLocaleString())
  expect(state.service.instances.auto_stop.toLocaleString()).toBe(
    addMinutes(date1, 6001).toLocaleString()
  );
});
