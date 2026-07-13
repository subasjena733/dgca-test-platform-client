import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import StudentNavbar from "./StudentNavbar";

function StudentMockTestsPage() {
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const fetchMockTests = async () => {
    try {
      const res = await api.get("/mock-tests");
    
      // Show only published mocks to students
      const publishedMocks = res.data.filter(
        (mock) => mock.isPublished
      );

      setMockTests(publishedMocks);
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
      <>
        <StudentNavbar/>
        <p className="p-6 pt-20">Loading...</p>
      </>
    );
  }

  return (
    <>
    <StudentNavbar/>
    <div className="p-6 pt-20">
      <h1 className="text-3xl font-bold mb-6">
        Available Mock Tests
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
                <strong>Subject:</strong> {mock.subject}
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

              {mock.isAttempted ? (
                
                <button
                  onClick={() =>
                    navigate("/student/result", {
                      state: {
                        attemptId: mock.attemptId
                      }
                    })
                  }
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                  View Result
                </button>

              ) : mock.isInProgress ? (

                <button
                  onClick={() =>
                    navigate(`/student/mock-tests/${mock._id}`, {
                      state: {
                        resume: true,
                        attemptId: mock.attemptId
                      }
                    })
                  }
                  className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  Resume Test
                </button>

              ) : (

                <button
                  onClick={() =>
                    navigate(`/student/mock-tests/${mock._id}`)
                  }
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Start Test
                </button>

              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default StudentMockTestsPage;