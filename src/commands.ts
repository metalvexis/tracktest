import { RESPONSES, COMMANDS, ABBREV } from "./constants";
import {
  calcAllFee,
  calcUptimeFee,
  calcAllocUptime,
  calcAutoShutdownDate,
  parseDateToString,
  calcLimits,
} from "./lib";
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

  const { isExceedT, isExceedS, isExceedU, isExceedFreeUptime, isAutoShutMonth } = calcLimits(
    draft,
    d,
    {
      allocTransfer,
      allocStorage,
      storageFee,
    }
  );

  if (isExceedS) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.s));
    return;
  }

  if (isExceedT) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.t));
    return;
  }

  if (isExceedU || isExceedFreeUptime) {
    console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.UPLOAD));
    return;
  }

  state.allocation.storage = allocStorage;
  state.allocation.transfer = allocTransfer;

  state.calculated_fees.storage = storageFee;
  state.calculated_fees.transfer = transferFee;

  console.log(
    RESPONSES.UPLOAD_SUCCESS(
      state.allocation.transfer,
      state.allocation.storage,
      isAutoShutMonth ? state.instances.auto_stop : null
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

  const { isExceedT, isAutoShutMonth } = calcLimits(draft, d, {
    allocTransfer,
  });

  if (isExceedT) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.DOWNLOAD, ABBREV.t));
    return;
  }

  state.allocation.transfer = allocTransfer;

  console.log(
    RESPONSES.DOWNLOAD_SUCCESS(
      state.allocation.transfer,
      isAutoShutMonth ? state.instances.auto_stop : null
    )
  );
}

export function _delete(draft: StoreState, d: Date, size: number) {
  const state = draft.service;

  if (size > state.allocation.storage) {
    console.log(RESPONSES.DELETE_NOT_FOUND());
    return;
  }

  const allocStorage = state.allocation.storage - size;

  const { isAutoShutMonth } = calcLimits(draft, d, {
    allocStorage,
  });

  state.allocation.storage = allocStorage;

  console.log(RESPONSES.DELETE_SUCCESS(size, isAutoShutMonth ? d : null));
}

export function _launch(draft: StoreState, d: Date, instanceCount: number) {
  const state = draft.service;
  const tmpInstanceList = Object.assign({}, state.instances.list);
  const instanceKey = parseDateToString(d);
  const tmpInstance: InstanceMeta =
    typeof tmpInstanceList[instanceKey] === "undefined"
      ? {
          count: instanceCount,
          start: d,
          last_calc: d,
        }
      : {
          ...tmpInstanceList[instanceKey],
          count: tmpInstanceList[instanceKey].count + instanceCount,
        };

  tmpInstanceList[instanceKey] = tmpInstance;
  const totalInstanceCount = Object.entries(tmpInstanceList).reduce(
    (p, c) => p + c[1].count,
    0
  );

  const newShutdownDate = calcAutoShutdownDate(state, totalInstanceCount, d);

  state.instances.list[instanceKey] = tmpInstance;
  state.instances.auto_stop = newShutdownDate;

  const { isAutoShutMonth } = calcLimits(draft, d, {});

  console.log(
    RESPONSES.LAUNCH_SUCCESS(
      totalInstanceCount,
      isAutoShutMonth ? state.instances.auto_stop : null
    )
  );
}

export function _stop(draft: StoreState, d: Date, start: Date, instanceCount: number) {
  const state = draft.service;
  const tmpInstanceList = Object.assign({}, state.instances.list);
  const instanceKey = parseDateToString(start);

  if (typeof tmpInstanceList[instanceKey] === "undefined") {
    console.log(RESPONSES.STOP_FAIL());
    return;
  }

  if (tmpInstanceList[instanceKey].count < instanceCount) {
    console.log(RESPONSES.STOP_FAIL());
    return;
  }

  const tmpInstance: InstanceMeta = {
    ...tmpInstanceList[instanceKey],
    count: tmpInstanceList[instanceKey].count - instanceCount,
  };

  tmpInstanceList[instanceKey] = tmpInstance;
  const totalInstanceCount = Object.entries(tmpInstanceList).reduce(
    (p, c) => p + c[1].count,
    0
  );

  const newShutdownDate = calcAutoShutdownDate(state, totalInstanceCount, d);

  state.instances.list[instanceKey] = tmpInstance;
  state.instances.auto_stop = newShutdownDate;

  const { isAutoShutMonth } = calcLimits(draft, d, {});

  console.log(
    RESPONSES.STOP_SUCCESS(
      totalInstanceCount,
      isAutoShutMonth ? state.instances.auto_stop : null
    )
  );
}

