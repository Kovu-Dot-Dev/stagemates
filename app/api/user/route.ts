import { supabaseServer } from "@/lib/supabaseServer";
import { UserProfile } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jamId = searchParams.get('jamId');
  const userId = searchParams.get('userId');
  const bandId = searchParams.get('bandId');

  // Controller seems like its doing alot of work, to retro
  if (bandId) {
    const bandIdNum = parseInt(bandId);
    
    if (isNaN(bandIdNum)) {
      return new Response(JSON.stringify({ error: "Invalid band ID provided" }), {
        status: 400,
      });
    }

    console.log("Fetching members for band ID:", bandIdNum);

    // First, get user IDs from band_members table
    const { data: bandMembers, error: membersError } = await supabaseServer
      .from("band_members")
      .select("user_id")
      .eq("band_id", bandIdNum);

    if (membersError) {
      console.log("Database error fetching band members:", membersError);
      return new Response(JSON.stringify({ error: membersError.message }), {
        status: 400,
      });
    }

    if (!bandMembers || bandMembers.length === 0) {
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    }

    // Extract user IDs
    const userIds = bandMembers.map(member => member.user_id);

    // Then, get user data from users table
    const { data: users, error: usersError } = await supabaseServer
      .from("users")
      .select("*")
      .in("id", userIds);

    if (usersError) {
      console.log("Database error fetching users:", usersError);
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ data: users }), { status: 200 });
  } else if (jamId) {
    console.log(`Fetching participants for jam ID: ${jamId}`);
    
    // Get accepted invites for this jam
    const { data: invites, error: invitesError } = await supabaseServer
      .from("jam_invites")
      .select("requester_id, respondant_id")
      .eq("jam_id", jamId)
      .eq("accepted", true);
      
    if (invitesError) {
      console.log("Error fetching jam invites:", invitesError);
      return new Response(JSON.stringify({ error: invitesError.message }), {
        status: 500,
      });
    }
    
    if (!invites || invites.length === 0) {
      console.log("No accepted invites found for this jam");
      return new Response(JSON.stringify({ data: [] }), { 
        status: 200 
      });
    }
    
    // Extract all user IDs (both requester and respondant) and remove duplicates
    const userIds = new Set<number>();
    invites.forEach(invite => {
      if (invite.requester_id) userIds.add(invite.requester_id);
      if (invite.respondant_id) userIds.add(invite.respondant_id);
    });
    
    const uniqueUserIds = Array.from(userIds);
    console.log("Unique user IDs:", uniqueUserIds);
    
    if (uniqueUserIds.length === 0) {
      console.log("No valid user IDs found");
      return new Response(JSON.stringify({ data: [] }), { 
        status: 200 
      });
    }
    
    // Get user details for all participants
    const { data: users, error: usersError } = await supabaseServer
      .from("users")
      .select("*")
      .in("id", uniqueUserIds);
      
    if (usersError) {
      console.log("Error fetching users:", usersError);
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 500,
      });
    }
    
    console.log("Jam participants:", users);
    return new Response(JSON.stringify({ data: users }), { 
      status: 200 
    });
  } else if (userId) {
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

    // const { genreData, error } = {} // await supabaseServer
    //   .from("user_genres")
    //   .select("*")
    //   .eq("user_id", userId);

    // if (error) {
    //   console.log("Error fetching user genres:", error);
    //   return new Response(JSON.stringify({ error: error.message }), {
    //     status: 500,
    //   });
    // }

    
    // Get user genres
    const { data: genreData, error: genreErr } = await supabaseServer
      .from("user_genres")
      .select("*")
      .eq("user", userId);

    if (genreErr) {
      console.log("Error fetching user genres:", genreErr);
      return new Response(JSON.stringify({ error: genreErr.message }), {
        status: 500,
      });
    }

    console.log("User found:", data);
    return new Response(JSON.stringify({ data: { ...data, genres: genreData?.map(data => data.genre) } }), {
      status: 200,
    });
  } else {
    return new Response(JSON.stringify({ error: "Either jamId, userId, or bandId parameter is required" }), {
      status: 400,
    });
  }
}
