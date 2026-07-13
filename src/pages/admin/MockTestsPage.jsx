import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function MockTestsPage() {
  const [mockTests, setMockTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const [viewQuestion, setViewQuestion] = useState(null);
  const [showSelectedQuestions, setShowSelectedQuestions] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    durationMinutes: 60,
    isPremium: false
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  
  const navigate = useNavigate();

  const fetchMockTests = async () => {
    try {
      const res = await api.get("/mock-tests");
      setMockTests(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");

      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMockTests();
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue =
      type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue
    });

    if (name === "subject") {
      setSelectedQuestions([]);
      setAvailableQuestions([]);
      fetchQuestionsBySubject(value);
    }
  };

  const fetchQuestionsBySubject = async (subject) => {
    try {

      const url =
        subject === "ALL"
          ? "/questions"
          : `/questions?subject=${encodeURIComponent(subject)}`;

      const res = await api.get(url);

      setAvailableQuestions(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  const toggleQuestionSelection = (question) => {
    const alreadySelected = selectedQuestions.some(
      (q) => q._id === question._id
    );

    if (alreadySelected) {
      setSelectedQuestions(
        selectedQuestions.filter(
          (q) => q._id !== question._id
        )
      );
    } else {
      setSelectedQuestions([
        ...selectedQuestions,
        question
      ]);
    }
  };

  const totalMarks = selectedQuestions.reduce(
    (sum, question) => sum + (question.marks || 0),
    0
  );

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("Please enter mock test title");
      return;
    }

    if (!formData.subject) {
      alert("Please select subject");
      return;
    }

    if (selectedQuestions.length === 0) {
      alert("Please select at least one question");
      return;
    }

    try {
      const questionIds = selectedQuestions.map(
        (question) => question._id
      );

      await api.post("/mock-tests", {
        title: formData.title,
        subject: formData.subject,
        questions: questionIds,
        durationMinutes: Number(
          formData.durationMinutes
        ),
        totalMarks,
        isPremium: formData.isPremium
      });

      alert("Mock Test Created");

      resetForm();      // Clear everything
      setShowForm(false);
      fetchMockTests();
    } catch (error) {
      console.error(error);
      alert("Failed to create mock test");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      durationMinutes: 60,
      isPremium: false
    });

    setSelectedQuestions([]);
    setAvailableQuestions([]);
  };

  //Search bar
  const filteredQuestions = availableQuestions.filter((question) =>
    question.questionCode
      .toLowerCase()
      .includes(questionSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Mock Test Management
        </h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Mock Test
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Add Mock Test
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <input
                name="title"
                placeholder="Mock Test Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Subject</option>

                <option value="ALL">
                  All Subjects
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject._id}
                    value={subject.subjectName}
                  >
                    {subject.subjectName}
                  </option>
                ))}
              </select>

              <input
                name="durationMinutes"
                placeholder="Duration in Minutes"
                type="number"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <label className="flex items-center gap-2">
                <input
                  name="isPremium"
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={handleChange}
                />
                Premium Mock Test
              </label>

              {availableQuestions.length > 0 && (
                <div className="border rounded p-3 max-h-72 overflow-y-auto">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Search Question Code..."
                      value={questionSearch}
                      onChange={(e) =>
                        setQuestionSearch(e.target.value)
                      }
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <h3 className="font-bold mb-3">
                    Available Questions
                  </h3>

                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-200">
                        <th className="p-2 text-left">Select</th>
                        <th className="p-2 text-left">Code</th>
                        <th className="p-2 text-left">Topic</th>
                        <th className="p-2 text-left">Marks</th>
                        <th className="p-2 text-left">View</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredQuestions.map((question) => (
                        <tr
                          key={question._id}
                          className="border-b"
                        >
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.some(
                                (q) => q._id === question._id
                              )}
                              onChange={() =>
                                toggleQuestionSelection(question)
                              }
                            />
                          </td>

                          <td className="p-2">
                            {question.questionCode}
                          </td>

                          <td className="p-2">
                            {question.topic}
                          </td>

                          <td className="p-2">
                            {question.marks}
                          </td>

                          <td className="p-2">
                            <button
                              onClick={() => setViewQuestion(question)}
                              className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {viewQuestion && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                  <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">

                    <div className="flex justify-between items-center mb-4">

                      <h2 className="text-2xl font-bold">
                        Question Details
                      </h2>

                      <button
                        onClick={() => setViewQuestion(null)}
                        className="text-2xl font-bold"
                      >
                        ×
                      </button>

                    </div>

                    <div className="space-y-4">

                      <div>
                        <strong>Question Code:</strong>{" "}
                        {viewQuestion.questionCode}
                      </div>

                      <div>
                        <strong>Subject:</strong>{" "}
                        {viewQuestion.subject}
                      </div>

                      <div>
                        <strong>Topic:</strong>{" "}
                        {viewQuestion.topic}
                      </div>

                      <div>
                        <strong>Difficulty:</strong>{" "}
                        {viewQuestion.difficulty}
                      </div>

                      <div className="border rounded p-3 bg-gray-50">
                        <strong>Question</strong>

                        <p className="mt-2">
                          {viewQuestion.questionText}
                        </p>
                      </div>

                      <div className="space-y-2">

                        {viewQuestion.options.map((option) => (

                          <div
                            key={option.label}
                            className={`border rounded p-2 ${
                              option.label === viewQuestion.correctOption
                                ? "bg-green-100 border-green-500"
                                : ""
                            }`}
                          >
                            <strong>
                              {option.label}.
                            </strong>{" "}
                            {option.text}

                          </div>

                        ))}

                      </div>

                      <div>

                        <strong>
                          Correct Answer:
                        </strong>{" "}

                        {viewQuestion.correctOption}

                      </div>

                      <div>

                        <strong>
                          Explanation
                        </strong>

                        <div className="border rounded p-3 bg-gray-50 mt-2">

                          {viewQuestion.explanation ||
                            "No explanation available."}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )}

              {showSelectedQuestions && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                  <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">

                      <div>
                        <h2 className="text-3xl font-bold">
                          Mock Test Preview
                        </h2>

                        <p className="text-gray-600 mt-2">
                          Selected Questions :{" "}
                          <strong>{selectedQuestions.length}</strong>
                        </p>

                        <p className="text-gray-600">
                          Total Marks :{" "}
                          <strong>{totalMarks}</strong>
                        </p>

                        <p className="text-gray-600">
                          Duration :{" "}
                          <strong>{formData.durationMinutes} Minutes</strong>
                        </p>

                      </div>

                      <button
                        onClick={() => setShowSelectedQuestions(false)}
                        className="text-3xl font-bold"
                      >
                        ×
                      </button>

                    </div>

                    <hr className="mb-6" />

                    {selectedQuestions.map((question, index) => (

                      <div
                        key={question._id}
                        className="border rounded-lg p-5 mb-6 shadow-sm"
                      >

                        {/* Question Heading */}

                        <div className="flex justify-between items-center mb-3">

                          <h3 className="text-xl font-bold">
                            Q{index + 1}. {question.questionText}
                          </h3>

                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">
                            {question.questionCode}
                          </span>

                        </div>

                        {/* Metadata */}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">

                          <div>
                            <strong>Subject :</strong>{" "}
                            {question.subject}
                          </div>

                          <div>
                            <strong>Topic :</strong>{" "}
                            {question.topic}
                          </div>

                          <div>
                            <strong>Difficulty :</strong>{" "}
                            {question.difficulty}
                          </div>

                          <div>
                            <strong>Marks :</strong>{" "}
                            {question.marks}
                          </div>

                          <div>
                            <strong>Negative :</strong>{" "}
                            {question.negativeMarks}
                          </div>

                        </div>

                        {/* Options */}

                        <div className="space-y-2 mb-4">

                          {question.options.map((option) => (

                            <div
                              key={option.label}
                              className={`border rounded p-3 ${
                                option.label === question.correctOption
                                  ? "bg-green-100 border-green-500"
                                  : ""
                              }`}
                            >

                              <strong>
                                {option.label}.
                              </strong>{" "}

                              {option.text}

                            </div>

                          ))}

                        </div>

                        {/* Correct Answer */}

                        <div className="mb-3">

                          <span className="font-semibold text-green-700">
                            Correct Answer :
                          </span>{" "}

                          {question.correctOption}

                        </div>

                        {/* Explanation */}

                        <div>

                          <p className="font-semibold mb-2">
                            Explanation
                          </p>

                          <div className="border rounded bg-gray-50 p-3">

                            {question.explanation
                              ? question.explanation
                              : "No explanation provided."}

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>
              )}

              {selectedQuestions.length > 0 && (
                <div className="bg-blue-50 border rounded p-4">
                  <p className="font-semibold">
                    Selected Questions: {selectedQuestions.length}
                  </p>

                  <p className="font-semibold">
                    Total Marks: {totalMarks}
                  </p>

                  <button
                    onClick={() =>
                      setShowSelectedQuestions(true)
                    }
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    View Selected Questions
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Reset
                </button>

                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Create Mock Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-200">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Total Marks</th>
              <th className="p-3 text-left">Premium</th>
              <th className="p-3 text-left">Actions</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {mockTests.map((test) => (
              <tr
                key={test._id}
                className="border-b"
              >
                <td className="p-3">
                  {test.title}
                </td>

                <td className="p-3">
                  {test.subject}
                </td>

                <td className="p-3">
                  {test.durationMinutes} mins
                </td>

                <td className="p-3">
                  {test.totalMarks}
                </td>

                <td className="p-3">
                  {test.isPremium ? "Yes" : "No"}
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/mock-tests/${test._id}`)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>
                  </div>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      test.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {test.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default MockTestsPage;