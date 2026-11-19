import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import StudentNavbar from "./StudentNavbar";

function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");

      setProfile(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <>
    <StudentNavbar/>
    <div className="max-w-3xl mx-auto p-4 sm:p-8 pt-20">

      <div className="bg-white shadow rounded-xl p-5 sm:p-8">

        <h1 className="text-2xl sm:text-3xl font-bold mb-8">
          My Profile
        </h1>

        <div className="space-y-4">

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-2">
            <span className="font-semibold">
              Name
            </span>

            <span>{profile.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-2">
            <span className="font-semibold">
              Email
            </span>

            <span className="break-all sm:text-right">{profile.email}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-2">
            <span className="font-semibold">
              Role
            </span>

            <span className="capitalize">
              {profile.role}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-2">
            <span className="font-semibold">
              Premium
            </span>

            <span>
              {profile.isPremium ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-2">
            <span className="font-semibold">
              Registered On
            </span>

            <span>
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>

        </div>

        <div className="mt-8">

          <button
            onClick={() =>
              navigate("/student/change-password")
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
          >
            Change Password
          </button>

        </div>

      </div>

    </div>
    </>
  );
}

export default StudentProfilePage;
