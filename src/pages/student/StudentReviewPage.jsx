import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import StudentNavbar from "./StudentNavbar"

function StudentReviewPage() {
  const { attemptId } = useParams();

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(
          `/tests/review/${attemptId}`
        );

        setReviewData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [attemptId]);

  if (loading) {
    return (
      <>
      <StudentNavbar/>
      <p className="p-6 pt-20">Loading review...</p>
      </>
    );
  }

  if (!reviewData) {
    return (
      <>
      <StudentNavbar/>
      <p className="p-6 pt-20">Review not found.</p>
      </>
    );
  }

  return (
    <>
    <StudentNavbar/>
    <div className="p-6 max-w-5xl mx-auto pt-20">
      <h1 className="text-2xl font-bold mb-2">
        Answer Review
      </h1>

      <p className="text-gray-600">
        {reviewData.mockTestTitle}
      </p>

      <div className="mb-6 font-semibold">
        Total Time:{" "}
        {formatTime(reviewData.totalTimeSpent || 0)}
      </div>

      <div className="space-y-8">
        {reviewData.review.map((question, index) => {
          let badgeText = "";
          let badgeClass = "";

          if (question.status === "CORRECT") {
            badgeText = `✓ +${question.marks}`;
            badgeClass = "bg-green-100 text-green-700";
          } else if (question.status === "WRONG") {
            badgeText = `✗ -${question.negativeMarks}`;
            badgeClass = "bg-red-100 text-red-700";
          } else {
            badgeText = "○ 0";
            badgeClass = "bg-gray-100 text-gray-700";
          }

          return (
            <div
              key={question.questionId}
              className="bg-white shadow rounded p-6"
            >
              {/* Header */}
              <div className="mb-3 flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    Q{index + 1} — {question.questionCode}
                  </p>

                  <p className="text-sm text-gray-600">
                    {question.subject} | {question.topic} |{" "}
                    {question.difficulty}
                  </p>
                </div>

                <div
                  className={`px-3 py-1 rounded-full font-semibold text-sm ${badgeClass}`}
                >
                  {badgeText}
                </div>
              </div>

              {/* Question */}
              <h2 className="font-medium mb-4">
                {question.questionText}
              </h2>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((option) => {
                  const isCorrect =
                    option.label === question.correctOption;

                  const isSelected =
                    option.label === question.selectedOption;

                  let className = "border rounded p-3";

                  if (isCorrect) {
                    className +=
                      " bg-green-100 border-green-500";
                  } else if (isSelected) {
                    className +=
                      " bg-red-100 border-red-500";
                  }

                  return (
                    <div
                      key={option.label}
                      className={className}
                    >
                      <strong>{option.label}:</strong>{" "}
                      {option.text}
                    </div>
                  );
                })}
              </div>

              {/* Meta Info */}
              <div className="mt-4 space-y-1 text-sm">
                <p>
                  <strong>Status:</strong>{" "}
                  {question.status}
                </p>

                <p>
                  <strong>Selected:</strong>{" "}
                  {question.selectedOption ??
                    "Not Answered"}
                </p>

                <p>
                  <strong>Correct:</strong>{" "}
                  {question.correctOption}
                </p>

                <p>
                  <strong>Time Spent:</strong>{" "}
                  {formatTime(question.timeSpent || 0)}
                </p>

                {question.explanation && (
                  <div className="mt-3 bg-yellow-50 p-3 rounded">
                    <strong>Explanation:</strong>{" "}
                    {question.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}

export default StudentReviewPage;