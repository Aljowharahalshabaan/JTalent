import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock,
  Building,
  Send,
  CheckCircle
} from "lucide-react";
import type { JobPosting, CreateCandidate } from "@/shared/types";

export default function Apply() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Omit<CreateCandidate, "job_posting_id">>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    resume_text: "",
    cover_letter: "",
    linkedin_url: "",
  });

  useEffect(() => {
    if (jobId) {
      fetchJobPosting();
    }
  }, [jobId]);

  const fetchJobPosting = async () => {
    try {
      const response = await fetch(`/api/job-postings/${jobId}`);
      if (response.ok) {
        const job = await response.json();
        setJobPosting(job);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to fetch job posting:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/job-postings/${jobId}/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        console.error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!jobPosting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
          <p className="text-gray-600">This job posting may no longer be available.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to {jobPosting.title} at {jobPosting.company}. 
            Your application will be reviewed by our AI screening system and the hiring team.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Job Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {jobPosting.title}
              </h1>
              <div className="flex items-center gap-2 text-lg text-gray-700 mb-4">
                <Building className="w-5 h-5" />
                {jobPosting.company}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            {jobPosting.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {jobPosting.location}
              </div>
            )}
            {jobPosting.employment_type && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {jobPosting.employment_type}
              </div>
            )}
            {jobPosting.salary_range && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {jobPosting.salary_range}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Posted {new Date(jobPosting.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{jobPosting.description}</p>
            </div>

            {jobPosting.requirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{jobPosting.requirements}</p>
              </div>
            )}
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for this position</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              {/* Resume & Cover Letter */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Application Materials</h3>
                
                <div>
                  <label htmlFor="resume_text" className="block text-sm font-medium text-gray-700 mb-2">
                    Resume/CV Text *
                  </label>
                  <textarea
                    id="resume_text"
                    name="resume_text"
                    value={formData.resume_text}
                    onChange={handleChange}
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Paste your resume content here, including your experience, education, skills, etc."
                  />
                </div>
                
                <div>
                  <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    id="cover_letter"
                    name="cover_letter"
                    value={formData.cover_letter}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write a brief cover letter explaining why you're interested in this position..."
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {submitting ? "Submitting Application..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
