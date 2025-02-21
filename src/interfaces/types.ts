export interface staticData {
  totalStorage: number;
  cpuModel: string;
  totalMemoryGB: number;
}

export interface polledGraphData {
  cpuUsage: number[];
  ramUsage: number[];
  storageUsage: number[];
}

export interface polledData {
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
}

export interface logs {
  pid: string;
  name: string;
  mem: string;
  cpu: string;
}
