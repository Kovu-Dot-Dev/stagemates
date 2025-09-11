import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (userId) {
      console.log(`Fetching bands for user ID: ${userId}`);
      
      // Get bands where user is a member
      const { data: bandMemberData, error: memberError } = await supabaseServer
        .from("band_members")
        .select(`
          band_id,
          bands (
            id,
            name,
            genre
          )
        `)
        .eq("user_id", userId);
        
      if (memberError) {
        console.log("Database error fetching band members:", memberError);
        return new Response(JSON.stringify({ error: memberError.message }), {
          status: 400,
        });
      }
      
      // Extract band data from the join result
      const bands = bandMemberData?.map(member => member.bands).filter(Boolean) || [];
      
      console.log("User bands fetched successfully:", bands);
      return new Response(JSON.stringify({ data: bands }), { status: 200 });
    } else {
      // Fetch all bands if no userId specified
      const { data, error } = await supabaseServer.from("bands").select("*");

      if (error) {
        console.log("Database error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
        });
      }
      return new Response(JSON.stringify({ data }), { status: 200 });
    }
  } catch (error) {
    console.error("Error in bands GET route:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch bands" }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bandName, genre, memberIds } = body;

    // Validate required fields
    if (!bandName || !genre || !memberIds || !Array.isArray(memberIds)) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: bandName, genre, and memberIds (array)" 
        }),
        { status: 400 }
      );
    }

    // Insert the new band
    const { data: bandData, error: bandError } = await supabaseServer
      .from("bands")
      .insert({
        name: bandName,
        genre: genre
      })
      .select()
      .single();

    if (bandError) {
      console.log("Database error creating band:", bandError);
      return new Response(JSON.stringify({ error: bandError.message }), {
        status: 400,
      });
    }

    // Create band_members records for each member
    const bandMemberRecords = memberIds.map(userId => ({
      band_id: bandData.id,
      user_id: userId
    }));

    const { data: memberData, error: memberError } = await supabaseServer
      .from("band_members")
      .insert(bandMemberRecords)
      .select();

    if (memberError) {
      console.log("Database error creating band members:", memberError);
      return new Response(JSON.stringify({ error: memberError.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ 
      band: bandData, 
      members: memberData 
    }), { status: 201 });
  } catch (error) {
    console.log("Request parsing error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      { status: 400 }
    );
  }
}
