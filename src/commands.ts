import { RESPONSES, COMMANDS, ABBREV } from "./constants";
import { calcAllFee, calcUptimeFee, calcAllocUptime } from "./lib";
import { isSameMonth, differenceInMinutes } from "date-fns";

export function _upload(
  draft: StoreState,
  d: Date,
  size: number // in Bytes
) {
  const state = draft.service;
  const allocTransfer = state.allocation.transfer + size;
  const allocStorage = state.allocation.storage + size;
  const allocUptime = state.allocation.uptime;

  const { storageFee, transferFee, uptimeFee } = calcAllFee(
    state,
    allocTransfer,
    allocStorage,
    allocUptime
  );

  const isExceedT = allocTransfer > state.limits.t;
  const isExceedS = allocStorage > state.limits.s;
  const isExceedU = storageFee + uptimeFee > state.limits.u;
  const isAutoShutMonth =
    state.instances.stop && isSameMonth(state.instances.stop, d);

  if (isExceedU) {
    return console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.UPLOAD));
  }

  if (isExceedT) {
    return console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.t));
  }

  if (isExceedS) {
    return console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.s));
  }

  state.allocation.storage = allocStorage;
  state.allocation.transfer = allocTransfer;

  state.calculated_fees.storage = storageFee;
  state.calculated_fees.transfer = transferFee;
  state.calculated_fees.uptime = uptimeFee;

  return console.log(
    RESPONSES.UPLOAD_SUCCESS(
      size,
      size,
      isAutoShutMonth ? state.instances.stop : null
    )
  );
}

export function _updateUptimeAlloc(draft: StoreState, now: Date) {
  const allocUptime = calcAllocUptime(draft.service, now);
  const isLastMinute =
    differenceInMinutes(now, draft.service.instances.stop) === 1;

  if (isLastMinute) return;

  draft.service.instances.last_calc = now;
  draft.service.allocation.uptime = allocUptime;
}

export function _updateUptimeFee(draft: StoreState) {
  const allocUptime = draft.service.allocation.uptime;
  const uptimeFee = calcUptimeFee(draft.service, allocUptime);
  draft.service.calculated_fees.uptime = uptimeFee;
}

export function _assertUsageOverrun(draft: StoreState) {
  const state = draft.service;
  const isOverrun =
    state.calculated_fees.storage + state.calculated_fees.uptime >
    state.limits.u;

  if (isOverrun) {
    draft.service.is_fee_overrun = true;
    draft.service.instances.count = 0;
  }

  return isOverrun;
}
