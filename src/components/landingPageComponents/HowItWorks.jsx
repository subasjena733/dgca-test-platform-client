import {
  BookOpen,
  ClipboardCheck,
  MonitorCheck,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    icon: <BookOpen size={42} strokeWidth={2.2} />,
    title: "Choose a Subject",
    description: "Select the subject you want to practice.",
  },
  {
    icon: <ClipboardCheck size={42} strokeWidth={2.2} />,
    title: "Practice & Learn",
    description: "Solve questions and learn from detailed explanations.",
  },
  {
    icon: <MonitorCheck size={42} strokeWidth={2.2} />,
    title: "Take Mock Tests",
    description: "Attempt full-length mock tests in real exam conditions.",
  },
  {
    icon: <TrendingUp size={42} strokeWidth={2.2} />,
    title: "Analyse & Improve",
    description: "Review performance and improve your weak areas.",
  },
];

function HowItWorks() {
  return (
    <section className="py-5 bg-white lg:scale-80">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-slate-900">
          How It Works
        </h2>

        <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mt-5"></div>

        <div className="mt-20">

          <div className="grid lg:grid-cols-4 gap-12">

            {steps.map((step, index) => (
              <div key={index} className="relative text-center">

                <div className="w-24 h-24 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-md">
                  {step.icon}
                </div>

                <div className="mt-8">

                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm mb-4">
                    {index + 1}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-xl text-slate-600 leading-7 ">
                    {step.description}
                  </p>

                </div>

                {/* Arrow */}

                {index !== steps.length - 1 && (
                  <ChevronRight
                    size={32}
                    className="
                      hidden
                      lg:block
                      absolute
                      top-10
                      -right-8
                      text-slate-300
                    "
                  />
                )}

              </div>
            ))}

          </div>

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;