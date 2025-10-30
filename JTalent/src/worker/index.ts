import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  authMiddleware,
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import OpenAI from "openai";
import {
  CreateJobPostingSchema,
  CreateCandidateSchema,
  JobPostingSchema,
  CandidateSchema,
  AIScreeningSchema,
  CandidateWithScreeningSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Authentication endpoints
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
    apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
    apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
      apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Job postings endpoints
app.get("/api/job-postings", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    `SELECT jp.*, 
            COUNT(c.id) as candidate_count
     FROM job_postings jp
     LEFT JOIN candidates c ON jp.id = c.job_posting_id
     WHERE jp.user_id = ?
     GROUP BY jp.id
     ORDER BY jp.created_at DESC`
  )
    .bind(user.id)
    .all();

  const jobPostings = results.map((row) => ({
    ...JobPostingSchema.parse(row),
    candidate_count: row.candidate_count || 0
  }));
  return c.json(jobPostings);
});

app.post("/api/job-postings", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  
  const validatedData = CreateJobPostingSchema.parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO job_postings (user_id, title, company, description, requirements, location, salary_range, employment_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      user.id,
      validatedData.title,
      validatedData.company,
      validatedData.description,
      validatedData.requirements || "",
      validatedData.location || "",
      validatedData.salary_range || "",
      validatedData.employment_type || ""
    )
    .run();

  const newJobPosting = await c.env.DB.prepare(
    "SELECT * FROM job_postings WHERE id = ?"
  )
    .bind(result.meta.last_row_id)
    .first();

  return c.json(JobPostingSchema.parse(newJobPosting), 201);
});

app.get("/api/job-postings/:id", async (c) => {
  const id = c.req.param("id");
  
  const jobPosting = await c.env.DB.prepare(
    "SELECT * FROM job_postings WHERE id = ? AND is_active = 1"
  )
    .bind(id)
    .first();

  if (!jobPosting) {
    return c.json({ error: "Job posting not found" }, 404);
  }

  return c.json(JobPostingSchema.parse(jobPosting));
});

app.get("/api/job-postings/:id/edit", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const id = c.req.param("id");
  
  const jobPosting = await c.env.DB.prepare(
    "SELECT * FROM job_postings WHERE id = ? AND user_id = ?"
  )
    .bind(id, user.id)
    .first();

  if (!jobPosting) {
    return c.json({ error: "Job posting not found" }, 404);
  }

  return c.json(JobPostingSchema.parse(jobPosting));
});

app.put("/api/job-postings/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const id = c.req.param("id");
  const body = await c.req.json();
  
  const validatedData = CreateJobPostingSchema.parse(body);

  const result = await c.env.DB.prepare(
    `UPDATE job_postings 
     SET title = ?, company = ?, description = ?, requirements = ?, 
         location = ?, salary_range = ?, employment_type = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`
  )
    .bind(
      validatedData.title,
      validatedData.company,
      validatedData.description,
      validatedData.requirements || "",
      validatedData.location || "",
      validatedData.salary_range || "",
      validatedData.employment_type || "",
      id,
      user.id
    )
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Job posting not found" }, 404);
  }

  const updatedJobPosting = await c.env.DB.prepare(
    "SELECT * FROM job_postings WHERE id = ?"
  )
    .bind(id)
    .first();

  return c.json(JobPostingSchema.parse(updatedJobPosting));
});

app.delete("/api/job-postings/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const id = c.req.param("id");

  const result = await c.env.DB.prepare(
    "DELETE FROM job_postings WHERE id = ? AND user_id = ?"
  )
    .bind(id, user.id)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Job posting not found" }, 404);
  }

  return c.json({ success: true });
});

app.post("/api/job-postings/:id/toggle-active", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const id = c.req.param("id");

  const jobPosting = await c.env.DB.prepare(
    "SELECT * FROM job_postings WHERE id = ? AND user_id = ?"
  )
    .bind(id, user.id)
    .first();

  if (!jobPosting) {
    return c.json({ error: "Job posting not found" }, 404);
  }

  const newStatus = jobPosting.is_active ? 0 : 1;
  
  await c.env.DB.prepare(
    "UPDATE job_postings SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(newStatus, id)
    .run();

  return c.json({ success: true, is_active: newStatus });
});

