import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { 
  Brain, 
  Users, 
  Zap, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle,
  Video,
  Star,
  Moon,
  Sun,
  Globe
} from "lucide-react";
import { useTheme } from "@/react-app/hooks/useTheme";
import { useLanguage } from "@/react-app/hooks/useLanguage";

export default function Home() {
  const { user, redirectToLogin, isPending } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: t('features.aiScreening'),
      description: t('features.aiScreeningDesc')
    },
    {
      icon: Shield,
      title: t('features.biasFreeval'),
      description: t('features.biasFreevalDesc')
    },
    {
      icon: Video,
      title: t('features.videoQA'),
      description: t('features.videoQADesc')
    },
    {
      icon: Star,
      title: t('features.scorecards'),
      description: t('features.scorecardsDesc')
    },
    {
      icon: Users,
      title: t('features.collaboration'),
      description: t('features.collaborationDesc')
    },
    {
      icon: Clock,
      title: t('features.timeSaver'),
      description: t('features.timeSaverDesc')
    }
  ];

  const benefits = [
    "Screen candidates 10x faster than manual review",
    "Eliminate unconscious bias in hiring decisions", 
    "Standardized evaluation criteria across all roles",
    "Video Q&A screening with AI analysis",
    "Detailed candidate insights and recommendations",
    "Easy integration with existing hiring workflows"
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors ${isRTL ? 'font-arabic' : ''}`}>
      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1 p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{language.toUpperCase()}</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Zap className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-white/80 shadow-lg"></div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={redirectToLogin}
                className="group bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                {t('home.getStarted')}
                <ArrowRight className={`w-5 h-5 group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform`} />
              </button>
              <button className="text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200">
                {t('home.watchDemo')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative -mt-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              {t('home.revolutionize')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors">
              {t('home.revolutionizeDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Choose JTalent?
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Transform your hiring process with AI that understands what makes a great candidate, 
                while eliminating bias and accelerating decisions.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <span className="text-blue-100 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="text-6xl font-bold text-yellow-400 mb-2">90%</div>
                <div className="text-white text-xl mb-6">Time Reduction</div>
                <div className="h-px bg-white/20 mb-6"></div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-white">10x</div>
                    <div className="text-blue-200">Faster Screening</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">100%</div>
                    <div className="text-blue-200">Bias-Free</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto transition-colors">
            Join forward-thinking HR teams who are already using AI to find the best candidates faster and more fairly.
          </p>
          <button
            onClick={redirectToLogin}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            Start Free Trial
            <ArrowRight className={`w-6 h-6 group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform`} />
          </button>
        </div>
      </div>
    </div>
  );
}
