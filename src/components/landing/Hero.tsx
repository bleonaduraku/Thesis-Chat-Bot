import Image from "next/image";
import OpenChatButton from "./OpenChatButton";

export default function Hero() {
  return (
    <section className="relative flex h-[420px] items-center justify-center overflow-hidden text-center sm:h-[520px]">
      <Image
        src="https://images.unsplash.com/photo-1744411417299-7a4d1280d1d5?w=1920&q=75&auto=format&fit=crop"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="brand-bg-darker absolute inset-0 opacity-70" />

      <div className="relative z-10 mx-auto max-w-2xl px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          UBT · University for Business and Technology
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl">
          Student services, answered instantly.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
          Ask about regulations, office hours, transcripts, registration, or
          tuition fees, grounded in UBT&apos;s actual student policies.
        </p>
        <div className="mt-8">
          <OpenChatButton className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[var(--navy)] transition-opacity hover:opacity-90">
            Ask the Assistant
          </OpenChatButton>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 6l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
