import { parseDateToString } from "./lib";

export const DATE_FORMAT = 'yyyy-MM-dd HH:mm'

export const SIZE_UNITS = {
  B: 1,
  KB: 1000,
  MB: 1000 * 1000,
  GB: 1000 * 1000 * 1000,
  TB: 1000 * 1000 * 1000 * 1000,
};

export const TIME_UNITS = {
  M: 1,
  H: 60,
};

export const FEE_RATES: {
  TRANSFER: CostPerUnit,
  STORAGE: CostPerUnit,
  UPTIME: CostPerUnit,
} = {
  TRANSFER: { cost: 1, unit: 100 * SIZE_UNITS.MB }, // 1 Yen per 100 MB
  STORAGE: { cost: 1, unit: 1 * SIZE_UNITS.GB }, // 1 Yen per 1 GB
  UPTIME: { cost: 100, unit: 60 * TIME_UNITS.M }, // 100 Yen per 1 Hour
}

export enum COMMANDS {
  UPLOAD = "UPLOAD",
  DOWNLOAD = "DOWNLOAD",
  DELETE = "DELETE",
  LAUNCH = "LAUNCH",
  STOP = "STOP",
  UPGRADE = "UPGRADE",
  CHANGE = "CHANGE",
  CALC = "CALC",
};

export enum ABBREV {
  t = "t",
  s = "s",
  u = "u",
};

export const RESPONSES = {
  EXCEED_USAGE_LIMIT: (command: string) => `${command}: please increase usage fee limit`,
  EXCEED_LIMIT: (command: string, type: string) => `${command}: ${type}`,

  UPLOAD_SUCCESS: (transfer: number, storage: number, time: Date | null) => `UPLOAD: ${transfer} ${storage} ${time ? parseDateToString(time) : '-'}`,
  
  DOWNLOAD_NOT_FOUND: () => `DOWNLOAD: no such files`,
  DOWNLOAD_SUCCESS: (transfer: number, time: Date | null) => `DOWNLOAD: ${transfer} ${time ? parseDateToString(time) : '-'}`,

  DELETE_NOT_FOUND: () => `DELETE: no such files`,
  DELETE_SUCCESS: (storage: number, time: Date | null) => `DELETE: ${storage} ${time ? parseDateToString(time) : '-'}`,

  LAUNCH_SUCCESS: (instanceCount: number, time: Date | null) => `LAUNCH: ${instanceCount} ${time ? parseDateToString(time) : '-'}`,

  STOP_FAIL: () => `STOP: please correctly specify the instances`,
  STOP_SUCCESS: (instanceCount: number, time: Date | null) => `STOP: ${instanceCount} ${time ? parseDateToString(time) : '-'}`,

  UPGRADE_FAIL: () => `UPGRADE: invalid value`,
  UPGRADE_TIER_SUCCESS: (time: Date | null) => `UPGRADE: ${time ? parseDateToString(time) : '-'}`,
  UPGRADE_LIMIT_SUCCESS: () => `UPGRADE: accepted`,
};