app.get("/api/job-postings/:id/candidates", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const jobId = c.req.param("id");

  // Verify user owns this job posting
  const jobPosting = await c.env.DB.prepare(
    "SELECT * FROM job_postings WHERE id = ? AND user_id = ?"
  )
    .bind(jobId, user.id)
    .first();

  if (!jobPosting) {
    return c.json({ error: "Job posting not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT c.*, ai.*, jp.title as job_title, jp.company as company_name
     FROM candidates c
     LEFT JOIN ai_screenings ai ON c.id = ai.candidate_id
     INNER JOIN job_postings jp ON c.job_posting_id = jp.id
     WHERE c.job_posting_id = ?
     ORDER BY c.created_at DESC`
  )
    .bind(jobId)
    .all();

  const candidatesWithScreenings = results.map((row) => {
    const candidate = {
      id: row.id,
      job_posting_id: row.job_posting_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      resume_text: row.resume_text,
      cover_letter: row.cover_letter,
      linkedin_url: row.linkedin_url,
      status: row.status || 'new',
      notes: row.notes || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      job_title: row.job_title,
      company_name: row.company_name,
      ai_screening: row.candidate_id ? {
        id: row.candidate_id,
        candidate_id: row.candidate_id,
        job_posting_id: row.job_posting_id,
        user_id: row.user_id,
        overall_score: row.overall_score,
        technical_skills_score: row.technical_skills_score,
        experience_score: row.experience_score,
        culture_fit_score: row.culture_fit_score,
        communication_score: row.communication_score,
        screening_summary: row.screening_summary,
        strengths: row.strengths,
        concerns: row.concerns,
        recommendation: row.recommendation,
        is_processed: row.is_processed,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } : null,
      video_screening: row.video_completed ? {
        is_completed: row.video_completed,
        overall_video_score: row.overall_video_score
      } : null,
    };
    
    return candidate;
  });

  return c.json(candidatesWithScreenings);
});

// Candidates endpoints
app.post("/api/job-postings/:jobId/candidates", async (c) => {
  const jobId = parseInt(c.req.param("jobId"));
  const body = await c.req.json();
  
  const validatedData = CreateCandidateSchema.parse({
    ...body,
    job_posting_id: jobId,
  });

  // Check if job posting exists and is active
  const jobPosting = await c.env.DB.prepare(
    "SELECT * FROM job_postings WHERE id = ? AND is_active = 1"
  )
    .bind(jobId)
    .first();

  if (!jobPosting) {
    return c.json({ error: "Job posting not found or inactive" }, 404);
  }

  const candidateResult = await c.env.DB.prepare(
    `INSERT INTO candidates (job_posting_id, first_name, last_name, email, phone, resume_text, cover_letter, linkedin_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      validatedData.job_posting_id,
      validatedData.first_name,
      validatedData.last_name,
      validatedData.email,
      validatedData.phone || "",
      validatedData.resume_text,
      validatedData.cover_letter || "",
      validatedData.linkedin_url || ""
    )
    .run();

  // Create AI screening record (unprocessed initially)
  await c.env.DB.prepare(
    `INSERT INTO ai_screenings (candidate_id, job_posting_id, user_id, is_processed)
     VALUES (?, ?, ?, 0)`
  )
    .bind(candidateResult.meta.last_row_id, jobId, jobPosting.user_id)
    .run();

  const newCandidate = await c.env.DB.prepare(
    "SELECT * FROM candidates WHERE id = ?"
  )
    .bind(candidateResult.meta.last_row_id)
    .first();

  return c.json(CandidateSchema.parse(newCandidate), 201);
});

app.get("/api/candidates", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    `SELECT c.*, ai.*, jp.title as job_title, jp.company as company_name,
            vs.is_completed as video_completed, vs.overall_video_score
     FROM candidates c
     LEFT JOIN ai_screenings ai ON c.id = ai.candidate_id
     LEFT JOIN video_screenings vs ON c.id = vs.candidate_id
     INNER JOIN job_postings jp ON c.job_posting_id = jp.id
     WHERE jp.user_id = ?
     ORDER BY c.created_at DESC`
  )
    .bind(user.id)
    .all();

  const candidatesWithScreenings = results.map((row) => {
    const candidate = {
      id: row.id,
      job_posting_id: row.job_posting_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      resume_text: row.resume_text,
      cover_letter: row.cover_letter,
      linkedin_url: row.linkedin_url,
      status: row.status || 'new',
      notes: row.notes || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      job_title: row.job_title,
      company_name: row.company_name,
      ai_screening: row.candidate_id ? {
        id: row.candidate_id,
        candidate_id: row.candidate_id,
        job_posting_id: row.job_posting_id,
        user_id: row.user_id,
        overall_score: row.overall_score,
        technical_skills_score: row.technical_skills_score,
        experience_score: row.experience_score,
        culture_fit_score: row.culture_fit_score,
        communication_score: row.communication_score,
        screening_summary: row.screening_summary,
        strengths: row.strengths,
        concerns: row.concerns,
        recommendation: row.recommendation,
        is_processed: row.is_processed,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } : null,
      video_screening: row.video_completed ? {
        is_completed: row.video_completed,
        overall_video_score: row.overall_video_score
      } : null,
    };
    
    return candidate;
  });

  return c.json(candidatesWithScreenings);
});

