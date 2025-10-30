import z from "zod";

// Job Posting Schemas
export const CreateJobPostingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().optional(),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  employment_type: z.string().optional(),
});

export const JobPostingSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string(),
  company: z.string(),
  description: z.string(),
  requirements: z.string().nullable(),
  location: z.string().nullable(),
  salary_range: z.string().nullable(),
  employment_type: z.string().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Candidate Schemas
export const CreateCandidateSchema = z.object({
  job_posting_id: z.number(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  resume_text: z.string().min(1, "Resume text is required"),
  cover_letter: z.string().optional(),
  linkedin_url: z.string().optional(),
});

export const CandidateSchema = z.object({
  id: z.number(),
  job_posting_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  resume_text: z.string(),
  cover_letter: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  status: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// AI Screening Schemas
export const AIScreeningSchema = z.object({
  id: z.number(),
  candidate_id: z.number(),
  job_posting_id: z.number(),
  user_id: z.string(),
  overall_score: z.number().nullable(),
  technical_skills_score: z.number().nullable(),
  experience_score: z.number().nullable(),
  culture_fit_score: z.number().nullable(),
  communication_score: z.number().nullable(),
  screening_summary: z.string().nullable(),
  strengths: z.string().nullable(),
  concerns: z.string().nullable(),
  recommendation: z.string().nullable(),
  is_processed: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Combined types for dashboard
export const CandidateWithScreeningSchema = CandidateSchema.extend({
  ai_screening: AIScreeningSchema.nullable(),
  job_title: z.string(),
  company_name: z.string(),
});

export type CreateJobPosting = z.infer<typeof CreateJobPostingSchema>;
export type JobPosting = z.infer<typeof JobPostingSchema>;
export type CreateCandidate = z.infer<typeof CreateCandidateSchema>;
export type Candidate = z.infer<typeof CandidateSchema>;
export type AIScreening = z.infer<typeof AIScreeningSchema>;
export type CandidateWithScreening = z.infer<typeof CandidateWithScreeningSchema>;
