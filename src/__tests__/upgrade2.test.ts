import { ServiceState } from "../service_store";
import { _launch, _upgrade, _fastForward } from "../commands";
import { parseStringToDate } from "../lib";
import { FEE_RATES, SIZE_UNITS, RESPONSES, COMMANDS, ABBREV } from "../constants";

jest.spyOn(global.console, 'log')

test("2_upgrade to paid after auto-shutdown should not update auto shutdown", function() {
  const store = ServiceState.getState();
  const state = store.service;
  const instanceCount = 100;
  const instanceStart = "2021-04-03 12:00";
  
  _fastForward(store, parseStringToDate(instanceStart));
  _launch(store, parseStringToDate(instanceStart), instanceCount); // 100 instances
  expect(state.instances.auto_stop.toLocaleString())
    .toBe(parseStringToDate("2021-04-03 13:01").toLocaleString());

  _fastForward(store, parseStringToDate("2021-04-03 13:31")); // after auto-shutdown
  _upgrade(store, parseStringToDate("2021-04-03 13:31"), 10000); // 10000 yen

  // const maxUsableUptime = (10000 / FEE_RATES.UPTIME.cost * FEE_RATES.UPTIME.unit) + state.allocation.uptime;
  console.log("inst", state.instances)
  expect(state.instances.auto_stop.toLocaleString())
    .toBe(parseStringToDate("2021-04-03 13:01").toLocaleString());
});