import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaChartLine,
  FaUser,
  FaClipboardList,
  FaBullseye,
  FaStar,
  FaQuestionCircle
} from "react-icons/fa";
import api from "../../services/api";

function StudentDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [summary, setSummary] = useState({
    availableTests: 0,
    totalTests: 0,
    averageAccuracy: 0,
    bestPercentage: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/dashboard/summary");

      setSummary(res.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Logout */}

      <div className="flex justify-end mb-6">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Welcome Banner */}

      <div className="bg-linear-to-r from-blue-700 to-indigo-700 rounded-2xl shadow-lg text-white p-5 sm:p-8 mb-6 sm:mb-8">

        <h1 className="text-2xl sm:text-4xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="mt-2 text-base sm:text-lg text-blue-100">
          Every mock test brings you one step closer to your dream airline.
        </p>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 sm:p-6">
          <FaBookOpen className="text-blue-600 text-3xl mb-3" />

          <p className="text-gray-500">
            Available Tests
          </p>

          <h2 className="text-3xl font-bold">
            {loading ? "--" : summary.availableTests}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 sm:p-6">
          <FaClipboardList className="text-green-600 text-3xl mb-3" />

          <p className="text-gray-500">
            Tests Attempted
          </p>

          <h2 className="text-3xl font-bold">
            {loading ? "--" : summary.totalTests}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 sm:p-6">
          <FaBullseye className="text-red-500 text-3xl mb-3" />

          <p className="text-gray-500">
            Average Accuracy
          </p>

          <h2 className="text-3xl font-bold">
            {loading ? "--" : `${summary.averageAccuracy}%`}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 sm:p-6">
          <FaStar className="text-yellow-500 text-3xl mb-3" />

          <p className="text-gray-500">
            Highest Score
          </p>

          <h2 className="text-3xl font-bold">
            {loading ? "--" : `${summary.bestPercentage}%`}
          </h2>
        </div>

      </div>

      {/* Quick Actions */}

      <h2 className="text-2xl font-bold mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Mock Tests */}

        <div
          onClick={() => navigate("/student/mock-tests")}
          className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-5 sm:p-8"
        >
          <FaBookOpen className="text-blue-600 text-5xl mb-4" />

          <h3 className="text-2xl font-bold mb-2">
            Mock Tests
          </h3>

          <p className="text-gray-600">
            Attempt available mock tests.
          </p>

        </div>

        {/* Performance */}

        <div
          onClick={() => navigate("/student/performance")}
          className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-5 sm:p-8"
        >
          <FaChartLine className="text-purple-600 text-5xl mb-4" />

          <h3 className="text-2xl font-bold mb-2">
            Performance
          </h3>

          <p className="text-gray-600">
            View detailed performance analytics.
          </p>

        </div>

        {/* My Profile */}

        <div
          onClick={() => navigate("/student/profile")}
          className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-5 sm:p-8"
        >
          <FaUser className="text-slate-700 text-5xl mb-4" />

          <h3 className="text-2xl font-bold mb-2">
            My Profile
          </h3>

          <p className="text-gray-600">
            View profile and change password.
          </p>

        </div>

        {/* Help */}

        <div
          onClick={() => alert("Help & Support coming soon!")}
          className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-5 sm:p-8"
        >
          <FaQuestionCircle className="text-orange-500 text-5xl mb-4" />

          <h3 className="text-2xl font-bold mb-2">
            Help & Support
          </h3>

          <p className="text-gray-600">
            FAQs, user guide and contact support.
          </p>

        </div>

      </div>

      {/* Recent Activity */}

      <div className="mt-8 sm:mt-10 bg-white rounded-xl shadow p-5 sm:p-6">

        <h2 className="text-2xl font-bold mb-4">
          Recent Activity
        </h2>

        <div className="text-gray-600">

          <p>
            No recent activity available.
          </p>

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;
