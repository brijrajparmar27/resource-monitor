import { ipcMain } from "electron";
import {
  getProcesses,
  getStaticData,
  pollResources,
  stopPolling,
  stopPollinglogs,
} from "./resourceManager";

const ipcHandlers = [
  {
    event: "StaticData",
    callback: async () => getStaticData(),
    method: ipcMain.handle,
  },
  {
    event: "pollData",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    callback: (_event: any) => pollResources(),
    method: ipcMain.on,
  },
  {
    event: "stop-polling",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    callback: (_event: any) => stopPolling(),
    method: ipcMain.on,
  },
  {
    event: "polllogData",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    callback: (_event: any) => getProcesses(),
    method: ipcMain.on,
  },
  {
    event: "stop-polling-logdata",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    callback: (_event: any) => stopPollinglogs(),
    method: ipcMain.on,
  },
];

export const registerIPCHandlers = () => {
  ipcHandlers.forEach(({ method, event, callback }) => {
    method.call(ipcMain, event, callback);
  });
};
