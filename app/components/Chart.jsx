import { Box, Button, Card } from "@shopify/polaris";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import useShareBasket from "../store/Store";

import { useNavigate } from "@remix-run/react";

  

export default function LinkStatsBarChart({blur}) {
  const navigate= useNavigate();
  const {analytics} = useShareBasket();
  console.log("Ana", analytics)

  return (
    <Box position="relative">
    <Card>
      {blur && (
        <Box
          position="absolute"
          width="100%"
          height="100%"
          style={{
            display: "flex",
            alignItems: "center",
            position: "absolute",
            top: "50%",
            left: "35%",
            zIndex: 100,
            justifyContent: "center",
          }}
          zIndex={101}
        >
          <Button variant="primary" onClick={() => navigate("/app/pricing")}>
            Upgrade to Pro to view stats
          </Button>
        </Box>
      )}
   
        <div
          style={{
            height: 400,
            filter: blur ? "blur(20px)" : "none",
            pointerEvents: blur ? "none" : "auto",
            userSelect: blur ? "none" : "auto",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
         <AreaChart
        data={analytics}
        width={1000}
        height={400}
        // margin={{ top: 40, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e6ecf9" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#e6ecf9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E6F7F1" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#E6F7F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="monthName" stroke="#666" fontSize={12} />
        <YAxis stroke="#666" fontSize={12} />
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Area
  type="monotone"
  dataKey="totalLinks"
  stroke="#3b82f6"
  strokeWidth={2}
  fillOpacity={1}
  fill="url(#colorTotal)"
  name="Created Links"
/>
<Area
  type="monotone"
  dataKey="totalClicks"
  stroke="#10b981"
  strokeWidth={2}
  fillOpacity={1}
  fill="url(#colorOpened)"
  name="Opened Links"
/>

      </AreaChart>
        </div>
    </Card>
  </Box>
  );
}
