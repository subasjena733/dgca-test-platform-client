import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import AsyncActionButton from "../../components/AsyncActionButton";
import api from "../../services/api";

function SubjectManagementPage() {

  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState({
    subjectName: "",
    subjectPrefix: ""
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {

    try {

      const res = await api.get("/subjects");

      setSubjects(res.data);

    } catch (error) {

      console.error(error);

    }

  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async () => {

    if (
      !formData.subjectName.trim() ||
      !formData.subjectPrefix.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {

      const res = await api.post(
        "/subjects",
        formData
      );

      alert(res.data.message);

      setFormData({
        subjectName: "",
        subjectPrefix: ""
      });

      await fetchSubjects();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to create subject."
      );

    }

  };

  return (

    <AdminLayout>

      <h1 className="text-3xl font-bold mb-6">
        Subject Management
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Add New Subject
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            name="subjectName"
            placeholder="Subject Name"
            value={formData.subjectName}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />

          <input
            type="text"
            name="subjectPrefix"
            placeholder="Subject Prefix"
            value={formData.subjectPrefix}
            onChange={handleChange}
            className="border rounded px-3 py-2 uppercase"
          />

        </div>

        <AsyncActionButton
          onClick={handleSubmit}
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
          loadingText="Adding subject..."
        >
          Add Subject
        </AsyncActionButton>

      </div>

      <div className="bg-white rounded-lg shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Available Subjects
        </h2>

        <table className="w-full border-collapse">

          <thead>

            <tr className="bg-slate-200">

              <th className="p-3 text-left">
                Subject
              </th>

              <th className="p-3 text-left">
                Prefix
              </th>

              <th className="p-3 text-left">
                Question Counter
              </th>

            </tr>

          </thead>

          <tbody>

            {subjects.map((subject) => (

              <tr
                key={subject._id}
                className="border-b"
              >

                <td className="p-3">
                  {subject.subjectName}
                </td>

                <td className="p-3">
                  {subject.subjectPrefix}
                </td>

                <td className="p-3">
                  {subject.questionCounter}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </AdminLayout>

  );

}

export default SubjectManagementPage;
