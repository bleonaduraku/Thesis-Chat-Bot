export default function About() {
  return (
    <section id="about" className="px-5 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--navy-light)]">
          About UBT
        </span>
        <h2 className="mt-3 text-3xl font-bold text-[var(--navy)] sm:text-4xl">
          A leading private university in Kosovo.
        </h2>
        <p className="mt-5 leading-relaxed text-muted">
          UBT - University for Business and Technology - was founded in 2001
          and is headquartered in Prishtina, with additional campuses in
          Lipjan, Prizren, Gjilan, Ferizaj, and Peja. The university is
          organized into nine academic institutes, spanning engineering,
          computer science, business, architecture, media, and health
          sciences. Its Innovation Campus houses more than 40 laboratories
          and the largest library in Kosovo.
        </p>

        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-left text-xs leading-relaxed text-amber-900">
          <strong>Note:</strong> this site is an unofficial student-services
          assistant built as a Bachelor&apos;s thesis demo. It is not
          affiliated with, operated by, or endorsed by UBT. For official
          information, always use{" "}
          <a
            href="https://www.ubt-uni.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            ubt-uni.net
          </a>{" "}
          or contact the Students Office directly.
        </div>
      </div>
    </section>
  );
}
