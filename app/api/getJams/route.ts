import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
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
  } catch (error) {
    console.error("Error in getJams route:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch jams" }), {
      status: 500,
    });
  }
}
