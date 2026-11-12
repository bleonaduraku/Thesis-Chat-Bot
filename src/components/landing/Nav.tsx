import Link from "next/link";
import Image from "next/image";
import OpenChatButton from "./OpenChatButton";

const NAV_LINKS = [
  { href: "https://www.ubt-uni.net/en/home/", label: "UBT" },
  { href: "https://www.ubt-uni.net/en/study/", label: "Studimi" },
  { href: "#help-topics", label: "Shërbime" },
  { href: "#about", label: "Rreth UBT" },
];

const E_SERVICES = [
  { href: "https://outlook.office.com/mail/", label: "Mail" },
  { href: "https://smis.ubt-uni.net/my/loginform.aspx", label: "SMIS" },
  { href: "https://moodle.ubt-uni.net/", label: "Moodle" },
  { href: "https://knowledgecenter.ubt-uni.net/", label: "Knowledge Center" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Dark utility bar, matching the real site's "Viti akademik / APLIKO TANI" strip */}
      <div className="brand-bg-darker text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2 text-xs sm:text-sm">
          <span className="text-white/80">
            Unofficial thesis demo - not an official UBT service
          </span>
          <OpenChatButton className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[var(--navy)] transition-opacity hover:opacity-90 sm:text-sm">
            Ask the Assistant
          </OpenChatButton>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/ubt-logo.png" alt="UBT" width={40} height={40} />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-wide text-[var(--navy)] md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="hover:text-[var(--navy-light)]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-sm text-[var(--navy)]">
            <div className="group relative hidden sm:block">
              <button className="flex items-center gap-1 font-medium">
                E-Shërbimet
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1 3l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="invisible absolute right-0 top-full z-10 mt-2 w-44 rounded-md border border-border bg-white py-1 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
                {E_SERVICES.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-1.5 text-xs hover:bg-muted-bg"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <span className="hidden text-xs font-semibold sm:inline">EN</span>
          </div>
        </div>
      </div>
    </header>
  );
}
