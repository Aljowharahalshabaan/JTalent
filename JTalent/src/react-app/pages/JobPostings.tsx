import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  MoreVertical
} from "lucide-react";
import { useLanguage } from "@/react-app/hooks/useLanguage";

interface JobPosting {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  salary_range: string;
  employment_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  candidate_count?: number;
}

export default function JobPostings() {
  const { } = useAuth();
  const { t, isRTL } = useLanguage();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/job-postings");
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
          setFilteredJobs(data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(job => 
        filterStatus === "active" ? job.is_active : !job.is_active
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filterStatus]);

  const handleDelete = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    
    try {
      const response = await fetch(`/api/job-postings/${jobId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const toggleJobStatus = async (jobId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/job-postings/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, is_active: !isActive } : job
        ));
      }
    } catch (error) {
      console.error("Failed to update job status:", error);
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
              {t('jobs.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your job postings and track applications
            </p>
          </div>
          <Link
            to="/jobs/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('jobs.createNew')}
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`${t('common.search')} jobs...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('common.all')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.is_active 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {job.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary_range}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.candidate_count || 0} applicants
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title={t('common.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/jobs/${job.id}/edit`}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleJobStatus(job.id, job.is_active)}
                      className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                      title={job.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No job postings found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first job posting"
                }
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Link
                  to="/jobs/create"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('jobs.createNew')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
