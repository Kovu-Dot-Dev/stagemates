import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jamName, location, dateHappening, capacity, creatorEmail } = body;
    
    console.log("Creating jam with:", { jamName, location, dateHappening, capacity, creatorEmail });
    
    // Validate required fields
    if (!jamName || !location || !dateHappening || !capacity) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: jamName, location, dateHappening, capacity" }), 
        { status: 400 }
      );
    }
    
    // Insert new jam into database
    const { data, error } = await supabaseServer
      .from("jams")
      .insert({
        jam_name: jamName,
        location: location,
        date_happening: new Date(dateHappening).toISOString(),
        capacity: capacity,
        owner_email: creatorEmail,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      console.log("Error creating jam:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    
    console.log("Jam created successfully:", data);
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
