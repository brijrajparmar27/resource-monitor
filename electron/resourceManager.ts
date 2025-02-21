import { exec } from "child_process";
import { BrowserWindow } from "electron";
import fs from "fs";
import os from "os";
import osUtils from "os-utils";

const POLLING_INTERVAL = 500;
let statsInterval: string | number | NodeJS.Timeout | null | undefined;
let logsInterval: string | number | NodeJS.Timeout | null | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pollResources() {
  statsInterval = setInterval(async () => {
    const cpuUsage = await getCpuUsage();
    const ramUsage = getRamUsage();
    const storageData = getStorageData();
    const win = BrowserWindow.getAllWindows()[0];
    win.webContents.send("poll", {
      cpuUsage,
      ramUsage,
      storageUsage: storageData.usage,
    });
  }, POLLING_INTERVAL);
}

export function getProcesses() {
  const command =
    process.platform === "win32"
      ? "tasklist /FO CSV /NH"
      : "ps -eo pid,comm,%mem,%cpu";
  const win = BrowserWindow.getAllWindows()[0];
  logsInterval = setInterval(() => {
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("Error fetching processes:", error || stderr);
        return;
      }

      const processes: {
        name: string;
        pid: string;
        mem: string;
        cpu?: string;
      }[] = [];

      if (process.platform === "win32") {
        stdout.split("\n").forEach((line) => {
          const parts = line
            .split('","')
            .map((p) => p.replace(/"/g, "").trim());
          if (parts.length >= 2) {
            processes.push({ name: parts[0], pid: parts[1], mem: parts[4] });
          }
        });
      } else {
        stdout
          .split("\n")
          .slice(1)
          .forEach((line) => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 4) {
              processes.push({
                pid: parts[0],
                name: parts[1],
                mem: parts[2] + "%",
                cpu: parts[3] + "%",
              });
            }
          });
      }

      win.webContents.send("polledlogs", { data: processes });
    });
  }, POLLING_INTERVAL);
}

export function stopPolling() {
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
    console.log("Polling stopped");
  }
}

export function stopPollinglogs() {
  if (logsInterval) {
    clearInterval(logsInterval);
    logsInterval = null;
    console.log("Polling stopped");
  }
}

export function getStaticData() {
  const totalStorage = getStorageData().total;
  const cpuModel = os.cpus()[0].model;
  const totalMemoryGB = Math.floor(osUtils.totalmem() / 1024);
  return {
    totalStorage,
    cpuModel,
    totalMemoryGB,
  };
}

function getCpuUsage(): Promise<number> {
  return new Promise((resolve) => {
    osUtils.cpuUsage(resolve);
  });
}

function getRamUsage() {
  return 1 - osUtils.freememPercentage();
}

function getStorageData() {
  // requires node 18
  const stats = fs.statfsSync(process.platform === "win32" ? "C://" : "/");
  const total = stats.bsize * stats.blocks;
  const free = stats.bsize * stats.bfree;

  return {
    total: Math.floor(total / 1_000_000_000),
    usage: 1 - free / total,
  };
}

export const handleABC = () => {
  console.log("abc");
};