app.get("/api/candidates/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const candidateId = c.req.param("id");

  const row = await c.env.DB.prepare(
    `SELECT c.*, ai.*, jp.title as job_title, jp.company as company_name
     FROM candidates c
     LEFT JOIN ai_screenings ai ON c.id = ai.candidate_id
     INNER JOIN job_postings jp ON c.job_posting_id = jp.id
     WHERE c.id = ? AND jp.user_id = ?`
  )
    .bind(candidateId, user.id)
    .first();

  if (!row) {
    return c.json({ error: "Candidate not found" }, 404);
  }

  const candidate = {
    id: row.id,
    job_posting_id: row.job_posting_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    resume_text: row.resume_text,
    cover_letter: row.cover_letter,
    linkedin_url: row.linkedin_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    job_title: row.job_title,
    company_name: row.company_name,
    ai_screening: row.candidate_id ? {
      id: row.candidate_id,
      candidate_id: row.candidate_id,
      job_posting_id: row.job_posting_id,
      user_id: row.user_id,
      overall_score: row.overall_score,
      technical_skills_score: row.technical_skills_score,
      experience_score: row.experience_score,
      culture_fit_score: row.culture_fit_score,
      communication_score: row.communication_score,
      screening_summary: row.screening_summary,
      strengths: row.strengths,
      concerns: row.concerns,
      recommendation: row.recommendation,
      is_processed: row.is_processed,
      created_at: row.created_at,
      updated_at: row.updated_at,
    } : null,
  };

  return c.json(CandidateWithScreeningSchema.parse(candidate));
});

app.put("/api/candidates/:id/status", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const candidateId = c.req.param("id");
  const body = await c.req.json();

  // Verify user owns this candidate through job posting
  const candidate = await c.env.DB.prepare(
    `SELECT c.* FROM candidates c
     INNER JOIN job_postings jp ON c.job_posting_id = jp.id
     WHERE c.id = ? AND jp.user_id = ?`
  )
    .bind(candidateId, user.id)
    .first();

  if (!candidate) {
    return c.json({ error: "Candidate not found" }, 404);
  }

  await c.env.DB.prepare(
    "UPDATE candidates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(body.status, candidateId)
    .run();

  return c.json({ success: true });
});

