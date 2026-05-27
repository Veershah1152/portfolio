import type {
  ParsedLinkedInData,
  ReviewItem,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInCertification,
  LinkedInSkill,
  LinkedInPost,
  LinkedInProject,
  LinkedInProfile,
} from "@/lib/supabase/types";

// ─── Relevance Scoring ────────────────────────────────────────────────────────
// Returns 0-100 score and a suggestion message

function scorePosition(pos: LinkedInPosition): { score: number; suggestion: string } {
  let score = 70;
  const suggestion: string[] = [];

  if (pos.description && pos.description.length > 50) {
    score += 15;
    suggestion.push("Has a detailed description — great for showcasing experience.");
  } else {
    suggestion.push("Consider adding more details to this experience.");
  }

  if (pos.finishedOn === undefined) {
    score += 10; // Current role
    suggestion.push("This is your current role — highly relevant.");
  }

  return {
    score: Math.min(score, 100),
    suggestion: suggestion.join(" "),
  };
}

function scoreEducation(edu: LinkedInEducation): { score: number; suggestion: string } {
  let score = 80;
  const suggestion: string[] = [];

  if (edu.degreeName) {
    score += 10;
    suggestion.push(`${edu.degreeName} in ${edu.fieldOfStudy || "your field"}.`);
  }

  if (edu.activities && edu.activities.length > 20) {
    score += 10;
    suggestion.push("Has activities/societies — adds personality to portfolio.");
  }

  return { score: Math.min(score, 100), suggestion: suggestion.join(" ") };
}

function scorePost(post: LinkedInPost): { score: number; suggestion: string } {
  const text = post.shareCommentary || "";
  let score = 40;
  const suggestion: string[] = [];

  // Technical content keywords
  const techKeywords = [
    "built", "launched", "shipped", "project", "developed", "created",
    "open source", "github", "api", "architecture", "system", "code",
    "typescript", "python", "kotlin", "react", "node", "ml", "ai",
    "security", "ctf", "hack", "exploit", "vulnerability",
    "internship", "team", "problem", "solution", "learned", "achieving",
  ];

  const matchedKeywords = techKeywords.filter((kw) =>
    text.toLowerCase().includes(kw)
  );

  score += matchedKeywords.length * 5;

  if (text.length > 200) {
    score += 15;
    suggestion.push("Substantial post — could make a great blog article.");
  } else if (text.length > 80) {
    score += 8;
    suggestion.push("Good post — consider adding it to your blog.");
  }

  // Shared/re-shared content penalty
  if (!post.shareCommentary || post.shareCommentary.length < 50) {
    score -= 20;
    suggestion.push("Short or reshared content — may not add value.");
  }

  if (matchedKeywords.length > 2) {
    suggestion.push(`Technical content detected (${matchedKeywords.slice(0, 3).join(", ")}).`);
  }

  return {
    score: Math.max(0, Math.min(score, 100)),
    suggestion: suggestion.join(" ") || "Review to decide if this belongs in your portfolio.",
  };
}

function scoreCertification(cert: LinkedInCertification): { score: number; suggestion: string } {
  let score = 85;
  const suggestion = `${cert.name} from ${cert.authority || "issuer"} — certifications always add credibility.`;
  return { score, suggestion };
}

function scoreSkill(skill: LinkedInSkill): { score: number; suggestion: string } {
  return {
    score: 75,
    suggestion: `"${skill.name}" — add to your skills section with a proficiency level.`,
  };
}

function scoreProject(project: LinkedInProject): { score: number; suggestion: string } {
  let score = 80;
  const suggestion: string[] = ["Portfolio project"];

  if (project.url) {
    score += 10;
    suggestion.push("Has a live URL — great for your portfolio.");
  }
  if (project.description && project.description.length > 60) {
    score += 10;
    suggestion.push("Has a detailed description.");
  }

  return { score: Math.min(score, 100), suggestion: suggestion.join(" ") };
}

// ─── Main Analyzer ────────────────────────────────────────────────────────────
export function analyzeLinkedInData(data: ParsedLinkedInData): ReviewItem[] {
  const items: ReviewItem[] = [];

  // Profile
  if (data.profile.firstName || data.profile.headline) {
    items.push({
      id: "profile-main",
      type: "profile",
      data: data.profile,
      relevanceScore: 95,
      aiSuggestion:
        "Your profile info — name, headline, location. Update your portfolio profile with this data.",
      action: "include",
    } as ReviewItem<LinkedInProfile>);
  }

  // Positions
  data.positions.forEach((pos, i) => {
    const { score, suggestion } = scorePosition(pos);
    items.push({
      id: `position-${i}`,
      type: "experience",
      data: pos,
      relevanceScore: score,
      aiSuggestion: suggestion,
      action: score >= 60 ? "include" : "skip",
    } as ReviewItem<LinkedInPosition>);
  });

  // Education
  data.education.forEach((edu, i) => {
    const { score, suggestion } = scoreEducation(edu);
    items.push({
      id: `education-${i}`,
      type: "education",
      data: edu,
      relevanceScore: score,
      aiSuggestion: suggestion,
      action: "include",
    } as ReviewItem<LinkedInEducation>);
  });

  // Certifications
  data.certifications.forEach((cert, i) => {
    const { score, suggestion } = scoreCertification(cert);
    items.push({
      id: `cert-${i}`,
      type: "certification",
      data: cert,
      relevanceScore: score,
      aiSuggestion: suggestion,
      action: "include",
    } as ReviewItem<LinkedInCertification>);
  });

  // Skills (deduplicate from existing portfolio skills later)
  data.skills.forEach((skill, i) => {
    const { score, suggestion } = scoreSkill(skill);
    items.push({
      id: `skill-${i}`,
      type: "skill",
      data: skill,
      relevanceScore: score,
      aiSuggestion: suggestion,
      action: "include",
    } as ReviewItem<LinkedInSkill>);
  });

  // Posts (only include those with score >= 50)
  data.posts.forEach((post, i) => {
    const { score, suggestion } = scorePost(post);
    items.push({
      id: `post-${i}`,
      type: "post",
      data: post,
      relevanceScore: score,
      aiSuggestion: suggestion,
      action: score >= 55 ? "include" : "skip",
    } as ReviewItem<LinkedInPost>);
  });

  // Projects
  data.projects.forEach((project, i) => {
    const { score, suggestion } = scoreProject(project);
    items.push({
      id: `project-${i}`,
      type: "project",
      data: project,
      relevanceScore: score,
      aiSuggestion: suggestion,
      action: "include",
    } as ReviewItem<LinkedInProject>);
  });

  // Sort by relevance (highest first), then by type priority
  const typePriority: Record<string, number> = {
    profile: 0, experience: 1, education: 2, certification: 3,
    project: 4, skill: 5, post: 6,
  };

  return items.sort((a, b) => {
    const typeDiff = (typePriority[a.type] ?? 99) - (typePriority[b.type] ?? 99);
    if (typeDiff !== 0) return typeDiff;
    return b.relevanceScore - a.relevanceScore;
  });
}
