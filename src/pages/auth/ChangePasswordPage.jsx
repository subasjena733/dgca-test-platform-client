import { useState } from "react";
import api from "../../services/api";
import StudentNavbar from "../student/StudentNavbar"

function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      return alert("Enter current password.");
    }

    if (!formData.newPassword) {
      return alert("Enter new password.");
    }

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      return alert("Passwords do not match.");
    }

    try {
      const res = await api.put(
        "/auth/change-password",
        {
          currentPassword:
            formData.currentPassword,
          newPassword: formData.newPassword
        }
      );

      alert(res.data.message);

      resetForm();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to change password."
      );
    }
  };

  return (
    <>
    <StudentNavbar/>
    <div className="max-w-md mx-auto mt-10 bg-white shadow rounded p-6 pt-20">

      <h1 className="text-2xl font-bold mb-6">
        Change Password
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          className="w-full border rounded p-2"
          value={formData.currentPassword}
          onChange={handleChange}
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          className="w-full border rounded p-2"
          value={formData.newPassword}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          className="w-full border rounded p-2"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Change Password
        </button>

      </form>

    </div>
    </>
  );
}

export default ChangePasswordPage;