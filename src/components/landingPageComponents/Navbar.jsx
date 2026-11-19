import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="absolute top-0 left-0 w-full z-50">

      <div className="max-w-7xl mx-auto px-2 lg:px-10 py-6">

        <div className="flex items-start justify-between">

          {/* Logo Section */}

          <div className=" lg:scale-80">

            <div className="flex items-end gap-2">

              <img
                src="/images/logo.png"
                alt="SkyPrep"
                className="h-16 lg:h-20 w-auto"
                draggable={false}
              />

              <h1 className="text-3xl lg:text-5xl font-extrabold leading-none">

                <span className="text-slate-900">

                  Sky

                </span>

                <span className="text-blue-600">

                  Prep

                </span>

              </h1>

            </div>

            <p className="mt-2 text-sm lg:text-xl font-medium text-slate-700">

              The Smart Aviation Learning Platform

            </p>

          </div>

          {/* Login */}

          <Link
            to="/login"
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-4
              py-2
              rounded-lg
              shadow-lg
              transition
            "
          >
            Login
          </Link>

        </div>

      </div>

    </header>
  );
}

export default Navbar;