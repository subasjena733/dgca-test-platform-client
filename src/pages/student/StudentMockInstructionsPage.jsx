import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

function StudentMockInstructionsPage() {
  const { id } = useParams();
  const [mockTest, setMockTest] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const fetchMockTest = async () => {
    try {
      const res = await api.get(`/mock-tests/${id}`);
      setMockTest(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMockTest();
  }, []);

  if (!mockTest) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {mockTest.title}
      </h1>

      <div className="bg-white rounded shadow p-6 space-y-3">
        <p>
          <strong>Subject:</strong> {mockTest.subject}
        </p>

        <p>
          <strong>Total Questions:</strong>{" "}
          {mockTest.questions.length}
        </p>

        <p>
          <strong>Total Marks:</strong>{" "}
          {mockTest.totalMarks}
        </p>

        <p>
          <strong>Duration:</strong>{" "}
          {mockTest.durationMinutes} mins
        </p>

        <button
          onClick={() =>
            navigate(
              `/student/mock-tests/${id}/attempt`,
              {
                state: location.state
              }
            )
          }
          className="mt-4 bg-green-600 text-white px-5 py-2 rounded"
        >
          Start Now
        </button>
      </div>
    </div>
  );
}

export default StudentMockInstructionsPage;