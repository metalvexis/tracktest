import { DATE_FORMAT, FEE_RATES, TIME_UNITS, SIZE_UNITS } from "./constants";
import {
  parse,
  formatDate,
  differenceInMinutes,
  addMinutes,
  isSameMonth,
  addMonths,
} from "date-fns";

export const calcAllFee = (
  state: ServiceState,
  tmpAllocTransfer: number,
  tmpAllocStorage: number,
  tmpAllocUptime: number
) => {
  const transferFee = calcTransferFee(state, tmpAllocTransfer);
  const storageFee = calcStorageFee(state, tmpAllocStorage);
  const uptimeFee = calcUptimeFee(state, tmpAllocUptime);

  return {
    transferFee,
    storageFee,
    uptimeFee,
  };
};

export const calcTransferFee = (
  state: ServiceState,
  tmpAllocTransfer: number
) => {
  return tmpAllocTransfer > state.fee_tiers.free_transfer
    ? FEE_RATES.TRANSFER.cost *
        ((tmpAllocTransfer - state.fee_tiers.free_transfer) /
          FEE_RATES.TRANSFER.unit)
    : 0;
};

export const calcStorageFee = (
  state: ServiceState,
  tmpAllocStorage: number
) => {
  return tmpAllocStorage > state.fee_tiers.free_storage
    ? FEE_RATES.STORAGE.cost *
        ((tmpAllocStorage - state.fee_tiers.free_storage) /
          FEE_RATES.STORAGE.unit)
    : 0;
};

export const calcUptimeFee = (state: ServiceState, tmpAllocUptime: number) => {
  const isExceedFreeUptime = tmpAllocUptime > state.fee_tiers.free_uptime;
  const hasMoreYen = state.limits.u > 0;

  return hasMoreYen && isExceedFreeUptime
    ? FEE_RATES.UPTIME.cost *
        ((tmpAllocUptime - state.fee_tiers.free_uptime) / FEE_RATES.UPTIME.unit)
    : 0;
};

export const calcAllocUptime = (state: ServiceState, now: Date) => {
  const inst = state.instances;
  const instList = inst.list;
  const auto_stop = inst.auto_stop;
  const calc_until = now >= auto_stop ? auto_stop : now;
  let currUptime = state.allocation.uptime;

  for (const k in instList) {
    if (Object.prototype.hasOwnProperty.call(instList, k)) {
      const elem = instList[k];

      if (elem.count === 0) continue;

      currUptime +=
        elem.count * Math.abs(differenceInMinutes(elem.last_calc, calc_until));
    }
  }

  return currUptime;
};

export const calcAutoShutdownDate = (
  state: ServiceState,
  instanceCount: number,
  start: Date
): Date => {
  if (instanceCount === 0) return start;

  const maxUptime =
    usageLimitToUptimeMinutes(state.limits.u) + state.fee_tiers.free_uptime;
  const currUptime = state.allocation.uptime;
  const usableUptime = Math.floor((maxUptime - currUptime) / instanceCount);
  const shutDate = addMinutes(start, usableUptime + 1);

  return shutDate;
};

export const parseStringToDate = (date: string) => {
  return parse(date, DATE_FORMAT, new Date());
};

export const parseDateToString = (date: Date) => {
  return formatDate(date, DATE_FORMAT);
};

export const usageLimitToUptimeMinutes = (limit: number) => {
  return (limit / FEE_RATES.UPTIME.cost) * FEE_RATES.UPTIME.unit;
};

export function calcLimits(
  draft: StoreState,
  d: Date,
  changes: {
    allocTransfer?: number;
    allocStorage?: number;
    allocUptime?: number;
    transferFee?: number;
    storageFee?: number;
    uptimeFee?: number;
  }
) {
  const state = draft.service;
  const {
    allocTransfer = 0,
    allocStorage = 0,
    storageFee = 0,
    uptimeFee = 0,
    allocUptime = 0,
  } = changes;
  const isExceedT =
    allocTransfer > state.fee_tiers.free_transfer + state.limits.t;
  const isExceedS =
    allocStorage > state.fee_tiers.free_storage + state.limits.s;
  const hasMoreYen = state.limits.u > 0;
  const isExceedFreeUptime = !hasMoreYen
    ? allocUptime > state.fee_tiers.free_uptime
    : false;
  const isExceedU = hasMoreYen
    ? storageFee + uptimeFee > state.limits.u
    : false;

  const isCurrAutoShutLater = state.instances.auto_stop > d;
  const isAutoShutMonth =
    isCurrAutoShutLater && isSameMonth(state.instances.auto_stop, d);
  const isAutoShutNextMonth =
    isCurrAutoShutLater &&
    isSameMonth(addMonths(d, 1), state.instances.auto_stop);

  return {
    isExceedT,
    isExceedS,
    isExceedU,
    isExceedFreeUptime,
    isAutoShutMonth,
    isAutoShutNextMonth,
  };
}

export const getInstanceCount = (list: InstanceRecords): number => {
  return Object.entries(list).reduce((p, c) => p + c[1].count, 0);
};

export function checkChangeLimitT(
  state: ServiceState,
  newLimit: number
): boolean {
  const isWithinLim =
    newLimit >= state.limits.t_min && newLimit <= state.limits.t_max;
  const isGreatThanCurr = state.allocation.transfer <= newLimit;
  return isWithinLim && isGreatThanCurr;
}

export function checkChangeLimitS(
  state: ServiceState,
  newLimit: number
): boolean {
  const isWithinLim =
    newLimit >= state.limits.s_min && newLimit <= state.limits.s_max;
  const isGreatThanCurr = state.allocation.storage <= newLimit;
  return isWithinLim && isGreatThanCurr;
}

export function checkChangeLimitU(
  state: ServiceState,
  newLimit: number
): boolean {
  const isWithinLim = newLimit >= state.limits.u_min;
  const isGreatThanCurr = state.limits.u <= newLimit;
  return isWithinLim && isGreatThanCurr;
}
