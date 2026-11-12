import Link from "next/link";
import Image from "next/image";

const SOCIAL = ["Facebook", "Instagram", "Twitter", "YouTube", "LinkedIn", "TikTok"];

export default function Footer() {
  return (
    <footer>
      {/* Real UBT public contact information, faithfully reproduced */}
      <div className="brand-bg px-5 py-12 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              UBT - Higher Education Institution
            </h3>
            <p className="text-xs leading-relaxed text-white/70">
              Lagjja Kalabria, 10000 Prishtine, Kosovo
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s}
                  href="https://www.ubt-uni.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s}
                  title={s}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 text-[10px] font-semibold text-white/80 hover:border-white hover:text-white"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          <div className="text-xs">
            <h3 className="mb-3 text-sm font-semibold">&nbsp;</h3>
            <a
              href="https://www.ubt-uni.net/en/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-0.5 text-white/70 hover:text-white"
            >
              Kontakti
            </a>
            <a
              href="https://www.ubt-uni.net"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-0.5 text-white/70 hover:text-white"
            >
              Campus map
            </a>
            <Link href="/knowledge" className="block py-0.5 text-white/70 hover:text-white">
              Admin: Knowledge base
            </Link>
          </div>

          <div className="text-xs">
            <h3 className="mb-3 text-sm font-semibold">Zyra e Administratës</h3>
            <a href="mailto:info@ubt-uni.net" className="block py-0.5 text-white/70 hover:text-white">
              info@ubt-uni.net
            </a>
            <a href="tel:+38338541400" className="block py-0.5 text-white/70 hover:text-white">
              +383 38 541 400
            </a>
            <a href="tel:+38338542138" className="block py-0.5 text-white/70 hover:text-white">
              +383 38 542 138
            </a>
          </div>

          <div className="text-xs">
            <h3 className="mb-3 text-sm font-semibold">
              Zyra e Marketingut dhe Rekrutimit
            </h3>
            <a href="mailto:marketing@ubt-uni.net" className="block py-0.5 text-white/70 hover:text-white">
              marketing@ubt-uni.net
            </a>
            <a href="tel:+38345111216" className="block py-0.5 text-white/70 hover:text-white">
              +383 45 111 216
            </a>
            <a href="tel:+38345111217" className="block py-0.5 text-white/70 hover:text-white">
              +383 45 111 217
            </a>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-6xl items-center justify-between border-t border-white/15 pt-4 text-xs text-white/60">
          <a
            href="https://www.ubt-uni.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            Legal Disclaimer
          </a>
          <span>© {new Date().getFullYear()} UBT</span>
        </div>
      </div>

      {/* Our own disclosure, kept visually separate from UBT's real footer above */}
      <div className="brand-bg-darker px-5 py-4 text-center text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 text-[11px] leading-relaxed text-white/60 sm:flex-row sm:gap-2">
          <Image src="/ubt-logo.png" alt="" width={16} height={16} />
          <span>
            This page is an unofficial Bachelor&apos;s thesis demo. It is not
            affiliated with, operated by, or endorsed by UBT. For official
            information, always use{" "}
            <a
              href="https://www.ubt-uni.net"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              ubt-uni.net
            </a>{" "}
            or contact the Students Office directly.
          </span>
        </div>
      </div>
    </footer>
  );
}
