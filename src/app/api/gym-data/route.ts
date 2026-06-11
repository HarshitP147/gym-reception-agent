import { getGymData } from "@/lib/gym-data";

// Always fetch fresh from Supabase rather than serving a cached response.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getGymData();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      {
        error: "Failed to fetch gym data",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
