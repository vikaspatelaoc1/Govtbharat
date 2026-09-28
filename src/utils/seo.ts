import { getDomainName, getDomainNameLowercase } from '../utils/domain';
import { JobAlert } from '../types';
import { saveSeoConfigToFirestore, saveCategorySeoConfigToFirestore } from '../services/firestoreService';

export interface GlobalSeoConfig {
  siteTitle: string;
  metaDescription: string;
  metaKeywords: string;
  authorName: string;
  ogImageUrl: string;
  robotsDirective: string;
}

export interface CategorySeoItem {
  id: string; // e.g. 'latest-jobs'
  name: string; // 'Latest Jobs'
  hindiName: string; // 'सरकारी नौकरी'
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  ogType: 'website' | 'article' | 'collection';
  canonicalUrl?: string;
  robotsDirective: string;
  schemaType?: string;
  lastUpdated?: string;
}

export type CategorySeoConfigMap = Record<string, CategorySeoItem>;

export const DEFAULT_GLOBAL_SEO: GlobalSeoConfig = {
  siteTitle: `${getDomainName()} | GovtBharat - Latest Online Form, Admit Card & Results 2026`,
  metaDescription: `${getDomainName()} - GovtBharat Government Jobs Portal: Get instant updates for latest Sarkari Naukri, Online Forms, Admit Cards, Exam Results, Answer Keys, Syllabus & Admissions 2026.`,
  metaKeywords: `${getDomainName()}, Sarkari Result, Govt Jobs 2026, Latest Online Form, Admit Card, Exam Results, Answer Key, GovtBharat, Recruitment Notification`,
  authorName: `${getDomainName()}`,
  ogImageUrl: "/logo.png",
  robotsDirective: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
};

