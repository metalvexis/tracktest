import { createStore } from "zustand/vanilla";
import { produce } from "immer";
import { SIZE_UNITS, TIME_UNITS, RESPONSES, COMMANDS } from "./constants";
import {
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
  is_fee_overrun: false,
  instances: {
    auto_stop: new Date(2000, 0, 1, 0, 0),
    list: {},
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

  fastForward: (date: Date, command: string) => {
    set(
      produce((draft: StoreState) => {
        _fastForward(draft, date, command);
        return draft;
      })
    );
  },

  upload: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date, COMMANDS.UPLOAD);
        !isOverrun && _upload(draft, date, size);
      })
    );
  },

  download: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date, COMMANDS.DOWNLOAD);
        !isOverrun && _download(draft, date, size);
      })
    );
  },

  remove: (date: Date, size: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date, COMMANDS.DELETE);
        !isOverrun && _delete(draft, date, size);
      })
    )
  },

  launch: (date: Date, instanceCount: number) => {
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date, COMMANDS.LAUNCH);
        !isOverrun && _launch(draft, date, instanceCount);
      })
    )
  },

  stop: (date: Date, start: Date, instanceCount: number) => {    
    set(
      produce((draft: StoreState) => {
        const { isOverrun } = _fastForward(draft, date, COMMANDS.STOP);
        !isOverrun && _stop(draft, date, start, instanceCount)
      })
    )
  },
}));
