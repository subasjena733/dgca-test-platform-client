import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  const [subjects, setSubjects] = useState([]);

  const [selectedSubject, setSelectedSubject] =
    useState("ALL");

  const [searchCode, setSearchCode] =
    useState("");

  const [questionCount, setQuestionCount] =
    useState(0);

  //-----------------------------------------
  // Fetch Questions
  //-----------------------------------------

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/questions");

      setQuestions(res.data);
      setFilteredQuestions(res.data);
      setQuestionCount(res.data.length);

    } catch (error) {
      console.error(error);
    }
  };

  //-----------------------------------------
  // Fetch Subjects
  //-----------------------------------------

  const fetchSubjects = async () => {
    try {

      const res =
        await api.get("/subjects");

      setSubjects(res.data);

    } catch (error) {

      console.error(error);

    }
  };

  //-----------------------------------------

  useEffect(() => {

    fetchQuestions();
    fetchSubjects();

  }, []);

  //-----------------------------------------
  // Filtering
  //-----------------------------------------

  useEffect(() => {

    let filtered = [...questions];

    //-----------------------------

    if (selectedSubject !== "ALL") {

      filtered = filtered.filter(
        q => q.subject === selectedSubject
      );

    }

    //-----------------------------

    if (searchCode.trim()) {

      filtered = filtered.filter(
        q =>
          q.questionCode
            .toLowerCase()
            .includes(
              searchCode.toLowerCase()
            )
      );

    }

    //-----------------------------

    setFilteredQuestions(filtered);

    setQuestionCount(filtered.length);

  }, [
    questions,
    selectedSubject,
    searchCode
  ]);

  //-----------------------------------------

  return (

    <AdminLayout>

      <div className="h-[calc(100vh-90px)] flex flex-col">

        {/* Fixed Header */}

        <div className="bg-white border rounded shadow p-5 mb-5">

          <h1 className="text-3xl font-bold mb-5">

            Question Bank

          </h1>

          <div className="flex flex-wrap gap-4 items-center">

            <select

              value={selectedSubject}

              onChange={(e) =>
                setSelectedSubject(
                  e.target.value
                )
              }

              className="border rounded px-3 py-2"

            >

              <option value="ALL">

                All Subjects

              </option>

              {subjects.map(subject => (

                <option
                  key={subject._id}
                  value={subject.subjectName}
                >

                  {subject.subjectName}

                </option>

              ))}

            </select>

            <input

              type="text"

              placeholder="Search Question Code"

              value={searchCode}

              onChange={(e) =>
                setSearchCode(
                  e.target.value
                )
              }

              className="border rounded px-3 py-2 w-72"

            />

            <div className="ml-auto bg-blue-600 text-white px-5 py-2 rounded-full font-semibold">

              Total Questions : {questionCount}

            </div>

          </div>

        </div>

        {/* Scroll Area */}

        <div className="flex-1 overflow-y-auto">

          {filteredQuestions.length === 0 ? (

            <div className="text-center text-gray-500 mt-10">

              No Questions Found

            </div>

          ) : (

            <div className="space-y-6">

              {filteredQuestions.map((question, index) => (

                <div
                  key={question._id}
                  className="bg-white rounded-lg shadow border p-6"
                >

                  {/* Header */}

                  <div className="flex justify-between items-center mb-5">

                    <h2 className="text-xl font-bold">

                      {question.questionCode}

                    </h2>

                    <div className="flex gap-2">

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">

                        {question.subject}

                      </span>

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded">

                        {question.difficulty}

                      </span>

                    </div>

                  </div>

                  {/* Details */}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 text-sm">

                    <div>

                      <strong>Topic</strong>

                      <br />

                      {question.topic}

                    </div>

                    <div>

                      <strong>Marks</strong>

                      <br />

                      {question.marks}

                    </div>

                    <div>

                      <strong>Negative</strong>

                      <br />

                      {question.negativeMarks}

                    </div>

                  </div>

                  {/* Question */}

                  <div className="mb-5">

                    <h3 className="font-bold mb-2">

                      Question

                    </h3>

                    <div className="bg-slate-50 border rounded p-4">

                      {question.questionText}

                    </div>

                  </div>

                  {/* Options */}

                  <div className="space-y-3">

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

                  <div className="mt-5">

                    <strong className="text-green-700">

                      Correct Answer :

                    </strong>{" "}

                    {question.correctOption}

                  </div>

                  {/* Explanation */}

                  <div className="mt-5 bg-blue-50 border rounded p-4">

                    <strong>

                      Explanation

                    </strong>

                    <p className="mt-2">

                      {question.explanation}

                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </AdminLayout>

  );

}

export default QuestionBankPage;