"use client";

export function openChatWidget(prefill?: string) {
  window.dispatchEvent(
    new CustomEvent("open-chat-widget", { detail: { prefill } })
  );
}

export default function OpenChatButton({
  children,
  className,
  prefill,
}: {
  children: React.ReactNode;
  className?: string;
  prefill?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openChatWidget(prefill)}
      className={className}
    >
      {children}
    </button>
  );
}
