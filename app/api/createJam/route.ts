import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jamName } = body;
    
    console.log("Creating jam with:", { jamName });
    
    // Validate required fields
    if (!jamName) {
      return new Response(
        JSON.stringify({ error: "Missing required field: jamName" }), 
        { status: 400 }
      );
    }
    
    // Insert new jam into database
    const { data, error } = await supabaseServer
      .from("jams")
      .insert({
        jam_name: jamName,
        created_at: new Date().toISOString(),
        location: "tbc",
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
