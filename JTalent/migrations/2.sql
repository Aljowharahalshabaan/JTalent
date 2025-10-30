
CREATE TABLE candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_posting_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_text TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_job_posting_id ON candidates(job_posting_id);
CREATE INDEX idx_candidates_email ON candidates(email);
