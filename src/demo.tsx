import { Box, Card, Grid2, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import "./App.css";
import m1 from "./assets/m1.svg";
import m2 from "./assets/m2.svg";
import m3 from "./assets/m3.svg";
import m4 from "./assets/m4.svg";
import intel from "./assets/intel.svg";
import amd from "./assets/amd.svg";
import {
  logs,
  polledData,
  polledGraphData,
  staticData,
} from "./interfaces/types";
import { StatsCard } from "./statsCard";

const Demo = () => {
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

  const getCPUsvg = (name: string) => {
    if (name.toLowerCase().includes("apple")) {
      if (name.toLowerCase().includes("m2")) {
        return m2;
      } else if (name.toLowerCase().includes("m3")) {
        return m3;
      } else if (name.toLowerCase().includes("m4")) {
        return m4;
      } else {
        return m1;
      }
    } else if (name.toLowerCase().includes("intel")) {
      return intel;
    } else {
      return amd;
    }
  };

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
    <Box
      height={"100vh"}
      width={"100vw"}
      sx={{ backgroundColor: "#222831", padding: "10px" }}
      display={"flex"}
    >
      <Grid2 container height={"100%"} width={"100%"}>
        <Grid2 size={4} display={"flex"}>
          <Card
            sx={{
              width: "100%",
              margin: "5px",
              backgroundColor: "transparent",
            }}
            elevation={0}
          >
            <Box
              sx={{ height: "100%" }}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <img
                src={getCPUsvg(staticData!.cpuModel)}
                alt=""
                height={"200px"}
                width={"auto"}
              />
              <Typography variant="h5" className="CPU-name" color="gainsboro">
                {staticData?.cpuModel}
              </Typography>
            </Box>
          </Card>
        </Grid2>
        <Grid2 size={8} display={"flex"}>
          <Card
            sx={{
              width: "100%",
              margin: "5px",
              overflowY: "auto",
              backgroundColor: "#000",
              color: "#0f0",
              fontFamily: "monospace",
              padding: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: "#fff" }}>
              System Logs
            </Typography>
            <Box height={"200px"}>
              {logData?.map((each) => {
                return (
                  <Box display={"flex"}>
                    <Typography fontSize={"10px"}>pid: {each.pid}</Typography>
                    <Typography fontSize={"10px"}>
                      name - {each.name}
                    </Typography>
                    <Typography fontSize={"10px"}>
                      Memory usage - {each.mem}
                    </Typography>
                    <Typography fontSize={"10px"}>
                      CPU utilization - {each.cpu}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid2>

        <Grid2 size={4} display={"flex"}>
          <StatsCard
            view={"STORAGE"}
            viewData={polledData!.storageUsage}
            viewLabel={"Storage Stats"}
            viewVal={`${staticData?.totalStorage}GB`}
          />
        </Grid2>

        <Grid2 size={4} display={"flex"}>
          <StatsCard
            view={"CPU"}
            viewData={polledData!.cpuUsage}
            viewLabel={"CPU Stats"}
            viewVal={staticData?.cpuModel}
          />
        </Grid2>

        <Grid2 size={4} display={"flex"}>
          <StatsCard
            view={"RAM"}
            viewData={polledData!.ramUsage}
            viewLabel={"RAM Stats"}
            viewVal={`${staticData?.totalMemoryGB}GB`}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default Demo;