export const DEFAULT_CATEGORY_SEO: CategorySeoConfigMap = {
  'latest-jobs': {
    id: 'latest-jobs',
    name: 'Latest Jobs',
    hindiName: 'सरकारी नौकरी',
    metaTitle: 'Latest Govt Jobs 2026 - Apply Online for 50,000+ Sarkari Naukri Vacancies | GovtBharat',
    metaDescription: 'Explore all latest Central & State Govt Job vacancies 2026. Get instant notifications, eligibility criteria, online application links & exam dates on GovtBharat.',
    metaKeywords: 'Latest Govt Jobs 2026, Sarkari Naukri, Online Form 2026, Railway Recruitment, SSC CGL, UPSC, Bank PO, Police Bharti, GovtBharat',
    ogTitle: 'Latest Govt Jobs & Sarkari Online Forms 2026 - GovtBharat',
    ogDescription: 'Daily updated government job vacancies with direct online apply links and notifications.',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'CollectionPage'
  },
  'admit-cards': {
    id: 'admit-cards',
    name: 'Admit Card',
    hindiName: 'प्रवेश पत्र',
    metaTitle: 'Admit Card 2026 - Download Hall Ticket, Call Letter & Exam City Slip | GovtBharat',
    metaDescription: 'Download official Admit Cards, Hall Tickets & Exam City Intimation Slips for SSC, UPSC, Railway, State PSC & Banking Exams 2026 at GovtBharat.',
    metaKeywords: 'Admit Card 2026, Hall Ticket Download, Exam City Slip, Call Letter, SSC Admit Card, Railway Hall Ticket, Sarkari Admit Card, GovtBharat',
    ogTitle: 'Official Exam Admit Cards & Hall Tickets 2026 - GovtBharat',
    ogDescription: 'Instant direct server links to download exam admit cards and view examination center.',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'CollectionPage'
  },
  'results': {
    id: 'results',
    name: 'Results',
    hindiName: 'परीक्षा परिणाम',
    metaTitle: 'Sarkari Exam Results 2026 - Merit List, Score Card & Cut Off Marks | GovtBharat',
    metaDescription: 'Check Sarkari Exam Results, Merit Lists, Final Selection Lists & Cut-Off Marks 2026. Direct server links with roll number search on GovtBharat.',
    metaKeywords: 'Sarkari Result 2026, Exam Results, Merit List PDF, Cut Off Marks, Score Card Download, Final Result, GovtBharat',
    ogTitle: 'Latest Sarkari Exam Results & Merit Lists 2026 - GovtBharat',
    ogDescription: 'Fastest exam result publication with direct download servers and cut-off lists.',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'CollectionPage'
  },
  'answer-key': {
    id: 'answer-key',
    name: 'Answer Key',
    hindiName: 'उत्तर कुंजी',
    metaTitle: 'Official Answer Key 2026 - Download Solved Question Papers & Challenge Objections | GovtBharat',
    metaDescription: 'Download official provisional & final Answer Keys 2026 with question papers. Submit online objections & calculate expected scores on GovtBharat.',
    metaKeywords: 'Answer Key 2026, Official Answer Sheet, Question Paper Solution, Objection Link, Response Sheet, GovtBharat',
    ogTitle: 'Official Answer Keys & Solved Papers 2026 - GovtBharat',
    ogDescription: 'Download official response sheets, answer keys, and submit objection forms.',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'CollectionPage'
  },
  'syllabus': {
    id: 'syllabus',
    name: 'Syllabus',
    hindiName: 'पाठ्यक्रम',
    metaTitle: 'Exam Syllabus & Exam Pattern PDF 2026 - Download Previous Year Question Papers | GovtBharat',
    metaDescription: 'Download updated subject-wise Exam Syllabus & latest Exam Pattern PDFs 2026 for SSC, Railway, UPSC, Teaching, Defence & Police exams on GovtBharat.',
    metaKeywords: 'Exam Syllabus 2026, Syllabus PDF Download, Exam Pattern, Marking Scheme, Previous Year Papers, GovtBharat',
    ogTitle: 'Updated Exam Syllabus & Question Patterns 2026 - GovtBharat',
    ogDescription: 'Comprehensive subject-wise syllabus PDFs, test patterns, and previous papers.',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'CollectionPage'
  },
  'admission': {
    id: 'admission',
    name: 'Admission',
    hindiName: 'प्रवेश',
    metaTitle: 'Admission 2026 - Entrance Exams, College Admissions & Counselling Forms | GovtBharat',
    metaDescription: 'Find university admissions, college entrance examination forms, counseling schedules, eligibility & prospectus downloads 2026 on GovtBharat.',
    metaKeywords: 'Admission 2026, University Admission, Entrance Exam, CUET, NEET, JEE, College Counselling, GovtBharat',
    ogTitle: 'University Admission & Entrance Exam Forms 2026 - GovtBharat',
    ogDescription: 'Apply online for top universities, diploma courses, and entrance exam forms.',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'CollectionPage'
  },
  'documents': {
    id: 'documents',
    name: 'Certificate & Documents',
    hindiName: 'प्रमाण पत्र व सेवाएं',
    metaTitle: 'Certificate & Online Services 2026 - Pan Card, Voter ID, Aadhar & Certificates | GovtBharat',
    metaDescription: 'Official links for online government citizen services: Pan Card, Aadhar update, Voter ID, Domicile, Caste & Income Certificate verification on GovtBharat.',
    metaKeywords: 'Online Services, Certificate Verification, Pan Card Apply, Voter Card, Aadhar Card, Caste Certificate, Domicile, GovtBharat',
    ogTitle: 'Government Certificates & Online Citizen Services - GovtBharat',
    ogDescription: 'Access direct citizen online verification links, identity cards, and certificates.',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'CollectionPage'
  },
  'important': {
    id: 'important',
    name: 'Important Links',
    hindiName: 'आवश्यक सूचना',
    metaTitle: 'Important Links & Official Notices 2026 - GovtBharat Jobs Portal Alerts',
    metaDescription: 'Check critical government alerts, recruitment notices, application deadline extensions, OTP corrections & official portals on GovtBharat.',
    metaKeywords: 'Important Notices, Govt Alerts, Date Extension, Correction Window, Official Portals, GovtBharat',
    ogTitle: 'Important Government Notices & Alert Bulletins - GovtBharat',
    ogDescription: 'Crucial alerts, date extensions, correction links, and government announcements.',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'CollectionPage'
  }
};

const SEO_STORAGE_KEY = 'GovtBharat_global_seo_config';
const CATEGORY_SEO_STORAGE_KEY = 'GovtBharat_category_seo_config';

/**
 * Loads custom global SEO configuration from LocalStorage or returns defaults.
 */
export function loadGlobalSeoConfig(): GlobalSeoConfig {
  if (typeof window === 'undefined') return DEFAULT_GLOBAL_SEO;
  try {
    const saved = localStorage.getItem(SEO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_GLOBAL_SEO, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to parse saved SEO config from localStorage:', err);
  }
  return DEFAULT_GLOBAL_SEO;
}

/**
 * Saves global SEO configuration to LocalStorage and triggers live update event.
 */
export function saveGlobalSeoConfig(config: GlobalSeoConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('GovtBharat_seo_updated', { detail: config }));

    // Asynchronously save to Firestore database
    saveSeoConfigToFirestore(config).catch(err => {
      console.warn('Firestore SEO config sync error:', err);
    });
  } catch (err) {
    console.warn('Failed to save SEO config to localStorage:', err);
  }
}

/**
 * Loads custom Category SEO configurations from LocalStorage or returns defaults.
 */
