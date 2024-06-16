import { createStore } from "zustand/vanilla";
import { produce } from "immer";
import { SIZE_UNITS, TIME_UNITS, RESPONSES, COMMANDS } from "./constants";
import {
  _upload,
  _download,
  _delete,
  _updateUptimeAlloc,
  _updateUptimeFee,
  _assertUsageOverrun,
} from "./commands";

export const initialServiceState: ServiceState = {
  is_fee_overrun: false,
  instances: {
    count: 0,
    start: new Date(2000, 0, 1, 0, 0),
    last_calc: new Date(2000, 0, 1, 0, 0),
    stop: new Date(2000, 0, 1, 0, 0),
  },
  limits: {
    t: 100 * SIZE_UNITS.GB, // 100 GB
    t_default: 100 * SIZE_UNITS.GB, // 100 GB
    t_min: 1 * SIZE_UNITS.KB, // 1 KB
    t_max: 1 * SIZE_UNITS.TB, // 1 TB

    s: 100 * SIZE_UNITS.GB, // 100 GB
    s_default: 100 * SIZE_UNITS.GB, // 100 GB
    s_min: 1 * SIZE_UNITS.KB, // 1 KB
    s_max: 1 * SIZE_UNITS.TB, // 1 TB

    u: 0, // Yen
    u_default: 10000,
    u_min: 100,
    u_max: 100,
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
  calc: () => set(produce((draft: StoreState) => {})),

  upload: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        _updateUptimeAlloc(draft, date);
        _updateUptimeFee(draft);

        if (_assertUsageOverrun(draft)) {
          return console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.UPLOAD));
        }

        _upload(draft, date, size);
      })
    );
  },

  download: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        _updateUptimeAlloc(draft, date);
        _updateUptimeFee(draft);

        if (_assertUsageOverrun(draft)) {
          return console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.DOWNLOAD));
        }

        _download(draft, date, size);
      })
    );
  },

  remove: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        _updateUptimeAlloc(draft, date);
        _updateUptimeFee(draft);

        if (_assertUsageOverrun(draft)) {
          return console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.DELETE));
        }

        _delete(draft, date, size);
      })
    )
  },

  launch: (date: Date, instanceCount: number) => {
    set(
      produce((draft: StoreState) => {
        _updateUptimeAlloc(draft, date);
        _updateUptimeFee(draft);

        if (_assertUsageOverrun(draft)) {
          return console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.LAUNCH));
        }

      })
    )
  },

  stop: (date: Date, instanceCount: number) => {
    set(
      produce((draft: StoreState) => {
        _updateUptimeAlloc(draft, date);
        _updateUptimeFee(draft);

        if (_assertUsageOverrun(draft)) {
          return console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS.STOP));
        }

      })
    )
  },
}));
