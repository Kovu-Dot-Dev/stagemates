import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;
  
  console.log("Checking user with email:", email);
  
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
    
  if (error) {
    // User not found or other error
    console.log("User not found or error:", error);
    return new Response(JSON.stringify({ exists: false }), {
      status: 200,
    });
  }
  
  // User exists
  console.log("User found:", data);
  return new Response(JSON.stringify({ exists: true, user: data }), { 
    status: 200 
  });
}