export function loadCategorySeoConfig(): CategorySeoConfigMap {
  if (typeof window === 'undefined') return DEFAULT_CATEGORY_SEO;
  try {
    const saved = localStorage.getItem(CATEGORY_SEO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CATEGORY_SEO, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to parse saved Category SEO config from localStorage:', err);
  }
  return DEFAULT_CATEGORY_SEO;
}

/**
 * Saves Category SEO configurations to LocalStorage and triggers live update event.
 */
export function saveCategorySeoConfig(configs: CategorySeoConfigMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORY_SEO_STORAGE_KEY, JSON.stringify(configs));
    window.dispatchEvent(new CustomEvent('GovtBharat_category_seo_updated', { detail: configs }));

    // Asynchronously save to Firestore database
    saveCategorySeoConfigToFirestore(configs).catch(err => {
      console.warn('Firestore Category SEO config sync error:', err);
    });
  } catch (err) {
    console.warn('Failed to save Category SEO config to localStorage:', err);
  }
}

/**
 * Helper to update or create a meta tag by name or property attribute.
 */
function setMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create a canonical link tag.
 */
function setCanonicalUrl(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Helper to inject or update JSON-LD Structured Data Schema for Google indexing.
 */
function setJsonLdSchema(id: string, schemaObj: object) {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaObj, null, 2);
}

/**
 * Injects dynamic SEO metadata for a specific Job/Result/Admit Card detail page.
 */
export function updateJobDetailSeo(job: JobAlert) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const baseUrl = window.location.origin;
  const canonicalUrl = `${baseUrl}/?jobId=${encodeURIComponent(job.id)}`;
  const siteName = getDomainName();

  const categoryName = job.category
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const fullTitle = `${job.title} - ${categoryName} 2026 | ${getDomainName()}`;
  const description = job.shortInfo && job.shortInfo.trim().length > 20
    ? `${job.title}: ${job.shortInfo.slice(0, 160)}... Check eligibility, important dates, and apply online on GovtBharat.`
    : `${job.title} notification released. Check latest eligibility, total vacancies, examination dates, admit card, and direct online form links at GovtBharat.`;

  const keywords = [
    job.title,
    categoryName,
    "Sarkari Result",
    "Govt Jobs 2026",
    "Admit Card",
    "Answer Key",
    "Online Form",
    job.state || 'All India',
    "GovtBharat"
  ].filter(Boolean).join(', ');

  const imageUrl = `${baseUrl}/logo.png`;

  // 1. Browser Title
  document.title = fullTitle;

  // 2. Primary Meta Tags
  setMetaTag('name', 'title', fullTitle);
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // 3. Canonical Link
  setCanonicalUrl(canonicalUrl);

  // 4. OpenGraph Meta Tags
  setMetaTag('property', 'og:type', 'article');
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:title', fullTitle);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:site_name', siteName);

  // 5. Twitter Meta Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:url', canonicalUrl);
  setMetaTag('name', 'twitter:title', fullTitle);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', imageUrl);

  // 6. Google JobPosting / Article Schema.org Structured Data
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": description,
    "datePosted": job.dates?.start || job.postDate || new Date().toISOString().split('T')[0],
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Government Recruitment / Exam Board",
      "sameAs": canonicalUrl
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.state || "India",
        "addressCountry": "IN"
      }
    },
    "url": canonicalUrl
  };

  if (job.dates?.last) {
    schema["validThrough"] = job.dates.last;
  }

  setJsonLdSchema('seo-schema', schema);
}

/**
 * Injects dedicated Category SEO metadata for a given Category tab.
 */
