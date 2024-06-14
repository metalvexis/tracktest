export const DATE_FORMAT = 'yyyy-MM-dd hh:mm'

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
  TRANSFER: { cost: 1, unit: 1 * SIZE_UNITS.MB }, // 1 Yen per 1 MB
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

  UPLOAD_SUCCESS: (transfer: number, storage: number, time?: Date) => `UPLOAD: ${transfer} ${storage} ${time ? time : '-'}`,
  
  DOWNLOAD_NOT_FOUND: () => `DOWNLOAD: no such files`,
  DOWNLOAD_SUCCESS: (transfer: number, storage: number, time?: Date) => `UPLOAD: ${transfer} ${storage} ${time ? time : '-'}`,

  
  DELETE_NOT_FOUND: () => `DOWNLOAD: no such files`,
  DELETE_SUCCESS: (storage: number, time?: Date) => `UPLOAD: ${storage} ${time ? time : '-'}`,
};