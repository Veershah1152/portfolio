import type {
  ParsedLinkedInData,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInCertification,
  LinkedInSkill,
  LinkedInProject,
} from "@/lib/supabase/types";

export function parseLinkedInPdfText(text: string): ParsedLinkedInData {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const data: ParsedLinkedInData = {
    profile: {},
    positions: [],
    education: [],
    certifications: [],
    skills: [],
    posts: [],
    projects: [],
  };

  let currentSection:
    | "profile"
    | "summary"
    | "experience"
    | "education"
    | "skills"
    | "certifications"
    | "projects"
    | null = null;

  let currentExperience: Partial<LinkedInPosition> & { details: string[] } = { details: [] };
  let currentEducation: Partial<LinkedInEducation> & { details: string[] } = { details: [] };
  let currentProject: Partial<LinkedInProject> & { details: string[] } = { details: [] };

  const flushExperience = () => {
    if (currentExperience.title && currentExperience.companyName) {
      if (currentExperience.details.length > 0) {
        currentExperience.description = currentExperience.details.join("\n");
      }
      data.positions.push(currentExperience as LinkedInPosition);
    }
    currentExperience = { details: [] };
  };

  const flushEducation = () => {
    if (currentEducation.schoolName) {
      if (currentEducation.details.length > 0) {
        currentEducation.notes = currentEducation.details.join("\n");
      }
      data.education.push(currentEducation as LinkedInEducation);
    }
    currentEducation = { details: [] };
  };

  const flushProject = () => {
    if (currentProject.title) {
      if (currentProject.details.length > 0) {
        currentProject.description = currentProject.details.join("\n");
      }
      data.projects.push(currentProject as LinkedInProject);
    }
    currentProject = { details: [] };
  };

  // Heuristics parsing loop
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();

    // Check for section headers
    if (upperLine === "CONTACT" || line.startsWith("Contact ") || line.includes("linkedin.com/in/")) {
      flushExperience();
      flushEducation();
      flushProject();
      currentSection = "profile";
      continue;
    } else if (upperLine === "SUMMARY") {
      flushExperience();
      flushEducation();
      flushProject();
      currentSection = "summary";
      continue;
    } else if (upperLine === "EXPERIENCE") {
      flushExperience();
      flushEducation();
      flushProject();
      currentSection = "experience";
      continue;
    } else if (upperLine === "EDUCATION") {
      flushExperience();
      flushEducation();
      flushProject();
      currentSection = "education";
      continue;
    } else if (
      upperLine === "LICENSES & CERTIFICATIONS" ||
      upperLine === "CERTIFICATIONS" ||
      upperLine === "HONORS & AWARDS"
    ) {
      flushExperience();
      flushEducation();
      flushProject();
      currentSection = "certifications";
      continue;
    } else if (upperLine === "TOP SKILLS" || upperLine === "SKILLS") {
      flushExperience();
      flushEducation();
      flushProject();
      currentSection = "skills";
      continue;
    } else if (upperLine === "PROJECTS") {
      flushExperience();
      flushEducation();
      flushProject();
      currentSection = "projects";
      continue;
    }

    // Process line depending on the current active section
    if (currentSection === "profile") {
      // Profile details extraction
      if (line.includes("@") && !data.profile.email) {
        data.profile.email = line;
      } else if (line.toLowerCase().includes("linkedin.com/in/")) {
        // Just extract name from headline if not set
        if (!data.profile.firstName) {
          const parts = line.split(" - ")[0].split(" ");
          data.profile.firstName = parts[0] || "";
          data.profile.lastName = parts.slice(1).join(" ") || "";
        }
      } else if (line.includes("Page ") && line.includes("of ")) {
        // Skip page numbers
      } else if (!data.profile.headline && line.length < 100 && !line.includes(":") && !line.includes("@")) {
        data.profile.headline = line;
      }
    } else if (currentSection === "summary") {
      if (line.includes("Page ") && line.includes("of ")) continue;
      data.profile.summary = (data.profile.summary || "") + line + "\n";
    } else if (currentSection === "experience") {
      if (line.includes("Page ") && line.includes("of ")) continue;

      // Detection of a new experience block:
      // In LinkedIn PDF, it usually goes:
      // Job Title
      // Company Name
      // Dates (e.g. "January 2021 - Present (2 years)")
      // Location
      // Description...
      
      const isDateLine = /^[A-Za-z]+\s+\d{4}\s*-\s*([A-Za-z]+\s+\d{4}|Present)/i.test(line) ||
                       /^\d{4}\s*-\s*(\d{4}|Present)/i.test(line);

      if (isDateLine) {
        // Parse start/end dates
        const dateParts = line.split(" - ");
        currentExperience.startedOn = dateParts[0]?.trim();
        currentExperience.finishedOn = dateParts[1]?.split("(")[0]?.trim();
      } else if (line.includes("United States") || line.includes("India") || line.includes("Germany") || line.includes("UK") || line.includes("Canada")) {
        currentExperience.location = line;
      } else if (!currentExperience.title) {
        currentExperience.title = line;
      } else if (!currentExperience.companyName) {
        currentExperience.companyName = line;
      } else {
        // Description details
        currentExperience.details.push(line);
      }

      // Heuristic: If we hit a new experience or section, it will be flushed.
      // But we can check if the next lines might be a new experience block.
      const nextLine = lines[i + 1];
      if (nextLine) {
        const nextUpper = nextLine.toUpperCase();
        const nextIsHeader = ["EXPERIENCE", "EDUCATION", "SKILLS", "CERTIFICATIONS", "LICENSES & CERTIFICATIONS", "PROJECTS", "SUMMARY", "CONTACT"].includes(nextUpper);
        
        // If next line is a DateLine, and we already have a job title & company, it might be the date for THIS experience.
        // If the next line after that is a DateLine, it could be a different job.
        // For simplicity: if we see another title pattern, we can flush.
        // A simple title pattern is just a capitalised line.
      }
    } else if (currentSection === "education") {
      if (line.includes("Page ") && line.includes("of ")) continue;

      const isDateLine = /^\d{4}\s*-\s*\d{4}/.test(line);

      if (isDateLine) {
        const dateParts = line.split(" - ");
        currentEducation.startDate = dateParts[0]?.trim();
        currentEducation.endDate = dateParts[1]?.trim();
      } else if (!currentEducation.schoolName) {
        currentEducation.schoolName = line;
      } else if (!currentEducation.degreeName) {
        // e.g. "Bachelor of Science, Computer Science"
        const parts = line.split(", ");
        currentEducation.degreeName = parts[0] || "";
        currentEducation.fieldOfStudy = parts.slice(1).join(", ") || "";
      } else {
        currentEducation.details.push(line);
      }
    } else if (currentSection === "certifications") {
      if (line.includes("Page ") && line.includes("of ")) continue;

      // Certifications format:
      // Certificate Name
      // Authority Name
      // License ID (optional)
      // Dates (optional)
      const isDateLine = /Issued\s+[A-Za-z]+\s+\d{4}/i.test(line) || /^\d{4}\s*-\s*\d{4}/.test(line);
      
      if (isDateLine) {
        // dates
      } else if (!line.includes("Credential ID")) {
        // If we see a certification authority or name, we create a cert object
        const nextLine = lines[i + 1] || "";
        // Simple heuristic: even lines are names, odd are authorities
        data.certifications.push({
          name: line,
          authority: nextLine.includes("Credential") || nextLine.toUpperCase() === "EDUCATION" ? "" : nextLine,
        });
        if (nextLine && !nextLine.includes("Credential") && nextLine.toUpperCase() !== "EDUCATION") {
          i++; // skip next line as it was parsed as authority
        }
      }
    } else if (currentSection === "skills") {
      if (line.includes("Page ") && line.includes("of ")) continue;
      
      // Skills might be bullet points or separated by dot/bars
      if (line.includes(" · ")) {
        const parts = line.split(" · ");
        parts.forEach((p) => {
          if (p.trim()) {
            data.skills.push({ name: p.trim() });
          }
        });
      } else {
        data.skills.push({ name: line });
      }
    } else if (currentSection === "projects") {
      if (line.includes("Page ") && line.includes("of ")) continue;

      if (!currentProject.title) {
        currentProject.title = line;
      } else {
        currentProject.details.push(line);
      }
    }
  }

  // Flush remaining temp items
  flushExperience();
  flushEducation();
  flushProject();

  // Deduplicate and filter empty items
  data.skills = data.skills.filter((s) => s.name && s.name.length < 50);
  data.certifications = data.certifications.filter((c) => c.name);

  // If no name found in profile section, fallback to headline or default
  if (!data.profile.firstName) {
    data.profile.firstName = "LinkedIn";
    data.profile.lastName = "User";
  }

  return data;
}
