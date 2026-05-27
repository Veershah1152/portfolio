import { parse as csvParse } from "papaparse";
import type {
  ParsedLinkedInData,
  LinkedInProfile,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInCertification,
  LinkedInSkill,
  LinkedInPost,
  LinkedInProject,
} from "@/lib/supabase/types";

// ─── CSV Parser Helper ────────────────────────────────────────────────────────
function parseCSV<T>(content: string): T[] {
  const result = csvParse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().replace(/\r/g, ""),
    transform: (v) => v.trim(),
  });
  return result.data as T[];
}

// ─── LinkedIn ZIP Structure ───────────────────────────────────────────────────
// LinkedIn exports various CSVs. We map the known filenames:
const FILE_MAP = {
  profile: ["Profile.csv", "Basic_Information.csv"],
  positions: ["Positions.csv", "Work_Experience.csv"],
  education: ["Education.csv"],
  certifications: ["Certifications.csv", "Licenses_And_Certifications.csv"],
  skills: ["Skills.csv"],
  articles: ["Articles.csv"],
  posts: ["Posts.csv", "Shares.csv"],
  projects: ["Projects.csv"],
};

// ─── Main Parser ─────────────────────────────────────────────────────────────
export async function parseLinkedInZip(
  buffer: ArrayBuffer
): Promise<ParsedLinkedInData> {
  // Dynamic import to avoid server/client issues
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);

  const files: Record<string, string> = {};
  for (const [name, file] of Object.entries(zip.files)) {
    if (!file.dir && name.endsWith(".csv")) {
      const basename = name.split("/").pop() || name;
      files[basename] = await file.async("string");
    }
  }

  // Helper to find file by multiple possible names
  const getFile = (names: string[]): string | null => {
    for (const name of names) {
      if (files[name]) return files[name];
    }
    return null;
  };

  // ─── Parse Profile ────────────────────────────────────────────────────────
  const profileContent = getFile(FILE_MAP.profile);
  let profile: LinkedInProfile = {};
  if (profileContent) {
    const rows = parseCSV<Record<string, string>>(profileContent);
    const row = rows[0] || {};
    profile = {
      firstName: row["First Name"] || row["firstName"] || "",
      lastName: row["Last Name"] || row["lastName"] || "",
      headline: row["Headline"] || row["headline"] || "",
      summary: row["Summary"] || row["summary"] || "",
      geoLocation: row["Geo Location"] || row["Location"] || "",
      industry: row["Industry"] || row["industry"] || "",
      email: row["Email Address"] || row["email"] || "",
      twitter: row["Twitter Handles"] || "",
    };
  }

  // ─── Parse Positions ─────────────────────────────────────────────────────
  const positionsContent = getFile(FILE_MAP.positions);
  let positions: LinkedInPosition[] = [];
  if (positionsContent) {
    const rows = parseCSV<Record<string, string>>(positionsContent);
    positions = rows.map((r) => ({
      companyName: r["Company Name"] || r["company_name"] || "",
      title: r["Title"] || r["title"] || "",
      description: r["Description"] || r["description"] || "",
      location: r["Location"] || r["location"] || "",
      startedOn: normalizeDate(r["Started On"] || r["started_on"] || ""),
      finishedOn: normalizeDate(r["Finished On"] || r["finished_on"] || ""),
    })).filter((p) => p.title);
  }

  // ─── Parse Education ──────────────────────────────────────────────────────
  const educationContent = getFile(FILE_MAP.education);
  let education: LinkedInEducation[] = [];
  if (educationContent) {
    const rows = parseCSV<Record<string, string>>(educationContent);
    education = rows.map((r) => ({
      schoolName: r["School Name"] || r["school_name"] || "",
      degreeName: r["Degree Name"] || r["degree_name"] || "",
      fieldOfStudy: r["Field Of Study"] || r["field_of_study"] || "",
      startDate: normalizeDate(r["Start Date"] || r["start_date"] || ""),
      endDate: normalizeDate(r["End Date"] || r["end_date"] || ""),
      activities: r["Activities And Societies"] || "",
      notes: r["Notes"] || "",
    })).filter((e) => e.schoolName);
  }

  // ─── Parse Certifications ─────────────────────────────────────────────────
  const certsContent = getFile(FILE_MAP.certifications);
  let certifications: LinkedInCertification[] = [];
  if (certsContent) {
    const rows = parseCSV<Record<string, string>>(certsContent);
    certifications = rows.map((r) => ({
      name: r["Name"] || r["name"] || "",
      authority: r["Authority"] || r["Issued By"] || r["authority"] || "",
      licenseNumber: r["License Number"] || r["license_number"] || "",
      startedOn: normalizeDate(r["Started On"] || r["started_on"] || ""),
      finishedOn: normalizeDate(r["Finished On"] || r["finished_on"] || ""),
      url: r["Url"] || r["url"] || "",
    })).filter((c) => c.name);
  }

  // ─── Parse Skills ─────────────────────────────────────────────────────────
  const skillsContent = getFile(FILE_MAP.skills);
  let skills: LinkedInSkill[] = [];
  if (skillsContent) {
    const rows = parseCSV<Record<string, string>>(skillsContent);
    skills = rows.map((r) => ({
      name: r["Name"] || r["name"] || r["Skill"] || "",
    })).filter((s) => s.name);
  }

  // ─── Parse Posts & Articles ───────────────────────────────────────────────
  const postsContent = getFile(FILE_MAP.posts) || getFile(FILE_MAP.articles);
  let posts: LinkedInPost[] = [];
  if (postsContent) {
    const rows = parseCSV<Record<string, string>>(postsContent);
    posts = rows.map((r) => ({
      date: r["Date"] || r["date"] || r["Published Date"] || "",
      shareCommentary: r["ShareCommentary"] || r["Commentary"] || r["Text"] || r["Content"] || "",
      shareLink: r["ShareLink"] || r["Url"] || r["Link"] || "",
      mediaType: r["MediaType"] || r["Type"] || "",
    })).filter((p) => p.shareCommentary && p.shareCommentary.length > 20);
  }

  // ─── Parse Projects ───────────────────────────────────────────────────────
  const projectsContent = getFile(FILE_MAP.projects);
  let projects: LinkedInProject[] = [];
  if (projectsContent) {
    const rows = parseCSV<Record<string, string>>(projectsContent);
    projects = rows.map((r) => ({
      title: r["Title"] || r["title"] || r["Project Title"] || "",
      description: r["Description"] || r["description"] || "",
      url: r["Url"] || r["url"] || r["Project URL"] || "",
      startedOn: normalizeDate(r["Started On"] || r["started_on"] || ""),
      finishedOn: normalizeDate(r["Finished On"] || r["finished_on"] || ""),
      associatedWith: r["Associated With"] || r["associated_with"] || "",
    })).filter((p) => p.title);
  }

  return {
    profile,
    positions,
    education,
    certifications,
    skills,
    posts,
    projects,
  };
}

// ─── Utility: Normalize LinkedIn date formats ─────────────────────────────────
function normalizeDate(raw: string): string | undefined {
  if (!raw || raw.toLowerCase() === "present" || raw === "") return undefined;
  // LinkedIn uses "Jan 2024", "2024-01-01", "January 2024" etc.
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10); // YYYY-MM-DD
    }
  } catch {
    // ignore
  }
  return undefined;
}
