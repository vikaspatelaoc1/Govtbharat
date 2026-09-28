import { getDomainName, getDomainNameLowercase } from '../utils/domain';
import React, { useState, useEffect, useMemo } from 'react';
import { normalizeExternalUrl } from '../utils/urlUtils';
import { 
  Sparkles, Wand2, Check, ArrowLeft, ArrowRight, Save, Eye, X, 
  Plus, Trash2, Calendar, DollarSign, GraduationCap, Building2, 
  Users, FileText, Link, Shield, Briefcase, HelpCircle, RefreshCw,
  Clock, AlertCircle, Share2, Download, ExternalLink, CheckCircle2
} from 'lucide-react';
import { JobAlert, JobCategory, PostWiseVacancy } from '../types';
import { DateInputWithPicker } from './DateInputWithPicker';
import { enrichJobDetails, cleanOfficialUrl } from '../utils/jobEnricher';
import { loadJobsFromLocalStorage } from '../utils/jobStorage';
import { PopularCategoriesAndTrafficAnalytics } from './PopularCategoriesAndTrafficAnalytics';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobAlert) => void;
  editingJob: JobAlert | null;
}

const ALL_INDIAN_STATES = [
  'Central',
  'Uttar Pradesh',
  'UP',
  'Bihar',
  'Delhi',
  'Madhya Pradesh',
  'Rajasthan',
  'Haryana',
  'Punjab',
  'Jharkhand',
  'Uttarakhand',
  'Chhattisgarh',
  'West Bengal',
  'Gujarat',
  'Maharashtra',
  'Odisha',
  'Assam',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'Karnataka',
  'Kerala',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Ladakh',
  'Goa',
  'Tripura',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Chandigarh',
  'Puducherry',
  'Andaman and Nicobar Islands',
  'Arunachal Pradesh',
  'Sikkim',
  'Other'
];

type AdminTab = 'basic' | 'dates-fees' | 'age-eligibility' | 'vacancies' | 'salary-selection' | 'instructions-docs' | 'links' | 'preview';

