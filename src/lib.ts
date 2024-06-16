import { DATE_FORMAT, FEE_RATES, TIME_UNITS, SIZE_UNITS } from "./constants"
import { parse, formatDate, differenceInMinutes, addMinutes } from "date-fns";

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
    transferFee, storageFee, uptimeFee
  };
}

export const calcTransferFee = (
  state: ServiceState,
  tmpAllocTransfer: number,
) => {
  return tmpAllocTransfer > state.fee_tiers.free_transfer ?
    FEE_RATES.TRANSFER.cost *
    (
      (tmpAllocTransfer - state.fee_tiers.free_transfer) / FEE_RATES.TRANSFER.unit
    )
    : 0;
}

export const calcStorageFee = (
  state: ServiceState,
  tmpAllocStorage: number,
) => {
  return tmpAllocStorage > state.fee_tiers.free_storage ?
  FEE_RATES.STORAGE.cost *
  (
    (tmpAllocStorage - state.fee_tiers.free_storage) / FEE_RATES.STORAGE.unit
  ) : 0;
}

export const calcUptimeFee = (
  state: ServiceState,
  tmpAllocUptime: number,
) => {
  return tmpAllocUptime > state.fee_tiers.free_uptime ?
    FEE_RATES.UPTIME.cost *
    (
      (tmpAllocUptime - state.fee_tiers.free_uptime) / FEE_RATES.UPTIME.unit
    ) : 0;
}

export const calcAllocUptime = (state: ServiceState, now: Date) => {
  const inst = state.instances;
  const instList = inst.list;
  const currUptime = state.allocation.uptime;
  let totalTmpAllocUptime = currUptime;

  for (const k in instList) {
    if (Object.prototype.hasOwnProperty.call(instList, k)) {
      const elem = instList[k];
      
      if (elem.count === 0) continue;

      totalTmpAllocUptime += elem.count * (differenceInMinutes(now, elem.last_calc));
    }
  }
  
  return totalTmpAllocUptime;
}

export const calcAutoShutdownDate = (
  state: ServiceState,
  instanceCount: number,
  start: Date,
): Date => {
  const maxUptime = usageLimitToUptimeMinutes(state.limits.u) + state.fee_tiers.free_uptime;
  const currUptime = state.allocation.uptime;
  const usableUptime = Math.floor((maxUptime - currUptime) / instanceCount);
  const shutDate = addMinutes(start, usableUptime + 1);
  return shutDate;
}

export const parseStringToDate = (date: string) => {
  return parse(date, DATE_FORMAT, new Date());
}

export const parseDateToString = (date: Date) => {
  return formatDate(date, DATE_FORMAT);
}

export const usageLimitToUptimeMinutes = (limit: number) => {
  return (limit / FEE_RATES.UPTIME.cost) * FEE_RATES.UPTIME.unit
};
