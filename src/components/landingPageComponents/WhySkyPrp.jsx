import {
  ShieldCheck,
  GraduationCap,
  BrainCircuit,
  Clock3,
} from "lucide-react";

const items = [
  {
    icon: <GraduationCap size={46} />,
    title: "Aviation Focused",
    description:
      "Designed exclusively for DGCA CPL aspirants and aviation professionals.",
  },
  {
    icon: <BrainCircuit size={46} />,
    title: "Smart Learning",
    description:
      "Learn from explanations, identify weak areas and improve continuously.",
  },
  {
    icon: <Clock3 size={46} />,
    title: "Save Time",
    description:
      "Practice topic-wise or attempt mock tests anytime from anywhere.",
  },
  {
    icon: <ShieldCheck size={46} />,
    title: "Reliable Platform",
    description:
      "Simple, fast and secure platform built for serious exam preparation.",
  },
];

function WhySkyPrep() {
  return (
    <section className="bg-slate-50 py-28">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-slate-900">
          Why Choose SkyPrep?
        </h2>

        <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mt-5"></div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mt-20">

          {items.map((item, index) => (

            <div
              key={index}
              className="
                bg-white
                rounded-3xl
                p-10
                shadow-lg
                hover:shadow-2xl
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >

              <div className="text-blue-600">

                {item.icon}

              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">

                {item.title}

              </h3>

              <p className="mt-5 leading-8 text-slate-600">

                {item.description}

              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default WhySkyPrep;