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

test("1_Launch 90", function () {
  const state = TestStore.getState(); // store.getState();
  const instanceCount = 30;
  const date1 = parseStringToDate("2021-04-03 12:00");
  const date2 = parseStringToDate("2021-04-03 12:01");
  const date3 = parseStringToDate("2021-04-03 12:02");

  _launch(state, date1, instanceCount);
  expect(console.log).toHaveBeenNthCalledWith(
    1,
    RESPONSES.LAUNCH_SUCCESS(instanceCount, addMinutes(date1, 201))
  );
  // console.log("date1", state.service.instances.auto_stop.toLocaleString())
  expect(state.service.instances.auto_stop.toLocaleString()).toBe(
    addMinutes(date1, 201).toLocaleString()
  );

  _launch(state, date2, instanceCount);
  expect(console.log).toHaveBeenNthCalledWith(
    2,
    RESPONSES.LAUNCH_SUCCESS(instanceCount * 2, addMinutes(date2, 101))
  );
  // console.log("date2", state.service.instances.auto_stop.toLocaleString())
  expect(state.service.instances.auto_stop.toLocaleString()).toBe(
    addMinutes(date2, 101).toLocaleString()
  );

  _launch(state, date3, instanceCount);
  expect(console.log).toHaveBeenNthCalledWith(
    3,
    RESPONSES.LAUNCH_SUCCESS(instanceCount * 3, addMinutes(date3, 67))
  );
  // console.log("date3", state.service.instances.auto_stop.toLocaleString())
  expect(state.service.instances.auto_stop.toLocaleString()).toBe(
    addMinutes(date3, 67).toLocaleString()
  );
});