export function _updateUptimeAlloc(draft: StoreState, now: Date) {
  const state = draft.service;
  const tmpInstanceList = Object.assign({}, state.instances.list);
  const allocUptime = calcAllocUptime(draft.service, now);
  const auto_stop = state.instances.auto_stop;

  for (const key in tmpInstanceList) {
    if (Object.prototype.hasOwnProperty.call(tmpInstanceList, key)) {
      if (now >= auto_stop) {
        tmpInstanceList[key].last_calc = auto_stop;
        tmpInstanceList[key].count = 0;
      } else {
        tmpInstanceList[key].last_calc = now;
      }      
    }
  }

  draft.service.instances.list = tmpInstanceList;
  draft.service.allocation.uptime = allocUptime;
}

export function _updateUptimeFee(draft: StoreState) {
  const allocUptime = draft.service.allocation.uptime;
  const uptimeFee = calcUptimeFee(draft.service, allocUptime);
  draft.service.calculated_fees.uptime = uptimeFee;
}

export function _assertUsageOverrun(draft: StoreState, date: Date) {
  const state = draft.service;
  const tmpInstanceList = Object.assign({}, state.instances.list);

  const { isExceedU, isExceedFreeUptime } = calcLimits(draft, date, {
    allocTransfer: state.allocation.transfer,
    allocStorage: state.allocation.storage,
    allocUptime: state.allocation.uptime,
    transferFee: state.calculated_fees.transfer,
    storageFee: state.calculated_fees.storage,
    uptimeFee: state.calculated_fees.uptime,  
  })
  const isOverrun = isExceedU || isExceedFreeUptime;

  if (isOverrun) {
    draft.service.is_fee_overrun = true;

    for (const key in tmpInstanceList) {
      if (Object.prototype.hasOwnProperty.call(tmpInstanceList, key)) {
        tmpInstanceList[key].count = 0;
      }
    }

    draft.service.instances.list = tmpInstanceList;
  }

  return isOverrun;
}

/**
 * @deprecated
 * @param draft 
 * @param d 
 * @param changes 
 * @returns 
 */
export function _assertLimits(
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
  const isExceedT = allocTransfer > state.limits.t;
  const isExceedS = allocStorage > state.limits.s;
  const hasMoreYen = state.limits.u > 0;
  const isExceedFreeUptime =
    !hasMoreYen ? allocUptime > state.fee_tiers.free_uptime: false;
  const isExceedU =
    hasMoreYen ? storageFee + uptimeFee > state.limits.u : false;
  const isAutoShutMonth =
    state.instances.auto_stop && isSameMonth(state.instances.auto_stop, d);
  const isAutoShutNextMonth =
    state.instances.auto_stop &&
    isSameMonth(addMonths(state.instances.auto_stop, 1), d);

  return {
    isExceedT,
    isExceedS,
    isExceedU,
    isExceedFreeUptime,
    isAutoShutMonth,
    isAutoShutNextMonth,
  };
}

export function _fastForward(
  draft: StoreState,
  date: Date,
  command: string,
) {
  _updateUptimeAlloc(draft, date);
  _updateUptimeFee(draft);
  const isOverrun = _assertUsageOverrun(draft, date);
  
  if (isOverrun) {
    console.log(RESPONSES.EXCEED_USAGE_LIMIT(command));
  }

  return {
    isOverrun
  }
}