const TAB_LIST: { id: AdminTab; label: string; shortLabel: string; icon: any }[] = [
  { id: 'basic', label: '1. Basic Info & Org', shortLabel: 'Basic Info', icon: Building2 },
  { id: 'dates-fees', label: '2. Dates & Fees', shortLabel: 'Dates & Fees', icon: Calendar },
  { id: 'age-eligibility', label: '3. Age & Qualification', shortLabel: 'Age & Eligibility', icon: GraduationCap },
  { id: 'vacancies', label: '4. Vacancy & Reservation', shortLabel: 'Vacancies', icon: Users },
  { id: 'salary-selection', label: '5. Salary & Selection', shortLabel: 'Salary & Selection', icon: Briefcase },
  { id: 'instructions-docs', label: '6. How To Apply & Docs', shortLabel: 'Apply & Docs', icon: FileText },
  { id: 'links', label: '7. Official Links', shortLabel: 'Official Links', icon: Link },
  { id: 'preview', label: '8. Live Preview', shortLabel: 'Preview', icon: Eye },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onSave, editingJob }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const formatInitialDate = (dateStr?: string) => {
    if (!dateStr) {
      const today = new Date();
      const d = String(today.getDate()).padStart(2, '0');
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const y = today.getFullYear();
      return `${d}-${m}-${y}`;
    }
    return dateStr;
  };

  const getInitialJobState = (): Partial<JobAlert> => ({
    title: '',
    category: 'latest-jobs',
    state: 'Central',
    orgName: '',
    postName: '',
    advtNo: '',
    totalVacancies: '',
    status: 'Application Open',
    isNew: true,
    shortInfo: '',
    postDate: formatInitialDate(),
    dates: {
      start: '',
      last: '',
      feeLast: '',
      correctionDate: '',
      examDate: '',
      admitCardDate: '',
      answerKeyDate: '',
      resultDate: '',
    },
    fees: {
      general: '₹100/-',
      scSt: '₹0/- (Exempted)',
      female: '₹0/- (Exempted)',
      paymentMode: 'Pay the Examination Fee Through Online Mode (Debit Card / Credit Card / Net Banking / UPI / E-Challan).',
    },
    ageLimit: {
      min: '18 Years',
      max: '27-32 Years (Post Wise)',
      asOn: `01-08-${new Date().getFullYear()}`,
      relaxation: 'Age Relaxation Extra as per Recruitment Rules (OBC: 3 Years, SC/ST: 5 Years, PwD: 10 Years).',
      details: '',
    },
    eligibility: '',
    qualifications: [],
    postWiseVacancies: [
      {
        postName: 'General Staff / Assistant',
        total: '500',
        general: 200,
        ews: 50,
        obc: 135,
        sc: 75,
        st: 40,
        eligibility: 'Bachelor Degree in Any Stream from Any Recognized University in India.'
      }
    ],
    salary: 'Pay Level-6 (₹35,400 to ₹1,12,400/-) + DA, HRA as per Central/State Government rules.',
    payScale: 'Pay Level-6 (₹35,400 to ₹1,12,400/-) + DA, HRA as per Central/State Government rules.',
    selectionProcess: [
      'Tier-I Computer Based Written Exam (CBT)',
      'Tier-II Main Examination / Skill Test',
      'Document Verification (DV)',
      'Medical Fitness Examination'
    ],
    howToApply: [
      'Interested candidates can apply online between the announced start and last dates.',
      'Candidates must carefully read the full official recruitment notification before filling the online form.',
      'Check and collect all required documents: Eligibility proof, ID proof, Address details, and Basic details.',
      'Keep scanned copies ready: Passport photo, Signature, ID Proof, 10th Certificate, Degree Marksheet.',
      'Before submitting the application form, preview and check all columns carefully.',
      'Pay the required application fee if applicable. Incomplete forms without fee will not be accepted.',
      'Take a clear printout of the final submitted application form for future reference.'
    ],
    importantDocuments: [
      'Active Mobile Number & Valid Email ID',
      'Recent Passport Size Color Photograph (White Background, max 50KB)',
      'Candidate Scanned Signature (max 20KB)',
      'Class 10th (High School) Certificate for Date of Birth Verification',
      'Graduation / Qualifying Degree Marksheet & Certificate',
      'Category / Caste / EWS Certificate (if seeking reservation benefit)',
      'Valid Photo Identity Proof (Aadhaar Card / Voter ID / PAN Card)'
    ],
    links: {
      apply: '',
      applyServer2: '',
      notification: '',
      official: '',
      admitCard: '',
      admitCardNotice: '',
      result: '',
      resultServer2: '',
      answerKey: '',
      syllabus: '',
      applicationForm: '',
      correctionForm: '',
      meritList: '',
      cutoff: '',
      examDate: '',
      videoHindi: '',
      telegram: 'https://t.me/govtbharatofficial',
      whatsapp: 'https://whatsapp.com/channel/govtbharatofficial',
      otherLinks: []
    }
  });

  const [formData, setFormData] = useState<Partial<JobAlert>>(getInitialJobState());

  useEffect(() => {
    if (editingJob) {
      const enriched = enrichJobDetails(editingJob);
      setFormData({
        ...enriched,
        postDate: enriched.postDate || formatInitialDate(),
        salary: enriched.salary || enriched.payScale || '',
        payScale: enriched.payScale || enriched.salary || '',
        dates: {
          start: enriched.dates?.start || '',
          last: enriched.dates?.last || '',
          feeLast: enriched.dates?.feeLast || '',
          correctionDate: enriched.dates?.correctionDate || '',
          examDate: enriched.dates?.examDate || '',
          admitCardDate: enriched.dates?.admitCardDate || '',
          answerKeyDate: enriched.dates?.answerKeyDate || '',
          resultDate: enriched.dates?.resultDate || '',
        },
        fees: {
          general: enriched.fees?.general || '₹100/-',
          scSt: enriched.fees?.scSt || '₹0/- (Exempted)',
          female: enriched.fees?.female || '₹0/- (Exempted)',
          paymentMode: enriched.fees?.paymentMode || 'Pay Exam Fee via Online Mode.',
        },
        ageLimit: typeof enriched.ageLimit === 'object' ? enriched.ageLimit : {
          min: '18 Years',
          max: '27-32 Years',
          asOn: `01-08-${new Date().getFullYear()}`,
          relaxation: typeof enriched.ageLimit === 'string' ? enriched.ageLimit : 'As per Rules',
        },
        links: {
          apply: enriched.links?.apply || '',
          applyServer2: enriched.links?.applyServer2 || '',
          official: enriched.links?.official || '',
          notification: enriched.links?.notification || '',
          admitCard: enriched.links?.admitCard || '',
          admitCardNotice: enriched.links?.admitCardNotice || '',
          result: enriched.links?.result || '',
          resultServer2: enriched.links?.resultServer2 || '',
          answerKey: enriched.links?.answerKey || '',
          syllabus: enriched.links?.syllabus || '',
          applicationForm: enriched.links?.applicationForm || '',
          correctionForm: enriched.links?.correctionForm || '',
          meritList: enriched.links?.meritList || '',
          cutoff: enriched.links?.cutoff || '',
          examDate: enriched.links?.examDate || '',
          videoHindi: enriched.links?.videoHindi || '',
          telegram: enriched.links?.telegram || '',
          whatsapp: enriched.links?.whatsapp || '',
          otherLinks: enriched.links?.otherLinks || [],
        }
      });
      setActiveTab('basic');
    } else {
      setFormData(getInitialJobState());
      setActiveTab('basic');
    }
  }, [editingJob, isOpen]);

  const existingJobs = useMemo<JobAlert[]>(() => {
    return loadJobsFromLocalStorage();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any, nested?: 'fees' | 'dates' | 'links' | 'ageLimit') => {
    if (nested) {
      setFormData(prev => ({ 
        ...prev, 
        [nested]: { 
          ...(prev[nested] as any || {}), 
          [field]: value 
        } 
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const sanitizeUrl = (url?: string) => {
    if (!url || !url.trim()) return '';
    const trimmed = url.trim();
    if (trimmed === '#') return '';
    return cleanOfficialUrl(trimmed);
  };

  // Quick Portal Presets for Indian Government Commissions
  const handleQuickPortalPreset = (portal: 'ssc' | 'rrb' | 'uppbpb' | 'bpsc' | 'bssc' | 'ibps' | 'nta' | 'upsc' | 'dsssb') => {
    const presets: Record<string, { org: string; apply: string; official: string; notification: string }> = {
      ssc: {
        org: 'Staff Selection Commission (SSC)',
        apply: 'https://ssc.gov.in',
        official: 'https://ssc.gov.in',
        notification: 'https://ssc.gov.in/notices'
      },
      bssc: {
        org: 'Bihar Staff Selection Commission (BSSC)',
        apply: 'https://onlinebssc.com',
        official: 'https://bssc.bihar.gov.in',
        notification: 'https://bssc.bihar.gov.in'
      },
      rrb: {
        org: 'Railway Recruitment Boards (RRB) / Ministry of Railways',
        apply: 'https://rrbapply.gov.in',
        official: 'https://indianrailways.gov.in',
        notification: 'https://rrbapply.gov.in/#/auth/home'
      },
      uppbpb: {
        org: 'Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)',
        apply: 'https://uppbpb.gov.in',
        official: 'https://uppbpb.gov.in',
        notification: 'https://uppbpb.gov.in/Recruitment'
      },
      bpsc: {
        org: 'Bihar Public Service Commission (BPSC)',
        apply: 'https://onlinebpsc.bihar.gov.in',
        official: 'https://bpsc.bih.nic.in',
        notification: 'https://bpsc.bih.nic.in'
      },
      ibps: {
        org: 'Institute of Banking Personnel Selection (IBPS)',
        apply: 'https://ibps.in',
        official: 'https://ibps.in',
        notification: 'https://ibps.in'
      },
      nta: {
        org: 'National Testing Agency (NTA)',
        apply: 'https://exams.nta.ac.in',
        official: 'https://nta.ac.in',
        notification: 'https://nta.ac.in'
      },
      upsc: {
        org: 'Union Public Service Commission (UPSC)',
        apply: 'https://upsconline.nic.in',
        official: 'https://upsc.gov.in',
        notification: 'https://upsc.gov.in/examinations'
      },
      dsssb: {
        org: 'Delhi Subordinate Services Selection Board (DSSSB)',
        apply: 'https://dsssbonline.nic.in',
        official: 'https://dsssb.delhi.gov.in',
        notification: 'https://dsssb.delhi.gov.in/current-vacancies'
      }
    };

    if (presets[portal]) {
      const p = presets[portal];
      setFormData(prev => ({
        ...prev,
        orgName: prev.orgName || p.org,
        links: {
          ...prev.links,
          apply: p.apply,
          official: p.official,
          notification: p.notification,
        }
      }));
      setStatusMessage(`Applied ${portal.toUpperCase()} portal preset successfully!`);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  // AI / Intelligent Auto-Enrichment from Title
  const handleAutoGenerateDetails = () => {
    if (!formData.title?.trim()) {
      alert('Please enter a Job Post Title first to auto-generate all columns.');
      return;
    }
    const enriched = enrichJobDetails(formData);
    setFormData(enriched);
    setStatusMessage('✨ All 7 tabs auto-populated with complete details! You can now review and customize any field.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Dynamic Array Handlers for Qualifications
  const handleAddQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...(prev.qualifications || []), 'Bachelor Degree / Diploma in relevant discipline.']
    }));
  };

  const handleUpdateQualification = (index: number, val: string) => {
    setFormData(prev => {
      const list = [...(prev.qualifications || [])];
      list[index] = val;
      return { ...prev, qualifications: list };
    });
  };

  const handleRemoveQualification = (index: number) => {
    setFormData(prev => {
      const list = [...(prev.qualifications || [])];
      list.splice(index, 1);
      return { ...prev, qualifications: list };
    });
  };

  // Dynamic Array Handlers for PostWiseVacancies
  const handleAddVacancyRow = () => {
    const newRow: PostWiseVacancy = {
      postName: 'Sub-Inspector / Assistant',
      total: '100',
      general: 40,
      ews: 10,
      obc: 27,
      sc: 15,
      st: 8,
      eligibility: formData.eligibility || 'Bachelor Degree in Any Stream from Any Recognized University in India.'
    };
    setFormData(prev => ({
      ...prev,
      postWiseVacancies: [...(prev.postWiseVacancies || []), newRow]
    }));
  };

  const handleUpdateVacancyRow = (index: number, field: keyof PostWiseVacancy, val: any) => {
    setFormData(prev => {
      const list = [...(prev.postWiseVacancies || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, postWiseVacancies: list };
    });
  };

  const handleRemoveVacancyRow = (index: number) => {
    setFormData(prev => {
      const list = [...(prev.postWiseVacancies || [])];
      list.splice(index, 1);
      return { ...prev, postWiseVacancies: list };
    });
  };

  const handleAutoDistributeVacancies = (index: number) => {
    setFormData(prev => {
      const list = [...(prev.postWiseVacancies || [])];
      const item = list[index];
      const totalNum = parseInt(String(item.total).replace(/\D/g, '') || '100', 10);
      item.general = Math.round(totalNum * 0.40);
      item.obc = Math.round(totalNum * 0.27);
      item.ews = Math.round(totalNum * 0.10);
      item.sc = Math.round(totalNum * 0.15);
      item.st = Math.max(0, totalNum - (Number(item.general) + Number(item.obc) + Number(item.ews) + Number(item.sc)));
      return { ...prev, postWiseVacancies: list };
    });
  };

  // Dynamic Array Handlers for Selection Process
  const handleAddSelectionStage = () => {
    const stageNum = (formData.selectionProcess?.length || 0) + 1;
    setFormData(prev => ({
      ...prev,
      selectionProcess: [...(prev.selectionProcess || []), `Stage ${stageNum}: Computer Based Test / Skill Assessment`]
    }));
  };

  const handleUpdateSelectionStage = (index: number, val: string) => {
    setFormData(prev => {
      const list = [...(prev.selectionProcess || [])];
      list[index] = val;
      return { ...prev, selectionProcess: list };
    });
  };

  const handleRemoveSelectionStage = (index: number) => {
    setFormData(prev => {
      const list = [...(prev.selectionProcess || [])];
      list.splice(index, 1);
      return { ...prev, selectionProcess: list };
    });
  };

  // Dynamic Array Handlers for How To Apply
  const handleAddApplyStep = () => {
    const stepNum = (formData.howToApply?.length || 0) + 1;
    setFormData(prev => ({
      ...prev,
      howToApply: [...(prev.howToApply || []), `${stepNum}. Review all required documents and details before submitting the application.`]
    }));
  };

  const handleUpdateApplyStep = (index: number, val: string) => {
    setFormData(prev => {
      const list = [...(prev.howToApply || [])];
      list[index] = val;
      return { ...prev, howToApply: list };
    });
  };

  const handleRemoveApplyStep = (index: number) => {
    setFormData(prev => {
      const list = [...(prev.howToApply || [])];
      list.splice(index, 1);
      return { ...prev, howToApply: list };
    });
  };

  // Dynamic Array Handlers for Important Documents
  const handleAddDocument = () => {
    setFormData(prev => ({
      ...prev,
      importantDocuments: [...(prev.importantDocuments || []), 'Scanned Copy of Required Qualification Marksheet']
    }));
  };

  const handleUpdateDocument = (index: number, val: string) => {
    setFormData(prev => {
      const list = [...(prev.importantDocuments || [])];
      list[index] = val;
      return { ...prev, importantDocuments: list };
    });
  };

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => {
      const list = [...(prev.importantDocuments || [])];
      list.splice(index, 1);
      return { ...prev, importantDocuments: list };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.title?.trim()) {
      setActiveTab('basic');
      alert('Please provide a Job Title before saving.');
      return;
    }

    setIsSubmitting(true);
    
    // Automatically enrich with all complete details so nothing is ever missing!
    const jobData = enrichJobDetails({
      id: editingJob?.id || `job-${Date.now()}`,
      title: formData.title ? formData.title.trim() : '',
      category: (formData.category as JobCategory) || 'latest-jobs',
      postDate: formData.postDate || formatInitialDate(),
      isNew: !!formData.isNew,
      state: formData.state || 'Central',
      orgName: formData.orgName?.trim() || '',
      postName: formData.postName?.trim() || '',
      advtNo: formData.advtNo?.trim() || '',
      totalVacancies: formData.totalVacancies || '',
      status: formData.status || 'Application Open',
      shortInfo: formData.shortInfo || '',
      ageLimit: formData.ageLimit || '',
      eligibility: formData.eligibility || '',
      qualifications: formData.qualifications || [],
      postWiseVacancies: formData.postWiseVacancies || [],
      salary: formData.salary || formData.payScale || '',
      payScale: formData.payScale || formData.salary || '',
      selectionProcess: formData.selectionProcess || [],
      howToApply: formData.howToApply || [],
      importantDocuments: formData.importantDocuments || [],
      fees: {
        general: formData.fees?.general || '₹100/-',
        scSt: formData.fees?.scSt || '₹0/- (Exempted)',
        female: formData.fees?.female || '₹0/- (Exempted)',
        paymentMode: formData.fees?.paymentMode || 'Online Mode',
      },
      dates: {
        start: formData.dates?.start || '',
        last: formData.dates?.last || '',
        feeLast: formData.dates?.feeLast || '',
        correctionDate: formData.dates?.correctionDate || '',
        examDate: formData.dates?.examDate || '',
        admitCardDate: formData.dates?.admitCardDate || '',
        answerKeyDate: formData.dates?.answerKeyDate || '',
        resultDate: formData.dates?.resultDate || '',
      },
      links: {
        apply: sanitizeUrl(formData.links?.apply) || 'https://india.gov.in',
        applyServer2: sanitizeUrl(formData.links?.applyServer2) || '',
        official: sanitizeUrl(formData.links?.official) || 'https://india.gov.in',
        notification: sanitizeUrl(formData.links?.notification) || 'https://india.gov.in',
        admitCard: sanitizeUrl(formData.links?.admitCard) || '',
        result: sanitizeUrl(formData.links?.result) || '',
        resultServer2: sanitizeUrl(formData.links?.resultServer2) || '',
        answerKey: sanitizeUrl(formData.links?.answerKey) || '',
        syllabus: sanitizeUrl(formData.links?.syllabus) || '',
        videoHindi: sanitizeUrl(formData.links?.videoHindi) || '',
        telegram: sanitizeUrl(formData.links?.telegram) || 'https://t.me/govtbharatofficial',
        whatsapp: sanitizeUrl(formData.links?.whatsapp) || 'https://whatsapp.com/channel/govtbharatofficial',
      },
      ...formData
    });

    onSave(jobData);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const getNextTab = (): AdminTab | null => {
    const currentIndex = TAB_LIST.findIndex(t => t.id === activeTab);
    if (currentIndex >= 0 && currentIndex < TAB_LIST.length - 1) {
      return TAB_LIST[currentIndex + 1].id;
    }
    return null;
  };

  const getPrevTab = (): AdminTab | null => {
    const currentIndex = TAB_LIST.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      return TAB_LIST[currentIndex - 1].id;
    }
    return null;
  };

  const activeTabIndex = TAB_LIST.findIndex(t => t.id === activeTab);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Breadcrumbs & Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <button 
              onClick={onClose} 
              className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </button>
            <span>/</span>
            <span>Admin Management</span>
            <span>/</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {editingJob ? 'Edit Job Notification' : 'Manual Job Post Editor'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-base shadow-sm">
              {editingJob ? '✎' : '+'}
            </span>
            <span>{editingJob ? `Editing: ${editingJob.title}` : 'Post Manual Job Notification (All Columns)'}</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Sarkari Result ke sabhi columns (Dates, Fees, Age, Vacancies, Reservation, Qualifications, Selection, Documents, Links) yahan se poori tarah fill karein.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleAutoGenerateDetails}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Auto populate all tabs based on title"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Auto-Fill All Tabs from Title</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'preview' ? 'basic' : 'preview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{activeTab === 'preview' ? 'Edit Columns' : 'Live Preview'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : editingJob ? 'Update & Publish' : 'Publish Job Post'}</span>
          </button>
        </div>
      </div>

      {/* Toast / Status Alert Banner */}
      {statusMessage && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-amber-700 hover:text-amber-950 dark:hover:text-white font-bold cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Quick Presets Bar for Popular Indian Commissions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Commission Presets:</span>
        </span>
        {(['ssc', 'rrb', 'uppbpb', 'bpsc', 'ibps', 'nta', 'upsc', 'dsssb'] as const).map(portal => (
          <button
            key={portal}
            type="button"
            onClick={() => handleQuickPortalPreset(portal)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-slate-800 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-[11px] uppercase transition-all cursor-pointer"
          >
            {portal}
          </button>
        ))}
      </div>

      {/* Editor Content Prioritization & Popular Categories Radar */}
      <PopularCategoriesAndTrafficAnalytics
        jobs={existingJobs}
        compact={true}
        onSelectCategory={(cat) => {
          handleChange('category', cat);
          setStatusMessage(`Category updated to: ${cat.toUpperCase()}`);
        }}
      />

      {/* Horizontal Tabs Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-1.5 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {TAB_LIST.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {idx < 7 && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-slate-950' : 'bg-slate-300 dark:bg-slate-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Tab Content Area */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ========================================================== */}
        {/* TAB 1: BASIC INFO & ORGANIZATION */}
        {/* ========================================================== */}
        {activeTab === 'basic' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <span>1. Job Post Title, Department & Basic Meta</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter the primary headline, conducting department, advertisement number, category, and state.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
              
              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Job Post Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSC CGL 2026 Online Form / Railway NTPC Graduate & Under Graduate Posts"
                  value={formData.title || ''}
                  onChange={e => handleChange('title', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 text-sm font-bold transition-all shadow-xs"
                />
              </div>

              {/* Organization / Department Name */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Organization / Commission / Department Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staff Selection Commission (SSC) / Railway Recruitment Board"
                  value={formData.orgName || ''}
                  onChange={e => handleChange('orgName', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Specific Post Name */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Specific Post Name / Notification Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Combined Graduate Level Examination 2026 (Group B & C Posts)"
                  value={formData.postName || ''}
                  onChange={e => handleChange('postName', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Advertisement Number */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Advertisement / Notification Number (Advt No.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advt No. 04/2026 / CEN 01/2026"
                  value={formData.advtNo || ''}
                  onChange={e => handleChange('advtNo', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Total Vacancies */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Total Vacancies
                </label>
                <input
                  type="text"
                  placeholder="e.g. 17,727 Posts / Multiple Vacancies"
                  value={formData.totalVacancies || ''}
                  onChange={e => handleChange('totalVacancies', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Pay Scale / Salary Information */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold flex items-center justify-between">
                  <span>Pay Scale / Salary Information</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Monthly / Pay Level</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pay Level-6 (₹35,400 - ₹1,12,400/-) + DA, HRA"
                  value={formData.payScale || formData.salary || ''}
                  onChange={e => {
                    handleChange('payScale', e.target.value);
                    handleChange('salary', e.target.value);
                  }}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Portal Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold transition-all"
                >
                  <option value="latest-jobs">Latest Jobs</option>
                  <option value="admit-cards">Admit Cards</option>
                  <option value="results">Results</option>
                  <option value="answer-key">Answer Key</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="admission">Admission</option>
                  <option value="documents">Certificates / Documents</option>
                  <option value="important">Important</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  State / Jurisdiction
                </label>
                <select
                  value={formData.state}
                  onChange={e => handleChange('state', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold transition-all"
                >
                  {ALL_INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{st === 'Central' ? 'Central (Govt of India)' : st}</option>
                  ))}
                </select>
              </div>

              {/* Post Status */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Application / Post Status
                </label>
                <select
                  value={formData.status || 'Application Open'}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold transition-all"
                >
                  <option value="Application Open">Application Open</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Last Date Near">Last Date Near</option>
                  <option value="Application Closed">Application Closed</option>
                  <option value="Admit Card Released">Admit Card Released</option>
                  <option value="Result Declared">Result Declared</option>
                  <option value="Answer Key Released">Answer Key Released</option>
                </select>
              </div>

              {/* Post Date */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Notification Date
                </label>
                <DateInputWithPicker
                  value={formData.postDate || ''}
                  onChange={val => handleChange('postDate', val)}
                  placeholder="DD-MM-YYYY"
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* NEW Badge Checkbox */}
              <div className="md:col-span-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="isNewCheck"
                  checked={!!formData.isNew}
                  onChange={e => handleChange('isNew', e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 dark:border-slate-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="isNewCheck" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer flex items-center gap-2">
                  <span>Display glowing "NEW" animated badge on homepage</span>
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded">NEW</span>
                </label>
              </div>

              {/* Short Information */}
              <div className="md:col-span-2">
                <label className="block mb-1.5 text-slate-900 dark:text-slate-100 font-bold">
                  Short Information Summary (Detailed Brief)
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter a comprehensive overview of this notification (e.g. eligibility, key dates, vacancies, commission overview)..."
                  value={formData.shortInfo || ''}
                  onChange={e => handleChange('shortInfo', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all font-medium leading-relaxed"
                />
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: IMPORTANT DATES & APPLICATION FEE */}
        {/* ========================================================== */}
        {activeTab === 'dates-fees' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>2. Important Dates & Application Fee Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure both columns: all schedule dates on the left, and category-wise application fees on the right.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Dates */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-black text-sm text-[#059669] dark:text-[#34d399] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <Calendar className="w-4 h-4" />
                  <span>Important Dates Column</span>
                </h3>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">• Application Begin Date</label>
                  <DateInputWithPicker
                    value={formData.dates?.start || ''}
                    onChange={v => handleChange('start', v, 'dates')}
                    placeholder="e.g. 24-06-2026"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-[#dc2626] dark:text-[#f87171]">• Last Date for Apply Online *</label>
                  <DateInputWithPicker
                    value={formData.dates?.last || ''}
                    onChange={v => handleChange('last', v, 'dates')}
                    placeholder="e.g. 24-07-2026 (11:00 PM)"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">• Last Date to Pay Exam Fee</label>
                  <input
                    type="text"
                    placeholder="e.g. 25-07-2026"
                    value={formData.dates?.feeLast || ''}
                    onChange={e => handleChange('feeLast', e.target.value, 'dates')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">• Correction Window Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 10-11 August 2026"
                    value={formData.dates?.correctionDate || ''}
                    onChange={e => handleChange('correctionDate', e.target.value, 'dates')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">• Exam Date (Tier-I / Written)</label>
                  <input
                    type="text"
                    placeholder="e.g. September - October 2026"
                    value={formData.dates?.examDate || ''}
                    onChange={e => handleChange('examDate', e.target.value, 'dates')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">• Admit Card Release Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Before Exam / 4 Days Before Exam"
                    value={formData.dates?.admitCardDate || ''}
                    onChange={e => handleChange('admitCardDate', e.target.value, 'dates')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-purple-600 dark:text-purple-400">• Answer Key Release Date</label>
                  <input
                    type="text"
                    placeholder="e.g. As per Schedule / Notify Soon"
                    value={formData.dates?.answerKeyDate || ''}
                    onChange={e => handleChange('answerKeyDate', e.target.value, 'dates')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-rose-600 dark:text-rose-400">• Result Declaration Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Notify Soon / Declared"
                    value={formData.dates?.resultDate || ''}
                    onChange={e => handleChange('resultDate', e.target.value, 'dates')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Right Column: Fees */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-black text-sm text-[#059669] dark:text-[#34d399] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <DollarSign className="w-4 h-4" />
                  <span>Application Fee Column</span>
                </h3>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">• General / OBC / EWS Fee</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹100/- or ₹500/-"
                    value={formData.fees?.general || ''}
                    onChange={e => handleChange('general', e.target.value, 'fees')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">• SC / ST / PwD (PH) Fee</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹0/- (Exempted) or ₹250/-"
                    value={formData.fees?.scSt || ''}
                    onChange={e => handleChange('scSt', e.target.value, 'fees')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">• All Category Female Fee</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹0/- (Exempted)"
                    value={formData.fees?.female || ''}
                    onChange={e => handleChange('female', e.target.value, 'fees')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">💳 Payment Mode Instructions</label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Pay the Examination Fee Through Debit Card, Credit Card, Net Banking, UPI or SBI E-Challan Offline Mode."
                    value={formData.fees?.paymentMode || ''}
                    onChange={e => handleChange('paymentMode', e.target.value, 'fees')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold">💡 Tip: In case of fee exemption, write <strong>₹0/- (Exempted)</strong> so candidates know clearly that there is no fee.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: AGE LIMIT & EDUCATIONAL QUALIFICATION */}
        {/* ========================================================== */}
        {activeTab === 'age-eligibility' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>3. Age Limit & Educational Qualification Details</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define age criteria, cutoff date, relaxation policy, and academic eligibility requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Age Limit Section */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-black text-sm text-[#d91e63] dark:text-[#f472b6] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <Clock className="w-4 h-4" />
                  <span>Age Limit Criteria</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">Minimum Age</label>
                    <input
                      type="text"
                      placeholder="e.g. 18 Years"
                      value={typeof formData.ageLimit === 'object' ? (formData.ageLimit.min || '') : ''}
                      onChange={e => handleChange('min', e.target.value, 'ageLimit')}
                      className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">Maximum Age</label>
                    <input
                      type="text"
                      placeholder="e.g. 27-32 Years (Post Wise)"
                      value={typeof formData.ageLimit === 'object' ? (formData.ageLimit.max || '') : ''}
                      onChange={e => handleChange('max', e.target.value, 'ageLimit')}
                      className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">Age Calculated As On Date</label>
                  <input
                    type="text"
                    placeholder={`e.g. 01-08-${new Date().getFullYear()}`}
                    value={typeof formData.ageLimit === 'object' ? (formData.ageLimit.asOn || '') : ''}
                    onChange={e => handleChange('asOn', e.target.value, 'ageLimit')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">Age Relaxation Policy</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Age Relaxation Extra as per Recruitment Rules (OBC: 3 Yrs, SC/ST: 5 Yrs, PwD: 10 Yrs)."
                    value={typeof formData.ageLimit === 'object' ? (formData.ageLimit.relaxation || '') : ''}
                    onChange={e => handleChange('relaxation', e.target.value, 'ageLimit')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">Extra Age Details / Post-wise Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. For Junior Statistical Officer: 18-32 Years. For Assistant Section Officer: 20-30 Years."
                    value={typeof formData.ageLimit === 'object' ? (formData.ageLimit.details || '') : ''}
                    onChange={e => handleChange('details', e.target.value, 'ageLimit')}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Eligibility & Qualifications Section */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-black text-sm text-[#059669] dark:text-[#34d399] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <GraduationCap className="w-4 h-4" />
                  <span>Educational Qualification</span>
                </h3>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">Primary Eligibility Summary</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Bachelor Degree in Any Stream from Any Recognized University in India. For more post-wise eligibility details read the official notification."
                    value={formData.eligibility || ''}
                    onChange={e => handleChange('eligibility', e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Specific Qualification Bullet Points */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-200">Specific Qualification Bullet Points</label>
                    <button
                      type="button"
                      onClick={handleAddQualification}
                      className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Point</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(formData.qualifications || []).map((q, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">•</span>
                        <input
                          type="text"
                          value={q}
                          onChange={e => handleUpdateQualification(idx, e.target.value)}
                          className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-1.5 text-xs text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveQualification(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Remove this point"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {(!formData.qualifications || formData.qualifications.length === 0) && (
                      <p className="text-xs text-slate-400 italic">No bullet points added. Click "+ Add Point" above.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: POST-WISE VACANCIES & CATEGORY RESERVATION */}
        {/* ========================================================== */}
        {activeTab === 'vacancies' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>4. Post-Wise Vacancy & Category Reservation Breakdown (UR, EWS, OBC, SC, ST)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in the complete reservation distribution table that displays directly under the vacancy details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddVacancyRow}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Post Row</span>
                </button>
              </div>
            </div>

            {/* Dynamic Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5 min-w-[160px]">Post Name</th>
                    <th className="p-2.5 w-20 text-center">Total</th>
                    <th className="p-2.5 w-16 text-center">UR</th>
                    <th className="p-2.5 w-16 text-center">EWS</th>
                    <th className="p-2.5 w-16 text-center">OBC</th>
                    <th className="p-2.5 w-16 text-center">SC</th>
                    <th className="p-2.5 w-16 text-center">ST</th>
                    <th className="p-2.5 min-w-[200px]">Specific Eligibility</th>
                    <th className="p-2.5 w-24 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {(formData.postWiseVacancies || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.postName}
                          onChange={e => handleUpdateVacancyRow(idx, 'postName', e.target.value)}
                          placeholder="e.g. Assistant / Inspector"
                          className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded p-1.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.total ?? ''}
                          onChange={e => handleUpdateVacancyRow(idx, 'total', e.target.value)}
                          placeholder="100"
                          className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded p-1.5 text-xs font-black text-center text-emerald-600 dark:text-emerald-400"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.general ?? ''}
                          onChange={e => handleUpdateVacancyRow(idx, 'general', e.target.value)}
                          placeholder="40"
                          className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded p-1.5 text-xs text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.ews ?? ''}
                          onChange={e => handleUpdateVacancyRow(idx, 'ews', e.target.value)}
                          placeholder="10"
                          className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded p-1.5 text-xs text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.obc ?? ''}
                          onChange={e => handleUpdateVacancyRow(idx, 'obc', e.target.value)}
                          placeholder="27"
                          className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded p-1.5 text-xs text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.sc ?? ''}
                          onChange={e => handleUpdateVacancyRow(idx, 'sc', e.target.value)}
                          placeholder="15"
                          className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded p-1.5 text-xs text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.st ?? ''}
                          onChange={e => handleUpdateVacancyRow(idx, 'st', e.target.value)}
                          placeholder="8"
                          className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded p-1.5 text-xs text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.eligibility || ''}
                          onChange={e => handleUpdateVacancyRow(idx, 'eligibility', e.target.value)}
                          placeholder="Eligibility criteria for this post"
                          className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded p-1.5 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAutoDistributeVacancies(idx)}
                            title="Auto Calculate standard reservation from total"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVacancyRow(idx)}
                            title="Delete Row"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!formData.postWiseVacancies || formData.postWiseVacancies.length === 0) && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400">
                        No post-wise vacancy rows created. Click "+ Add Post Row" above to create rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: SALARY & SELECTION PROCESS */}
        {/* ========================================================== */}
        {activeTab === 'salary-selection' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <span>5. Salary / Pay Scale & Selection Process Stages</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specify monthly remuneration and the stages required for final candidate selection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Salary Section */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Pay Scale & Salary Information Details</span>
                </h3>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-900 dark:text-slate-200">
                    Pay Scale / Matrix Level / Remuneration Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Pay Level-6 (₹35,400 - ₹1,12,400/-) to Level-8 (₹47,600 - ₹1,51,100/-) as per 7th CPC plus Dearness Allowance (DA), House Rent Allowance (HRA) and Transport Allowance."
                    value={formData.payScale || formData.salary || ''}
                    onChange={e => {
                      handleChange('payScale', e.target.value);
                      handleChange('salary', e.target.value);
                    }}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Quick Pay Scale Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Level-1 (₹18,000 - ₹56,900/-)',
                      'Level-2 (₹19,900 - ₹63,200/-)',
                      'Level-4 (₹25,500 - ₹81,100/-)',
                      'Level-6 (₹35,400 - ₹1,12,400/-)',
                      'Level-7 (₹44,900 - ₹1,42,400/-)',
                      'Level-8 (₹47,600 - ₹1,51,100/-)',
                      'Level-10 (₹56,100 - ₹1,77,500/-)',
                      'Fixed Stipend: ₹25,000/Month'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          const val = `${preset} + DA, HRA and admissible allowances as per Govt rules.`;
                          handleChange('payScale', val);
                          handleChange('salary', val);
                        }}
                        className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer transition-all"
                      >
                        {preset.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selection Process Section */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Selection Process Stages</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSelectionStage}
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Stage</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(formData.selectionProcess || []).map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={stage}
                        onChange={e => handleUpdateSelectionStage(idx, e.target.value)}
                        className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectionStage(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="Remove Stage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!formData.selectionProcess || formData.selectionProcess.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No stages configured. Click "+ Add Stage" above.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 6: HOW TO APPLY & REQUIRED DOCUMENTS */}
        {/* ========================================================== */}
        {activeTab === 'instructions-docs' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>6. How to Apply Instructions & Required Documents Checklist</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide step-by-step guidance for applicants and the checklist of files they need to upload.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* How To Apply Steps */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>How To Apply Steps</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddApplyStep}
                    className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {(formData.howToApply || []).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-black flex items-center justify-center shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={step}
                        onChange={e => handleUpdateApplyStep(idx, e.target.value)}
                        className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveApplyStep(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 mt-1 cursor-pointer"
                        title="Remove Step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Documents to Keep Ready</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Document</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {(formData.importantDocuments || []).map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-blue-500 font-bold">📄</span>
                      <input
                        type="text"
                        value={doc}
                        onChange={e => handleUpdateDocument(idx, e.target.value)}
                        className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-medium text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 7: OFFICIAL IMPORTANT LINKS */}
        {/* ========================================================== */}
        {activeTab === 'links' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Link className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>7. Official Important Direct Links</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All buttons displayed in the Important Links table on the job details page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
              
              {/* Apply Server 1 */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  1. Apply Online Link (Server 1) *
                </label>
                <input
                  type="text"
                  placeholder="https://apply.commission.gov.in"
                  value={formData.links?.apply || ''}
                  onChange={e => handleChange('apply', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Apply Server 2 */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  2. Apply Online Link (Server 2 / Mirror)
                </label>
                <input
                  type="text"
                  placeholder="https://server2.commission.gov.in"
                  value={formData.links?.applyServer2 || ''}
                  onChange={e => handleChange('applyServer2', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Official Notification */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  3. Download Official Notification (PDF / Notice)
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/notice.pdf"
                  value={formData.links?.notification || ''}
                  onChange={e => handleChange('notification', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Official Website */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  4. Official Commission / Board Website
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in"
                  value={formData.links?.official || ''}
                  onChange={e => handleChange('official', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Admit Card */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  5. Download Admit Card Link
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/admitcard"
                  value={formData.links?.admitCard || ''}
                  onChange={e => handleChange('admitCard', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Result Server 1 */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  6. Download Result Link (Server 1)
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/result"
                  value={formData.links?.result || ''}
                  onChange={e => handleChange('result', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Result Server 2 */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  7. Download Result Link (Server 2)
                </label>
                <input
                  type="text"
                  placeholder="https://server2.commission.gov.in/result"
                  value={formData.links?.resultServer2 || ''}
                  onChange={e => handleChange('resultServer2', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Answer Key */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  8. Download Answer Key Link
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/answerkey"
                  value={formData.links?.answerKey || ''}
                  onChange={e => handleChange('answerKey', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Syllabus */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  9. Download Syllabus & Exam Pattern
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/syllabus.pdf"
                  value={formData.links?.syllabus || ''}
                  onChange={e => handleChange('syllabus', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Application Form */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  10. Download Application Form Link
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/application-form.pdf"
                  value={formData.links?.applicationForm || ''}
                  onChange={e => handleChange('applicationForm', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Correction Form */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  11. Correction / Edit Form Link
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/correction"
                  value={formData.links?.correctionForm || ''}
                  onChange={e => handleChange('correctionForm', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Merit List */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  12. Download Merit List Link
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/merit-list.pdf"
                  value={formData.links?.meritList || ''}
                  onChange={e => handleChange('meritList', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Cut Off */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  13. Download Cut Off Link
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/cutoff.pdf"
                  value={formData.links?.cutoff || ''}
                  onChange={e => handleChange('cutoff', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Exam Date / City Intimation */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  14. Exam Date / City Intimation Link
                </label>
                <input
                  type="text"
                  placeholder="https://commission.gov.in/exam-city"
                  value={formData.links?.examDate || ''}
                  onChange={e => handleChange('examDate', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Video Hindi */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  15. Video: How to Fill Form in Hindi (YouTube)
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.links?.videoHindi || ''}
                  onChange={e => handleChange('videoHindi', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Telegram */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  16. Official Telegram Channel Link
                </label>
                <input
                  type="text"
                  placeholder="https://t.me/govtbharatofficial"
                  value={formData.links?.telegram || ''}
                  onChange={e => handleChange('telegram', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block mb-1 text-slate-900 dark:text-slate-100 font-bold">
                  17. Official WhatsApp Channel Link
                </label>
                <input
                  type="text"
                  placeholder="https://whatsapp.com/channel/..."
                  value={formData.links?.whatsapp || ''}
                  onChange={e => handleChange('whatsapp', e.target.value, 'links')}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Other Important Links Dynamic Builder */}
              <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-slate-900 dark:text-slate-100 font-bold text-sm">
                    18. Other Important Custom Links (Dynamic Array)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const current = formData.links?.otherLinks || [];
                      handleChange('otherLinks', [...current, { title: '', url: '' }], 'links');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Add Other Link
                  </button>
                </div>
                <div className="space-y-3">
                  {(formData.links?.otherLinks || []).map((linkItem, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Link Title (e.g. Age Calculator)"
                        value={linkItem.title}
                        onChange={e => {
                          const updated = [...(formData.links?.otherLinks || [])];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          handleChange('otherLinks', updated, 'links');
                        }}
                        className="flex-1 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="URL (https://...)"
                        value={linkItem.url}
                        onChange={e => {
                          const updated = [...(formData.links?.otherLinks || [])];
                          updated[idx] = { ...updated[idx], url: e.target.value };
                          handleChange('otherLinks', updated, 'links');
                        }}
                        className="flex-1 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.links?.otherLinks || []).filter((_, i) => i !== idx);
                          handleChange('otherLinks', updated, 'links');
                        }}
                        className="p-2.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 text-xs font-bold cursor-pointer"
                        title="Remove Link"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(!formData.links?.otherLinks || formData.links.otherLinks.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No custom other links added yet. Click "+ Add Other Link" above.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 8: LIVE PREVIEW */}
        {/* ========================================================== */}
        {activeTab === 'preview' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>8. Live Sarkari Result Format Preview</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Yeh exact format hai jaisa user ko Job Link par click karne ke baad show hoga.
                </p>
              </div>
            </div>

            {/* Rendered Job Card */}
            <article className="border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-md">
              {/* Header */}
              <div className="p-4 sm:p-6 text-center border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/90 dark:to-slate-900">
                <h2 className="text-base sm:text-xl font-black text-[#d91e63] dark:text-[#f472b6] tracking-tight uppercase mb-1.5">
                  {formData.orgName || 'Commission / Organization'}
                </h2>
                <h1 className="text-lg sm:text-2xl font-extrabold text-[#059669] dark:text-[#34d399] leading-tight max-w-4xl mx-auto mb-1.5">
                  {formData.title || 'Job Post Title'}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#c026d3] dark:text-[#e879f9] mb-2">
                  {formData.postName || formData.title} : Short Details of Notification
                </p>
                <div className="inline-block py-1 px-4 rounded-md my-1 font-black text-xs sm:text-sm text-[#dc2626] dark:text-[#f87171] uppercase tracking-wider">
                  GovtBharat Result Official • {getDomainName()}
                </div>
              </div>

              {/* Short Info */}
              {formData.shortInfo && (
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-amber-500 m-4 rounded-r-xl text-xs sm:text-sm">
                  <strong className="text-amber-700 dark:text-amber-400 block mb-1">Short Information :</strong>
                  <p>{formData.shortInfo}</p>
                </div>
              )}

              {/* Dates & Fees */}
              <div className="p-4">
                <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-slate-300 dark:divide-slate-700">
                    <div className="p-4 space-y-2 text-xs">
                      <h4 className="font-black text-center text-[#059669] uppercase pb-2 border-b">Important Dates</h4>
                      <p className="flex justify-between"><span>• Application Begin:</span><strong>{formData.dates?.start || 'Active Now'}</strong></p>
                      <p className="flex justify-between text-[#dc2626]"><span>• Last Date Apply:</span><strong>{formData.dates?.last || 'Notify Soon'}</strong></p>
                      <p className="flex justify-between"><span>• Last Date Fee:</span><strong>{formData.dates?.feeLast || 'As per Schedule'}</strong></p>
                      {formData.dates?.examDate && <p className="flex justify-between text-indigo-600"><span>• Exam Date:</span><strong>{formData.dates.examDate}</strong></p>}
                    </div>

                    <div className="p-4 space-y-2 text-xs">
                      <h4 className="font-black text-center text-[#059669] uppercase pb-2 border-b">Application Fee</h4>
                      <p className="flex justify-between"><span>• Gen / OBC / EWS:</span><strong>{formData.fees?.general || '₹100/-'}</strong></p>
                      <p className="flex justify-between"><span>• SC / ST / PH:</span><strong>{formData.fees?.scSt || '₹0/- (Exempted)'}</strong></p>
                      {formData.fees?.female && <p className="flex justify-between"><span>• Female:</span><strong>{formData.fees.female}</strong></p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Scale / Salary Information in Preview */}
              {(formData.payScale || formData.salary) && (
                <div className="p-4 pt-0">
                  <div className="border-2 border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl p-3.5 text-xs sm:text-sm">
                    <strong className="text-emerald-800 dark:text-emerald-400 block mb-1 font-black uppercase text-xs flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Pay Scale / Salary Information :</span>
                    </strong>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {formData.payScale || formData.salary}
                    </p>
                  </div>
                </div>
              )}

              {/* Vacancy Reservation Table */}
              {formData.postWiseVacancies && formData.postWiseVacancies.length > 0 && (
                <div className="p-4">
                  <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-[#1d4ed8] text-white font-black text-center py-2 text-xs uppercase">
                      Category-Wise Vacancy Reservation Details
                    </div>
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold border-b">
                          <th className="p-2 text-left">Post Name</th>
                          <th className="p-2">UR</th>
                          <th className="p-2">EWS</th>
                          <th className="p-2">OBC</th>
                          <th className="p-2">SC</th>
                          <th className="p-2">ST</th>
                          <th className="p-2 font-black text-emerald-600">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {formData.postWiseVacancies.map((pv, i) => (
                          <tr key={i}>
                            <td className="p-2 text-left font-bold">{pv.postName}</td>
                            <td className="p-2">{pv.general ?? '-'}</td>
                            <td className="p-2">{pv.ews ?? '-'}</td>
                            <td className="p-2">{pv.obc ?? '-'}</td>
                            <td className="p-2">{pv.sc ?? '-'}</td>
                            <td className="p-2">{pv.st ?? '-'}</td>
                            <td className="p-2 font-black text-emerald-600">{pv.total ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </article>
          </div>
        )}

        {/* ========================================================== */}
        {/* BOTTOM TAB NAVIGATION & SUBMIT BAR */}
        {/* ========================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {getPrevTab() ? (
              <button
                type="button"
                onClick={() => {
                  const prev = getPrevTab();
                  if (prev) setActiveTab(prev);
                }}
                className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Tab</span>
              </button>
            ) : (
              <div className="hidden sm:block text-xs font-bold text-slate-400">Beginning of Form</div>
            )}

            {getNextTab() && (
              <button
                type="button"
                onClick={() => {
                  const next = getNextTab();
                  if (next) setActiveTab(next);
                }}
                className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>Next Tab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            Step {activeTabIndex + 1} of {TAB_LIST.length} • {TAB_LIST[activeTabIndex]?.shortLabel}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving to Database...' : editingJob ? 'Update & Publish' : 'Publish Job Post'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
