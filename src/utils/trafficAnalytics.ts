import { JobAlert, JobCategory } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { isFirestoreQuotaExceeded } from '../services/firestoreService';

export interface CategoryTrafficStat {
  category: JobCategory;
  label: string;
  count: number;
  clicks: number;
  sharePercentage: number;
  trend: 'up' | 'stable' | 'down';
  trendPercent: number;
  priorityLevel: 'urgent' | 'high' | 'medium' | 'normal';
  priorityScore: number; // 0 - 100
  color: string;
  bgLight: string;
  iconName: string;
  recommendation: string;
}

export interface HighTrafficLinkItem {
  id: string;
  title: string;
  org: string;
  url: string;
  type: 'apply' | 'admitCard' | 'result' | 'answerKey' | 'notification' | 'official' | 'other';
  category: JobCategory;
  clicks: number;
  lastClickedAt: string;
  healthStatus: 'healthy' | 'warning' | 'needs_review';
  statusCode?: number;
  isTrending: boolean;
}

export interface TrafficAnalyticsSummary {
  totalClicks: number;
  totalViews: number;
  topCategory: JobCategory;
  topCategoryClicks: number;
  topLinkUrl: string;
  topLinkTitle: string;
  categoryStats: CategoryTrafficStat[];
  highTrafficLinks: HighTrafficLinkItem[];
  lastUpdated: string;
}

const STORAGE_KEY_TRAFFIC = 'GovtBharat_traffic_analytics_v2';
const STORAGE_KEY_LINK_CLICKS = 'GovtBharat_link_click_counts';

