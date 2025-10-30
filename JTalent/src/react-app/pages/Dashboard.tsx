import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Briefcase, 
  Users, 
  Clock, 
  TrendingUp,
  BarChart3,
  Activity,
  Video,
  Brain
} from "lucide-react";
import { useLanguage } from "@/react-app/hooks/useLanguage";

interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  pendingScreenings: number;
  completedScreenings: number;
  avgScore: number;
  recentActivity: Array<{
    id: number;
    type: 'application' | 'screening' | 'video';
    message: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalCandidates: 0,
    pendingScreenings: 0,
    completedScreenings: 0,
    avgScore: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: t('dashboard.totalJobs'),
      value: stats.totalJobs.toString(),
      icon: Briefcase,
      color: "blue",
      trend: "+12%"
    },
    {
      title: t('dashboard.totalCandidates'),
      value: stats.totalCandidates.toString(),
      icon: Users,
      color: "green",
      trend: "+8%"
    },
    {
      title: t('dashboard.pendingScreenings'),
      value: stats.pendingScreenings.toString(),
      icon: Clock,
      color: "yellow",
      trend: "-5%"
    },
    {
      title: "Avg AI Score",
      value: `${stats.avgScore}/100`,
      icon: Brain,
      color: "purple",
      trend: "+3%"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
      yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`space-y-8 ${isRTL ? 'font-arabic' : ''}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Welcome back, {user?.google_user_data.given_name || 'User'}! Here's your hiring overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/jobs/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t('jobs.createNew')}
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border ${getColorClasses(stat.color)} bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('dashboard.recentActivity')}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {stats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'application' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          activity.type === 'screening' ? 'bg-green-100 dark:bg-green-900/30' :
                          'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          {activity.type === 'application' && <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                          {activity.type === 'screening' && <Brain className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          {activity.type === 'video' && <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white">{activity.message}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Screening Accuracy</span>
                  <span className="font-semibold text-gray-900 dark:text-white">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Time Saved</span>
                  <span className="font-semibold text-gray-900 dark:text-white">32 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Top Skill Gap</span>
                  <span className="font-semibold text-gray-900 dark:text-white">React.js</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/jobs/create"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    Post New Job
                  </span>
                </Link>
                <Link
                  to="/candidates"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <Users className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    Review Candidates
                  </span>
                </Link>
                <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group w-full text-left">
                  <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    View Analytics
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
