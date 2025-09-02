import { supabaseServer } from "@/lib/supabaseServer";
export async function POST(req: Request) {
  const body = await req.json();
  const { email, name, username, instruments } = body;
  
  console.log("Received data:", { email, name, username, instruments });
  
  const { data, error } = await supabaseServer
    .from("users")
    .insert([{ email: email, name: name, username: username, instruments: instruments }]);
    
  if (error) {
    console.log("Database error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
  
    return new Response(JSON.stringify({ data }), { status: 200 });
}
