import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inviteId } = body;
    
    console.log("Accepting invite with ID:", inviteId);
    
    // Validate required fields
    if (!inviteId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: inviteId" }), 
        { status: 400 }
      );
    }

    // Update the invite to set accepted = true
    const { data, error } = await supabaseServer
      .from("jam_invites")
      .update({ accepted: true })
      .eq("id", inviteId)
      .select()
      .single();
      
    if (error) {
      console.log("Error accepting invite:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    
    console.log("Invite accepted successfully:", data);
    return new Response(JSON.stringify({ data }), { 
      status: 200 
    });
  } catch (error) {
    console.error("Error parsing request:", error);
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
    });
  }
}
