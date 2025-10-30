import { useEffect, useState } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { useNavigate, useParams, Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  ExternalLink, 
  Brain,
  User,
  FileText,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Star,
  Download
} from "lucide-react";
import type { CandidateWithScreening } from "@/shared/types";

export default function CandidateDetail() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<CandidateWithScreening | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("new");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user && candidateId) {
      fetchCandidate();
    }
  }, [user, candidateId]);

  const fetchCandidate = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      if (response.ok) {
        const candidateData = await response.json();
        setCandidate(candidateData);
        // Set initial status and notes if they exist
        setStatus(candidateData.status || "new");
        setNotes(candidateData.notes || "");
      } else {
        navigate("/candidates");
      }
    } catch (error) {
      console.error("Failed to fetch candidate:", error);
      navigate("/candidates");
    } finally {
      setLoading(false);
    }
  };

  const processScreening = async () => {
    if (!candidate?.ai_screening) return;
    
    setProcessingId(candidate.ai_screening.id);
    try {
      const response = await fetch(`/api/ai-screenings/${candidate.ai_screening.id}/process`, {
        method: "POST",
      });
      
      if (response.ok) {
        await fetchCandidate();
      }
    } catch (error) {
      console.error("Failed to process screening:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const updateNotes = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        console.error("Failed to update notes");
      }
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const getRecommendationIcon = (recommendation: string) => {
    const lower = recommendation.toLowerCase();
    if (lower.includes("recommend") && !lower.includes("not")) {
      return <ThumbsUp className="w-5 h-5 text-green-600" />;
    }
    if (lower.includes("not")) {
      return <ThumbsDown className="w-5 h-5 text-red-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "reviewed": return "bg-yellow-100 text-yellow-800";
      case "interview": return "bg-purple-100 text-purple-800";
      case "hired": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isPending || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </Layout>
    );
  }

  if (!candidate) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate not found</h2>
          <p className="text-gray-600">This candidate may not exist or you don't have permission to view them.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/candidates")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {candidate.first_name} {candidate.last_name}
              </h1>
              <p className="text-gray-600 mt-2">
                Applied for <Link to={`/jobs/${candidate.job_posting_id}`} className="text-indigo-600 hover:text-indigo-700">{candidate.job_title}</Link> at {candidate.company_name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${candidate.email}`} className="text-indigo-600 hover:text-indigo-700">
                    {candidate.email}
                  </a>
                </div>
                
                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${candidate.phone}`} className="text-indigo-600 hover:text-indigo-700">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                
                {candidate.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <a 
                      href={candidate.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume
                </h2>
                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {candidate.resume_text}
                </pre>
              </div>
            </div>

            {/* Cover Letter */}
            {candidate.cover_letter && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {candidate.cover_letter}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions and AI Screening */}
          <div className="space-y-8">
            {/* Status Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Candidate</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="interview">Interview</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={updateNotes}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add private notes about this candidate..."
                  />
                </div>
              </div>
            </div>

            {/* AI Screening */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {candidate.ai_screening?.is_processed ? (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">AI Screening Results</h3>
                  </div>
                  
                  {/* Overall Score */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Overall Score</span>
                      <div className={`px-4 py-2 rounded-full text-lg font-bold border ${getScoreColor(candidate.ai_screening.overall_score || 0)}`}>
                        {candidate.ai_screening.overall_score}/100
                      </div>
                    </div>
                  </div>

                  {/* Individual Scores */}
                  <div className="space-y-3 mb-6">
                    {[
                      { label: "Technical Skills", score: candidate.ai_screening.technical_skills_score },
                      { label: "Experience", score: candidate.ai_screening.experience_score },
                      { label: "Culture Fit", score: candidate.ai_screening.culture_fit_score },
                      { label: "Communication", score: candidate.ai_screening.communication_score },
                    ].map(({ label, score }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${score && score >= 80 ? 'bg-green-500' : score && score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${score || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{score || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  {candidate.ai_screening.recommendation && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getRecommendationIcon(candidate.ai_screening.recommendation)}
                        <span className="font-medium text-gray-900">Recommendation</span>
                      </div>
                      <p className="text-sm text-gray-700">{candidate.ai_screening.recommendation}</p>
                    </div>
                  )}

                  {/* Summary */}
                  {candidate.ai_screening.screening_summary && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        {candidate.ai_screening.screening_summary}
                      </p>
                    </div>
                  )}

                  {/* Strengths */}
                  {candidate.ai_screening.strengths && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                        <Star className="w-4 h-4 text-green-600" />
                        Strengths
                      </h4>
                      <p className="text-sm text-gray-700 bg-green-50 rounded-lg p-3">
                        {candidate.ai_screening.strengths}
                      </p>
                    </div>
                  )}

                  {/* Concerns */}
                  {candidate.ai_screening.concerns && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Concerns
                      </h4>
                      <p className="text-sm text-gray-700 bg-yellow-50 rounded-lg p-3">
                        {candidate.ai_screening.concerns}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Screening</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Process this candidate with AI to get detailed insights and scoring.
                  </p>
                  <button
                    onClick={processScreening}
                    disabled={processingId === candidate.ai_screening?.id}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processingId === candidate.ai_screening?.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Brain className="w-5 h-5" />
                    )}
                    {processingId === candidate.ai_screening?.id ? "Processing..." : "Process with AI"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
