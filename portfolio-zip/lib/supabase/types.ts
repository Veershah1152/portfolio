// ─── Database Types ───────────────────────────────────────────────────────────

export type ProjectStatus = "STABLE" | "BETA" | "ALPHA" | "ARCHIVED" | "WIP";
export type TimelineType = "work" | "education" | "achievement" | "certification";
export type AvailabilityStatus = "available" | "busy" | "unavailable";

export interface Profile {
  id: number;
  name: string;
  title: string;
  bio: string;
  bio_secondary?: string;
  avatar_url?: string;
  resume_url?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  email?: string;
  location?: string;
  status: AvailabilityStatus;
  stats?: {
    ctfs?: number;
    vulnerabilities?: number;
    commits?: number;
    streak?: number;
    projects?: number;
  };
  terminal_title?: string;
  marquee_items?: string[];
  roles?: string[];
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  tech_stack?: string[];
  github_url?: string;
  live_url?: string;
  thumbnail_url?: string;
  screenshots?: string[];
  featured: boolean;
  category?: string;
  tags?: string[];
  completion_date?: string;
  achievements?: string[];
  status: ProjectStatus;
  metrics?: Record<string, string | number>;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  category: string;
  name: string;
  percentage?: number;
  icon_url?: string;
  is_learning: boolean;
  order_index: number;
}

export interface SkillGroup {
  category: string;
  items: Skill[];
}

export interface TimelineEntry {
  id: string;
  type: TimelineType;
  title: string;
  organization?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  icon?: string;
  tags?: string[];
  url?: string;
  order_index: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_url?: string;
  category?: string;
  tags?: string[];
  featured: boolean;
  published: boolean;
  reading_time?: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ─── LinkedIn Import Types ────────────────────────────────────────────────────

export interface LinkedInPosition {
  companyName: string;
  title: string;
  description?: string;
  location?: string;
  startedOn?: string;
  finishedOn?: string;
}

export interface LinkedInEducation {
  schoolName: string;
  degreeName?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  activities?: string;
  notes?: string;
}

export interface LinkedInCertification {
  name: string;
  authority?: string;
  licenseNumber?: string;
  startedOn?: string;
  finishedOn?: string;
  url?: string;
}

export interface LinkedInSkill {
  name: string;
}

export interface LinkedInPost {
  date?: string;
  shareCommentary?: string;
  shareLink?: string;
  mediaType?: string;
}

export interface LinkedInProject {
  title: string;
  description?: string;
  url?: string;
  startedOn?: string;
  finishedOn?: string;
  associatedWith?: string;
}

export interface LinkedInProfile {
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  geoLocation?: string;
  industry?: string;
  email?: string;
  twitter?: string;
  websites?: string[];
}

export interface ParsedLinkedInData {
  profile: LinkedInProfile;
  positions: LinkedInPosition[];
  education: LinkedInEducation[];
  certifications: LinkedInCertification[];
  skills: LinkedInSkill[];
  posts: LinkedInPost[];
  projects: LinkedInProject[];
}

export interface ReviewItem<T = unknown> {
  id: string;
  type: "experience" | "education" | "certification" | "skill" | "post" | "project" | "profile";
  data: T;
  relevanceScore: number;
  aiSuggestion?: string;
  action: "include" | "skip" | "edit";
  edited?: Partial<T>;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface GitHubStats {
  username: string;
  totalCommits: number;
  totalRepos: number;
  totalStars: number;
  followers: number;
  languages: { name: string; percentage: number; color: string }[];
  recentRepos: {
    name: string;
    description?: string;
    url: string;
    stars: number;
    forks: number;
    language?: string;
    updatedAt: string;
  }[];
  contributionStreak: number;
}
