import { RESPONSES, COMMANDS, ABBREV } from "./constants";
import { calcAllFee, calcUptimeFee, calcAllocUptime, usageLimitToUptimeMinutes } from "./lib";
import { isSameMonth, differenceInMinutes, addMonths } from "date-fns";

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

  const { isExceedT, isExceedS, isExceedU, isAutoShutMonth  } = _assertLimits(draft, d, {
    allocTransfer,
    allocStorage,
    storageFee,
  });

  if (isExceedS) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.s));
    return;
  }
 
  if (isExceedT) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.t));
    return;
  }

  if(isExceedU) {
    console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.UPLOAD));
    return;
  }

  state.allocation.storage = allocStorage;
  state.allocation.transfer = allocTransfer;

  state.calculated_fees.storage = storageFee;
  state.calculated_fees.transfer = transferFee;

  console.log(
    RESPONSES.UPLOAD_SUCCESS(
      size,
      size,
      isAutoShutMonth ? state.instances.stop : null
    )
  );
}

export function _download(draft: StoreState, d: Date, size: number) {
  const state = draft.service;
  const allocTransfer = state.allocation.transfer + size;

  if (size > state.allocation.storage) {
    console.log(RESPONSES.DOWNLOAD_NOT_FOUND());
    return;
  }
  
  const { isExceedT, isAutoShutMonth } = _assertLimits(draft, d, {
    allocTransfer,
  });

  if (isExceedT) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.DOWNLOAD, ABBREV.t));
    return;
  }

  state.allocation.transfer = allocTransfer;

  console.log(
    RESPONSES.DOWNLOAD_SUCCESS(size, isAutoShutMonth ? d : null)
  )
}

export function _delete(draft: StoreState, d: Date, size: number) {
  const state = draft.service;

  if (size > state.allocation.storage) {
    console.log(RESPONSES.DELETE_NOT_FOUND());
    return;
  }

  const allocStorage = state.allocation.storage - size;
  
  const { isAutoShutMonth } = _assertLimits(draft, d, {
    allocStorage,
  });

  state.allocation.storage = allocStorage;

  console.log(
    RESPONSES.DELETE_SUCCESS(size, isAutoShutMonth ? d : null)
  )
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

export function _assertLimits(draft: StoreState, d: Date, changes: {
  allocTransfer?: number,
  allocStorage?: number,
  allocUptime?: number,
  transferFee?: number,
  storageFee?: number,
  uptimeFee?: number,
}) {
  const state = draft.service;
  const { allocTransfer =0, allocStorage = 0, storageFee = 0, uptimeFee = 0} = changes;
  const isExceedT = allocTransfer > (state.limits.t);
  const isExceedS = allocStorage > (state.limits.s);
  const isExceedU = state.limits.u > 0 ? storageFee + uptimeFee > state.limits.u : false;
  const isAutoShutMonth =
    state.instances.stop && isSameMonth(state.instances.stop, d);
  const isAutoShutNextMonth =
    state.instances.stop && isSameMonth(addMonths(state.instances.stop, 1), d);

  return {
    isExceedT, isExceedS, isExceedU, isAutoShutMonth, isAutoShutNextMonth
  }
}