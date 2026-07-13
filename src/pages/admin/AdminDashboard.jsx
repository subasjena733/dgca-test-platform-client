import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(
        "/admin/analytics"
      );

      setAnalytics(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!analytics) {
    return (
      <AdminLayout>
        <h1>Loading...</h1>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2>Total Students</h2>
          <p className="text-3xl font-bold">
            {analytics.totalStudents}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2>Premium Students</h2>
          <p className="text-3xl font-bold">
            {analytics.premiumStudents}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2>Total Mocks</h2>
          <p className="text-3xl font-bold">
            {analytics.totalMocks}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2>Total Attempts</h2>
          <p className="text-3xl font-bold">
            {analytics.totalAttempts}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2>Avg Percentage</h2>
          <p className="text-3xl font-bold">
            {analytics.averagePercentage}%
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2>Avg Accuracy</h2>
          <p className="text-3xl font-bold">
            {analytics.averageAccuracy}%
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;