import { supabaseServer } from "@/lib/supabaseServer";
export async function POST(req: Request) {
  const body = await req.json();
  const { email, name } = body;
  const { data, error } = await supabaseServer
    .from("users")
    .insert([{ email, name }]);
  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  return new Response(JSON.stringify({ data }), { status: 200 });
}
