
CREATE TABLE video_screenings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  job_posting_id INTEGER NOT NULL,
  questions TEXT NOT NULL,
  video_responses TEXT,
  ai_analysis TEXT,
  communication_score INTEGER,
  confidence_score INTEGER,
  response_quality_score INTEGER,
  overall_video_score INTEGER,
  is_completed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
