import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function AdminLeaderboardPage() {
  const { mockTestId } = useParams();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [mockTestId]);

  if (loading) {
    return <p>Loading leaderboard...</p>;
  }

  const filteredLeaderboard = leaderboard.filter((student) =>
    student.studentName
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Leaderboard
      </h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Candidate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 border rounded px-4 py-2"
        />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">

        <table className="min-w-full border-collapse">

          <thead className="bg-gray-200">

            <tr>
              <th className="border p-3">Rank</th>
              <th className="border p-3">Candidate</th>
              <th className="border p-3">Score</th>
              <th className="border p-3">Correct</th>
              <th className="border p-3">Wrong</th>
              <th className="border p-3">Unattempted</th>
              <th className="border p-3">Accuracy</th>
              <th className="border p-3">Time</th>
              <th className="border p-3">Submitted</th>
              <th className="border p-3">Action</th>
            </tr>

          </thead>

          <tbody>

            {filteredLeaderboard.map((student) => (

              <tr key={student.attemptId}>

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
                  {student.correct}
                </td>

                <td className="border p-2 text-center text-red-600">
                  {student.wrong}
                </td>

                <td className="border p-2 text-center">
                  {student.unattempted}
                </td>

                <td className="border p-2 text-center">
                  {student.accuracy}%
                </td>

                <td className="border p-2 text-center">
                  {formatTime(student.totalTimeSpent)}
                </td>

                <td className="border p-2 text-center">
                  {new Date(student.submittedAt).toLocaleString()}
                </td>

                <td className="border p-2 text-center">

                  <button
                    onClick={() =>
                      navigate(`/admin/review/${student.attemptId}`)
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Review
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminLeaderboardPage;