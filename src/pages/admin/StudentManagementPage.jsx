import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import AsyncActionButton from "../../components/AsyncActionButton";
import api from "../../services/api";

const PAGE_SIZE = 25;

function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeStudent, setActiveStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await api.get("/admin/students", {
        params: {
          search,
          premium: premiumFilter === "all" ? undefined : premiumFilter,
          page,
          limit: PAGE_SIZE
        }
      });
      setStudents(response.data.students);
      setTotal(response.data.total);
      setPages(Math.max(response.data.pages, 1));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Could not load students.");
    } finally {
      setLoading(false);
    }
  }, [search, premiumFilter, page]);

  useEffect(() => {
    const timeout = setTimeout(fetchStudents, 250);
    return () => clearTimeout(timeout);
  }, [fetchStudents]);

  const viewStudent = async (student) => {
    setActiveStudent(student);
    setStudentDetails(null);
    setDetailsLoading(true);
    try {
      const response = await api.get(`/admin/students/${student._id}`);
      setStudentDetails(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Could not load student details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const updatePremium = async (student) => {
    const nextValue = !student.isPremium;
    const action = nextValue ? "grant" : "remove";
    if (!window.confirm(`Are you sure you want to ${action} premium access for ${student.name}?`)) return;

    try {
      const response = await api.patch(`/admin/students/${student._id}/premium`, { isPremium: nextValue });
      setStudents((current) => current.map((item) =>
        item._id === student._id ? { ...item, isPremium: response.data.student.isPremium } : item
      ));
      setActiveStudent((current) => current?._id === student._id
        ? { ...current, isPremium: response.data.student.isPremium }
        : current
      );
      setStudentDetails((current) => current?.student._id === student._id
        ? { ...current, student: { ...current.student, isPremium: response.data.student.isPremium } }
        : current
      );
      await fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Could not update premium access.");
    }
  };

  const formatTime = (seconds = 0) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="mt-1 text-gray-600">Search student accounts, view test history, and manage premium access.</p>
        </div>
        <div className="rounded bg-white px-4 py-2 shadow">
          <strong>{total}</strong> students
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded bg-white p-4 shadow sm:flex-row">
        <input
          aria-label="Search students by name or email"
          className="w-full rounded border px-3 py-2 sm:max-w-md"
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder="Search by name or email"
          type="search"
          value={search}
        />
        <select
          aria-label="Filter students by premium access"
          className="rounded border px-3 py-2 sm:w-48"
          onChange={(event) => { setPremiumFilter(event.target.value); setPage(1); }}
          value={premiumFilter}
        >
          <option value="all">All students</option>
          <option value="true">Premium</option>
          <option value="false">Standard</option>
        </select>
      </div>

      {errorMessage && <p className="mb-4 rounded bg-red-100 p-3 text-red-800" role="alert">{errorMessage}</p>}

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Registered</th>
              <th className="p-3 text-left">Access</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && students.map((student) => (
              <tr className="border-b" key={student._id}>
                <td className="p-3 font-medium">{student.name}</td>
                <td className="p-3">{student.email}</td>
                <td className="p-3">{new Date(student.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{student.isPremium ? "Premium" : "Standard"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={() => viewStudent(student)}>View</button>
                    <AsyncActionButton
                      className="rounded bg-indigo-700 px-3 py-1 text-white"
                      loadingText="Saving..."
                      onClick={() => updatePremium(student)}
                    >
                      {student.isPremium ? "Remove Premium" : "Grant Premium"}
                    </AsyncActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && students.length === 0 && (
              <tr><td className="p-8 text-center text-gray-500" colSpan={5}>No students match this search.</td></tr>
            )}
            {loading && <tr><td className="p-8 text-center text-gray-500" colSpan={5}>Loading students...</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">Page {page} of {pages}</p>
        <div className="flex gap-2">
          <button className="rounded bg-slate-700 px-4 py-2 text-white disabled:opacity-50" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <button className="rounded bg-slate-700 px-4 py-2 text-white disabled:opacity-50" disabled={page >= pages || loading} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </div>

      {activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6">
          <section aria-label="Student details" aria-modal="true" className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl" role="dialog">
            <header className="flex items-start justify-between border-b p-4 sm:p-6">
              <div>
                <h2 className="text-2xl font-bold">{activeStudent.name}</h2>
                <p className="text-gray-600">{activeStudent.email}</p>
              </div>
              <button aria-label="Close student details" className="rounded px-3 py-1 text-xl hover:bg-gray-100" onClick={() => setActiveStudent(null)}>×</button>
            </header>
            <div className="overflow-y-auto p-4 sm:p-6">
              {detailsLoading && <p>Loading student details...</p>}
              {studentDetails && (
                <>
                  <div className="mb-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded bg-slate-100 p-3"><strong>Registered</strong><br />{new Date(studentDetails.student.createdAt).toLocaleDateString()}</div>
                    <div className="rounded bg-slate-100 p-3"><strong>Access</strong><br />{studentDetails.student.isPremium ? "Premium" : "Standard"}</div>
                    <div className="rounded bg-slate-100 p-3"><strong>Submitted tests</strong><br />{studentDetails.attempts.length}{studentDetails.attempts.length === 50 ? "+ (latest 50 shown)" : ""}</div>
                  </div>
                  <h3 className="mb-3 text-lg font-bold">Recent Test Attempts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse text-sm">
                      <thead className="bg-slate-200"><tr>
                        <th className="p-2 text-left">Mock Test</th><th className="p-2">Date</th><th className="p-2">Score</th><th className="p-2">Correct / Wrong</th><th className="p-2">Accuracy</th><th className="p-2">Time</th><th className="p-2">Review</th>
                      </tr></thead>
                      <tbody>
                        {studentDetails.attempts.map((attempt) => (
                          <tr className="border-b" key={attempt._id}>
                            <td className="p-2">{attempt.mockTestTitle}</td>
                            <td className="p-2 text-center">{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "—"}</td>
                            <td className="p-2 text-center">{attempt.score} ({attempt.percentage}%)</td>
                            <td className="p-2 text-center">{attempt.correctCount} / {attempt.wrongCount}</td>
                            <td className="p-2 text-center">{attempt.accuracy}%</td>
                            <td className="p-2 text-center">{formatTime(attempt.totalTimeSpent)}</td>
                            <td className="p-2 text-center"><a className="text-blue-700 underline" href={`/admin/review/${attempt._id}`}>Open</a></td>
                          </tr>
                        ))}
                        {studentDetails.attempts.length === 0 && <tr><td className="p-5 text-center text-gray-500" colSpan={7}>No submitted tests yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <footer className="flex justify-between border-t p-4">
              {studentDetails && (
                <AsyncActionButton className="rounded bg-indigo-700 px-4 py-2 text-white" loadingText="Saving..." onClick={() => updatePremium(studentDetails.student)}>
                  {studentDetails.student.isPremium ? "Remove Premium" : "Grant Premium"}
                </AsyncActionButton>
              )}
              <button className="ml-auto rounded bg-slate-600 px-4 py-2 text-white" onClick={() => setActiveStudent(null)}>Close</button>
            </footer>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

export default StudentManagementPage;
