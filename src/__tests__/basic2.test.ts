import { ServiceState } from "../service_store";
import { _launch } from "../commands";
import { parseStringToDate } from "../lib";
import { FEE_RATES } from "../constants";
import { addMinutes } from "date-fns";
import { parseDateToString } from "../lib";
jest.spyOn(global.console, "log");

test("2_Basic", function () {
  const {
    upload,
    launch,
    upgrade,
    change,
    calcEndOfMonth,
    service,
  } = ServiceState.getState();

  // LAUNCH 2021-04-01 12:00 100
  launch(parseStringToDate("2021-04-01 12:00"), 100);
  
  // UPGRADE 2021-04-01 12:01 10000
  upgrade(parseStringToDate("2021-04-01 12:01"), 10000);

  // CHANGE 2021-04-01 12:02 u 50000
  change(parseStringToDate("2021-04-01 12:02"), "u", 50000);


  // LAUNCH 2021-04-01 18:00 100
  launch(parseStringToDate("2021-04-01 18:00"), 100);
  
  // CHANGE 2021-04-01 19:00 u 100000
  change(parseStringToDate("2021-04-01 19:00"), "u", 100000);
  
  // LAUNCH 2021-04-01 19:00 100
  launch(parseStringToDate("2021-04-01 19:00"), 100);
  

  // CALC
  calcEndOfMonth()
    
  // UPLOAD 2021-05-01 12:00 15000000000
  upload(parseStringToDate("2021-05-01 12:00"), 15000000000);

  // CALC
  calcEndOfMonth()

  // UPLOAD 2021-06-01 12:00 15000000000
  upload(parseStringToDate("2021-06-01 12:00"), 15000000000);

  // UPLOAD 2021-06-01 12:30 150000000000
  upload(parseStringToDate("2021-06-01 12:30"), 150000000000); 

  // LAUNCH 2021-06-30 23:59 100
  launch(parseStringToDate("2021-06-30 23:59"), 100);

  // CALC
  calcEndOfMonth()

  const expected = [
    "LAUNCH: 100 2021-04-01 13:01",
    "UPGRADE: 2021-04-01 14:01",
    "CHANGE: 2021-04-01 18:01",
    "LAUNCH: 200 2021-04-01 18:01",
    "CHANGE: -",
    "LAUNCH: 100 2021-04-01 23:59",
    "CALC: 100000 -",
    "UPLOAD: 15000000000 15000000000 -",
    "CALC: 50 -",
    "UPLOAD: 15000000000 30000000000 -",
    "UPLOAD: t",
    "LAUNCH: 100 -",
    "CALC: 60 2021-07-01 10:59",
  ];

  expect(console.log).toHaveBeenCalledTimes(expected.length);
  expected.forEach((msg, i) => 
    expect(console.log).toHaveBeenNthCalledWith(i + 1, msg)
  )
  
});
