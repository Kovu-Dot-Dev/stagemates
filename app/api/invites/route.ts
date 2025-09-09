import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { bandId, jamId, userId } = await req.json();

    if (!bandId || !jamId || !userId) {
      return new Response(JSON.stringify({ error: "bandId, jamId, and userId are required" }), {
        status: 400,
      });
    }

    console.log(`Creating invites for band ${bandId} to jam ${jamId} from user ${userId}`);

    // First, get all band members for the given bandId
    const { data: bandMembers, error: bandMembersError } = await supabaseServer
      .from("band_members")
      .select("user_id")
      .eq("band_id", bandId);

    console.log("xx bandMembers", bandMembers);

    if (bandMembersError) {
      console.log("Error fetching band members:", bandMembersError);
      return new Response(JSON.stringify({ error: bandMembersError.message }), {
        status: 500,
      });
    }

    if (!bandMembers || bandMembers.length === 0) {
      console.log("No band members found for band:", bandId);
      return new Response(JSON.stringify({ error: "No band members found for this band" }), {
        status: 404,
      });
    }

    console.log(`Found ${bandMembers.length} band members to invite`);

    // Create invites for each band member
    const invitesData = bandMembers.map((member) => ({
      requester_id: userId,
      respondant_id: member.user_id,
      jam_id: jamId,
      accepted: false,
    }));

    const { data: createdInvites, error: createError } = await supabaseServer
      .from("jam_invites")
      .insert(invitesData)
      .select();

    if (createError) {
      console.log("Error creating invites:", createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 500,
      });
    }

    console.log(`Successfully created ${createdInvites?.length || 0} invites`);

    return new Response(JSON.stringify({
      data: createdInvites,
      message: `Successfully invited ${bandMembers.length} band members to the jam`
    }), {
      status: 201,
    });

  } catch (error) {
    console.error("Error in createInvites route:", error);
    return new Response(JSON.stringify({ error: "Failed to create invites" }), {
      status: 500,
    });
  }
}

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
