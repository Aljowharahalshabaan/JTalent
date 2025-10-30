
CREATE TABLE ai_screenings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  job_posting_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  overall_score INTEGER,
  technical_skills_score INTEGER,
  experience_score INTEGER,
  culture_fit_score INTEGER,
  communication_score INTEGER,
  screening_summary TEXT,
  strengths TEXT,
  concerns TEXT,
  recommendation TEXT,
  is_processed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_screenings_candidate_id ON ai_screenings(candidate_id);
CREATE INDEX idx_ai_screenings_job_posting_id ON ai_screenings(job_posting_id);
CREATE INDEX idx_ai_screenings_user_id ON ai_screenings(user_id);
CREATE INDEX idx_ai_screenings_is_processed ON ai_screenings(is_processed);
