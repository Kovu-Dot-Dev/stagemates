import { supabaseServer } from "@/lib/supabaseServer";
export async function POST(req: Request) {
  const body = await req.json();
  const { email, name, username, description, instruments, spotifyLink, soundcloudLink, instagramLink, tiktokLink } = body;
  
  console.log("Received data:", { email, name, username, description, instruments, spotifyLink, soundcloudLink, instagramLink, tiktokLink });
  
  // Check if user exists
  const { data: existingUser } = await supabaseServer
    .from("users")
    .select("id")
    .eq("email", email);

  let data, error;

  if (existingUser && existingUser.length > 0) {
    // User exists, update them
    const result = await supabaseServer
      .from("users")
      .update({ 
        name: name, 
        username: username,
        description: description,
        instruments: instruments,
        spotify_link: spotifyLink,
        soundcloud_link: soundcloudLink,
        instagram_link: instagramLink,
        tiktok_link: tiktokLink
      })
      .eq("email", email);
    
    data = result.data;
    error = result.error;
  } else {
    // User doesn't exist, create them
    const result = await supabaseServer
      .from("users")
      .insert([{ 
        email: email, 
        name: name, 
        username: username,
        description: description,
        instruments: instruments,
        spotify_link: spotifyLink,
        soundcloud_link: soundcloudLink,
        instagram_link: instagramLink,
        tiktok_link: tiktokLink
      }]);
    
    data = result.data;
    error = result.error;
  }
    
  if (error) {
    console.log("Database error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
  
  return new Response(JSON.stringify({ data }), { status: 200 });
}
