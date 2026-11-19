function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">

      <div className="max-w-7xl mx-auto px-8">

        <div className="grid lg:grid-cols-3 gap-12">

          <div>

            <div className="flex items-center gap-4">

              <img
                src="/images/logo1.jpeg"
                alt="SkyPrep"
                className="h-16"
              />

              <h2 className="text-4xl font-bold">

                <span className="text-white">

                  Sky

                </span>

                <span className="text-blue-400">

                  Prep

                </span>

              </h2>

            </div>

            <p className="mt-6 text-slate-300">

              The Smart Aviation Learning Platform

            </p>

          </div>

          <div>

            <h3 className="text-2xl font-bold">

              About SkyPrep

            </h3>

            <p className="mt-5 text-xl text-slate-300 leading-8">

              SkyPrep is designed to help aviation aspirants
              prepare effectively for DGCA examinations with
              structured learning, practice questions and
              performance analytics.

            </p>

          </div>

          <div>

            <h3 className="text-2xl font-bold">

              Quick Links

            </h3>

            <ul className="mt-5 text-xl space-y-3 text-slate-300">

              <li>Features</li>
              <li>Subjects</li>
              <li>Mock Tests</li>
              <li>Question Bank</li>

            </ul>

          </div>

        </div>

        <div className="border-t border-slate-700 mt-14 pt-8 text-center text-slate-400">

          © 2026 SkyPrep. All Rights Reserved.

        </div>

      </div>

    </footer>
  );
}

export default Footer;