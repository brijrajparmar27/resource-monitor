import { useEffect, useState } from "react";
import "./App.css";
import m1 from "./assets/m1.svg";
import {
  logs,
  polledData,
  polledGraphData,
  staticData,
} from "./interfaces/types";
import { Chart } from "./charts/Chart";

function App() {
  const [staticData, setStaticData] = useState<staticData | null>(null);
  const [logData, setLogsData] = useState<logs[] | null>(null);
  const [polledData, setpolledData] = useState<polledGraphData>({
    cpuUsage: [],
    ramUsage: [],
    storageUsage: [],
  });

  const handleGraph = (data: polledData) => {
    setpolledData((prevPolled) => {
      const cpuUsage = [...prevPolled.cpuUsage, data.cpuUsage];
      const ramUsage = [...prevPolled.ramUsage, data.ramUsage];
      const storageUsage = [...prevPolled.storageUsage, data.storageUsage];
      if (cpuUsage.length > 10) cpuUsage.shift();
      if (ramUsage.length > 10) ramUsage.shift();
      if (storageUsage.length > 10) storageUsage.shift();
      const newData = {
        cpuUsage,
        ramUsage,
        storageUsage,
      };
      return newData;
    });
  };

  function fragmentData(arr: logs[], chunkSize: number) {
    const result = [...arr];
    const numChunks = Math.floor(Math.random() * (arr.length / chunkSize)) + 1; // Random number of chunks to remove

    for (let i = 0; i < numChunks; i++) {
      const startIdx = Math.floor(
        Math.random() * (result.length - chunkSize + 1)
      );
      result.splice(startIdx, chunkSize);
    }

    return result;
  }

  useEffect(() => {
    window.ipcRenderer.invoke("StaticData").then((data) => setStaticData(data));
    window.ipcRenderer.send("pollData");
    window.ipcRenderer.on("poll", (_event, data) => {
      handleGraph(data);
    });
    window.ipcRenderer.send("polllogData");
    window.ipcRenderer.on("polledlogs", (_event, { data }) => {
      setLogsData(fragmentData(data, 30));
    });
    return () => {
      window.ipcRenderer.send("stop-polling");
      window.ipcRenderer.send("stop-polling-logdata");
    };
  }, []);

  return (
    <div className="root">
      <div className="main">
        <div className="topRow">
          <div className="processor-contain">
            <img src={m1} height={200} width={"auto"} />
            <p className="CPU-name">{staticData?.cpuModel}</p>
          </div>
          <div className="loggs-contain">
            <div className="logs-card">
              {logData?.map((each) => {
                return (
                  <div className="log-line">
                    <p>pid: {each.pid}</p>
                    <p>name - {each.name}</p>
                    <p>Memory usage - {each.mem}</p>
                    <p>CPU utilization - {each.cpu}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bottomRow">
          <div className="util-bar"></div>
          <div className="stats-wrapper">
            <div className="cpu-contain card">
              <Chart
                data={polledData!.cpuUsage}
                maxDataPoints={1}
                selectedView={"CPU"}
              />
              <div className="info-row">
                <p>CPU Stats</p>
                <p>{staticData?.cpuModel}</p>
              </div>
            </div>
            <div className="ram-contain card">
              <Chart
                data={polledData!.ramUsage}
                maxDataPoints={1}
                selectedView={"RAM"}
              />
              <div className="info-row">
                <p>RAM Stats</p>
                <p>{staticData?.totalMemoryGB}GB</p>
              </div>
            </div>
            <div className="storage-contain card">
              <Chart
                data={polledData!.storageUsage}
                maxDataPoints={1}
                selectedView={"STORAGE"}
              />
              <div className="info-row">
                <p>Storage Stats</p>
                <p>{staticData?.totalStorage}GB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
