import { RESPONSES, COMMANDS, ABBREV } from './constants'
import { calcUsageFeeNow, calcAllocUptime } from "./lib";

export function _upload(
  draft: ServiceStore,
  d: Date,
  size: number, // in Bytes
) {
  const state = draft.service;
  const allocTransfer = state.allocation.transfer + size;
  const allocStorage = state.allocation.storage + size;
  const allocUptime = calcAllocUptime(state)

  const {
    storageFee,
    transferFee,
    uptimeFee,
  } = calcUsageFeeNow(state, allocTransfer, allocStorage, allocUptime);

  const isExceedT = allocTransfer > state.limits.t;
  const isExceedS = allocStorage > state.limits.s;
  const isExceedU = storageFee + uptimeFee > state.limits.u;
  if (isExceedT) {
    return console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.t))
  }
  if (isExceedS) {
    return console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.s))
  }
  if (isExceedU) {
    return console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.u))
  }
  state.allocation.storage = allocStorage;
  state.allocation.transfer = allocTransfer;
  state.allocation.uptime = allocUptime;
  state.calculated_fees.storage = storageFee;
  state.calculated_fees.transfer = transferFee;
  state.calculated_fees.uptime = uptimeFee;
  state.calculated_fees.usage = storageFee + uptimeFee;
}