import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminLeaderboardListPage() {
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMockTests = async () => {
    try {
      const res = await api.get("/mock-tests");

      // Admin sees all mock tests
      setMockTests(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockTests();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Mock Test Leaderboards
      </h1>

      {mockTests.length === 0 ? (
        <p>No mock tests available.</p>
      ) : (
        <div className="space-y-4">
          {mockTests.map((mock) => (
            <div
              key={mock._id}
              className="bg-white rounded shadow p-6"
            >
              <h2 className="text-xl font-bold mb-2">
                {mock.title}
              </h2>

              <p>
                <strong>Subject:</strong>{" "}
                {mock.subject}
              </p>

              <p>
                <strong>Duration:</strong>{" "}
                {mock.durationMinutes} mins
              </p>

              <p>
                <strong>Total Marks:</strong>{" "}
                {mock.totalMarks}
              </p>

              <p>
                <strong>Questions:</strong>{" "}
                {mock.questions.length}
              </p>

              <button
                onClick={() =>
                  navigate(
                    `/admin/leaderboard/${mock._id}`
                  )
                }
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                View Leaderboard
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminLeaderboardListPage;