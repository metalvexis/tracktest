import { FEE_RATES, TIME_UNITS, SIZE_UNITS } from "./constants"
import { differenceInMinutes, addMinutes } from "date-fns";
export const calcUsageFeeNow = (
  state: ServiceState,
  tmpAllocTransfer: number,
  tmpAllocStorage: number,
  tmpAllocUptime: number
) => {
  const transferFee = tmpAllocTransfer > state.fee_tiers.free_transfer ?
    FEE_RATES.TRANSFER.cost *
    (
      (tmpAllocTransfer - state.fee_tiers.free_transfer) / (100 * SIZE_UNITS.MB)
    )
    : 0;

  const storageFee = tmpAllocStorage > state.fee_tiers.free_storage ?
    FEE_RATES.STORAGE.cost *
    (
      (tmpAllocStorage - state.fee_tiers.free_storage) / SIZE_UNITS.GB
    ) : 0;

  const uptimeFee = tmpAllocUptime > state.fee_tiers.free_uptime ?
    FEE_RATES.UPTIME.cost *
    (
      (tmpAllocUptime - state.fee_tiers.free_uptime) / (100 * TIME_UNITS.H)
    ) : 0;

  return {
    transferFee, storageFee, uptimeFee
  };
}

export const calcAllocUptime = (state: ServiceState) => {
  let tmpAllocUptime = 0;
  for (const key in state.instances) {
    if (Object.prototype.hasOwnProperty.call(state.instances, key)) {
      const inst = state.instances[key];
      const tmpStop = new Date();
      tmpAllocUptime += inst.count * (differenceInMinutes(inst.stop ? inst.stop : tmpStop, inst.start))
    }
  }

  return tmpAllocUptime;
}

export const calcAutoShutdownDate = (
  state: ServiceState,
  start: Date,
) => {
  const tmpAllocStorage = state.allocation.storage;
  const tmpAllocUptime = calcAllocUptime(state);
  const usage = tmpAllocStorage + tmpAllocUptime;
  const remainingUsageLimit = state.limits.u - usage;
  if (remainingUsageLimit <= 0) {
    return {
      autoShutdown: start,
    }
  }
  const remainingHours = Math.floor(remainingUsageLimit / FEE_RATES.UPTIME.cost);
  return {
    autoShutdown: addMinutes(start, remainingHours / TIME_UNITS.H),

  };
}