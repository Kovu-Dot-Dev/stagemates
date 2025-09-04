import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return new Response(JSON.stringify({ error: "Email parameter is required" }), {
      status: 400,
    });
  }
  
  console.log("Fetching user with email:", email);
  
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("email", email);
    
  if (error) {
    console.log("Database error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  
  if (!data || data.length === 0) {
    console.log("User not found");
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }
  
  console.log("User found:", data[0]);
  return new Response(JSON.stringify({ data: data[0] }), { 
    status: 200 
  });
}
