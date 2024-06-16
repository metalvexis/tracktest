import { initialServiceState } from "../service_store";
import {
  calcAllFee,
  calcTransferFee,
  calcStorageFee,
  calcUptimeFee,
  calcAllocUptime,
  calcAutoShutdownDate,
  parseDateToString,
  usageLimitToUptimeMinutes,
} from "../lib";
import { DATE_FORMAT, SIZE_UNITS, TIME_UNITS, FEE_RATES } from "../constants";
import { addMinutes } from "date-fns";
describe("LIBRARY", () => {
  test("Calc fees within free tier", () => {
    const initState: ServiceState = { ...initialServiceState };
    const transfer = 10 * SIZE_UNITS.GB;
    const storage = 20 * SIZE_UNITS.GB;
    const uptime = 100 * TIME_UNITS.H;
    const { storageFee, transferFee, uptimeFee } = calcAllFee(
      initState,
      transfer,
      storage,
      uptime
    );

    expect(storageFee).toBe(0);
    expect(transferFee).toBe(0);
    expect(uptimeFee).toBe(0);
  });

  test("Calc fees exceeding storage free tier", () => {
    const initState: ServiceState = { ...initialServiceState };
    const free_storage = initState.fee_tiers.free_storage;
    const excess = 1 * SIZE_UNITS.GB;
    const expectFee =
      (excess / FEE_RATES.STORAGE.unit) * FEE_RATES.STORAGE.cost;
    const storageFee = calcStorageFee(initState, free_storage + excess);

    expect(storageFee).toBe(expectFee);
  });

  test("Calc fees exceeding transfer free tier", () => {
    const initState: ServiceState = { ...initialServiceState };
    const free_transfer = initState.fee_tiers.free_transfer;
    const excess = 1 * SIZE_UNITS.GB;
    const expectFee =
      (excess / FEE_RATES.TRANSFER.unit) * FEE_RATES.TRANSFER.cost;
    const transferFee = calcTransferFee(initState, free_transfer + excess);

    expect(transferFee).toBe(expectFee);
  });

  test("Calc fees exceeding uptime free tier", () => {
    const initState: ServiceState = { ...initialServiceState };
    const free_uptime = initState.fee_tiers.free_uptime; // in Minutes
    const excess = 60;
    const expectFee = (excess / FEE_RATES.UPTIME.unit) * FEE_RATES.UPTIME.cost;
    const uptimeFee = calcUptimeFee(initState, free_uptime + excess);

    expect(uptimeFee).toBe(expectFee);
  });

  test("Calc alloc uptime", () => {
    const initState: ServiceState = { ...initialServiceState };
    const instanceCount = 1;
    const start = new Date(2024, 0, 1, 0, 0);
    const minutesLater = 60;
    const later = addMinutes(start, minutesLater);
    const expectUptime = instanceCount * minutesLater;
    const newInst: InstanceMeta = {
      count: instanceCount,
      start,
      last_calc: start,
    };
    
    initState.instances = {
      auto_stop: calcAutoShutdownDate(initState, instanceCount, start),
      list: {
        [parseDateToString(start)]: newInst,
      },
    };

    const uptime = calcAllocUptime(initState, later);
    expect(uptime).toBe(expectUptime);
  });

  test("Convert usage limit to minutes", () => {
    const lim = 100;
    const minutes = usageLimitToUptimeMinutes(lim);
    const expectMinutes = 60;

    expect(minutes).toBe(expectMinutes);
  });

  test("Calc auto-shutdown date 100 instances", () => {
    const initState: ServiceState = { ...initialServiceState };
    const instanceCount = 100;
    const start = new Date(2021, 3, 1, 12, 0, 0);
    const expectShutDate = new Date(2021, 3, 1, 13, 1, 0);
    const shutDate = calcAutoShutdownDate(initState, instanceCount, start);
    expect(shutDate.toLocaleString()).toBe(expectShutDate.toLocaleString());
  });

  test("Calc auto-shutdown date 1000 instances", () => {
    const initState: ServiceState = { ...initialServiceState };
    const instanceCount = 1000;
    const start = new Date(2021, 3, 6, 12, 0, 0);
    const expectShutDate = new Date(2021, 3, 6, 12, 7, 0);
    const shutDate = calcAutoShutdownDate(initState, instanceCount, start);
    expect(shutDate.toLocaleString()).toBe(expectShutDate.toLocaleString());
  });
});
