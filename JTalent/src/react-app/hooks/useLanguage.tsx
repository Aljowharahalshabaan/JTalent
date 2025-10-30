import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.jobs': 'Job Postings',
    'nav.candidates': 'Candidates',
    'nav.signOut': 'Sign Out',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.new': 'New',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    
    // Home Page
    'home.title': 'JTalent',
    'home.subtitle': 'AI-powered hiring assistant for faster and fairer recruitment',
    'home.getStarted': 'Get Started Free',
    'home.watchDemo': 'Watch Demo',
    'home.revolutionize': 'Revolutionize Your Hiring Process',
    'home.revolutionizeDesc': 'Leverage cutting-edge AI to identify the best candidates while ensuring fair and unbiased evaluation',
    
    // Features
    'features.aiScreening': 'AI-Powered Screening',
    'features.aiScreeningDesc': 'Advanced AI analyzes resumes and applications to identify top candidates automatically.',
    'features.biasFreeval': 'Bias-Free Evaluation', 
    'features.biasFreevalDesc': 'Objective scoring eliminates unconscious bias for fair and equitable hiring decisions.',
    'features.videoQA': 'Video Q&A Screening',
    'features.videoQADesc': 'Automated video interviews with AI analysis of responses and communication skills.',
    'features.scorecards': 'Smart Scorecards',
    'features.scorecardsDesc': 'Comprehensive scoring across technical skills, experience, culture fit, and communication.',
    'features.collaboration': 'Team Collaboration',
    'features.collaborationDesc': 'Share candidate insights with your hiring team for better decision-making.',
    'features.timeSaver': 'Save Time',
    'features.timeSaverDesc': 'Reduce manual screening time by 90% while improving candidate quality.',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.totalJobs': 'Total Jobs',
    'dashboard.totalCandidates': 'Total Candidates',
    'dashboard.pendingScreenings': 'Pending Screenings',
    'dashboard.recentActivity': 'Recent Activity',
    
    // Jobs
    'jobs.title': 'Job Postings',
    'jobs.createNew': 'Create New Job',
    'jobs.jobTitle': 'Job Title',
    'jobs.company': 'Company',
    'jobs.location': 'Location',
    'jobs.type': 'Type',
    'jobs.salary': 'Salary Range',
    'jobs.status': 'Status',
    'jobs.actions': 'Actions',
    'jobs.description': 'Description',
    'jobs.requirements': 'Requirements',
    'jobs.employmentType': 'Employment Type',
    
    // Candidates
    'candidates.title': 'Candidates',
    'candidates.name': 'Name',
    'candidates.email': 'Email',
    'candidates.phone': 'Phone',
    'candidates.appliedFor': 'Applied For',
    'candidates.overallScore': 'Overall Score',
    'candidates.status': 'Status',
    'candidates.appliedOn': 'Applied On',
    'candidates.resume': 'Resume',
    'candidates.coverLetter': 'Cover Letter',
    'candidates.linkedin': 'LinkedIn',
    'candidates.notes': 'Notes',
    
    // AI Screening
    'screening.overallScore': 'Overall Score',
    'screening.technicalSkills': 'Technical Skills',
    'screening.experience': 'Experience',
    'screening.cultureFit': 'Culture Fit',
    'screening.communication': 'Communication',
    'screening.summary': 'Summary',
    'screening.strengths': 'Strengths',
    'screening.concerns': 'Concerns',
    'screening.recommendation': 'Recommendation',
    'screening.pending': 'Screening Pending',
    'screening.completed': 'Screening Completed',
    
    // Video Q&A
    'video.title': 'Video Q&A Screening',
    'video.questions': 'Questions',
    'video.responses': 'Responses',
    'video.analysis': 'AI Analysis',
    'video.communicationScore': 'Communication Score',
    'video.confidenceLevel': 'Confidence Level',
    'video.responseQuality': 'Response Quality',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.jobs': 'الوظائف',
    'nav.candidates': 'المرشحين',
    'nav.signOut': 'تسجيل خروج',
    
    // Common
    'common.loading': 'جارٍ التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.create': 'إنشاء',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.all': 'الكل',
    'common.new': 'جديد',
    'common.active': 'نشط',
    'common.inactive': 'غير نشط',
    
    // Home Page
    'home.title': 'جي تالنت',
    'home.subtitle': 'مساعد التوظيف بالذكاء الاصطناعي للتوظيف الأسرع والأكثر عدالة',
    'home.getStarted': 'ابدأ مجاناً',
    'home.watchDemo': 'شاهد العرض',
    'home.revolutionize': 'ثورة في عملية التوظيف',
    'home.revolutionizeDesc': 'استخدم الذكاء الاصطناعي المتطور لتحديد أفضل المرشحين مع ضمان التقييم العادل والموضوعي',
    
    // Features
    'features.aiScreening': 'فرز بالذكاء الاصطناعي',
    'features.aiScreeningDesc': 'ذكاء اصطناعي متقدم يحلل السير الذاتية والطلبات لتحديد أفضل المرشحين تلقائياً.',
    'features.biasFreeval': 'تقييم خالٍ من التحيز',
    'features.biasFreevalDesc': 'التقييم الموضوعي يلغي التحيز اللاواعي لقرارات توظيف عادلة ومنصفة.',
    'features.videoQA': 'فرز بالفيديو والأسئلة',
    'features.videoQADesc': 'مقابلات فيديو آلية مع تحليل ذكي للإجابات ومهارات التواصل.',
    'features.scorecards': 'بطاقات تقييم ذكية',
    'features.scorecardsDesc': 'تقييم شامل للمهارات التقنية والخبرة والملاءمة الثقافية والتواصل.',
    'features.collaboration': 'تعاون الفريق',
    'features.collaborationDesc': 'شارك رؤى المرشحين مع فريق التوظيف لاتخاذ قرارات أفضل.',
    'features.timeSaver': 'توفير الوقت',
    'features.timeSaverDesc': 'قلل وقت الفرز اليدوي بنسبة 90% مع تحسين جودة المرشحين.',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.totalJobs': 'إجمالي الوظائف',
    'dashboard.totalCandidates': 'إجمالي المرشحين',
    'dashboard.pendingScreenings': 'فرز في الانتظار',
    'dashboard.recentActivity': 'النشاط الحديث',
    
    // Jobs
    'jobs.title': 'الوظائف',
    'jobs.createNew': 'إنشاء وظيفة جديدة',
    'jobs.jobTitle': 'المسمى الوظيفي',
    'jobs.company': 'الشركة',
    'jobs.location': 'الموقع',
    'jobs.type': 'النوع',
    'jobs.salary': 'نطاق الراتب',
    'jobs.status': 'الحالة',
    'jobs.actions': 'الإجراءات',
    'jobs.description': 'الوصف',
    'jobs.requirements': 'المتطلبات',
    'jobs.employmentType': 'نوع التوظيف',
    
    // Candidates
    'candidates.title': 'المرشحين',
    'candidates.name': 'الاسم',
    'candidates.email': 'البريد الإلكتروني',
    'candidates.phone': 'الهاتف',
    'candidates.appliedFor': 'تقدم لوظيفة',
    'candidates.overallScore': 'النتيجة الإجمالية',
    'candidates.status': 'الحالة',
    'candidates.appliedOn': 'تاريخ التقديم',
    'candidates.resume': 'السيرة الذاتية',
    'candidates.coverLetter': 'خطاب التغطية',
    'candidates.linkedin': 'لينكد إن',
    'candidates.notes': 'ملاحظات',
    
    // AI Screening
    'screening.overallScore': 'النتيجة الإجمالية',
    'screening.technicalSkills': 'المهارات التقنية',
    'screening.experience': 'الخبرة',
    'screening.cultureFit': 'الملاءمة الثقافية',
    'screening.communication': 'التواصل',
    'screening.summary': 'الملخص',
    'screening.strengths': 'نقاط القوة',
    'screening.concerns': 'المخاوف',
    'screening.recommendation': 'التوصية',
    'screening.pending': 'فرز في الانتظار',
    'screening.completed': 'تم الفرز',
    
    // Video Q&A
    'video.title': 'فرز الفيديو والأسئلة',
    'video.questions': 'الأسئلة',
    'video.responses': 'الإجابات',
    'video.analysis': 'تحليل الذكاء الاصطناعي',
    'video.communicationScore': 'درجة التواصل',
    'video.confidenceLevel': 'مستوى الثقة',
    'video.responseQuality': 'جودة الإجابة',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jtalent-language');
      if (stored === 'en' || stored === 'ar') return stored;
      return navigator.language.startsWith('ar') ? 'ar' : 'en';
    }
    return 'en';
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const isRTL = language === 'ar';

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('jtalent-language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