// Initial realistic baseline stats for government job portal categories
const DEFAULT_CATEGORY_METRICS: Record<JobCategory, { baseClicks: number; weight: number; color: string; bgLight: string; label: string }> = {
  'latest-jobs': { baseClicks: 28450, weight: 0.42, color: '#dc2626', bgLight: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50', label: 'Latest Jobs' },
  'admit-cards': { baseClicks: 19820, weight: 0.28, color: '#d97706', bgLight: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50', label: 'Admit Cards' },
  'results': { baseClicks: 14650, weight: 0.18, color: '#059669', bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50', label: 'Results' },
  'answer-key': { baseClicks: 8320, weight: 0.08, color: '#4f46e5', bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50', label: 'Answer Keys' },
  'syllabus': { baseClicks: 5210, weight: 0.05, color: '#0284c7', bgLight: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/50', label: 'Syllabus & Pattern' },
  'admission': { baseClicks: 3940, weight: 0.04, color: '#e11d48', bgLight: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50', label: 'Admission' },
  'documents': { baseClicks: 3100, weight: 0.03, color: '#7c3aed', bgLight: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50', label: 'Certificates & Docs' },
  'important': { baseClicks: 2900, weight: 0.02, color: '#d97706', bgLight: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50', label: 'Important Links' },
};

// Seed baseline high-traffic official links
const BASELINE_HIGH_TRAFFIC_LINKS: HighTrafficLinkItem[] = [
  {
    id: 'link-ssc-apply',
    title: 'SSC OTR & Online Application Server (ssc.gov.in)',
    org: 'Staff Selection Commission',
    url: 'https://ssc.gov.in',
    type: 'apply',
    category: 'latest-jobs',
    clicks: 14890,
    lastClickedAt: new Date().toISOString(),
    healthStatus: 'healthy',
    statusCode: 200,
    isTrending: true,
  },
  {
    id: 'link-upsc-apply',
    title: 'UPSC Online OTR & Application Portal (upsconline.nic.in)',
    org: 'Union Public Service Commission',
    url: 'https://upsconline.nic.in',
    type: 'apply',
    category: 'latest-jobs',
    clicks: 11240,
    lastClickedAt: new Date().toISOString(),
    healthStatus: 'healthy',
    statusCode: 200,
    isTrending: true,
  },
  {
    id: 'link-nta-admit',
    title: 'NTA Exam Admit Card & City Slip Server (exams.nta.ac.in)',
    org: 'National Testing Agency',
    url: 'https://exams.nta.ac.in',
    type: 'admitCard',
    category: 'admit-cards',
    clicks: 9840,
    lastClickedAt: new Date().toISOString(),
    healthStatus: 'healthy',
    statusCode: 200,
    isTrending: true,
  },
  {
    id: 'link-rrb-apply',
    title: 'Railway Recruitment Boards (RRB) Apply Online Server',
    org: 'Indian Railways RRB',
    url: 'https://rrbapply.gov.in',
    type: 'apply',
    category: 'latest-jobs',
    clicks: 9420,
    lastClickedAt: new Date().toISOString(),
    healthStatus: 'healthy',
    statusCode: 200,
    isTrending: true,
  },
  {
    id: 'link-uppsc-admit',
    title: 'UPPSC Admit Card & Exam Roll Verification Server',
    org: 'Uttar Pradesh PSC',
    url: 'https://uppsc.up.nic.in',
    type: 'admitCard',
    category: 'admit-cards',
    clicks: 7650,
    lastClickedAt: new Date().toISOString(),
    healthStatus: 'healthy',
    statusCode: 200,
    isTrending: false,
  },
  {
    id: 'link-bpsc-result',
    title: 'BPSC Final Merit List & Marksheet Download Server',
    org: 'Bihar Public Service Commission',
    url: 'https://bpsc.bih.nic.in',
    type: 'result',
    category: 'results',
    clicks: 6890,
    lastClickedAt: new Date().toISOString(),
    healthStatus: 'healthy',
    statusCode: 200,
    isTrending: true,
  },
  {
    id: 'link-ssc-ans',
    title: 'SSC Answer Key Challenge & Response Sheet Portal',
    org: 'Staff Selection Commission',
    url: 'https://ssc.digialm.com',
    type: 'answerKey',
    category: 'answer-key',
    clicks: 5420,
    lastClickedAt: new Date().toISOString(),
    healthStatus: 'healthy',
    statusCode: 200,
    isTrending: false,
  },
  {
    id: 'link-ibps-apply',
    title: 'IBPS Online Application & Scorecard Server (ibpsonline.ibps.in)',
    org: 'IBPS Banking Personnel',
    url: 'https://ibpsonline.ibps.in',
    type: 'apply',
    category: 'latest-jobs',
    clicks: 4890,
    lastClickedAt: new Date().toISOString(),
    healthStatus: 'healthy',
    statusCode: 200,
    isTrending: false,
  },
];

// Helper to get local click delta
function getLocalLinkClicks(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LINK_CLICKS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Track a user link click
export function trackLinkClick(
  url?: string,
  linkType?: string,
  jobTitle?: string,
  category?: string
): void {
  if (!url || typeof window === 'undefined') return;

  try {
    const localClicks = getLocalLinkClicks();
    const cleanUrl = url.trim().toLowerCase();
    localClicks[cleanUrl] = (localClicks[cleanUrl] || 0) + 1;
    localStorage.setItem(STORAGE_KEY_LINK_CLICKS, JSON.stringify(localClicks));

    // Also track by category
    const catKey = `GovtBharat_cat_clicks_${category || 'general'}`;
    const prevCat = parseInt(localStorage.getItem(catKey) || '0', 10);
    localStorage.setItem(catKey, String(prevCat + 1));

    // Optional firestore increment in background
    if (!isFirestoreQuotaExceeded()) {
      const statsDoc = doc(db, 'site_config', 'link_traffic_stats');
      getDoc(statsDoc).then((snap) => {
        const data = snap.exists() ? snap.data() : {};
        const clicksMap = data.clicks || {};
        clicksMap[cleanUrl] = (clicksMap[cleanUrl] || 0) + 1;
        setDoc(statsDoc, {
          clicks: clicksMap,
          lastUpdated: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }).catch(() => {});
    }
  } catch (err) {
    // Non-blocking telemetry
  }
}

// Calculate comprehensive traffic & category stats
export function calculateTrafficAnalytics(jobs: JobAlert[]): TrafficAnalyticsSummary {
  const localClicks = getLocalLinkClicks();

  // 1. Group jobs by category
  const categoryJobCounts: Record<JobCategory, number> = {
    'latest-jobs': 0,
    'admit-cards': 0,
    'results': 0,
    'answer-key': 0,
    'syllabus': 0,
    'admission': 0,
    'documents': 0,
    'important': 0,
  };

  jobs.forEach(j => {
    const cat = (j.category || 'latest-jobs') as JobCategory;
    if (categoryJobCounts[cat] !== undefined) {
      categoryJobCounts[cat] += 1;
    } else {
      categoryJobCounts['latest-jobs'] += 1;
    }
  });

  // 2. Extract links from actual jobs in database and merge with high traffic catalog
  const dynamicLinksMap = new Map<string, HighTrafficLinkItem>();

  // Add baseline items first
  BASELINE_HIGH_TRAFFIC_LINKS.forEach(item => {
    const cleanUrl = item.url.trim().toLowerCase();
    const additional = localClicks[cleanUrl] || 0;
    dynamicLinksMap.set(cleanUrl, {
      ...item,
      clicks: item.clicks + additional,
    });
  });

  // Extract from published jobs
  jobs.forEach(job => {
    if (!job.links) return;
    const org = job.orgName || job.state || 'Govt Portal';

    if (job.links.apply && typeof job.links.apply === 'string' && job.links.apply.startsWith('http')) {
      const u = job.links.apply.trim().toLowerCase();
      const existing = dynamicLinksMap.get(u);
      const added = localClicks[u] || 0;
      const baseHits = (job.viewsCount || 120) * 3 + added;
      if (existing) {
        existing.clicks = Math.max(existing.clicks, baseHits);
      } else {
        dynamicLinksMap.set(u, {
          id: `job-link-${job.id}-apply`,
          title: `${job.title} - Online Application Server`,
          org,
          url: job.links.apply,
          type: 'apply',
          category: job.category || 'latest-jobs',
          clicks: baseHits,
          lastClickedAt: job.postDate || new Date().toISOString(),
          healthStatus: job.linkHealthStatus === 'Needs Review' ? 'needs_review' : 'healthy',
          statusCode: 200,
          isTrending: job.isNew || false,
        });
      }
    }

    if (job.links.admitCard && typeof job.links.admitCard === 'string' && job.links.admitCard.startsWith('http')) {
      const u = job.links.admitCard.trim().toLowerCase();
      const existing = dynamicLinksMap.get(u);
      const added = localClicks[u] || 0;
      const baseHits = (job.viewsCount || 95) * 4 + added;
      if (existing) {
        existing.clicks = Math.max(existing.clicks, baseHits);
      } else {
        dynamicLinksMap.set(u, {
          id: `job-link-${job.id}-admit`,
          title: `${job.title} - Admit Card Hall Ticket Portal`,
          org,
          url: job.links.admitCard,
          type: 'admitCard',
          category: 'admit-cards',
          clicks: baseHits,
          lastClickedAt: job.postDate || new Date().toISOString(),
          healthStatus: 'healthy',
          statusCode: 200,
          isTrending: true,
        });
      }
    }

    if (job.links.result && typeof job.links.result === 'string' && job.links.result.startsWith('http')) {
      const u = job.links.result.trim().toLowerCase();
      const existing = dynamicLinksMap.get(u);
      const added = localClicks[u] || 0;
      const baseHits = (job.viewsCount || 80) * 3 + added;
      if (existing) {
        existing.clicks = Math.max(existing.clicks, baseHits);
      } else {
        dynamicLinksMap.set(u, {
          id: `job-link-${job.id}-result`,
          title: `${job.title} - Result & Cutoff Score Server`,
          org,
          url: job.links.result,
          type: 'result',
          category: 'results',
          clicks: baseHits,
          lastClickedAt: job.postDate || new Date().toISOString(),
          healthStatus: 'healthy',
          statusCode: 200,
          isTrending: job.isNew || false,
        });
      }
    }
  });

  const sortedHighTrafficLinks = Array.from(dynamicLinksMap.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 15);

  // 3. Compute Category Stats
  let totalCalculatedClicks = 0;
  const categoriesList: JobCategory[] = ['latest-jobs', 'admit-cards', 'results', 'answer-key', 'syllabus', 'admission', 'documents', 'important'];

  const rawStats = categoriesList.map(cat => {
    const meta = DEFAULT_CATEGORY_METRICS[cat];
    const jobCount = categoryJobCounts[cat] || 0;
    
    // Read category click overrides
    const localCatBonus = parseInt(
      (typeof window !== 'undefined' ? localStorage.getItem(`GovtBharat_cat_clicks_${cat}`) : '0') || '0', 
      10
    );

    const clicks = meta.baseClicks + (jobCount * 45) + localCatBonus;
    totalCalculatedClicks += clicks;

    let priorityLevel: 'urgent' | 'high' | 'medium' | 'normal' = 'medium';
    let priorityScore = 50;
    let recommendation = 'Keep updated with standard notifications.';

    if (cat === 'latest-jobs') {
      priorityLevel = 'urgent';
      priorityScore = 96;
      recommendation = 'Critical: Highest candidate demand. Ensure active Apply Online & Syllabus links.';
    } else if (cat === 'admit-cards') {
      priorityLevel = 'urgent';
      priorityScore = 91;
      recommendation = 'High Traffic: Candidates need fast direct admit card download servers.';
    } else if (cat === 'results') {
      priorityLevel = 'high';
      priorityScore = 84;
      recommendation = 'Spike Traffic: Publish cutoffs & merit list PDFs immediately on release.';
    } else if (cat === 'answer-key') {
      priorityLevel = 'high';
      priorityScore = 72;
      recommendation = 'Timely: Keep objection window links active for active exams.';
    } else if (cat === 'syllabus') {
      priorityLevel = 'medium';
      priorityScore = 60;
      recommendation = 'Steady: Detailed exam pattern & subject-wise syllabus files.';
    } else {
      priorityLevel = 'normal';
      priorityScore = 45;
      recommendation = 'Maintain accurate official department links & certificate templates.';
    }

    return {
      category: cat,
      label: meta.label,
      count: jobCount,
      clicks,
      sharePercentage: 0, // computed below
      trend: (cat === 'latest-jobs' || cat === 'admit-cards' || cat === 'results' ? 'up' : 'stable') as 'up' | 'stable' | 'down',
      trendPercent: cat === 'latest-jobs' ? 24 : cat === 'admit-cards' ? 19 : cat === 'results' ? 14 : 6,
      priorityLevel,
      priorityScore,
      color: meta.color,
      bgLight: meta.bgLight,
      iconName: cat,
      recommendation,
    };
  });

  // Calculate percentages
  const finalCategoryStats = rawStats.map(s => ({
    ...s,
    sharePercentage: totalCalculatedClicks > 0 ? Math.round((s.clicks / totalCalculatedClicks) * 100) : 0,
  })).sort((a, b) => b.clicks - a.clicks);

  const topCategory = finalCategoryStats[0]?.category || 'latest-jobs';
  const topCategoryClicks = finalCategoryStats[0]?.clicks || 0;
  const topLink = sortedHighTrafficLinks[0];

  return {
    totalClicks: totalCalculatedClicks,
    totalViews: Math.round(totalCalculatedClicks * 1.8),
    topCategory,
    topCategoryClicks,
    topLinkUrl: topLink ? topLink.url : 'https://ssc.gov.in',
    topLinkTitle: topLink ? topLink.title : 'Staff Selection Commission Portal',
    categoryStats: finalCategoryStats,
    highTrafficLinks: sortedHighTrafficLinks,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}
