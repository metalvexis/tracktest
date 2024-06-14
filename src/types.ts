
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
  usage: number, // in Yen
}

interface InstanceMeta {
  count: number,
  start: Date,
  stop: Date | null,
}

interface VmInstance {
  [key: string]: InstanceMeta,
}

interface ServiceState {
  is_fee_overrun: boolean,
  instances: VmInstance,
  limits: FeeLimits,
  fee_tiers: FeeTiers,
  allocation: Allocation,
  calculated_fees: CalculatedFees,
}


interface ServiceStore {
  service: ServiceState;
  upload: (d: Date, size: number) => void;
};

type CostPerUnit = { cost: number, unit: number };