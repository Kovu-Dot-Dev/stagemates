import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const userId = params.id;
  
  console.log("Fetching user with ID:", userId);
  
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
    
  if (error) {
    console.log("User not found or error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 404,
    });
  }
  
  console.log("User found:", data);
  return new Response(JSON.stringify({ data }), { 
    status: 200 
  });
}
