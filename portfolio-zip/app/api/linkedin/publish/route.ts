import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { ReviewItem } from "@/lib/supabase/types";

export async function POST(req: Request) {
  try {
    // Verify admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items }: { items: ReviewItem[] } = await req.json();
    const includedItems = items.filter((item) => item.action === "include");

    const adminClient = createAdminClient();
    const results = { inserted: 0, skipped: 0, errors: [] as string[] };

    for (const item of includedItems) {
      // Use edited data if present, else original
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: Record<string, any> = { ...(item.data as Record<string, any>), ...((item.edited || {}) as Record<string, any>) };

      try {
        if (item.type === "profile") {
          await adminClient.from("profile").update({
            name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || undefined,
            bio: data.summary || undefined,
            location: data.geoLocation || undefined,
            email: data.email || undefined,
            twitter_url: data.twitter ? `https://twitter.com/${data.twitter}` : undefined,
          }).eq("id", 1);

        } else if (item.type === "experience") {
          await adminClient.from("timeline").insert({
            type: "work",
            title: data.title || "Position",
            organization: data.companyName || "",
            description: data.description || "",
            start_date: data.startedOn || null,
            end_date: data.finishedOn || null,
            icon: "Briefcase",
            tags: [],
          });

        } else if (item.type === "education") {
          await adminClient.from("timeline").insert({
            type: "education",
            title: data.degreeName ? `${data.degreeName} in ${data.fieldOfStudy || ""}` : data.schoolName,
            organization: data.schoolName || "",
            description: data.activities || data.notes || "",
            start_date: data.startDate || null,
            end_date: data.endDate || null,
            icon: "GraduationCap",
            tags: data.fieldOfStudy ? [data.fieldOfStudy] : [],
          });

        } else if (item.type === "certification") {
          await adminClient.from("timeline").insert({
            type: "certification",
            title: data.name || "Certification",
            organization: data.authority || "",
            url: data.url || null,
            start_date: data.startedOn || null,
            end_date: data.finishedOn || null,
            icon: "Award",
            tags: [],
          });

        } else if (item.type === "skill") {
          // Check if skill already exists
          const { data: existing } = await adminClient
            .from("skills")
            .select("id")
            .ilike("name", data.name)
            .single();

          if (!existing) {
            await adminClient.from("skills").insert({
              name: data.name,
              category: "LinkedIn Skills",
              percentage: 70, // Default — admin can update
              is_learning: false,
            });
          } else {
            results.skipped++;
            continue;
          }

        } else if (item.type === "post") {
          const title = data.shareCommentary?.slice(0, 80) || "LinkedIn Post";
          const slug = slugify(title) + "-" + Date.now();
          await adminClient.from("posts").insert({
            title: title,
            slug: slug,
            content: data.shareCommentary || "",
            excerpt: data.shareCommentary?.slice(0, 160) || "",
            published: false, // Admin must review and publish
            featured: false,
            tags: ["linkedin"],
          });

        } else if (item.type === "project") {
          const slug = slugify(data.title || "project") + "-" + Date.now();
          const { data: existingProject } = await adminClient
            .from("projects")
            .select("id")
            .eq("slug", slug)
            .single();

          if (!existingProject) {
            await adminClient.from("projects").insert({
              title: data.title || "Project",
              slug: slug,
              short_description: data.description?.slice(0, 200) || "",
              full_description: data.description || "",
              github_url: data.url || null,
              status: "STABLE",
              featured: false,
              tech_stack: [],
            });
          }
        }

        results.inserted++;
      } catch (itemErr) {
        console.error(`Error inserting ${item.type}:`, itemErr);
        results.errors.push(`Failed to insert ${item.type}: ${item.id}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Imported ${results.inserted} items${results.skipped > 0 ? `, skipped ${results.skipped} duplicates` : ""}${results.errors.length > 0 ? `, ${results.errors.length} errors` : ""}.`,
    });
  } catch (err) {
    console.error("LinkedIn publish error:", err);
    return NextResponse.json({ error: "Failed to publish items." }, { status: 500 });
  }
}
