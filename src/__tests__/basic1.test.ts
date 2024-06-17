import { ServiceState } from "../service_store";
import { _launch } from "../commands";
import { parseStringToDate } from "../lib";
// import { createStore } from "zustand/vanilla";

// const TestStore = createStore<StoreState & StoreActions>((set) => ({
//   service: initialServiceState,
// }));

jest.spyOn(global.console, "log");

test("1_Basic", function () {
  const {
    // fastForward,
    upload,
    download,
    remove,
    launch,
    stop
  } = ServiceState.getState();

  // fastForward(parseStringToDate("2021-04-03 12:30"), "UPLOAD");
  upload(parseStringToDate("2021-04-03 12:30"), 1000);
  
  // fastForward(parseStringToDate("2021-04-04 12:00"), "DELETE");
  remove(parseStringToDate("2021-04-04 12:00"), 500);

  // fastForward(parseStringToDate("2021-04-05 13:00"), "DOWNLOAD");
  download(parseStringToDate("2021-04-05 13:00"), 1000);

  // fastForward(parseStringToDate("2021-04-06 12:00"), "LAUNCH");
  launch(parseStringToDate("2021-04-06 12:00"), 1000);
  
  // fastForward(parseStringToDate("2021-04-06 12:03"), "STOP");
  console.log("STATE :", ServiceState.getState().service);
  stop(
    parseStringToDate("2021-04-06 12:03"),
    parseStringToDate("2021-04-06 12:00"),
    500
  )

  // fastForward(parseStringToDate("2021-04-07 12:00"), "DELETE");
  remove(parseStringToDate("2021-04-07 12:00"), 1000)
  console.log("STATE :", ServiceState.getState().service);
});
