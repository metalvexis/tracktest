import { ServiceState } from "../service_store";
import { _stop } from "../commands";
import { parseStringToDate } from "../lib";
import { RESPONSES, SIZE_UNITS } from "../constants";
import { addMinutes } from "date-fns";

jest.spyOn(global.console, "log");

test("2_Stop success", function () {
  const state = ServiceState.getState();
  const strDate = "2021-04-03 12:00"
  const date1 = parseStringToDate(strDate);
  const startDate = parseStringToDate(strDate);
  state.service.instances = {
    auto_stop: addMinutes(date1, 201),
    list: {
      [strDate]: {
        count: 30,
        start: date1,
        last_calc: date1,
      }
    },
  }
  const stopInstance = 15;

  _stop(state, date1, startDate, stopInstance);
  expect(console.log).toHaveBeenNthCalledWith(
    1,
    RESPONSES.STOP_SUCCESS(15, addMinutes(date1, 401))
  );
  expect(state.service.instances.auto_stop.toLocaleString()).toBe(
    addMinutes(date1, 401).toLocaleString()
  );
});
