import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function AdminReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      navigate("/admin/leaderboards");
    }
  };

  const backButton = (
    <button
      className="mb-4 rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
      onClick={goBack}
      type="button"
    >
      Back
    </button>
  );

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
    return <div className="p-6">{backButton}<p>Loading review...</p></div>;
  }

  if (!reviewData) {
    return <div className="p-6">{backButton}<p>Review not found.</p></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {backButton}
      <h1 className="text-2xl font-bold mb-2">Answer Review</h1>

      <div className="bg-blue-50 rounded p-4 mb-6">
        <p>
            <strong>Candidate:</strong>{" "}
            {reviewData.candidateName}
        </p>

        <p>
            <strong>Email:</strong>{" "}
            {reviewData.candidateEmail}
        </p>

        <p>
            <strong>Mock Test:</strong>{" "}
            {reviewData.mockTestTitle}
        </p>

        <p>
            <strong>Total Time:</strong>{" "}
            {formatTime(reviewData.totalTimeSpent)}
        </p>
        </div>

        {reviewData.regradeHistory?.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
            <h2 className="font-bold mb-3">Regrade History</h2>
            <div className="space-y-3">
              {reviewData.regradeHistory.map((entry, index) => (
                <div key={`${entry._id || entry.regradedAt}-${index}`} className="border-t border-amber-200 pt-3 text-sm">
                  <p>
                    <strong>{entry.questionCode}</strong> regraded on {new Date(entry.regradedAt).toLocaleString()}
                    {entry.adminId?.name ? ` by ${entry.adminId.name}` : ""}.
                  </p>
                  <p>
                    Score: {entry.previousScore} → {entry.newScore}; correct: {entry.previousCorrectCount} → {entry.newCorrectCount}; wrong: {entry.previousWrongCount} → {entry.newWrongCount}; accuracy: {entry.previousAccuracy}% → {entry.newAccuracy}%; percentage: {entry.previousPercentage}% → {entry.newPercentage}%.
                  </p>
                  {entry.reason && <p className="text-gray-600">{entry.reason}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

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
                {question.options.filter((option) => option.text?.trim()).map((option) => {
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
  );
}

export default AdminReviewPage;
