import { initialServiceState } from "../service_store";
import { _delete } from "../commands";
import { parseStringToDate } from "../lib";
import { RESPONSES, SIZE_UNITS } from "../constants";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set)=> ({ service: initialServiceState}));

jest.spyOn(global.console, 'log').mockImplementation(() => {});

test("2_Delete not existing", function() {
  const state = TestStore.getState(); // store.getState();
  const size = 50 * SIZE_UNITS.GB;

  _delete(state, parseStringToDate("2021-04-03 13:30"), size);
  
  expect(state.service.allocation.storage).toBe(0);

  expect(console.log).toHaveBeenCalledWith(
    RESPONSES.DELETE_NOT_FOUND()
  )
});