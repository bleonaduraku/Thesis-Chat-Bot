import OpenChatButton from "./OpenChatButton";

const TOPICS = [
  {
    icon: "📋",
    color: "brand-bg",
    title: "Regulations & Policies",
    description:
      "Student assessment, complaints, anti-plagiarism, program transfers, and student rights - straight from UBT's official regulations.",
    questions: [
      "What's the policy on transferring between study programs?",
      "What happens if I'm caught plagiarizing?",
    ],
  },
  {
    icon: "🏢",
    color: "green-bg",
    title: "Student Services & Office Hours",
    description:
      "Enrollment, study contracts, exam schedules, transcripts, and academic file requests through the Students Office.",
    questions: [
      "What are the office hours for the Students Office?",
      "How do I request a transcript?",
    ],
  },
  {
    icon: "💳",
    color: "purple-bg",
    title: "Registration & Fees",
    description:
      "How tuition works, available discounts, and how to apply online through UBT's application portal.",
    questions: ["Are there discounts on tuition fees?"],
  },
];

export default function HelpTopics() {
  return (
    <section id="help-topics" className="mx-auto max-w-6xl px-5 py-20">
      <div className="mx-auto mb-14 max-w-xl text-center">
        <h2 className="text-3xl font-bold text-[var(--navy)] sm:text-4xl">
          What the assistant can help with
        </h2>
        <p className="mt-3 text-muted">
          Grounded in real UBT student-services documentation. Tap a question
          to try it.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {TOPICS.map((t) => (
          <div
            key={t.title}
            className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"
          >
            <div className={`${t.color} flex items-center gap-2 px-5 py-3.5 text-white`}>
              <span className="text-xl">{t.icon}</span>
              <h3 className="font-semibold">{t.title}</h3>
            </div>
            <div className="p-5">
              <p className="mb-4 text-sm leading-relaxed text-muted">
                {t.description}
              </p>
              <div className="space-y-2">
                {t.questions.map((q) => (
                  <OpenChatButton
                    key={q}
                    prefill={q}
                    className="block w-full rounded-md border border-border bg-muted-bg px-3 py-2 text-left text-xs text-[var(--navy)]/80 transition-colors hover:border-[var(--navy)]/30 hover:bg-white"
                  >
                    &quot;{q}&quot;
                  </OpenChatButton>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