export function updateCategorySeo(categoryId: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const categoryConfigs = loadCategorySeoConfig();
  const globalSeo = loadGlobalSeoConfig();
  const baseUrl = window.location.origin;

  // Normalized key check (e.g. 'latest-jobs', 'services' -> 'documents')
  const normKey = categoryId === 'services' ? 'documents' : categoryId;
  const catConfig = categoryConfigs[normKey] || DEFAULT_CATEGORY_SEO[normKey];

  if (!catConfig) {
    resetDefaultSeo(categoryId);
    return;
  }

  const title = catConfig.metaTitle || `${catConfig.name} 2026 - Latest Notifications & Updates | GovtBharat`;
  const description = catConfig.metaDescription || globalSeo.metaDescription;
  const keywords = catConfig.metaKeywords || globalSeo.metaKeywords;
  const canonicalUrl = catConfig.canonicalUrl || `${baseUrl}/?tab=${encodeURIComponent(categoryId)}`;
  const imageUrl = catConfig.ogImageUrl?.startsWith('http')
    ? catConfig.ogImageUrl
    : `${baseUrl}${catConfig.ogImageUrl || globalSeo.ogImageUrl || '/logo.png'}`;
  const ogTitle = catConfig.ogTitle || title;
  const ogDescription = catConfig.ogDescription || description;
  const robots = catConfig.robotsDirective || globalSeo.robotsDirective || 'index, follow, max-image-preview:large';

  // 1. Browser Title
  document.title = title;

  // 2. Primary Meta Tags
  setMetaTag('name', 'title', title);
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'author', globalSeo.authorName || 'GovtBharat');
  setMetaTag('name', 'robots', robots);

  // 3. Canonical Link
  setCanonicalUrl(canonicalUrl);

  // 4. OpenGraph Meta Tags
  setMetaTag('property', 'og:type', catConfig.ogType || 'website');
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:title', ogTitle);
  setMetaTag('property', 'og:description', ogDescription);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:site_name', "GovtBharat");

  // 5. Twitter Meta Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:url', canonicalUrl);
  setMetaTag('name', 'twitter:title', ogTitle);
  setMetaTag('name', 'twitter:description', ogDescription);
  setMetaTag('name', 'twitter:image', imageUrl);

  // 6. Category Collection Schema.org
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": catConfig.schemaType || "CollectionPage",
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "publisher": {
      "@type": "Organization",
      "name": globalSeo.authorName || "GovtBharat",
      "logo": {
        "@type": "ImageObject",
        "url": imageUrl
      }
    }
  };

  setJsonLdSchema('seo-schema', categorySchema);
}

/**
 * Resets or applies the default homepage / category SEO metadata based on Super Admin custom settings.
 */
export function resetDefaultSeo(activeTab = 'home') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // If a category tab is active (not 'home'), prioritize Category SEO configuration
  if (activeTab && activeTab !== 'home') {
    const categoryConfigs = loadCategorySeoConfig();
    const normKey = activeTab === 'services' ? 'documents' : activeTab;
    if (categoryConfigs[normKey] || DEFAULT_CATEGORY_SEO[normKey]) {
      updateCategorySeo(normKey);
      return;
    }
  }

  const globalSeo = loadGlobalSeoConfig();
  const baseUrl = window.location.origin;

  let title = globalSeo.siteTitle || DEFAULT_GLOBAL_SEO.siteTitle;
  
  // Ensure we don't show the ugly all-caps WWW...
  title = title.replace(/WWW\.(GovtBharat\.INFO|GOVTBHARAT\.COM)/ig, getDomainName());

  let canonicalUrl = `${baseUrl}/`;

  if (activeTab === 'home') {
    title = `Home | ${title.replace(/(GovtBharat\.info|GovtBharat\.com)\s*\|\s*/i, '')}`;
  } else if (activeTab && activeTab !== 'home') {
    const tabName = activeTab
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    title = `${tabName} 2026 - Latest Notifications & Updates | ${getDomainName()}`;
    canonicalUrl = `${baseUrl}/?tab=${encodeURIComponent(activeTab)}`;
  }

  const description = (globalSeo.metaDescription || DEFAULT_GLOBAL_SEO.metaDescription).replace(/WWW\.(GovtBharat\.INFO|GOVTBHARAT\.COM)/ig, getDomainName());
  const keywords = (globalSeo.metaKeywords || DEFAULT_GLOBAL_SEO.metaKeywords).replace(/WWW\.(GovtBharat\.INFO|GOVTBHARAT\.COM)/ig, getDomainName());
  const imageUrl = globalSeo.ogImageUrl?.startsWith('http')
    ? globalSeo.ogImageUrl
    : `${baseUrl}${globalSeo.ogImageUrl || '/logo.png'}`;

  // 1. Browser Title
  document.title = title;

  // 2. Primary Meta Tags
  setMetaTag('name', 'title', title);
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'author', (globalSeo.authorName || getDomainName()).replace(/WWW\.(GovtBharat\.INFO|GOVTBHARAT\.COM)/ig, getDomainName()));
  setMetaTag('name', 'robots', globalSeo.robotsDirective || DEFAULT_GLOBAL_SEO.robotsDirective);

  // 3. Canonical Link
  setCanonicalUrl(canonicalUrl);

  // 4. OpenGraph Meta Tags
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:site_name', `${getDomainName()}`);

  // 5. Twitter Meta Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:url', canonicalUrl);
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', imageUrl);

  // 6. Base WebSite Schema.org
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": `${getDomainName()}`,
    "alternateName": "GovtBharat",
    "url": canonicalUrl,
    "author": {
      "@type": "Organization",
      "name": globalSeo.authorName || `${getDomainName()}`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  setJsonLdSchema('seo-schema', baseSchema);
}

