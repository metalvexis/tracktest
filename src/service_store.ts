import { createStore } from "zustand/vanilla";
import { produce } from "immer";
import { endOfMonth } from "date-fns";
import { SIZE_UNITS, TIME_UNITS, RESPONSES, COMMANDS } from "./constants";
import {
  _calcEOM,
  _upgrade,
  _change,
  _fastForward,
  _upload,
  _download,
  _delete,
  _launch,
  _stop,
  _updateUptimeAlloc,
  _updateUptimeFee,
  _assertUsageOverrun,
} from "./commands";

export const initialServiceState: ServiceState = {
  current_date: new Date(2000, 0, 1, 0, 0),
  user_tier: "FREE",
  is_fee_overrun: false,
  instances: {
    auto_stop: new Date(2000, 0, 1, 0, 0),
    list: {},
  },
  limits: {
    t: 0, // 0 GB
    t_default: 100 * SIZE_UNITS.GB, // 100 GB
    t_min: 1 * SIZE_UNITS.KB, // 1 KB
    t_max: 100 * SIZE_UNITS.TB, // 1 TB

    s: 0, // 0 GB
    s_default: 100 * SIZE_UNITS.GB, // 100 GB
    s_min: 1 * SIZE_UNITS.KB, // 1 KB
    s_max: 100 * SIZE_UNITS.TB, // 1 TB

    u: 0, // 0 Yen
    u_default: 10000,
    u_min: 100,
    u_max: 0,
  },
  fee_tiers: {
    free_transfer: 10 * SIZE_UNITS.GB, // 10 GB
    free_storage: 20 * SIZE_UNITS.GB, // 20 GB
    free_uptime: 100 * TIME_UNITS.H, // 100 Hours
  },
  allocation: {
    transfer: 0,
    storage: 0,
    uptime: 0,
  },
  calculated_fees: {
    storage: 0,
    transfer: 0,
    uptime: 0,
  },
};

export const ServiceState = createStore<StoreState & StoreActions>((set) => ({
  service: { ...initialServiceState },
  calcEndOfMonth: () => set(
    produce((draft: StoreState) => {
      _fastForward(draft, endOfMonth(draft.service.current_date));

      _calcEOM(draft);
    })
  ),

  fastForward: (date: Date, command: string) => {
    set(
      produce((draft: StoreState) => {
        _fastForward(draft, date);
      })
    );
  },

  upgrade(date, newLimitU) {
    set(
      produce((draft: StoreState) => {
        _fastForward(draft, date);
        _upgrade(draft, date, newLimitU);
      })
    );
  },

  change(date, abbrev, newLimitU) {
    set(
      produce((draft: StoreState) => {
        _fastForward(draft, date);
        _change(draft, date, abbrev, newLimitU);
      })
    );
  },

  upload: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date);
        isOverrun
          ? console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.UPLOAD))
          : _upload(draft, date, size);
      })
    );
  },

  download: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date);
        isOverrun
          ? console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.DOWNLOAD))
          : _download(draft, date, size);
      })
    );
  },

  remove: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date);
        isOverrun
          ? console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.DELETE))
          : _delete(draft, date, size);
      })
    );
  },

  launch: (date: Date, instanceCount: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date);
        isOverrun
          ? console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.LAUNCH))
          : _launch(draft, date, instanceCount);
      })
    );
  },

  stop: (date: Date, start: Date, instanceCount: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date);        
        isOverrun
          ? console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.STOP))
          : _stop(draft, date, start, instanceCount);;
      })
    );
  },
}));
