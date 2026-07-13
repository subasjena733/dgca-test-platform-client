import {
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Target,
} from "lucide-react";

const features = [
  {
    icon: <BookOpen size={42} strokeWidth={2.2} />,
    title: "Extensive Question Bank",
    description:
      "Access thousands of DGCA CPL subject questions organised topic-wise.",
  },
  {
    icon: <ClipboardCheck size={42} strokeWidth={2.2} />,
    title: "Mock Tests",
    description:
      "Experience real exam simulation with full-length mock tests.",
  },
  {
    icon: <BarChart3 size={42} strokeWidth={2.2} />,
    title: "Performance Analytics",
    description:
      "Analyse your progress using detailed reports and performance tracking.",
  },
  {
    icon: <Target size={42} strokeWidth={2.2} />,
    title: "Focused Preparation",
    description:
      "Identify weak areas and improve through targeted practice.",
  },
];

function Features() {
  return (
    <section className="relative -mt-24 z-20 flex justify-center px-6">

      <div className="w-full max-w-7xl">

        <div
          className="
            bg-white
            rounded-[32px]
            shadow-2xl
            border
            border-slate-200
            overflow-hidden
          "
        >

          <div className="grid md:grid-cols-2 xl:grid-cols-4">

            {features.map((item, index) => (
              <div
                key={index}
                className="
                  p-10
                  flex
                  gap-5
                  items-start
                  border-b
                  md:border-b-0
                  xl:border-r
                  last:border-r-0
                  border-slate-200
                "
              >
                <div className="text-blue-600 flex-shrink-0">
                  {item.icon}
                </div>

                <div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-slate-600 leading-7">
                    {item.description}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </section>
  );
}

export default Features;