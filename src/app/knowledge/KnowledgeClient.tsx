"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DocumentSummary {
  id: string;
  title: string;
  preview: string;
  chunkCount: number;
  createdAt: string;
}

export default function KnowledgeClient() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadDocuments() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch (err) {
      console.error(err);
      setError("Couldn't load documents.");
    } finally {
      setIsLoading(false);
    }
  }

  // Initial load on mount. Inlined (rather than calling the outer
  // `loadDocuments`) so this effect only ever synchronizes with the fetch
  // it itself started - `loadDocuments` is still reused, but only from
  // event handlers (handleSubmit/handleDelete) below, never from an effect.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/documents");
        const data = await res.json();
        if (!cancelled) setDocuments(data.documents ?? []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Couldn't load documents.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add document.");
      }
      setTitle("");
      setContent("");
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document.");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-muted-bg">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-xs text-muted hover:text-[var(--navy)]"
        >
          ← Back to site
        </Link>

        <h1 className="mb-1 text-xl font-semibold text-[var(--navy)]">
          Knowledge Base
        </h1>
        <p className="mb-6 text-sm text-muted">
          Documents the assistant draws on when answering student questions
          about UBT. Each document is automatically split into chunks and
          embedded for semantic search.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-3 rounded-lg border border-border bg-white p-5 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Registration & Fees"'
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-muted focus:border-[var(--navy)]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Paste the full document text here…"
              className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-muted focus:border-[var(--navy)]/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="brand-bg rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {isSubmitting ? "Adding…" : "Add document"}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <h2 className="mb-3 text-sm font-medium text-muted">
          Documents ({documents.length})
        </h2>
        {isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted">No documents yet.</p>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-lg border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-[var(--navy)]">
                      {doc.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {doc.preview}
                      {doc.preview.length >= 200 ? "…" : ""}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {doc.chunkCount} chunk{doc.chunkCount === 1 ? "" : "s"} ·{" "}
                      {new Date(doc.createdAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="shrink-0 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    {deletingId === doc.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
