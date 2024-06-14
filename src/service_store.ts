import { createStore } from 'zustand/vanilla'
import { produce } from 'immer';
import { SIZE_UNITS, TIME_UNITS, RESPONSES, COMMANDS } from './constants';
import { _upload } from './commands';

const initialServiceState: ServiceState = {
  is_fee_overrun: false,
  instances: {},
  limits: {
    t: 100 * SIZE_UNITS.GB, // 100 GB
    t_default: 100 * SIZE_UNITS.GB, // 100 GB
    t_min: 1 * SIZE_UNITS.KB, // 1 KB
    t_max: 1 * SIZE_UNITS.TB, // 1 TB

    s: 100 * SIZE_UNITS.GB, // 100 GB
    s_default: 100 * SIZE_UNITS.GB, // 100 GB
    s_min: 1 * SIZE_UNITS.KB, // 1 KB
    s_max: 1 * SIZE_UNITS.TB, // 1 TB

    u: 10000, // Yen
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
    usage: 0,
  }
}

export const ServiceStore = createStore<ServiceStore>((set) => ({
  service: initialServiceState,
  eom: () => set(produce((draft: ServiceStore) => {})),
  upload: (date: Date, size: number) => {
    set(
      produce((draft: ServiceStore) => {
        _upload(draft, date, size)
      }),
    )
  }
}))