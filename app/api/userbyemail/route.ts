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
  
  const { data: userData, error: userErr } = await supabaseServer
    .from("users")
    .select("*")
    .eq("email", email);
    
  if (userErr) {
    console.log("Database error:", userErr);
    return new Response(JSON.stringify({ error: userErr.message }), {
      status: 500,
    });
  }
  
  if (!userData || userData.length === 0) {
    console.log("User not found");
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  // Get user genres
  const { data: genreData, error: genreErr } = await supabaseServer
    .from("user_genres")
    .select("*")
    .eq("user", userData[0].id);

  if (genreErr) {
    console.log("Error fetching user genres:", genreErr);
    return new Response(JSON.stringify({ error: genreErr.message }), {
      status: 500,
    });
  }

  console.log("User found:", {...userData[0], genres: genreData?.map(data => data.genre)});
  return new Response(JSON.stringify({ data: {...userData[0], genres: genreData?.map(data => data.genre)} }), {
    status: 200
  });
}
