import { useEffect, useState } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { useNavigate, useParams, Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  ArrowLeft, 
  Edit, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Users,
  ExternalLink
} from "lucide-react";
import type { JobPosting, CandidateWithScreening } from "@/shared/types";

export default function ViewJob() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
  const [candidates, setCandidates] = useState<CandidateWithScreening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user && jobId) {
      fetchJobData();
    }
  }, [user, jobId]);

  const fetchJobData = async () => {
    try {
      const [jobResponse, candidatesResponse] = await Promise.all([
        fetch(`/api/job-postings/${jobId}/edit`),
        fetch(`/api/job-postings/${jobId}/candidates`)
      ]);

      if (jobResponse.ok) {
        const job = await jobResponse.json();
        setJobPosting(job);
      } else {
        navigate("/jobs");
        return;
      }

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        setCandidates(candidatesData);
      }
    } catch (error) {
      console.error("Failed to fetch job data:", error);
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const getApplicationUrl = () => {
    return `${window.location.origin}/apply/${jobId}`;
  };

  const copyApplicationUrl = () => {
    navigator.clipboard.writeText(getApplicationUrl());
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

  if (!jobPosting) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
          <p className="text-gray-600">This job posting may not exist or you don't have permission to view it.</p>
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
              onClick={() => navigate("/jobs")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{jobPosting.title}</h1>
              <p className="text-gray-600 mt-2">
                {jobPosting.company} • {candidates.length} applicant{candidates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <a
              href={getApplicationUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Page
            </a>
            <Link
              to={`/jobs/${jobId}/edit`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Job
            </Link>
          </div>
        </div>

        {/* Job Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                jobPosting.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {jobPosting.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-8">
            {jobPosting.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {jobPosting.location}
              </div>
            )}
            {jobPosting.employment_type && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {jobPosting.employment_type}
              </div>
            )}
            {jobPosting.salary_range && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {jobPosting.salary_range}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Posted {new Date(jobPosting.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{jobPosting.description}</p>
            </div>

            {jobPosting.requirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{jobPosting.requirements}</p>
              </div>
            )}
          </div>

          {/* Application URL */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Public Application URL</h4>
                <p className="text-sm text-gray-600">Share this link with candidates to apply</p>
              </div>
              <button
                onClick={copyApplicationUrl}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Copy Link
              </button>
            </div>
            <div className="mt-3 p-2 bg-white border border-gray-200 rounded text-sm text-gray-700 font-mono break-all">
              {getApplicationUrl()}
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Applicants</h2>
                <p className="text-gray-600 mt-1">
                  {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} have applied for this position
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-5 h-5" />
                <span className="font-medium">{candidates.length}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600">Candidates will appear here when they apply to this job posting.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <Link
                    key={candidate.id}
                    to={`/candidates/${candidate.id}`}
                    className="block p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {candidate.first_name} {candidate.last_name}
                          </h4>
                          {candidate.ai_screening?.is_processed ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              AI Processed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{candidate.email}</p>
                        <p className="text-gray-700 text-sm line-clamp-2">{candidate.resume_text}</p>
                      </div>
                      {candidate.ai_screening?.is_processed && (
                        <div className="ml-6 text-right">
                          <div className="text-sm text-gray-600 mb-1">Overall Score</div>
                          <div className="text-2xl font-bold text-indigo-600">
                            {candidate.ai_screening.overall_score}/100
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
