import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

function StudentAttemptPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  const { id } = useParams();
  const [mockTest, setMockTest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [reviewQuestions, setReviewQuestions] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [questionTimeMap, setQuestionTimeMap] = useState({});
  const [questionEntryTime, setQuestionEntryTime] = useState(0);


  const fetchMockTest = async () => {
    try {
        let res;

      if (state?.resume && state?.attemptId) {
        res = await api.get(
          `/tests/resume/${state.attemptId}`
        );
      } else {
        res = await api.post(
          `/tests/start-mock/${id}`
        );
      }

      setAttemptId(res.data.attemptId);

      setMockTest({
        _id: res.data.mockTestId,
        title: res.data.title,
        durationMinutes: res.data.durationMinutes,
        questions: res.data.questions
      });

      if (state?.resume) {

        setSelectedAnswers(res.data.selectedAnswers || {});
        setVisitedQuestions(res.data.visitedQuestions || {});
        setReviewQuestions(res.data.reviewQuestions || {});
        setQuestionTimeMap(res.data.questionTimeMap || {});
        setCurrentQuestionIndex(res.data.currentQuestionIndex || 0);

        setTimeLeft(res.data.timeLeftSeconds);
        setQuestionEntryTime(res.data.timeLeftSeconds);

      } else {

        const initialTime =
          res.data.durationMinutes * 60;

        setTimeLeft(initialTime);
        setQuestionEntryTime(initialTime);
      }
    } catch (error) {
      console.error(error);

      if (
        error.response &&
        error.response.status === 400
      ) {
        alert(error.response.data.message);
        navigate("/student");
      }
    }
  };

  const saveCurrentQuestionTime = () => {
    if (!mockTest) return questionTimeMap;

    const currentQuestion =
      mockTest.questions[currentQuestionIndex];

    const timeSpent =
      questionEntryTime - timeLeft;

    if (timeSpent < 0) return questionTimeMap;

    const updatedMap = {
      ...questionTimeMap,
      [currentQuestion._id]:
        (questionTimeMap[currentQuestion._id] || 0) +
        timeSpent
    };

    setQuestionTimeMap(updatedMap);
    setQuestionEntryTime(timeLeft);

    return updatedMap;
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setSelectedAnswers((prev) => {
      const updated = {
        ...prev,
        [questionId]: selectedOption
      };

      saveProgress({
        selectedAnswersValue: updated
      });

      return updated;
    });
  };

  const handleClearResponse = (questionId) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];

      saveProgress({
        selectedAnswersValue: updated
      });

      return updated;
    });
  };

  const saveProgress = async ({
    currentQuestion = currentQuestionIndex,
    remainingTimeValue = timeLeft,
    reviewQuestionsValue = reviewQuestions,
    visitedQuestionsValue = visitedQuestions,
    selectedAnswersValue = selectedAnswers,
    questionTimeMapValue = questionTimeMap
  } = {}) => {
    console.log("Save Progress Called");
    if (!mockTest || !attemptId) return;

    const formattedAnswers = mockTest.questions.map((question) => ({
      questionId: question._id,
      selectedOption:
        selectedAnswersValue[question._id] ?? null,
      timeSpent:
        questionTimeMapValue[question._id] || 0
    }));

    try {
      await api.post(`/tests/save-progress/${attemptId}`, {
        answers: formattedAnswers,
        currentQuestion,
        remainingTime: remainingTimeValue,
        visitedQuestions: visitedQuestionsValue,
        reviewQuestions: reviewQuestionsValue,
        questionTimeMap: questionTimeMapValue
      });
    } catch (error) {
      console.error("Progress save failed", error);
    }
  };

  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (!mockTest || !attemptId) return;
    const currentQuestion = mockTest.questions[currentQuestionIndex];
    const finalQuestionTime = Math.max(0, questionEntryTime - timeLeft);
    const finalQuestionTimeMap = {
      ...questionTimeMap,
      [currentQuestion._id]:
        (questionTimeMap[currentQuestion._id] || 0) +
        finalQuestionTime
    };

    const formattedAnswers = mockTest.questions.map(
      (question) => ({
        questionId: question._id,
        selectedOption: selectedAnswers[question._id] ?? null,
        timeSpent: finalQuestionTimeMap[question._id] || 0
      })
    );

    const totalTimeSpent = Math.max(0, (mockTest.durationMinutes * 60) - timeLeft);

    try {
      const res = await api.post(
        `/tests/submit/${attemptId}`,
        {
          answers: formattedAnswers,
          totalTimeSpent
        }
      );

      if (isAutoSubmit) {
        alert("⏰ Time is over. Your test has been submitted automatically.");
      } else {
        alert("✅ Test submitted successfully.");
      }


      navigate("/student/result", {
        state: {
          attemptId: res.data.attemptId
        }
      });
    } catch (error) {
      console.error(error);
      alert("❌ Failed to submit the test. Please try again.");
    }
  };

  const handleManualSubmit = async () => {
    const answeredCount =
      Object.keys(selectedAnswers).length;

    const unansweredCount =
      mockTest.questions.length - answeredCount;

    const confirmSubmit = window.confirm(
      `Answered: ${answeredCount}\nUnanswered: ${unansweredCount}\n\nAre you sure you want to submit?`
    );

    if (!confirmSubmit) return;

    //alert("Test submitted successfully.");
    await handleSubmitTest(false);//await added
  };

  useEffect(() => {
    fetchMockTest();
  }, []);

  useEffect(() => {
    if (!mockTest) return;

    const currentQuestion = mockTest.questions[currentQuestionIndex];

    setVisitedQuestions((prev) => ({
      ...prev,
      [currentQuestion._id]: true
    }));
  }, [currentQuestionIndex, mockTest]);

  //Auto save after 10 secs
  useEffect(() => {
    if (!attemptId) return;

    const interval = setInterval(() => {
      const updatedMap = saveCurrentQuestionTime();

      saveProgress({
        questionTimeMapValue: updatedMap
      });
    }, 10000); // every 10 seconds
    //console.log("Auto Save Calling Save Progress");
    return () => clearInterval(interval);
  }, [
    attemptId,
    currentQuestionIndex,
    timeLeft,
    selectedAnswers,
    reviewQuestions,
    visitedQuestions,
    questionTimeMap
  ]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      //alert("Time is over! Test submitted.");
      handleSubmitTest(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!mockTest) {
    return <p className="p-6">Loading...</p>;
  }

  const currentQuestion = mockTest.questions[currentQuestionIndex];
  const isCurrentQuestionInReview = reviewQuestions[currentQuestion._id];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {mockTest.title}
      </h1>

      {/* Timer */}
      <div className="mb-4 text-lg font-bold text-red-600">
        Time Left:{" "}
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>

      {/* Question Palette */}
      <div className="mb-6 flex flex-wrap gap-2">
        {mockTest.questions.map((question, index) => {
          const isCurrent = index === currentQuestionIndex;
          const isAnswered = selectedAnswers[question._id];
          const isVisited = visitedQuestions[question._id];
          const isReview = reviewQuestions[question._id];
          const isAnsweredAndReview = isAnswered && isReview;

          return (
            <button
              key={question._id}
              onClick={() => {
                const updatedMap = saveCurrentQuestionTime();

                saveProgress({
                  currentQuestion: index,
                  questionTimeMapValue: updatedMap
                });

                setCurrentQuestionIndex(index);
              }}
              className={`w-10 h-10 rounded font-semibold ${
                isCurrent
                  ? "bg-blue-600 text-white"
                  : isAnsweredAndReview
                  ? "bg-teal-500 text-white"
                  : isReview
                  ? "bg-purple-600 text-white"
                  : isAnswered
                  ? "bg-green-500 text-white"
                  : isVisited
                  ? "bg-orange-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded shadow p-6">
        <p className="font-semibold mb-4">
          Question {currentQuestionIndex + 1} of{" "}
          {mockTest.questions.length}
        </p>

        <h2 className="text-lg font-medium mb-4">
          {currentQuestion.questionText}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected =
              selectedAnswers[currentQuestion._id] ===
              option.label;

              return (
                <label
                  key={option.label}
                  className={`border rounded p-3 cursor-pointer flex gap-3 items-start ${
                    isSelected
                      ? "bg-blue-100 border-blue-500"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion._id}
                    checked={isSelected}
                    onChange={() =>handleAnswerSelect(currentQuestion._id, option.label)}
                  className="mt-1"
                />

                <span>
                  <strong>{option.label}:</strong>{" "}
                  {option.text}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => {
              const updatedMap = saveCurrentQuestionTime();

              saveProgress({
                currentQuestion: currentQuestionIndex - 1,
                questionTimeMapValue: updatedMap
              });

              setCurrentQuestionIndex(currentQuestionIndex - 1);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={() => {
              const updatedMap = saveCurrentQuestionTime();

              const questionId = currentQuestion._id;

              setReviewQuestions((prev) => {
                const updated = {
                  ...prev,
                  [questionId]: !prev[questionId]
                };

                saveProgress({
                  reviewQuestionsValue: updated,
                  questionTimeMapValue: updatedMap
                });

                return updated;
              });
            }}
            className={`text-white px-4 py-2 rounded ${
              isCurrentQuestionInReview
                ? "bg-gray-600"
                : "bg-purple-600"
            }`}
          >
            {isCurrentQuestionInReview
              ? "Clear Review"
              : "Mark for Review"}
          </button>

          <button
            onClick={() =>
              handleClearResponse(currentQuestion._id)
            }
            disabled={
              !selectedAnswers[currentQuestion._id]
            }
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Response
          </button>

          <button
            disabled={
              currentQuestionIndex ===
              mockTest.questions.length - 1
            }
            onClick={() => {
              const updatedMap = saveCurrentQuestionTime();

              saveProgress({
                currentQuestion: currentQuestionIndex + 1,
                questionTimeMapValue: updatedMap
              });

              setCurrentQuestionIndex(currentQuestionIndex + 1);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleManualSubmit}
            className="bg-red-600 text-white px-6 py-3 rounded font-semibold"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentAttemptPage;