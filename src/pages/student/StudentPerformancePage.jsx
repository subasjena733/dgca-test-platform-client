import { useEffect, useState } from "react";
import api from "../../services/api";
import StudentNavbar from "./StudentNavbar";

import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function StudentPerformancePage() {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.matchMedia("(max-width: 639px)").matches
  );

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const updateViewport = (event) => setIsMobileViewport(event.matches);

    setIsMobileViewport(mobileQuery.matches);
    mobileQuery.addEventListener("change", updateViewport);

    return () => mobileQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get(
          "/tests/performance-history"
        );

        setPerformance(res.data.performance);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  const chartData = performance.map((attempt) => ({
    date: new Date(
      attempt.date
    ).toLocaleDateString(),

    percentage: attempt.percentage,
    percentile: attempt.percentile,
    accuracy: attempt.accuracy,
    score: attempt.score,
    mockTestTitle: attempt.mockTestTitle,
    rank: attempt.rank,
    totalParticipants:
      attempt.totalParticipants
  }));

  const CustomTooltip = ({
    active,
    payload
  }) => {
    if (
      active &&
      payload &&
      payload.length > 0 &&
      payload[0]
    ) {
      const data = payload[0].payload;

      return (
        <div className="bg-white border shadow-lg rounded p-4 space-y-2 min-w-64">
          <p className="font-bold text-blue-700">
            {data.mockTestTitle}
          </p>

          <p>Score: {data.score}</p>

          <p>
            Percentage:
            <span className="font-semibold ml-1">
              {data.percentage}%
            </span>
          </p>

          <p>
            Accuracy:
            <span className="font-semibold ml-1">
              {data.accuracy}%
            </span>
          </p>

          <p>
            Rank:
            <span className="font-semibold ml-1">
              {data.rank}/{data.totalParticipants}
            </span>
          </p>

          <p>
            Percentile:
            <span className="font-semibold ml-1">
              {data.percentile}%
            </span>
          </p>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 pt-20">
        Loading performance...
      </div>
    );
  }

  if (!performance.length) {
    return (
      <div className="p-6">
        No performance data found.
      </div>
    );
  }

  // Keep tests closer together while leaving enough room for date labels.
  const chartWidth = isMobileViewport
    ? Math.max(performance.length * 72, 360)
    : Math.max(performance.length * 160, 900);
  const chartBarSize = isMobileViewport ? 18 : 45;
  
  const TrendTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white border rounded shadow-lg p-4 space-y-2">
        <p className="font-bold text-blue-700">
          {data.mockTestTitle}
        </p>

        <p>Date: {data.date}</p>

        <p>
          Accuracy:
          <span className="font-semibold ml-1 text-green-700">
            {data.accuracy}%
          </span>
        </p>

        <p>
          Percentile:
          <span className="font-semibold ml-1 text-red-600">
            {data.percentile}%
          </span>
        </p>
      </div>
    );
  };
  
  return (
    <>
    <StudentNavbar/>
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pt-20 min-w-0">

      <h1 className="text-2xl sm:text-3xl font-bold">
        Performance Dashboard
      </h1>

      {/* =========================
            FRAME 1
      ========================== */}

      <div className="bg-white rounded shadow p-4 sm:p-6 overflow-x-auto">

        <h2 className="text-xl font-semibold mb-6">
          Test-wise Percentage
        </h2>

        <div
          style={{
            width: chartWidth,
            height: 420
          }}
        >
          <BarChart
            width={chartWidth}
            height={420}
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 50
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              angle={-25}
              textAnchor="end"
              interval={0}
              height={70}
            />

            <YAxis
              domain={[0, 100]}
              label={{
                value: "Percentage",
                angle: -90,
                position: "insideLeft"
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
            />

            <Legend />

            <Bar
              dataKey="percentage"
              fill="#2563eb"
              name="Percentage"
              barSize={chartBarSize}
              maxBarSize={chartBarSize}
              barCategoryGap={isMobileViewport ? "12%" : "20%"}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </div>

      </div>

      {/* =========================
            FRAME 2
      ========================== */}

      <div className="bg-white rounded shadow p-4 sm:p-6">

        <h2 className="text-xl font-semibold mb-4">
          Performance Trend
        </h2>

        <div className="overflow-x-auto">

          <div
            style={{
              width: chartWidth,
              height: 350
            }}
          >

            <LineChart
              width={chartWidth}
              height={350}
              data={chartData}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis domain={[0, 100]} />

              <Tooltip content={<TrendTooltip />} />

              <Legend />

              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                name="Accuracy"
              />

              <Line
                type="monotone"
                dataKey="percentile"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                name="Percentile"
              />

            </LineChart>

          </div>

        </div>

      </div>

    </div>
    </>
  );
}

export default StudentPerformancePage;
