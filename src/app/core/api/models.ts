/** DTOs returned by the Portfolio API (backend/src/Portfolio.Application/Features). */

export interface Profile {
  fullName: string;
  headline: string;
  tagline: string;
  about: string;
  location: string;
  email: string;
  photoUrl: string | null;
  cvUrl: string | null;
  linkedInUrl: string | null;
  gitHubUrl: string | null;
  telegramUrl: string | null;
  yearsOfExperience: number;
  teamSize: number;
  projectsCount: number;
  openToWork: boolean;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Experience {
  id: string;
  company: string;
  companyUrl: string | null;
  role: string;
  startDate: string; // yyyy-MM-dd
  endDate: string | null;
  isCurrent: boolean;
  highlights: string[];
}

export interface ProjectListItem {
  slug: string;
  title: string;
  category: string;
  summary: string;
  stack: string[];
  liveUrl: string | null;
  repositoryUrl: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
}

export interface ProjectDetail extends ProjectListItem {
  problem: string | null;
  role: string | null;
  solution: string | null;
  results: string | null;
  availableLanguages: string[];
}

export interface BlogPostListItem {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  coverImageUrl: string | null;
  publishedAt: string;
  readingMinutes: number;
}

export interface BlogPost extends BlogPostListItem {
  content: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  languageCode: string;
  /** Honeypot: must stay empty. */
  website: string;
}
