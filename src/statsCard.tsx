import { Box, Card } from "@mui/material";
import { Chart } from "./charts/Chart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StatsCard = ({ view, viewData, viewLabel, viewVal }: any) => {
  return (
    <Card
      sx={{
        width: "100%",
        margin: "5px",
        backgroundColor: "#31363F",
      }}
    >
      <Box
        display={"flex"}
        height={"240px"}
        width={"100%"}
        flexDirection={"column"}
      >
        <Box width={"100%"} flex={10} maxHeight={"240px"}>
          <Chart data={viewData} maxDataPoints={1} selectedView={view} />
        </Box>
      </Box>
      <Box
        className="info-row"
        flex={1}
        display={"flex"}
        justifyContent={"space-around"}
        color={"gainsboro"}
        alignItems={"center"}
      >
        <p>{viewLabel}</p>
        <p>{viewVal}</p>
      </Box>
    </Card>
  );
};
