

interface FeeLimits {
  // ALL limit in Byte
  t: number,
  t_default: number, 
  t_min: number,
  t_max: number,
  
  // ALL limit in Byte
  s: number,
  s_default: number,
  s_min: number,
  s_max: number,

  // ALL limit in Yen
  u: number,
  u_default: number,
  u_min: number,
  u_max: number,
}

interface FeeTiers {
  free_transfer: number, // in Byte
  free_storage: number, // in Byte
  free_uptime: number, // in Minute
}

interface Allocation {
  transfer: number, // in Byte
  storage: number, // in Byte
  uptime: number, // in Minute
}

interface CalculatedFees {
  transfer: number, // in Yen
  storage: number, // in Yen
  uptime: number, // in Yen
  // usage: number, // in Yen
}

interface InstanceMeta {
  count: number,
  start: Date,
  last_calc: Date,
}

interface InstanceRecords {
  [key: string]: InstanceMeta,
}

interface Instance {
  auto_stop: Date,
  list: InstanceRecords
}

type UserTier = "FREE" | "PAID";

interface ServiceState {
  current_date: Date,
  user_tier: UserTier,
  is_fee_overrun: boolean,
  instances: Instance,
  limits: FeeLimits,
  fee_tiers: FeeTiers,
  allocation: Allocation,
  calculated_fees: CalculatedFees,
}

interface StoreState {
  service: ServiceState;
};

interface StoreActions {
  // fastForward: (date: Date, command: string) => void;
  calcEndOfMonth: () => void;
  upload: (d: Date, size: number) => void;
  download: (date: Date, size: number) => void;
  remove: (date: Date, size: number) => void;
  launch: (date: Date, instanceCount: number) => void;
  stop: (date: Date, start: Date, instanceCount: number) => void;
  upgrade: (date: Date, newLimitU: number)=> void;
  change: (date: Date, abbrev: string, newLimit: number)=> void;
};

type CostPerUnit = { cost: number, unit: number };