import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import * as XLSX from "xlsx";

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editingQuestionId, setEditingQuestionId] =useState(null);

  const [showQuestionView, setShowQuestionView] = useState(false);
  const [viewQuestion, setViewQuestion] = useState(null);

  //Bulk upload
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [excelRows, setExcelRows] = useState([]);
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  //-----------------------------------------------------

  const initialFormData = {
    subject: "",
    topic: "",
    difficulty: "Easy",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
    explanation: "",
    marks: 1,
    negativeMarks: 0
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, []);

  const fetchQuestions = async () => {
    try {
    const res = await api.get("/questions");
      setQuestions(res.data);
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

  const handleSubmit = async () => {
    try {
      if (!formData.correctOption) {
        alert("Please select correct option");
        return;
      }

      const payload = {
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        questionText: formData.questionText,
        options: [
          {
            label: "A",
            text: formData.optionA
          },
          {
            label: "B",
            text: formData.optionB
          },
          {
            label: "C",
            text: formData.optionC
          },
          {
            label: "D",
            text: formData.optionD
          }
        ],
        correctOption: formData.correctOption,
        explanation: formData.explanation,
        marks: formData.marks,
        negativeMarks: formData.negativeMarks
      };

      if (editingQuestionId) {
        await api.put(
          `/questions/${editingQuestionId}`,
          payload
        );

        alert("Question updated successfully");
      } else {
        await api.post("/questions", payload);

        alert("Question added successfully");
      }

      setShowForm(false);

      setEditingQuestionId(null);

      setFormData({
        subject: "",
        topic: "",
        difficulty: "Easy",
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "",
        explanation: "",
        marks: 1,
        negativeMarks: 0
      });

      fetchQuestions();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to add question"
      );
    }
  };

  const clearForm = () => {
    setFormData(initialFormData);
  };

  const resetForm = () => {
    if (window.confirm("Clear all fields?")) {
      clearForm();
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/questions/${id}`);

      alert("Question deleted successfully");

      fetchQuestions();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Delete failed"
      );
    }
  };

  const handleEdit = (question) => {
    setEditingQuestionId(question._id);

    setFormData({
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      questionText: question.questionText,
      optionA: question.options[0]?.text || "",
      optionB: question.options[1]?.text || "",
      optionC: question.options[2]?.text || "",
      optionD: question.options[3]?.text || "",
      correctOption: question.correctOption,
      explanation: question.explanation || "",
      marks: question.marks,
      negativeMarks: question.negativeMarks
    });

    setShowForm(true);
  };

  const handleReadExcel = () => {

    if (!selectedExcelFile) {
      alert("Please select an Excel file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {

      const data = new Uint8Array(e.target.result);

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const firstSheet =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[firstSheet];

      const json =XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: "",
        }
      );

      //console.log(json);

      setExcelRows(json);
      validateExcel(json);

    };

    reader.readAsArrayBuffer(
      selectedExcelFile
    );

  };

  const downloadTemplate = () => {

    const template = [
      {
        Subject: "",
        Topic: "",
        Difficulty: "Easy",
        Question: "",
        "Option A": "",
        "Option B": "",
        "Option C": "",
        "Option D": "",
        "Correct Option": "",
        Explanation: "",
        Marks: 1,
        "Negative Marks": 0
      }
    ];

    const worksheet =
      XLSX.utils.json_to_sheet(template);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Questions"
    );

    XLSX.writeFile(
      workbook,
      "Question_Template.xlsx"
    );

  };

  const validateExcel = (rows) => {

    const valid = [];
    const invalid = [];

    rows.forEach((row, index) => {

      // Normalize all values

      const subject = String(row.Subject || "").trim();
      const topic = String(row.Topic || "").trim();
      const difficulty = String(row.Difficulty || "").trim();
      const question = String(row.Question || "").trim();
      const optionA = String(row["Option A"] || "").trim();
      const optionB = String(row["Option B"] || "").trim();
      const optionC = String(row["Option C"] || "").trim();
      const optionD = String(row["Option D"] || "").trim();
      const correctOption = String(row["Correct Option"] || "").trim().toUpperCase();
      const explanation = String(row.Explanation || "").trim();

      const marks = Number(row.Marks);
      const negativeMarks = Number(row["Negative Marks"]);

      const errors = [];

      // Subject

      if (!subject) {
        errors.push("Subject missing");
      } else {

        const subjectExists = subjects.some(
          (s) => s.subjectName === subject
        );

        if (!subjectExists) {
          errors.push("Subject not found");
        }

      }

      // Topic

      if (!topic) {
        errors.push("Topic missing");
      }

      // Difficulty

      if (
        !["Easy", "Medium", "Hard"].includes(
          difficulty
        )
      ) {
        errors.push("Invalid Difficulty");
      }

      // Question

      if (!question) {
        errors.push("Question missing");
      }

      // Options

      if (!optionA)
        errors.push("Option A missing");

      if (!optionB)
        errors.push("Option B missing");

      if (!optionC)
        errors.push("Option C missing");

      if (!optionD)
        errors.push("Option D missing");

      // Correct Option

      if (
        !["A", "B", "C", "D"].includes(
          correctOption
        )
      ) {
        errors.push("Correct Option invalid");
      }

      // Explanation

      if (!explanation) {
        errors.push("Explanation missing");
      }

      // Marks

      if (
        isNaN(marks) ||
        marks <= 0
      ) {
        errors.push("Marks invalid");
      }

      // Negative Marks

      if (
        isNaN(negativeMarks) ||
        negativeMarks < 0
      ) {
        errors.push(
          "Negative Marks invalid"
        );
      }

      // Final Result

      if (errors.length === 0) {

        valid.push({
          subject,
          topic,
          difficulty,
          question,
          options: [
            {
              label: "A",
              text: optionA
            },
            {
              label: "B",
              text: optionB
            },
            {
              label: "C",
              text: optionC
            },
            {
              label: "D",
              text: optionD
            }
          ],
          correctOption,
          explanation,
          marks,
          negativeMarks
        });

      } else {

        invalid.push({
          rowNumber: index + 2,
          errors
        });

      }

    });

    setExcelRows(rows);

    setValidRows(valid);

    setInvalidRows(invalid);

    setShowPreview(true);

    //console.log(valid);
    //console.log(invalid);
  };

  const handleBulkImport = async () => {

    if (validRows.length === 0) {
      alert("No valid questions to import.");
      return;
    }

    try {

      const res = await api.post(
        "/questions/bulk-upload",
        {
          questions: validRows
        }
      );

      alert(res.data.message);

      //--------------------------------
      // Reset Everything
      //--------------------------------

      setShowPreview(false);

      setShowBulkUpload(false);

      setSelectedExcelFile(null);

      setValidRows([]);

      setInvalidRows([]);

      setExcelRows([]);

      //--------------------------------

      fetchQuestions();

    }

    catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Bulk upload failed."
      );

    }

  };

  const handleViewQuestion = (question) => {
    setViewQuestion(question);
    setShowQuestionView(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Question Management
        </h1>

        <button
          onClick={() => {
          if (editingQuestionId) {
            setEditingQuestionId(null);
            clearForm();
          }

          setShowForm(true);
        }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Question
        </button>

        <button
          onClick={() => setShowBulkUpload(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Bulk Upload
        </button>
      </div>
  {/* ------------------------Bulk upload form------------------------------ */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Bulk Question Upload
              </h2>

              <button
                onClick={() => {
                  setShowBulkUpload(false);
                  setSelectedExcelFile(null);
                }}
                className="text-2xl font-bold"
              >
                ×
              </button>

            </div>

            <div className="space-y-5">

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) =>
                  setSelectedExcelFile(
                    e.target.files[0]
                  )
                }
              />

              {selectedExcelFile && (
                <div className="text-sm text-gray-600">

                  Selected File :

                  <strong>
                    {" "}
                    {selectedExcelFile.name}
                  </strong>

                </div>
              )}

              <div className="flex justify-between">

                <button
                  onClick={downloadTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Download Template
                </button>

                <div className="flex gap-2">

                  <button
                    onClick={() => {
                      setShowBulkUpload(false);
                      setSelectedExcelFile(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleReadExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Read Excel
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}  

      {/*---------------Preview Valid Rows------------------------------ */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white w-[95%] h-[92vh] rounded-lg shadow-lg flex flex-col">

            {/* Header */}

            <div className="border-b p-5 flex justify-between items-center">

              <h2 className="text-2xl font-bold">
                Bulk Upload Preview
              </h2>

              <button
                onClick={() => setShowPreview(false)}
                className="text-2xl font-bold"
              >
                ×
              </button>

            </div>

            {/* Summary */}

            <div className="grid grid-cols-3 gap-4 p-5 bg-slate-100">

              <div className="bg-white rounded p-4 shadow text-center">

                <h3 className="text-lg font-semibold">
                  Total Rows
                </h3>

                <p className="text-3xl font-bold">
                  {excelRows.length}
                </p>

              </div>

              <div className="bg-green-100 rounded p-4 shadow text-center">

                <h3 className="text-lg font-semibold">
                  Valid
                </h3>

                <p className="text-3xl font-bold text-green-700">
                  {validRows.length}
                </p>

              </div>

              <div className="bg-red-100 rounded p-4 shadow text-center">

                <h3 className="text-lg font-semibold">
                  Invalid
                </h3>

                <p className="text-3xl font-bold text-red-700">
                  {invalidRows.length}
                </p>

              </div>

            </div>

            {/* Body */}

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              {/* Invalid Rows */}

              {invalidRows.length > 0 && (

                <div>

                  <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Invalid Rows
                  </h2>

                  <div className="bg-red-50 border rounded">

                    <table className="w-full">

                      <thead>

                        <tr className="bg-red-100">

                          <th className="p-3 text-left">
                            Excel Row
                          </th>

                          <th className="p-3 text-left">
                            Errors
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {invalidRows.map((row) => (

                          <tr
                            key={row.rowNumber}
                            className="border-t"
                          >

                            <td className="p-3 font-semibold">
                              {row.rowNumber}
                            </td>

                            <td className="p-3">

                              <ul className="list-disc ml-5">

                                {row.errors.map((error, i) => (

                                  <li key={i}>
                                    {error}
                                  </li>

                                ))}

                              </ul>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}

              {/* Valid Questions */}

              <div>

                <h2 className="text-2xl font-bold text-green-700 mb-6">
                  Valid Questions
                </h2>

                {validRows.map((question, index) => (

                  <div
                    key={index}
                    className="bg-white rounded shadow border p-6 mb-6"
                  >

                    {/* Heading */}

                    <div className="flex justify-between items-center mb-4">

                      <h3 className="text-xl font-bold">
                        Question {index + 1}
                      </h3>

                      <span className="text-green-700 font-semibold">
                        VALID
                      </span>

                    </div>

                    {/* Subject Details */}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 text-sm">

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

                    {/* Question */}

                    <div className="mb-5">

                      <p className="font-semibold text-lg">

                        Q{index + 1}. {question.question}

                      </p>

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

                      <span className="font-semibold text-green-700">

                        Correct Answer :

                      </span>{" "}

                      {question.correctOption}

                    </div>

                    {/* Explanation */}

                    <div className="mt-4 bg-slate-50 border rounded p-4">

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

            </div>

            {/* Footer */}

            <div className="border-t p-4 flex justify-end gap-2">

              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleBulkImport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Import Valid Rows
              </button>

            </div>

          </div>

        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingQuestionId ? "Edit Question" : "Add Question"}
              </h2>

              <button
                onClick={() => {
                  setShowForm(false);
                }}
                className="text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
             
              <select
                className="border p-2 rounded"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subject: e.target.value
                  })
                }
              >
                  <option value="">
                    Select Subject
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
                placeholder="Topic"
                className="border p-2 rounded"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    topic: e.target.value
                  })
                }
              />

              <select
                className="border p-2 rounded"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value
                  })
                }
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            
            <textarea
              placeholder="Question Text"
              className="w-full border p-2 rounded mb-4"
              rows="4"
              value={formData.questionText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  questionText: e.target.value
                })
              }
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                placeholder="Option A"
                className="border p-2 rounded"
                value={formData.optionA}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionA: e.target.value
                  })
                }
              />

              <input
                placeholder="Option B"
                className="border p-2 rounded"
                value={formData.optionB}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionB: e.target.value
                  })
                }
              />

              <input
                placeholder="Option C"
                className="border p-2 rounded"
                value={formData.optionC}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionC: e.target.value
                  })
                }
              />

              <input
                placeholder="Option D"
                className="border p-2 rounded"
                value={formData.optionD}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionD: e.target.value
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <select
                className="border p-2 rounded"
                value={formData.correctOption}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    correctOption: e.target.value
                  })
                }
              >
                <option value="">
                  Select Correct Option
                </option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Marks
                </label>

                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={formData.marks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marks: Number(e.target.value)
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Negative Marks
                </label>

                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={formData.negativeMarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      negativeMarks: Number(e.target.value)
                    })
                  }
                />
              </div>
            </div>

            <textarea
              placeholder="Explanation"
              rows="3"
              className="w-full border p-2 rounded mb-4"
              value={formData.explanation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  explanation: e.target.value
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Reset
              </button>

              <button
                onClick={() => {
                  setShowForm(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/*-----------------View Individual Questions---------------- */}

      {showQuestionView && viewQuestion && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">

            {/* Header */}

            <div className="border-b p-5 flex justify-between items-center">

              <h2 className="text-2xl font-bold">

                Question Details

              </h2>

              <button
                onClick={() => setShowQuestionView(false)}
                className="text-2xl font-bold"
              >
                ×
              </button>

            </div>

            {/* Body */}

            <div className="p-6">

              {/* Basic Details */}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

                <div>
                  <strong>Question Code</strong>
                  <br />
                  {viewQuestion.questionCode}
                </div>

                <div>
                  <strong>Subject</strong>
                  <br />
                  {viewQuestion.subject}
                </div>

                <div>
                  <strong>Topic</strong>
                  <br />
                  {viewQuestion.topic}
                </div>

                <div>
                  <strong>Difficulty</strong>
                  <br />
                  {viewQuestion.difficulty}
                </div>

                <div>
                  <strong>Marks</strong>
                  <br />
                  {viewQuestion.marks}
                </div>

                <div>
                  <strong>Negative Marks</strong>
                  <br />
                  {viewQuestion.negativeMarks}
                </div>

              </div>

              {/* Question */}

              <div className="mb-6">

                <h3 className="font-bold text-lg mb-2">

                  Question

                </h3>

                <div className="border rounded p-4 bg-slate-50">

                  {viewQuestion.questionText}

                </div>

              </div>

              {/* Options */}

              <div className="space-y-3 mb-6">

                {viewQuestion.options.map((option) => (

                  <div
                    key={option.label}
                    className={`border rounded p-3 ${
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

              {/* Correct Answer */}

              <div className="mb-5">

                <strong className="text-green-700">

                  Correct Answer :

                </strong>{" "}

                {viewQuestion.correctOption}

              </div>

              {/* Explanation */}

              <div className="bg-blue-50 border rounded p-4">

                <strong>

                  Explanation

                </strong>

                <p className="mt-2">

                  {viewQuestion.explanation}

                </p>

              </div>

            </div>

            {/* Footer */}

            <div className="border-t p-4 flex justify-end">

              <button
                onClick={() => setShowQuestionView(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/*---------------------------------------------------------- */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-200">
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Topic</th>
              <th className="p-3 text-left">Difficulty</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {questions.map((question) => (
              <tr
                key={question._id}
                className="border-b"
              >
                <td className="p-3">
                  {question.questionCode}
                </td>

                <td className="p-3">
                  {question.subject}
                </td>

                <td className="p-3">
                  {question.topic}
                </td>

                <td className="p-3">
                  {question.difficulty}
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewQuestion(question)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleEdit(question)}
                      className=" w-20 bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(question._id)}
                      className=" w-20 bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default QuestionsPage;