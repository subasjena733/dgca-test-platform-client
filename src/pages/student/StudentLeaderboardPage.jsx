import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../../services/api";
import StudentNavbar from "./StudentNavbar"

function StudentLeaderboardPage() {
  const { mockTestId } = useParams();
  const { state } = useLocation();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const attemptId = state?.attemptId;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get(
          `/tests/leaderboard/${mockTestId}`
        );

        setLeaderboard(res.data.leaderboard);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [mockTestId]);

  if (loading) return <p>Loading leaderboard...</p>;

  const top10 = leaderboard.slice(0, 10);

  const myRank = leaderboard.find(
    (item) => item.attemptId === attemptId
  );

  const alreadyInTop10 = top10.some(
    (item) => item.attemptId === attemptId
  );

  return (
    <>
    <StudentNavbar/>
    <div className="p-6 max-w-5xl mx-auto pt-20">
      <h1 className="text-2xl font-bold mb-6">
        Leaderboard
      </h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-3">Rank</th>
              <th className="border p-3">Candidate</th>
              <th className="border p-3">Score</th>
              <th className="border p-3">Accuracy</th>
              <th className="border p-3">Time</th>
            </tr>
          </thead>

          <tbody>
            {top10.map((student) => (
              <tr
                key={student.attemptId}
                className={
                  student.attemptId === attemptId
                    ? "bg-green-100 font-semibold"
                    : ""
                }
              >
                <td className="border p-2 text-center">
                  {student.rank}
                </td>

                <td className="border p-2">
                  {student.studentName}
                </td>

                <td className="border p-2 text-center">
                  {student.score}
                </td>

                <td className="border p-2 text-center">
                  {student.accuracy}%
                </td>

                <td className="border p-2 text-center">
                  {formatTime(student.totalTimeSpent)}
                </td>
              </tr>
            ))}

            {!alreadyInTop10 && myRank && (
              <>
                <tr>
                  <td
                    colSpan={5}
                    className="text-center font-bold py-2"
                  >
                    • • •
                  </td>
                </tr>

                <tr className="bg-green-100 font-semibold">
                  <td className="border p-2 text-center">
                    {myRank.rank}
                  </td>

                  <td className="border p-2">
                    {myRank.studentName}
                  </td>

                  <td className="border p-2 text-center">
                    {myRank.score}
                  </td>

                  <td className="border p-2 text-center">
                    {myRank.accuracy}%
                  </td>

                  <td className="border p-2 text-center">
                    {formatTime(myRank.totalTimeSpent)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

export default StudentLeaderboardPage;