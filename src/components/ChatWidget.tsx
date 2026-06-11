"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hey! I'm the IronPulse AI receptionist. Ask me anything about classes, membership, coaches or facilities — I'm here 24/7 🏋️";

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 5.94 2 10.8c0 2.77 1.46 5.24 3.74 6.86-.13 1.2-.6 2.6-1.54 3.74-.17.2-.02.51.24.48 1.9-.25 3.46-1.02 4.6-1.86.94.25 1.93.38 2.96.38 5.523 0 10-3.94 10-8.8S17.523 2 12 2z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function ChatWidget() {
  // `render` = present in the DOM; `shown` = animated-in. Two flags give a clean
  // grow-from-corner open and a collapse-back-to-corner close.
  const [render, setRender] = useState(false);
  const [shown, setShown] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sessionId = useRef<string>("");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openChat() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMessages((prev) =>
      prev.length === 0 ? [{ role: "assistant", content: GREETING }] : prev
    );
    setRender(true);
    // Next frame: flip to the shown state so the transition runs.
    requestAnimationFrame(() => setShown(true));
  }

  function closeChat() {
    setShown(false);
    closeTimer.current = setTimeout(() => setRender(false), 250);
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Auto-scroll to newest; focus the input once the bubble is shown.
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (shown) inputRef.current?.focus();
  }, [shown]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    // Generate the session id lazily in the handler (not during render).
    if (!sessionId.current) {
      sessionId.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    const history = [...messages, { role: "user" as const, content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, sessionId: sessionId.current }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the gym's system just now. Please try again in a moment.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const lastIsEmptyAssistant =
    loading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  return (
    <>
      {/* The bubble — grows out of the bottom-right corner where the button sits */}
      {render && (
        <div
          role="dialog"
          aria-label="FitAgent chat"
          aria-hidden={!shown}
          className={[
            "fixed bottom-6 right-4 left-4 z-50 flex origin-bottom-right flex-col overflow-hidden",
            "rounded-3xl border border-border bg-background shadow-2xl shadow-black/60",
            "h-[min(82vh,680px)] sm:left-auto sm:right-6 sm:w-[440px]",
            "transition-all duration-[250ms] ease-out",
            shown
              ? "scale-100 opacity-100 translate-y-0"
              : "pointer-events-none scale-50 opacity-0 translate-y-8",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-background">
                <ChatIcon className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="font-serif text-xl tracking-tight text-foreground">
                  FitAgent <span className="text-accent">⚡</span>
                </p>
                <p className="text-xs text-muted">IronPulse receptionist · online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              aria-label="Close chat"
              className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Thread */}
          <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-background"
                      : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-surface px-4 py-2.5 text-sm text-foreground"
                  }
                >
                  <RichText text={m.content} />
                  {lastIsEmptyAssistant && i === messages.length - 1 && <TypingDots />}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about classes, plans, coaches…"
              aria-label="Message FitAgent"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-background transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.39 1.18L4 11l11 1-11 1-1.99 6.22a1 1 0 001.39 1.18z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating launcher — hidden while the bubble is open so it reads as the
          button expanding into the bubble */}
      <button
        type="button"
        onClick={openChat}
        aria-label="Chat with FitAgent"
        aria-expanded={render}
        className={[
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-accent px-5 py-3",
          "font-semibold text-background shadow-lg shadow-accent/20 transition-all duration-200",
          render
            ? "pointer-events-none scale-50 opacity-0"
            : "scale-100 opacity-100 hover:scale-105",
        ].join(" ")}
      >
        <ChatIcon className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline">Chat with FitAgent</span>
      </button>
    </>
  );
}

// Minimal inline markdown: **bold** and *italic*. Tolerant of unclosed markers
// (mid-stream). Whitespace/newlines preserved by the bubble's `whitespace-pre-wrap`.
function RichText({ text }: { text: string }) {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      parts.push(<strong key={key++}>{m[1]}</strong>);
    } else {
      parts.push(<em key={key++}>{m[2]}</em>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
    </span>
  );
}
