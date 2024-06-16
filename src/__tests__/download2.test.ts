import { initialServiceState } from "../service_store";
import { _download } from "../commands";
import { parseStringToDate } from "../lib";
import { RESPONSES } from "../constants";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set)=> ({ service: initialServiceState}));

jest.spyOn(global.console, 'log')

test("2_Download not existing", function() {
  const state = TestStore.getState(); // store.getState();

  _download(state, parseStringToDate("2021-04-03 13:30"), 1000);
  
  expect(state.service.allocation.transfer).toBe(0);

  expect(console.log).toHaveBeenCalledWith(
    RESPONSES.DOWNLOAD_NOT_FOUND()
  )
});