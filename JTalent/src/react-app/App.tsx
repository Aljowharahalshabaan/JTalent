import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { ThemeProvider } from "@/react-app/hooks/useTheme";
import { LanguageProvider } from "@/react-app/hooks/useLanguage";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import JobPostingsPage from "@/react-app/pages/JobPostings";
import CreateJobPage from "@/react-app/pages/CreateJob";
import EditJobPage from "@/react-app/pages/EditJob";
import ViewJobPage from "@/react-app/pages/ViewJob";
import CandidatesPage from "@/react-app/pages/Candidates";
import CandidateDetailPage from "@/react-app/pages/CandidateDetail";
import ApplyPage from "@/react-app/pages/Apply";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/jobs" element={<JobPostingsPage />} />
              <Route path="/jobs/create" element={<CreateJobPage />} />
              <Route path="/jobs/:jobId" element={<ViewJobPage />} />
              <Route path="/jobs/:jobId/edit" element={<EditJobPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/candidates/:candidateId" element={<CandidateDetailPage />} />
              <Route path="/apply/:jobId" element={<ApplyPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
