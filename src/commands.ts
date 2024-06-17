import { RESPONSES, COMMANDS, ABBREV } from "./constants";
import {
  calcAllFee,
  calcUptimeFee,
  calcAllocUptime,
  calcAutoShutdownDate,
  parseDateToString,
  calcLimits,
  getInstanceCount,
  checkChangeLimitT,
  checkChangeLimitS,
  checkChangeLimitU,
} from "./lib";
import { isSameMonth, startOfMonth, addMonths, addMinutes } from "date-fns";

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

  const { isExceedT, isExceedS, isAutoShutMonth } = calcLimits(draft, d, {
    allocTransfer,
    allocStorage,
    storageFee,
  });

  if (isExceedT) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.t));
    return;
  }

  if (isExceedS) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.UPLOAD, ABBREV.s));
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


  const { isExceedT, isAutoShutMonth } = calcLimits(draft, d, {
    allocTransfer,
  });

  if (isExceedT) {
    console.log(RESPONSES.EXCEED_LIMIT(COMMANDS.DOWNLOAD, ABBREV.t));
    return;
  }

  if (size > state.allocation.storage) {
    console.log(RESPONSES.DOWNLOAD_NOT_FOUND());
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

  console.log(RESPONSES.DELETE_SUCCESS(allocStorage, isAutoShutMonth ? d : null));
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
  const totalInstanceCount = getInstanceCount(tmpInstanceList);

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

export function _stop(
  draft: StoreState,
  d: Date,
  start: Date,
  instanceCount: number
) {
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
  const totalInstanceCount = getInstanceCount(tmpInstanceList);

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
  });
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

export function _fastForward(draft: StoreState, date: Date) {
  draft.service.current_date = date;
  _updateUptimeAlloc(draft, date);
  _updateUptimeFee(draft);
  const isOverrun = _assertUsageOverrun(draft, date);

  return {
    isOverrun,
  };
}

export function _upgrade(draft: StoreState, date: Date, newLimitU: number) {
  const state = draft.service;
  const isFreeTier = state.user_tier === "FREE";
  const totalInstanceCount = getInstanceCount(state.instances.list);

  if (isFreeTier) {
    state.user_tier = "PAID";
    state.limits.t = state.limits.t_default;
    state.limits.s = state.limits.s_default;
    state.limits.u = state.limits.u_default;
  }

  if (!isFreeTier) {
    const isChangeU = checkChangeLimitU(state, newLimitU);

    if (!isChangeU) {
      console.log(RESPONSES.UPGRADE_FAIL());
      return;
    }
    state.limits.u_max = newLimitU;
  }

  if (totalInstanceCount > 0) {
    state.instances.auto_stop = calcAutoShutdownDate(
      state,
      totalInstanceCount,
      date
    );
  }

  const { isAutoShutMonth } = calcLimits(draft, date, {});

  isFreeTier
    ? console.log(
        RESPONSES.UPGRADE_TIER_SUCCESS(
          isAutoShutMonth ? state.instances.auto_stop : null
        )
      )
    : console.log(RESPONSES.UPGRADE_LIMIT_SUCCESS());
}

export function _change(
  draft: StoreState,
  date: Date,
  abbrev: string,
  newLimit: number
) {
  const state = draft.service;

  if (state.user_tier === "FREE") {
    console.log(RESPONSES.CHANGE_FREE_FAIL());
    return;
  }

  if (abbrev === ABBREV.t) {
    if (!checkChangeLimitT(state, newLimit)) {
      console.log(RESPONSES.CHANGE_FAIL());
      return;
    }
    state.limits.t = newLimit;
  }

  if (abbrev === ABBREV.s) {
    if (!checkChangeLimitS(state, newLimit)) {
      console.log(RESPONSES.CHANGE_FAIL());
      return;
    }

    state.limits.s = newLimit;
  }

  if (abbrev === ABBREV.u) {
    if (!checkChangeLimitU(state, newLimit)) {
      console.log(RESPONSES.CHANGE_FAIL());
      return;
    }
    state.limits.u = newLimit;
    const totalInstanceCount = getInstanceCount(state.instances.list);
    state.instances.auto_stop = calcAutoShutdownDate(
      state,
      totalInstanceCount,
      date
    );
  }
  const { isAutoShutMonth } = calcLimits(draft, date, {});
  console.log(
    RESPONSES.CHANGE_SUCCESS(isAutoShutMonth ? state.instances.auto_stop : null)
  );
}

export function _calcEOM(draft: StoreState) {
  const state = draft.service;
  state.current_date = startOfMonth(addMonths(state.current_date, 1));
  state.allocation.transfer = 0;
  state.allocation.uptime = 0;
  state.is_fee_overrun = false;

  _updateUptimeAlloc(draft, addMinutes(state.current_date, 1));

  const totalInstanceCount = getInstanceCount(state.instances.list);
  const newStop = calcAutoShutdownDate(state, totalInstanceCount, addMinutes(state.current_date, -1));

  state.instances.auto_stop = newStop;
  const { isAutoShutMonth } = calcLimits(draft, state.current_date, {});
  const actualUsage =
    state.calculated_fees.storage + state.calculated_fees.uptime;
  const usageFee = actualUsage < state.limits.u ? actualUsage : state.limits.u;
  const showFee = usageFee + state.calculated_fees.transfer;
  console.log(
    RESPONSES.CALC_SUCCESS(
      showFee,
      isAutoShutMonth ? state.instances.auto_stop : null
    )
  );
}
