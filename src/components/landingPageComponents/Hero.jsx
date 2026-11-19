import { Link } from "react-router-dom";

function Hero() {
  return (
   <section className="relative h-[98vh] overflow-hidden">

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

  {/* Light Overlay */}

  <div className="absolute inset-0 bg-white/10 -z-10"></div>
      {/* Light Overlay */}

      <div className="absolute inset-0 bg-white/10"></div>

      {/* Hero Content */}

      <div className="relative z-10 min-h-screen flex items-start pt-36 lg:pt-40">

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 pb-32">

          <div className="max-w-3xl">

            {/* Tagline */}

            <h2 className=" text-2xl md:text-4xl lg:text-4xl font-bold leading-tight">

              <span className="text-slate-900">

                The Smart Aviation

              </span>

              <br />

              <span className="text-blue-600">

                Learning Platform

              </span>

            </h2>

            {/* Divider */}

            <div className="mt-4 w-28 h-1 bg-blue-600 rounded-full"></div>

            {/* Description */}

            <p className="mt-5 max-w-2xl text-xl md:text-2xl lg:text-2xl leading-9 black">

              Practice smarter with structured question banks,
              realistic mock tests and detailed performance analytics
              designed for aviation professionals.

            </p>

            {/* Button */}

            <Link
              to="/login"
              className="
                inline-flex
                items-center
                justify-center
                mt-8
                px-5
                py-2
                rounded-lg
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-lg
                font-semibold
                shadow-xl
                transition
              "
            >
              Login
            </Link>

          </div>

        </div>

      </div>

      {/* Bottom Fade */}

      <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-b from-transparent via-white/20 to-white"></div>

    </section>
  );
}

export default Hero;