app.put("/api/candidates/:id/notes", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const candidateId = c.req.param("id");
  const body = await c.req.json();

  // Verify user owns this candidate through job posting
  const candidate = await c.env.DB.prepare(
    `SELECT c.* FROM candidates c
     INNER JOIN job_postings jp ON c.job_posting_id = jp.id
     WHERE c.id = ? AND jp.user_id = ?`
  )
    .bind(candidateId, user.id)
    .first();

  if (!candidate) {
    return c.json({ error: "Candidate not found" }, 404);
  }

  await c.env.DB.prepare(
    "UPDATE candidates SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(body.notes, candidateId)
    .run();

  return c.json({ success: true });
});

// Dashboard endpoint
app.get("/api/dashboard", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Get total jobs
    const totalJobsResult = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM job_postings WHERE user_id = ?"
    ).bind(user.id).first();

    // Get total candidates
    const totalCandidatesResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM candidates c
       INNER JOIN job_postings jp ON c.job_posting_id = jp.id
       WHERE jp.user_id = ?`
    ).bind(user.id).first();

    // Get pending screenings
    const pendingScreeningsResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM ai_screenings ai
       INNER JOIN job_postings jp ON ai.job_posting_id = jp.id
       WHERE jp.user_id = ? AND ai.is_processed = 0`
    ).bind(user.id).first();

    // Get completed screenings
    const completedScreeningsResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM ai_screenings ai
       INNER JOIN job_postings jp ON ai.job_posting_id = jp.id
       WHERE jp.user_id = ? AND ai.is_processed = 1`
    ).bind(user.id).first();

    // Get average score
    const avgScoreResult = await c.env.DB.prepare(
      `SELECT AVG(overall_score) as avg_score FROM ai_screenings ai
       INNER JOIN job_postings jp ON ai.job_posting_id = jp.id
       WHERE jp.user_id = ? AND ai.is_processed = 1 AND ai.overall_score IS NOT NULL`
    ).bind(user.id).first();

    // Get recent activity
    const { results: recentActivity } = await c.env.DB.prepare(
      `SELECT 'application' as type, 
              'New application from ' || c.first_name || ' ' || c.last_name || ' for ' || jp.title as message,
              c.created_at as timestamp,
              c.id as id
       FROM candidates c
       INNER JOIN job_postings jp ON c.job_posting_id = jp.id
       WHERE jp.user_id = ?
       UNION ALL
       SELECT 'screening' as type,
              'AI screening completed for ' || c.first_name || ' ' || c.last_name as message,
              ai.updated_at as timestamp,
              ai.id as id
       FROM ai_screenings ai
       INNER JOIN candidates c ON ai.candidate_id = c.id
       INNER JOIN job_postings jp ON ai.job_posting_id = jp.id
       WHERE jp.user_id = ? AND ai.is_processed = 1
       ORDER BY timestamp DESC
       LIMIT 10`
    ).bind(user.id, user.id).all();

    return c.json({
      totalJobs: Number(totalJobsResult?.count) || 0,
      totalCandidates: Number(totalCandidatesResult?.count) || 0,
      pendingScreenings: Number(pendingScreeningsResult?.count) || 0,
      completedScreenings: Number(completedScreeningsResult?.count) || 0,
      avgScore: Math.round(Number(avgScoreResult?.avg_score) || 0),
      recentActivity: recentActivity || []
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    return c.json({ error: "Failed to fetch dashboard data" }, 500);
  }
});

// Job postings with candidate count
app.patch("/api/job-postings/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const id = c.req.param("id");
  const body = await c.req.json();

  const result = await c.env.DB.prepare(
    "UPDATE job_postings SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
  )
    .bind(body.is_active, id, user.id)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Job posting not found" }, 404);
  }

  return c.json({ success: true });
});

// AI Screening endpoint
app.post("/api/ai-screenings/:id/process", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const screeningId = parseInt(c.req.param("id"));

  // Get screening with candidate and job posting data
  const screening = await c.env.DB.prepare(
    `SELECT ai.*, c.*, jp.title, jp.description, jp.requirements
     FROM ai_screenings ai
     INNER JOIN candidates c ON ai.candidate_id = c.id
     INNER JOIN job_postings jp ON ai.job_posting_id = jp.id
     WHERE ai.id = ? AND ai.user_id = ? AND ai.is_processed = 0`
  )
    .bind(screeningId, user.id)
    .first();

  if (!screening) {
    return c.json({ error: "Screening not found or already processed" }, 404);
  }

  try {
    const openai = new OpenAI({
      apiKey: (c.env as any).OPENAI_API_KEY,
    });

    const prompt = `
