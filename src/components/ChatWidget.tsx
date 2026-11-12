"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Assistant replies are Markdown (bold, lists, tables, links). Raw HTML in
// the model output is not rendered (react-markdown's default), so this is
// safe to use on untrusted text.
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  h1: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
  h2: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
  h3: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words text-[var(--navy)] underline"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted-bg px-1 py-0.5 text-[12px]">{children}</code>
  ),
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-[12px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted-bg px-2 py-1 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-2 py-1 align-top">{children}</td>
  ),
  hr: () => <hr className="my-2 border-border" />,
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

const STORAGE_KEY = "ubt-assistant.conversationId";
const GREETING_DISMISSED_KEY = "ubt-assistant.greetingDismissed";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Plain ref, not state: it's an internal guard, never rendered, so
  // flipping it shouldn't itself trigger a re-render from inside an effect.
  const hasInitializedRef = useRef(false);

  // Lazily create/reload the conversation only the first time the widget is
  // opened, rather than on every page load - visitors who never open it
  // shouldn't leave behind an empty conversation row.
  useEffect(() => {
    if (!isOpen || hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    setIsLoadingHistory(true);

    let cancelled = false;
    (async () => {
      const existingId =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;

      try {
        if (existingId) {
          const res = await fetch(`/api/conversations/${existingId}`);
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              setConversationId(existingId);
              setMessages(
                data.conversation.messages.map(
                  (m: { id: string; role: string; content: string }) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                  })
                )
              );
            }
            return;
          }
          window.localStorage.removeItem(STORAGE_KEY);
        }

        const createRes = await fetch("/api/conversations", { method: "POST" });
        const created = await createRes.json();
        if (!cancelled) {
          setConversationId(created.conversation.id);
          window.localStorage.setItem(STORAGE_KEY, created.conversation.id);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Couldn't connect. Please try again.");
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Proactively invite visitors to chat: show a speech-bubble callout a
  // couple seconds after the page loads, unless they've already dismissed
  // it before (persisted across visits) or opened the widget.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(GREETING_DISMISSED_KEY)) return;
    const timer = setTimeout(() => setShowGreeting(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  function dismissGreeting() {
    setShowGreeting(false);
    window.localStorage.setItem(GREETING_DISMISSED_KEY, "1");
  }

  function openFromGreeting() {
    dismissGreeting();
    setIsOpen(true);
  }

  // Lets CTA buttons elsewhere on the page (e.g. Hero's "Ask the assistant",
  // or a suggested-question chip) open the widget - and optionally pre-fill
  // the input - without prop-drilling, since they live outside this
  // component's tree; the widget is mounted once in the root layout.
  useEffect(() => {
    const openWidget = (e: Event) => {
      setIsOpen(true);
      setShowGreeting(false);
      window.localStorage.setItem(GREETING_DISMISSED_KEY, "1");
      const prefill = (e as CustomEvent<{ prefill?: string }>).detail?.prefill;
      if (prefill) setInput(prefill);
    };
    window.addEventListener("open-chat-widget", openWidget);
    return () => window.removeEventListener("open-chat-widget", openWidget);
  }, []);

  async function sendMessage() {
    const text = input.trim();
    if (!text || !conversationId || isSending) return;

    setError(null);
    setInput("");
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: text,
    };
    const assistantId = `local-assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content || "[Couldn't get a response]" }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-xl border border-border bg-white shadow-2xl sm:right-6">
          <div className="brand-bg flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Image src="/ubt-logo.png" alt="" width={22} height={22} />
              <span className="text-sm font-semibold text-white">
                UBT Student Assistant
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 3L13 13M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted-bg px-4 py-3">
            {isLoadingHistory && (
              <p className="text-xs text-muted">Loading…</p>
            )}
            {!isLoadingHistory && messages.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-white p-4 text-center text-xs text-muted">
                Ask about student regulations, office hours, transcripts,
                registration, or tuition fees at UBT.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "brand-bg whitespace-pre-wrap text-white"
                      : "min-w-0 break-words border border-border bg-white text-[var(--foreground)]"
                  }`}
                >
                  {m.role === "assistant" && m.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={markdownComponents}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content ||
                    (m.role === "assistant" && isSending ? "…" : "")
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="bg-muted-bg px-4 pb-1 text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-end gap-2 border-t border-border bg-white p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message…"
              disabled={!conversationId || isSending}
              className="flex-1 resize-none rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-[var(--foreground)] placeholder:text-muted focus:border-[var(--navy)]/40 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!conversationId || isSending || !input.trim()}
              className="brand-bg rounded-lg px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {showGreeting && !isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-64 sm:right-6">
          <div className="relative rounded-2xl border border-border bg-white p-4 pr-8 shadow-xl">
            <button
              onClick={dismissGreeting}
              aria-label="Dismiss"
              className="absolute right-2 top-2 rounded-md p-1 text-muted hover:bg-muted-bg hover:text-[var(--foreground)]"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 3L13 13M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={openFromGreeting}
              className="text-left text-sm leading-relaxed text-[var(--foreground)]"
            >
              👋 Have a question about UBT? Ask us anything!
            </button>
            {/* Speech-bubble tail, pointing down toward the FAB */}
            <div className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 border-b border-r border-border bg-white" />
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen((v) => !v);
          dismissGreeting();
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="brand-bg fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 sm:right-6"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 3L13 13M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C7.03 3 3 6.58 3 11c0 2.39 1.19 4.53 3.08 6.02-.1.98-.5 2.32-1.58 3.48 0 0 2.13-.13 4.03-1.36.75.19 1.55.29 2.47.29 4.97 0 9-3.58 9-8S16.97 3 12 3z" />
          </svg>
        )}
      </button>
    </>
  );
}
