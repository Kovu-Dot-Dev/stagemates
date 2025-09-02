import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jamId, requesterEmail, respondantEmail } = body;
    
    console.log("Creating jam invite with:", { jamId, requesterEmail, respondantEmail });
    
    // Validate required fields
    if (!jamId || !requesterEmail || !respondantEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: jamId, requesterEmail, respondantEmail" }), 
        { status: 400 }
      );
    }

    // BAD BAD PRACTISE ID SHOULD BE STORED ON CLIENT SIDE BUT IM USING EMAIL FOR IDENTIFICATION FOR NOW
    // SO NEED TO FETCH THE ID WITH THE EMAIL 
    // Query for requester user ID
    const { data: requesterData, error: requesterError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", requesterEmail)
      .single();

    if (requesterError || !requesterData) {
      console.log("Requester not found:", requesterError);
      return new Response(
        JSON.stringify({ error: "Requester user not found" }), 
        { status: 404 }
      );
    }

    // Query for respondant user ID
    const { data: respondantData, error: respondantError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", respondantEmail)
      .single();

    if (respondantError || !respondantData) {
      console.log("Respondant not found:", respondantError);
      return new Response(
        JSON.stringify({ error: "Respondant user not found" }), 
        { status: 404 }
      );
    }

    // Insert new jam invite into database
    const { data, error } = await supabaseServer
      .from("jam_invites")
      .insert({
        jam_id: jamId,
        requester_id: requesterData.id,
        respondant_id: respondantData.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      console.log("Error creating jam invite:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    
    console.log("Jam invite created successfully:", data);
    return new Response(JSON.stringify({ data }), { 
      status: 201 
    });
  } catch (error) {
    console.error("Error parsing request:", error);
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
    });
  }
}
