import { Link } from "react-router-dom";

function StudentNavbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-700 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">

        <h1 className="text-xl font-bold">
          DGCA Test Platform
        </h1>

        <Link
          to="/student"
          className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-gray-200 transition"
        >
          Home
        </Link>

      </div>
    </nav>
  );
}

export default StudentNavbar;