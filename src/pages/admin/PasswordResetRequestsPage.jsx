import { useEffect, useState } from "react";
import api from "../../services/api";

function PasswordResetRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get(
        "/admin/password-reset-requests"
      );

      setRequests(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const resetPassword = async (id) => {

    const newPassword = prompt(
      "Enter Temporary Password"
    );

    if (!newPassword) return;

    try {

      await api.post(
        `/admin/reset-password/${id}`,
        {
          newPassword
        }
      );

      alert("Password reset successfully.");

      fetchRequests();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Error"
      );
    }
  };

  const rejectRequest = async (id) => {

    if (
      !window.confirm(
        "Reject this password reset request?"
      )
    )
      return;

    try {

      await api.delete(
        `/admin/password-reset-request/${id}`
      );

      fetchRequests();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Password Reset Requests
      </h1>

      <table className="w-full border">

        <thead className="bg-gray-200">

          <tr>
            <th className="border p-2">
              Name
            </th>

            <th className="border p-2">
              Email
            </th>

            <th className="border p-2">
              Requested On
            </th>

            <th className="border p-2">
              Action
            </th>
          </tr>

        </thead>

        <tbody>

          {requests.map((req) => (

            <tr key={req._id}>

              <td className="border p-2">
                {req.name}
              </td>

              <td className="border p-2">
                {req.email}
              </td>

              <td className="border p-2">
                {new Date(
                  req.createdAt
                ).toLocaleString()}
              </td>

              <td className="border p-2">

                <button
                  onClick={() =>
                    resetPassword(req._id)
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                >
                  Reset Password
                </button>

                <button
                  onClick={() =>
                    rejectRequest(req._id)
                  }
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default PasswordResetRequestsPage;