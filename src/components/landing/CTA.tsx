import OpenChatButton from "./OpenChatButton";

export default function CTA() {
  return (
    <section className="brand-bg px-5 py-16 text-center text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          UBT Student Assistant
        </p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
          &quot;Have a question? Ask, don&apos;t wait.&quot;
        </h2>
        <p className="mt-3 text-sm text-white/70">
          Available anytime - no need to wait for office hours to get a
          straight answer.
        </p>
        <div className="mt-7">
          <OpenChatButton className="rounded-md bg-white px-7 py-3 text-sm font-semibold text-[var(--navy)] transition-opacity hover:opacity-90">
            ASK THE ASSISTANT
          </OpenChatButton>
        </div>
      </div>
    </section>
  );
}
