import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Search, 
  Filter,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Video,
  Brain
} from "lucide-react";
import { useLanguage } from "@/react-app/hooks/useLanguage";

interface Candidate {
  id: number;
  job_posting_id: number;
  job_title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  resume_text: string;
  cover_letter: string;
  linkedin_url: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  ai_screening?: {
    overall_score: number;
    technical_skills_score: number;
    experience_score: number;
    culture_fit_score: number;
    communication_score: number;
    recommendation: string;
    is_processed: boolean;
  };
  video_screening?: {
    is_completed: boolean;
    overall_video_score: number;
  };
}

export default function Candidates() {
  const { } = useAuth();
  const { t, isRTL } = useLanguage();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterScore, setFilterScore] = useState<string>("all");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("/api/candidates");
        if (response.ok) {
          const data = await response.json();
          setCandidates(data);
          setFilteredCandidates(data);
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
    let filtered = candidates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.job_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(candidate => candidate.status === filterStatus);
    }

    // Filter by score
    if (filterScore !== "all") {
      filtered = filtered.filter(candidate => {
        if (!candidate.ai_screening?.overall_score) return false;
        const score = candidate.ai_screening.overall_score;
        switch (filterScore) {
          case "high": return score >= 80;
          case "medium": return score >= 60 && score < 80;
          case "low": return score < 60;
          default: return true;
        }
      });
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, filterStatus, filterScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
    return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "reviewed": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "interview": return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      case "hired": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "rejected": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`space-y-6 ${isRTL ? 'font-arabic' : ''}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('candidates.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Review and manage candidate applications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredCandidates.length} of {candidates.length} candidates
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`${t('common.search')} candidates...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('common.all')} Status</option>
                <option value="new">{t('common.new')}</option>
                <option value="reviewed">Reviewed</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Scores</option>
              <option value="high">High (80+)</option>
              <option value="medium">Medium (60-79)</option>
              <option value="low">Low (&lt;60)</option>
            </select>
          </div>
        </div>

        {/* Candidates List */}
        <div className="grid gap-6">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {candidate.first_name[0]}{candidate.last_name[0]}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {candidate.first_name} {candidate.last_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          Applied for: <span className="font-medium">{candidate.job_title}</span>
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {candidate.email}
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {candidate.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(candidate.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {/* AI Screening Scores */}
                        {candidate.ai_screening?.is_processed && (
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">AI Score:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(candidate.ai_screening.overall_score)}`}>
                                {candidate.ai_screening.overall_score}/100
                              </span>
                            </div>
                            
                            {candidate.video_screening?.is_completed && (
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">Video:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(candidate.video_screening.overall_video_score)}`}>
                                  {candidate.video_screening.overall_video_score}/100
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className={`text-xs font-medium ${
                                candidate.ai_screening.recommendation === 'RECOMMEND' ? 'text-green-600 dark:text-green-400' :
                                candidate.ai_screening.recommendation === 'MAYBE' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {candidate.ai_screening.recommendation}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Skills breakdown */}
                        {candidate.ai_screening?.is_processed && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {candidate.ai_screening.technical_skills_score}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Technical</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {candidate.ai_screening.experience_score}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Experience</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {candidate.ai_screening.culture_fit_score}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Culture Fit</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {candidate.ai_screening.communication_score}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Communication</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/candidates/${candidate.id}`}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {t('common.view')}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No candidates found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterStatus !== "all" || filterScore !== "all"
                  ? "Try adjusting your search or filters"
                  : "Candidates will appear here when they apply to your job postings"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
