import { Link, useNavigate } from "react-router-dom";

function AdminLayout({ children }) {
  const navigate = useNavigate();

  //Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">
          Admin Panel
        </h1>

        <nav className="space-y-4">
          <Link
            to="/admin"
            className="block hover:text-blue-400"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/subjects"
            className="block hover:text-blue-400"
          >
            Subject Management
          </Link>

          <Link
            to="/admin/students"
            className="block hover:text-blue-400"
          >
            Student Management
          </Link>

          <Link
            to="/admin/questions"
            className="block hover:text-blue-400"
          >
            Questions
          </Link>

          <Link 
          to="/admin/question-bank"
          className="block hover:text-blue-400"
          >
            Question Bank
          </Link>

          <Link
            to="/admin/mock-tests"
            className="block hover:text-blue-400"
          >
            Mock Tests
          </Link>

          <Link
            to="/admin/leaderboards"
            className="block hover:text-blue-400"
          >
            Leaderboards
          </Link>

          <Link
            to="/admin/pending-registrations"
            className="block hover:text-blue-400"
          >
            Pending Registrations
          </Link>

          <Link
            to="/admin/password-reset-requests"
            className="block hover:text-blue-400"
          >
            Password Reset Requests
          </Link>

          <div className="mt-10">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
          
        </nav>
      </aside>

      <main className="flex-1 bg-slate-100 p-8">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
