import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch the current views count
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("views")
      .eq("slug", slug)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Increment views count
    const { error: updateError } = await supabase
      .from("posts")
      .update({ views: (post.views || 0) + 1 })
      .eq("slug", slug);

    if (updateError) {
      console.error("Failed to increment views:", updateError);
      return NextResponse.json({ error: "Failed to update views." }, { status: 500 });
    }

    return NextResponse.json({ success: true, views: (post.views || 0) + 1 }, { status: 200 });
  } catch (err) {
    console.error("Views API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
