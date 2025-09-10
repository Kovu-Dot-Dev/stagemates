import { supabaseServer } from "@/lib/supabaseServer";
export async function POST(req: Request) {
  const body = await req.json();
  const {
    email,
    name,
    username,
    description,
    instruments,
    spotifyLink,
    soundcloudLink,
    instagramLink,
    tiktokLink,
    availability,
    preferredGenres,
  } = body;

  console.log("Received data:", {
    email,
    name,
    username,
    description,
    instruments,
    spotifyLink,
    soundcloudLink,
    instagramLink,
    tiktokLink,
    availability,
    preferredGenres,
  });

  // Check if user exists
  const { data: existingUser } = await supabaseServer
    .from("users")
    .select("id")
    .eq("email", email);

  let data, error, userId;

  if (existingUser && existingUser.length > 0) {
    // User exists, update them
    userId = existingUser[0].id;
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
        tiktok_link: tiktokLink,
        availability: availability,
      })
      .eq("email", email)
      .select();

    data = result.data;
    error = result.error;
  } else {
    // User doesn't exist, create them
    const result = await supabaseServer
      .from("users")
      .insert([
        {
          email: email,
          name: name,
          username: username,
          description: description,
          instruments: instruments,
          spotify_link: spotifyLink,
          soundcloud_link: soundcloudLink,
          instagram_link: instagramLink,
          tiktok_link: tiktokLink,
          availability: availability,
        },
      ])
      .select();

    data = result.data;
    error = result.error;
    if (data && data.length > 0) {
      userId = data[0].id;
    }
  }

  if (error) {
    console.log("Database error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  // Handle user_genres join table
  if (userId && Array.isArray(preferredGenres)) {
    // Remove existing user_genres for this user
    const { error: deleteError } = await supabaseServer
      .from("user_genres")
      .delete()
      .eq("user", userId);
    if (deleteError) {
      console.log("Error deleting old user_genres:", deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 400,
      });
    }
    // Insert new user_genres
    const genreRows = preferredGenres
      .filter((id) => !!id)
      .map((genre_id) => ({ user: userId, genre: genre_id }));
    if (genreRows.length > 0) {
      const { error: insertError } = await supabaseServer
        .from("user_genres")
        .insert(genreRows);
      if (insertError) {
        console.log("Error inserting user_genres:", insertError);
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 400,
        });
      }
    }
  }

  if (error) {
    console.log("Database error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
}
