import { Link, useNavigate } from "react-router-dom";

function StudentNavbar() {
  const navigate = useNavigate();

  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      navigate("/student");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-700 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-3 px-4 sm:px-6 h-16">

        <h1 className="text-base sm:text-xl font-bold truncate">
          DGCA Test Platform
        </h1>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={goBack}
            className="bg-blue-800 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-900 transition"
          >
            Back
          </button>
          <Link
            to="/student"
            className="bg-white text-blue-700 px-3 sm:px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            Home
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default StudentNavbar;
