import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer.from("users").select("*");

  if (error) {
    console.log("Database error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  const { data: genreData, error: genreErr } = await supabaseServer
    .from("user_genres")
    .select("*");
  
  if (genreErr) {
    console.log("Error fetching user genres:", genreErr);
    return new Response(JSON.stringify({ error: genreErr.message }), {
      status: 500,
    });
  }

  // Map genres to users
  const userIdToGenres: Record<number, number[]> = {};
  for (const row of genreData ?? []) {
    if (!userIdToGenres[row.user]) userIdToGenres[row.user] = [];
    userIdToGenres[row.user].push(row.genre);
  }

  const usersWithGenres = (data ?? []).map((user) => ({
    ...user,
    genres: userIdToGenres[user.id],
  }));

  console.log("Users with genres:", usersWithGenres);

  return new Response(JSON.stringify({ data: usersWithGenres }), { status: 200 });
}
