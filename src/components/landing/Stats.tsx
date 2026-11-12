const STATS = [
  {
    icon: (
      <path
        d="M12 2l2.4 5.2L20 8l-4 4 1 5.8L12 15l-5 2.8L8 12 4 8l5.6-.8L12 2z"
        fill="currentColor"
      />
    ),
    value: "#1",
    label: "University Brand and Reputation in the World",
  },
  {
    icon: (
      <path
        d="M8 12l3 3 6-6M6 8l3-3 3 3M15 8l3-3M4 12v6a2 2 0 002 2h3M20 12v6a2 2 0 01-2 2h-3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    value: "500+",
    label: "International Partnerships",
  },
  {
    icon: (
      <path
        d="M12 3L2 8l10 5 8-4.2V15M6 10.6V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    value: "10000+",
    label: "Alumni",
  },
];

export default function Stats() {
  return (
    <section className="bg-muted-bg">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-5 py-12 sm:grid-cols-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="brand-bg flex flex-col items-center gap-2 rounded-lg px-6 py-8 text-center text-white"
          >
            <svg width="34" height="34" viewBox="0 0 24 24">
              {s.icon}
            </svg>
            <div className="text-2xl font-bold sm:text-3xl">{s.value}</div>
            <div className="text-xs text-white/70 sm:text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
