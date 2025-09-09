import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { bandId, userId } = await req.json();

    if (!bandId || !userId) {
      return new Response(JSON.stringify({ error: "bandId and userId are required" }), {
        status: 400,
      });
    }

    console.log(`Adding user ${userId} to band ${bandId}`);

    // Check if user is already a member of this band
    const { data: existingMember, error: checkError } = await supabaseServer
      .from("band_members")
      .select("*")
      .eq("band_id", bandId)
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.log("Error checking existing membership:", checkError);
      return new Response(JSON.stringify({ error: checkError.message }), {
        status: 500,
      });
    }

    if (existingMember) {
      return new Response(JSON.stringify({
        error: "User is already a member of this band"
      }), {
        status: 400,
      });
    }

    // Add user to band
    const { data: newMember, error: insertError } = await supabaseServer
      .from("band_members")
      .insert({
        band_id: bandId,
        user_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.log("Error adding user to band:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
      });
    }

    console.log(`Successfully added user ${userId} to band ${bandId}`);

    return new Response(JSON.stringify({
      data: newMember,
      message: "User successfully added to band"
    }), {
      status: 201,
    });

  } catch (error) {
    console.error("Error in addUserToBand route:", error);
    return new Response(JSON.stringify({ error: "Failed to add user to band" }), {
      status: 500,
    });
  }
}