You are an expert HR professional tasked with fairly evaluating a candidate for a job position. 
Please analyze the candidate's qualifications and provide an unbiased assessment.

Job Position: ${screening.title}
Job Description: ${screening.description}
Job Requirements: ${screening.requirements || "Not specified"}

Candidate Information:
Name: ${screening.first_name} ${screening.last_name}
Email: ${screening.email}
Resume: ${screening.resume_text}
Cover Letter: ${screening.cover_letter || "Not provided"}

Please provide scores from 1-100 for each category and detailed feedback:

1. Technical Skills Score (1-100): How well do the candidate's technical skills match the job requirements?
2. Experience Score (1-100): How relevant and valuable is their work experience?
3. Culture Fit Score (1-100): Based on their communication style and background, how well might they fit the company culture?
4. Communication Score (1-100): How effectively do they communicate in their application materials?

Also provide:
- Overall Score (1-100): A weighted average considering all factors
- Screening Summary: A brief 2-3 sentence overview
- Strengths: Key positive aspects of this candidate
- Concerns: Any potential areas of concern or gaps
- Recommendation: RECOMMEND, MAYBE, or NOT_RECOMMEND with brief reasoning

Focus on objective qualifications and avoid any bias based on name, gender, race, age, or other protected characteristics.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional providing fair and unbiased candidate evaluations. Respond in a structured format that can be easily parsed."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const aiResponse = response.choices[0].message.content;
    
    // Parse the AI response (this is a simplified parser)
    const parseScore = (text: string, label: string): number => {
      const regex = new RegExp(`${label}.*?:(.*?)(?:\\n|$)`, 'i');
      const match = text.match(regex);
      if (match) {
        const scoreMatch = match[1].match(/(\d+)/);
        return scoreMatch ? parseInt(scoreMatch[1]) : 50;
      }
      return 50;
    };

    const parseSection = (text: string, label: string): string => {
      const regex = new RegExp(`${label}:(.*?)(?=\\n[A-Z]|$)`, 'is');
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const responseText = aiResponse || "";
    const overallScore = parseScore(responseText, "Overall Score");
    const technicalScore = parseScore(responseText, "Technical Skills Score");
    const experienceScore = parseScore(responseText, "Experience Score");
    const cultureFitScore = parseScore(responseText, "Culture Fit Score");
    const communicationScore = parseScore(responseText, "Communication Score");
    
    const summary = parseSection(responseText, "Screening Summary");
    const strengths = parseSection(responseText, "Strengths");
    const concerns = parseSection(responseText, "Concerns");
    const recommendation = parseSection(responseText, "Recommendation");

    // Update the screening with AI results
    await c.env.DB.prepare(
      `UPDATE ai_screenings SET 
       overall_score = ?, technical_skills_score = ?, experience_score = ?, 
       culture_fit_score = ?, communication_score = ?, screening_summary = ?,
       strengths = ?, concerns = ?, recommendation = ?, is_processed = 1,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(
        overallScore,
        technicalScore, 
        experienceScore,
        cultureFitScore,
        communicationScore,
        summary,
        strengths,
        concerns,
        recommendation,
        screeningId
      )
      .run();

    const updatedScreening = await c.env.DB.prepare(
      "SELECT * FROM ai_screenings WHERE id = ?"
    )
      .bind(screeningId)
      .first();

    return c.json(AIScreeningSchema.parse(updatedScreening));

  } catch (error) {
    console.error("AI screening error:", error);
    return c.json({ error: "Failed to process AI screening" }, 500);
  }
});

export default app;
