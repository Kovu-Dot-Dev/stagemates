import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("bands")
    .select("*");
    
  if (error) {
    console.log("Database error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
  
  return new Response(JSON.stringify({ data }), { status: 200 });
}
