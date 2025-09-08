import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jam_id = searchParams.get("jamId");

    console.log("Fetching attendees for jam_id:", jam_id);

    // Validate required fields
    if (!jam_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: jamId" }), 
        { status: 400 }
      );
    }

    // Query jam_invites table for accepted invites with user data
    const { data, error } = await supabaseServer
      .from("jam_invites")
      .select(`
        *,
        respondant:users!respondant_id(id, name, email, username, instruments),
        requester:users!requester_id(id, name, email, username, instruments)
      `)
      .eq("jam_id", jam_id)
      .eq("accepted", true);

    if (error) {
      console.log("Error fetching attendees:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // Extract unique users from both respondants and requesters
    const attendees: Array<{
      id: number;
      name: string;
      email: string;
      username: string;
      instruments: string[];
    }> = [];
    const userIds = new Set<number>();

    data?.forEach((invite) => {
      // Add respondant if not already added
      if (invite.respondant && !userIds.has(invite.respondant.id)) {
        attendees.push(invite.respondant);
        userIds.add(invite.respondant.id);
      }
      
      // Add requester if not already added
      if (invite.requester && !userIds.has(invite.requester.id)) {
        attendees.push(invite.requester);
        userIds.add(invite.requester.id);
      }
    });

    console.log("Attendees fetched successfully:", attendees);
    return new Response(JSON.stringify({ data: attendees }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in getAttendees route:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch attendees" }), {
      status: 500,
    });
  }
}
