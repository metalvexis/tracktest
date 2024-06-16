import { initialServiceState } from "../service_store";
import { _upload } from "../commands";
import { parseStringToDate } from "../lib";
import { createStore } from "zustand";

const TestStore = createStore<StoreState>((set)=> ({ service: initialServiceState}));
test("2_upload", function() {
  const state = TestStore.getState(); // store.getState();
  _upload(state, parseStringToDate("2021-04-03 12:30"), 2000);
  
  expect(state.service.allocation.storage).toBe(2000);
});