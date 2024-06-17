import { ServiceState } from "../service_store";
import { _launch } from "../commands";
import { parseStringToDate } from "../lib";

jest.spyOn(global.console, "log");

test("1_Basic", function () {
  const {
    // fastForward,
    upload,
    download,
    remove,
    launch,
    stop,
    calcEndOfMonth,
  } = ServiceState.getState();

  // UPLOAD 2021-04-03 12:30 1000
  upload(parseStringToDate("2021-04-03 12:30"), 1000);
  
  // DELETE 2021-04-04 12:00 500
  remove(parseStringToDate("2021-04-04 12:00"), 500);

  // DOWNLOAD 2021-04-05 13:00 1000
  download(parseStringToDate("2021-04-05 13:00"), 1000);

  // LAUNCH 2021-04-06 12:00 1000
  launch(parseStringToDate("2021-04-06 12:00"), 1000);
  
  // STOP 2021-04-06 12:03 2021-04-06 12:00 500
  stop(
    parseStringToDate("2021-04-06 12:03"),
    parseStringToDate("2021-04-06 12:00"),
    500
  )

  // DELETE 2021-04-07 12:00 1000
  remove(parseStringToDate("2021-04-07 12:00"), 1000)

  // CALC
  calcEndOfMonth();

  const expected = [
    "UPLOAD: 1000 1000 -",
    "DELETE: 500 -",
    "DOWNLOAD: no such files",
    "LAUNCH: 1000 2021-04-06 12:07",
    "STOP: 500 2021-04-06 12:10",
    "DELETE: please increase usage fee limit",
    "CALC: 0 -",
  ];
  expect(console.log).toHaveBeenCalledTimes(expected.length);
  expected.forEach((msg, i) => 
    expect(console.log).toHaveBeenNthCalledWith(i + 1, msg)
  )
});
