import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import StudentNavbar from "./StudentNavbar";

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
    return (
      <>
        <StudentNavbar />
        <p className="p-4 sm:p-6 pt-20">Loading...</p>
      </>
    );
  }

  return (
    <>
    <StudentNavbar />
    <div className="p-4 sm:p-6 pt-20 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 break-words">
        {mockTest.title}
      </h1>

      <div className="bg-white rounded shadow p-4 sm:p-6 space-y-3">
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
          className="mt-4 w-full sm:w-auto bg-green-600 text-white px-5 py-3 sm:py-2 rounded"
        >
          Start Now
        </button>
      </div>
    </div>
    </>
  );
}

export default StudentMockInstructionsPage;
