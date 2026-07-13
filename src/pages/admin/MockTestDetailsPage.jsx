import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

function MockTestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mockTest, setMockTest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    durationMinutes: 0,
    isPremium: false
  });

  const fetchMockTest = async () => {
    try {
      const res = await api.get(`/mock-tests/${id}`);
      setMockTest(res.data);

      setEditForm({
        title: res.data.title,
        durationMinutes: res.data.durationMinutes,
        isPremium: res.data.isPremium
      });
    } catch (error) {
      console.error(error);
    }
  };

  const togglePublishStatus = async () => {
    try {
      await api.put(`/mock-tests/${id}`, {
        isPublished: !mockTest.isPublished
      });

      fetchMockTest();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this mock test?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/mock-tests/${id}`);
      navigate("/admin/mock-tests");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editForm.title.trim()) {
        alert("Title cannot be empty");
        return;
      }

      if (editForm.durationMinutes <= 0) {
        alert("Duration must be greater than 0");
        return;
      }

      await api.put(`/mock-tests/${id}`, editForm);

      setIsEditing(false);
      fetchMockTest();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMockTest();
  }, []);
  


  return (
    <AdminLayout>
      {!mockTest ? (
        <p>Loading...</p>
      ) : (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {mockTest.title}
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit
            </button>

            <button 
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>

            <button
              onClick={togglePublishStatus}
              className={`text-white px-4 py-2 rounded ${
                mockTest.isPublished
                  ? "bg-orange-500"
                  : "bg-green-600"
              }`}
            >
              {mockTest.isPublished
                ? "Unpublish"
                : "Publish"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-6 space-y-2">
          <p>
            <strong>Subject:</strong> {mockTest.subject}
          </p>

          <p>
            <strong>Duration:</strong>{" "}
            {mockTest.durationMinutes} mins
          </p>

          <p>
            <strong>Total Marks:</strong>{" "}
            {mockTest.totalMarks}
          </p>

          <p>
            <strong>Premium:</strong>{" "}
            {mockTest.isPremium ? "Yes" : "No"}
          </p>

          <p>
            <strong>Published:</strong>{" "}
            {mockTest.isPublished ? "Yes" : "No"}
          </p>

          <p>
            <strong>Question Count:</strong>{" "}
            {mockTest.questions.length}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Questions
          </h2>

          {/*Question section*/}
          {mockTest.questions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white rounded shadow p-6"
            >
              <p className="font-semibold mb-2">
                Q{index + 1}. {question.questionText}
              </p>

              <p className="text-sm text-gray-600 mb-3">
                Code: {question.questionCode}{" | "}Marks: {question.marks}{" | "}-ve Marks: {question.negativeMarks}
              </p>

              <div className="space-y-2">
                {question.options.map((option) => (
                  <div
                    key={option.label}
                    className="border rounded p-2"
                  >
                    <strong>{option.label}:</strong>{" "}
                    {option.text}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-green-600 font-semibold">
                Correct Answer: {question.correctOption}
              </p>
            </div>
          ))}
        </div>
      </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Edit Mock Test
              </h2>

              <button
                onClick={() => setIsEditing(false)}
                className="text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      title: e.target.value
                    })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={editForm.durationMinutes}
                  disabled
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      durationMinutes: e.target.value
                    })
                  }
                  className="w-full border p-2 rounded"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Duration cannot be changed after mock test creation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isPremium}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      isPremium: e.target.checked
                    })
                  }
                />
                <label>Premium Mock</label>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default MockTestDetailsPage;