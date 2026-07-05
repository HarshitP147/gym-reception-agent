export const dynamic = "force-dynamic";

type ClientMessage = { role: "user" | "assistant"; content: string };

// Stub for the member concierge agent (dashboard chat panel). Same request/
// response contract a real streaming agent will use later — swapping this out
// shouldn't require any UI changes in MemberChatPanel.
export async function POST(req: Request) {
  let body: { messages?: ClientMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  if (!incoming.some((m) => m.role === "user")) {
    return Response.json(
      { error: "messages must include at least one user message" },
      { status: 400 }
    );
  }

  const reply =
    "I'm not wired up to a live concierge yet — that's coming soon. Once connected I'll be able to see your membership and bookings and act on them directly.";

  return new Response(reply, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
