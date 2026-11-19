import { Link } from "react-router-dom";

function AuthBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Desktop */}
      <div
        className="hidden xl:block absolute inset-0 bg-cover bg-bottom bg-no-repeat -z-20"
        style={{
          backgroundImage: "url('/images/hero-desktop.jpeg')",
        }}
      />

      {/* Tablet */}
      <div
        className="hidden md:block xl:hidden absolute inset-0 bg-cover bg-center bg-no-repeat -z-20"
        style={{
          backgroundImage: "url('/images/hero-tablet.jpeg')",
        }}
      />

      {/* Mobile */}
      <div
        className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat -z-20"
        style={{
          backgroundImage: "url('/images/hero-mobile.jpeg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10 -z-10"></div>

      <Link
        to="/"
        className="absolute left-4 top-4 z-20 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-md transition hover:bg-white sm:left-6 sm:top-6"
      >
        Home
      </Link>

      {/* Page Content */}
      <div className="relative min-h-screen flex items-center justify-center">
        {children}
      </div>

    </div>
  );
}

export default AuthBackground;
