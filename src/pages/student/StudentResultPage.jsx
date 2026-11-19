import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";
import StudentNavbar from "./StudentNavbar";

function StudentResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState(null);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  const chartData =
    reviewData?.review.map((q, index) => ({
      question: `Q${index + 1}`,
      time: q.timeSpent || 0,
      status: q.status,
      subject: q.subject,
      topic: q.topic,
      code: q.questionCode
    })) || [];

  const angleTimeLabels = isMobileViewport || chartData.length > 12;
  const questionChartWidth = Math.max(
    isMobileViewport ? 360 : 600,
    chartData.length * (isMobileViewport ? 48 : 56)
  );

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(
            `/tests/result/${state.attemptId}`
          );

          const reviewRes = await api.get(
            `/tests/review/${state.attemptId}`
          );

          setResult({
            ...res.data,
            attemptId: state.attemptId
          });

          setReviewData(reviewRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (state?.attemptId) {
      fetchResult();
    } else {
      setLoading(false);
    }
  }, [state]);

  if (!state?.attemptId) {
    return (
      <>
      <StudentNavbar/>
      <p className="p-6 pt-20">No result found.</p>
      </>
    );
  }

  if (loading) {
    return (
      <>
      <StudentNavbar/>
      <p className="p-6 pt-20">Loading result...</p>
      </>
    );
  }

  if (!result) {
    return (
      <>
      <StudentNavbar/>
      <p className="p-6 pt-20">Failed to load result.</p>
      </>
    );
  }
  
  const analysis = {};

    if (reviewData) {
      reviewData.review.forEach((q) => {
        if (!analysis[q.subject]) {
          analysis[q.subject] = {};
        }

        if (!analysis[q.subject][q.topic]) {
          analysis[q.subject][q.topic] = {
            total: 0,
            correct: 0,
            wrong: 0,
            unattempted: 0,
            timeSpent: 0
          };
        }

        const topic = analysis[q.subject][q.topic];

        topic.total++;
        topic.timeSpent += q.timeSpent || 0;

        if (q.status === "CORRECT") {
          topic.correct++;
        } else if (q.status === "WRONG") {
          topic.wrong++;
        } else {
          topic.unattempted++;
        }
      });

      // Calculate Avg Time per Question
      Object.values(analysis).forEach((topics) => {
        Object.values(topics).forEach((topic) => {
          topic.avgTime =
            topic.total > 0
              ? Math.round(topic.timeSpent / topic.total)
              : 0;
        });
      });
    }

  return (
    <>
    <StudentNavbar/>
    <div className="p-4 sm:p-6 max-w-3xl mx-auto pt-20 min-w-0">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Test Result</h1>
        <p className="text-gray-600">
          {result.mockTestTitle}
        </p>
      </div>

      <div className="bg-white rounded shadow p-4 sm:p-6 space-y-3">
        <p>
          <strong>Score:</strong> {result.score}
        </p>

        <p className="text-green-600 font-semibold">
          <strong>Correct:</strong> {result.correct}
        </p>

        <p className="text-red-600 font-semibold">
          <strong>Wrong:</strong> {result.wrong}
        </p>

        <p className="text-gray-600 font-semibold">
          <strong>Unattempted:</strong>{" "}
          {result.unattempted}
        </p>

        <p>
          <strong>Accuracy:</strong>{" "}
          {result.accuracy}%
        </p>

        <p>
          <strong>Percentage:</strong>{" "}
          {result.percentage}%
        </p>

        <p>
          <strong>Rank:</strong> {result.rank} /{" "}
          {result.totalParticipants}
        </p>

        <p>
          <strong>Time Taken:</strong>{" "}
          {formatTime(result.totalTimeSpent || 0)}
        </p>
      </div>

      {reviewData && (
        <div className="mt-8 bg-white rounded shadow p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4">
            Subject-wise Analysis
          </h2>

          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border border-gray-300 text-sm sm:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Subject</th>
                <th className="border p-2">Topic</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Correct</th>
                <th className="border p-2">Wrong</th>
                <th className="border p-2">Unattempted</th>
                <th className="border p-2">Accuracy</th>
                <th className="border p-2">Avg Time per Question</th>
              </tr>
            </thead>
          <tbody>
              {Object.entries(analysis).map(([subject, topics]) =>
                Object.entries(topics).map(
                  ([topic, stats], index) => (
                    <tr key={`${subject}-${topic}`}>
                      <td className="border p-2 font-semibold">
                        {index === 0 ? subject : ""}
                      </td>

                      <td className="border p-2">
                        {topic}
                      </td>

                      <td className="border p-2 text-center">
                        {stats.total}
                      </td>

                      <td className="border p-2 text-center text-green-600">
                        {stats.correct}
                      </td>

                      <td className="border p-2 text-center text-red-600">
                        {stats.wrong}
                      </td>

                      <td className="border p-2 text-center">
                        {stats.unattempted}
                      </td>

                      <td className="border p-2 text-center">
                        {(
                          (stats.correct / stats.total) *
                          100
                        ).toFixed(1)}
                        %
                      </td>

                      <td className="border p-2 text-center">
                        {formatTime(stats.avgTime)}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mt-10 mb-4">
        Time Spent Per Question
      </h2>

      <div className="bg-white shadow rounded p-3 sm:p-6 mb-8">
        <div className="overflow-x-auto">
        <div style={{ width: questionChartWidth, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 30, right: 20, left: 10, bottom: angleTimeLabels ? 36 : 10 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="question"
              height={angleTimeLabels ? 60 : 30}
              interval={0}
              tick={angleTimeLabels
                ? { angle: -45, textAnchor: "end", fontSize: 11 }
                : { fontSize: 12 }}
              label={{
                value: "Questions",
                position: "insideBottom",
                offset: -5
              }}
            />

            <YAxis
              label={{
                value: "Time",
                angle: -90,
                position: "insideLeft"
              }}
            />

            <Tooltip
              formatter={(value) => [`${value} sec`, "Time"]}
              labelFormatter={(label, payload) => {
                if (!payload?.length) return label;

                const q = payload[0].payload;

                return `${label} (${q.code})
                ${q.subject} • ${q.topic}`;
              }}
            />

            <Bar
              dataKey="time"
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                dataKey="time"
                position="top"
                formatter={(value) => formatTime(value)}
                content={angleTimeLabels ? (props) => {
                  const { x, y, width, value } = props;
                  if (x == null || y == null || value == null) return null;
                  const labelX = x + (width || 0) / 2;
                  const labelY = y - 5;

                  return (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="start"
                      transform={`rotate(-55 ${labelX} ${labelY})`}
                      fill="#374151"
                      fontSize={10}
                    >
                      {formatTime(value)}
                    </text>
                  );
                } : undefined}
              />

              {chartData.map((entry, index) => {
                let color = "#eab308"; // Yellow (Unattempted)

                if (entry.status === "CORRECT") {
                  color = "#22c55e"; // Green
                } else if (entry.status === "WRONG") {
                  color = "#ef4444"; // Red
                }

                return (
                  <Cell
                    key={index}
                    fill={color}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={() =>
            navigate(
              `/student/review/${result.attemptId}`
            )
          }
          className="bg-blue-600 text-white px-6 py-3 rounded font-semibold"
        >
          Review Answers
        </button>

        <button
          onClick={() =>
            navigate(
              `/student/leaderboard/${result.mockTestId}`,
              {
                state: {
                  attemptId: result.attemptId
                }
              }
            )
          }
          className="bg-green-600 text-white px-6 py-3 rounded font-semibold"
        >
          Leaderboard
        </button>
      </div>
    </div>
    </>
  );
}

export default StudentResultPage;
