import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import AsyncActionButton from "../../components/AsyncActionButton";

function StudentAttemptPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  const { id } = useParams();

  const [mockTest, setMockTest] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [reviewQuestions, setReviewQuestions] = useState({});
  const [questionTimeMap, setQuestionTimeMap] = useState({});

  const [questionEntryTime, setQuestionEntryTime] = useState(0);

  /* ---------- Refs (latest values) ---------- */

  const selectedAnswersRef = useRef({});
  const visitedQuestionsRef = useRef({});
  const reviewQuestionsRef = useRef({});
  const questionTimeMapRef = useRef({});

  const timeLeftRef = useRef(0);
  const currentQuestionIndexRef = useRef(0);
  const questionEntryTimeRef = useRef(0);

  const saveIntervalRef = useRef(null);

  const testSubmittedRef = useRef(false);
  //------------To restrict multiple save request at a time----------------
  
  const fetchMockTest = async () => {
    
    try {
      let res;

      //Retriving attempt Id from session storage if browser refreshed
      const savedAttemptId = sessionStorage.getItem(`attempt_${id}`);

      if (state?.resume && state?.attemptId) {
        res = await api.get(`/tests/resume/${state.attemptId}`);

      }else if (savedAttemptId) {

        // Only after refresh
        res = await api.get(`/tests/resume/${savedAttemptId}`);

      } else {
        res = await api.post(`/tests/start-mock/${id}`);
      }

      setAttemptId(res.data.attemptId);

      //To sore attempt id in session storage so that refresh browser dont lose data.
      
      sessionStorage.setItem(`attempt_${id}`, res.data.attemptId);
      const isResume = (state?.resume && state?.attemptId) || savedAttemptId;

      const mock = {
        _id: res.data.mockTestId,
        title: res.data.title,
        durationMinutes: res.data.durationMinutes,
        questions: res.data.questions,
      };

      setMockTest(mock);

      if (isResume) {
        setSelectedAnswers(res.data.selectedAnswers || {});
        setVisitedQuestions(res.data.visitedQuestions || {});
        setReviewQuestions(res.data.reviewQuestions || {});
        setQuestionTimeMap(res.data.questionTimeMap || {});

        setCurrentQuestionIndex(res.data.currentQuestionIndex || 0);

        setTimeLeft(res.data.timeLeftSeconds);
        setQuestionEntryTime(res.data.timeLeftSeconds);

        /* refs */

        selectedAnswersRef.current = res.data.selectedAnswers || {};
        visitedQuestionsRef.current = res.data.visitedQuestions || {};
        reviewQuestionsRef.current = res.data.reviewQuestions || {};
        questionTimeMapRef.current = res.data.questionTimeMap || {};

        currentQuestionIndexRef.current =
          res.data.currentQuestionIndex || 0;

        timeLeftRef.current = res.data.timeLeftSeconds;
        questionEntryTimeRef.current =
          res.data.timeLeftSeconds;
      } else {
        const totalTime =
          res.data.durationMinutes * 60;

        setTimeLeft(totalTime);
        setQuestionEntryTime(totalTime);

        timeLeftRef.current = totalTime;
        questionEntryTimeRef.current = totalTime;
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
    if (!mockTest) return questionTimeMapRef.current;

    const currentQuestion = mockTest.questions[currentQuestionIndexRef.current];

    if (!currentQuestion) return questionTimeMapRef.current;

    const spent =
      questionEntryTimeRef.current -
      timeLeftRef.current;

    if (spent <= 0)
      return questionTimeMapRef.current;

    const updated = {
      ...questionTimeMapRef.current,
      [currentQuestion._id]:
        (questionTimeMapRef.current[currentQuestion._id] || 0) +
        spent,
    };

    questionTimeMapRef.current = updated;

    setQuestionTimeMap(updated);

    questionTimeMapRef.current = updated;

    questionEntryTimeRef.current = timeLeftRef.current;

    setQuestionEntryTime(timeLeftRef.current);

    return updated;
  };
  
  const handleAnswerSelect = (questionId, selectedOption) => {
    const updatedAnswers = {
      ...selectedAnswersRef.current,
      [questionId]: selectedOption,
    };

    selectedAnswersRef.current = updatedAnswers;
    setSelectedAnswers(updatedAnswers);

    saveProgress({
      selectedAnswersValue: updatedAnswers,
    });
  };

  const handleClearResponse = async (questionId) => {
    const updatedAnswers = {
      ...selectedAnswersRef.current,
    };

    delete updatedAnswers[questionId];

    selectedAnswersRef.current = updatedAnswers;
    setSelectedAnswers(updatedAnswers);

    await saveProgress({
      selectedAnswersValue: updatedAnswers,
    });
  };

  const handleReviewToggle = async () => {
    const updatedTimeMap = saveCurrentQuestionTime();

    const questionId =
      mockTest.questions[currentQuestionIndexRef.current]._id;

    const updatedReview = {
      ...reviewQuestionsRef.current,
      [questionId]:
        !reviewQuestionsRef.current[questionId],
    };

    reviewQuestionsRef.current = updatedReview;
    setReviewQuestions(updatedReview);

    await saveProgress({
      reviewQuestionsValue: updatedReview,
      questionTimeMapValue: updatedTimeMap,
    });
  };

  const moveToQuestion = (newIndex) => {
    const updatedTimeMap = saveCurrentQuestionTime();

    currentQuestionIndexRef.current = newIndex;

    setCurrentQuestionIndex(newIndex);

    questionEntryTimeRef.current = timeLeftRef.current;
    setQuestionEntryTime(timeLeftRef.current);

    questionTimeMapRef.current = updatedTimeMap;

    saveProgress({
      currentQuestion: newIndex,
      questionTimeMapValue: updatedTimeMap,
    });
  };

  const saveProgress = async ({
    currentQuestion = currentQuestionIndexRef.current,
    remainingTimeValue = timeLeftRef.current,
    selectedAnswersValue = selectedAnswersRef.current,
    visitedQuestionsValue = visitedQuestionsRef.current,
    reviewQuestionsValue = reviewQuestionsRef.current,
    questionTimeMapValue = questionTimeMapRef.current,
  } = {}) => {

    if (testSubmittedRef.current) return;

    if (!mockTest || !attemptId) return;

    const formattedAnswers =
      mockTest.questions.map((q) => ({
        questionId: q._id,
        selectedOption:
          selectedAnswersValue[q._id] ?? null,
        timeSpent:
          questionTimeMapValue[q._id] || 0,
      }));

    try {
      await api.post(
        `/tests/save-progress/${attemptId}`,
        {
          answers: formattedAnswers,
          currentQuestion,
          remainingTime: remainingTimeValue,
          visitedQuestions: visitedQuestionsValue,
          reviewQuestions: reviewQuestionsValue,
          questionTimeMap: questionTimeMapValue,
        }
      );
    } catch (err) {
      console.error(
        "Progress save failed",
        err
      );
    }
  };

  const handleSubmitTest = async (isAutoSubmit = false) => {

    testSubmittedRef.current = true;

    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    if (!mockTest || !attemptId) return;
    const finalQuestionTimeMap = saveCurrentQuestionTime();

    const formattedAnswers = mockTest.questions.map(
      (question) => ({
        questionId: question._id,
        selectedOption: selectedAnswersRef.current[question._id] ?? null,
        timeSpent: finalQuestionTimeMap[question._id] || 0
      })
    );

    const totalTimeSpent = Math.max( 0, (mockTest.durationMinutes * 60) - timeLeftRef.current);

    try {
      const res = await api.post(
        `/tests/submit/${attemptId}`,
        {
          answers: formattedAnswers,
          totalTimeSpent
        }
      );
      // Clear the attempt id stored in session id.
      sessionStorage.removeItem(`attempt_${id}`);

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
//--------------------Use Effect Section-------------------------
  useEffect(() => {
    fetchMockTest();
  }, []);

  useEffect(() => {
    if (!mockTest) return;

    const question =
      mockTest.questions[currentQuestionIndex];

    if (!question) return;

    const updatedVisited = {
      ...visitedQuestionsRef.current,
      [question._id]: true,
    };

    visitedQuestionsRef.current = updatedVisited;
    setVisitedQuestions(updatedVisited);
  }, [currentQuestionIndex, mockTest]);

  //Auto save after 10 secs
  useEffect(() => {
    if (!attemptId || !mockTest) return;

    //console.log("Auto Save Started");
    
    saveIntervalRef.current = setInterval(() => {

      if (testSubmittedRef.current) return;

      const updatedMap = saveCurrentQuestionTime();

      saveProgress({
        questionTimeMapValue: updatedMap,
      });

    }, 10000);

    return () => {
      clearInterval(saveIntervalRef.current);
    };

  }, [attemptId, mockTest]);

  useEffect(() => {

    if (timeLeft === null) return;

    timeLeftRef.current = timeLeft;

    if (timeLeft <= 0) {
      handleSubmitTest(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);

  }, [timeLeft]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    reviewQuestionsRef.current = reviewQuestions;
  }, [reviewQuestions]);

  useEffect(() => {
    visitedQuestionsRef.current = visitedQuestions;
  }, [visitedQuestions]);

  useEffect(() => {
    questionTimeMapRef.current = questionTimeMap;
  }, [questionTimeMap]);

  useEffect(() => {
    currentQuestionIndexRef.current =
      currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    questionEntryTimeRef.current =
      questionEntryTime;
  }, [questionEntryTime]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {

    const handleBeforeUnload = () => {

      const updatedMap =
        saveCurrentQuestionTime();

      saveProgress({
        questionTimeMapValue: updatedMap,
      });

    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () =>
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

  }, [mockTest, attemptId]);

  if (!mockTest) {
    return <p className="p-6">Loading...</p>;
  }

  const currentQuestion = mockTest.questions[currentQuestionIndex];
  const isCurrentQuestionInReview = reviewQuestions[currentQuestion._id];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="flex flex-col p-3 sm:p-6 max-w-4xl mx-auto w-full min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 break-words">
        {mockTest.title}
      </h1>

      {/* Timer */}
      <div className="mb-4 text-base sm:text-lg font-bold text-red-600">
        Time Left:{" "}
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>

      {/* Question Palette */}
      <div className="order-4 sm:order-3 mb-6 flex max-h-36 sm:max-h-48 overflow-y-auto flex-wrap gap-2 rounded bg-white/70 p-2">
        {mockTest.questions.map((question, index) => {
          const isCurrent = index === currentQuestionIndex;
          const isAnswered = selectedAnswers[question._id];
          const isVisited = visitedQuestions[question._id];
          const isReview = reviewQuestions[question._id];
          const isAnsweredAndReview = isAnswered && isReview;

          return (
            <button
              key={question._id}
              onClick={() => moveToQuestion(index)}
              className={`w-10 h-10 shrink-0 rounded font-semibold ${
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

      <div className="order-3 sm:order-4 bg-white rounded shadow p-3 sm:p-6">
        <p className="font-semibold mb-4">
          Question {currentQuestionIndex + 1} of{" "}
          {mockTest.questions.length}
        </p>

        <h2 className="text-base sm:text-lg font-medium mb-4 whitespace-pre-wrap break-words">
          {currentQuestion.questionText}
        </h2>

        {currentQuestion.imageUrl && <img alt={`Question ${currentQuestion.questionCode || currentQuestionIndex + 1}`} className="mb-5 max-h-[28rem] w-auto max-w-full rounded border object-contain" src={currentQuestion.imageUrl} />}

        <div className="space-y-3">
          {currentQuestion.options.filter((option) => option.text?.trim()).map((option) => {
            const isSelected =
              selectedAnswers[currentQuestion._id] ===
              option.label;

              return (
                <label
                  key={option.label}
                  className={`border rounded p-2 sm:p-3 cursor-pointer flex gap-3 items-start min-w-0 ${
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

                <span className="min-w-0 break-words">
                  <strong>{option.label}:</strong>{" "}
                  {option.text}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-between gap-2">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => moveToQuestion(currentQuestionIndex - 1)}
            className="order-1 sm:order-none bg-gray-500 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <AsyncActionButton
            onClick={handleReviewToggle}
            className={`order-4 sm:order-none col-span-2 sm:col-span-auto text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded ${
              isCurrentQuestionInReview
                ? "bg-gray-600"
                : "bg-purple-600"
            }`}
          >
            {isCurrentQuestionInReview
              ? "Clear Review"
              : "Mark for Review"}
          </AsyncActionButton>

          <AsyncActionButton
            onClick={() =>
              handleClearResponse(currentQuestion._id)
            }
            disabled={
              !selectedAnswers[currentQuestion._id]
            }
            className="order-3 sm:order-none col-span-2 sm:col-span-auto bg-red-500 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            loadingText="Saving..."
          >
            Clear Response
          </AsyncActionButton>

          <button
            disabled={
              currentQuestionIndex ===
              mockTest.questions.length - 1
            }
            onClick={() => moveToQuestion(currentQuestionIndex + 1)}
            className="order-2 sm:order-none bg-blue-600 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <AsyncActionButton
            onClick={handleManualSubmit}
            className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded font-semibold"
            loadingText="Submitting test..."
          >
            Submit Test
          </AsyncActionButton>
        </div>
      </div>
    </div>
  );
}

export default StudentAttemptPage;
