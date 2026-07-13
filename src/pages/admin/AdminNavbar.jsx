import { Link } from "react-router-dom";

function AdminNavbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-900 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">

        <h1 className="text-xl font-bold">
          DGCA Test Platform-Admin
        </h1>

        <Link
          to="/admin"
          className="bg-white text-slate-900 px-4 py-2 rounded hover:bg-gray-200 transition"
        >
          Home
        </Link>

      </div>
    </nav>
  );
}

export default AdminNavbar;