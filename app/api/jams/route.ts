import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userEmail = searchParams.get('userEmail');
    
    if (userEmail) {
      console.log(`Fetching jams for user email: ${userEmail}`);
      
      // Search jams by owner_email
      const { data, error } = await supabaseServer
        .from("jams")
        .select("*")
        .eq("owner_email", userEmail)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.log("Error fetching jams by email:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
        });
      }
      
      console.log("Jams fetched successfully by email:", data);
      return new Response(JSON.stringify({ data }), { 
        status: 200 
      });
    } else if (id) {
      console.log(`Fetching jams for user ID: ${id}`);
      
      // First, get accepted invites where user is either requester or respondant
      const { data: invites, error: invitesError } = await supabaseServer
        .from("jam_invites")
        .select("jam_id")
        .eq("accepted", true)
        .or(`requester_id.eq.${id},respondant_id.eq.${id}`);
        
      if (invitesError) {
        console.log("Error fetching jam invites:", invitesError);
        return new Response(JSON.stringify({ error: invitesError.message }), {
          status: 500,
        });
      }
      
      if (!invites || invites.length === 0) {
        console.log("No accepted invites found for user");
        return new Response(JSON.stringify({ data: [] }), { 
          status: 200 
        });
      }
      
      // Extract jam_ids from the invites
      const jamIds = invites.map(invite => invite.jam_id);
      
      // Get all jams that match these jam_ids
      const { data, error } = await supabaseServer
        .from("jams")
        .select("*")
        .in("id", jamIds)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.log("Error fetching jams:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
        });
      }
      
      console.log("User jams fetched successfully:", data);
      return new Response(JSON.stringify({ data }), { 
        status: 200 
      });
    } else {
      console.log("Fetching all jams...");
      
      const { data, error } = await supabaseServer
        .from("jams")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.log("Error fetching jams:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
        });
      }
      
      console.log("Jams fetched successfully:", data);
      return new Response(JSON.stringify({ data }), { 
        status: 200 
      });
    }
  } catch (error) {
    console.error("Error in getJams route:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch jams" }), {
      status: 500,
    });
  }
}
