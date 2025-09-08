import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const respondant_id = searchParams.get("respondant_id");

    console.log("Fetching invites, respondant_id filter:", respondant_id);

    let query = supabaseServer
      .from("jam_invites")
      .select(`
        *,
        requester:users!requester_id(id, name, email, username)
      `)
      .eq("accepted", false)
      .order("created_at", { ascending: false });

    // If respondant_id is provided, filter by it, otherwise get all invites
    if (respondant_id) {
      query = query.eq("respondant_id", respondant_id);
    }

    const { data, error } = await query;

    if (error) {
      console.log("Error fetching invites:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    console.log("Invites fetched successfully:", data);
    return new Response(JSON.stringify({ data }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in getInvites route:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch invites" }), {
      status: 500,
    });
  }
}
