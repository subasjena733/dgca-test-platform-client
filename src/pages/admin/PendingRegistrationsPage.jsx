import { useEffect, useState } from "react";
import api from "../../services/api";
import AsyncActionButton from "../../components/AsyncActionButton";

function PendingRegistrationsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get(
        "/admin/pending-registrations"
      );

     // console.log("Pending Requests", res.data);

      setRequests(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const approveRequest = async (id) => {
    const confirmApprove = window.confirm(
      "Are you sure you want to approve this registration?"
    );

    if (!confirmApprove) return;

    try {
      await api.post(`/admin/approve-registration/${id}`);

      alert("Registration approved successfully.");

      await fetchRequests();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to approve registration."
      );
    }
  };

  const rejectRequest = async (id) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this registration?"
    );

    if (!confirmReject) return;

    try {
      await api.delete(`/admin/reject-registration/${id}`);

      alert("Registration rejected successfully.");

      await fetchRequests();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to reject registration."
      );
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Pending Registrations
      </h1>

      <table className="w-full border">

        <thead className="bg-gray-200">

          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Requested On</th>
            <th className="border p-2">Action</th>
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
                {new Date(req.createdAt).toLocaleString()}
              </td>

              <td className="border p-2">

                <AsyncActionButton
                  onClick={() =>
                    approveRequest(req._id)
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  loadingText="Approving..."
                >
                  Approve
                </AsyncActionButton>

                <AsyncActionButton
                  onClick={() =>
                    rejectRequest(req._id)
                  }
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  loadingText="Rejecting..."
                >
                  Reject
                </AsyncActionButton>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default PendingRegistrationsPage;
