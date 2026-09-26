export type JobCategory = 'latest-jobs' | 'admit-cards' | 'results' | 'answer-key' | 'syllabus' | 'admission' | 'documents' | 'important';

export interface EmployeePermissions {
  canAddJob: boolean;
  canEditJob: boolean;
  canDeleteJob: boolean;
  canEditTicker: boolean;
  canExportDatabase: boolean;
  canSendBroadcast: boolean;
  canViewAnalytics: boolean;
}

export interface EmployeeUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'employee';
  createdAt: string;
  status: 'active' | 'suspended';
  permissions: EmployeePermissions;
}

export interface DeletedEmployeeLog {
  id: string;
  name: string;
  username: string;
  deletedAt: string;
  deletedBy: string;
}

export interface PostWiseVacancy {
  postName: string;
  total?: string | number;
  eligibility?: string;
  general?: string | number;
  obc?: string | number;
  ews?: string | number;
  sc?: string | number;
  st?: string | number;
}

export interface SubjectItem {
  sno: number | string;
  name: string;
  code?: string;
  eligibility?: string;
}

export interface JobAlert {
  id: string;
  title: string;
  slug?: string;
  category: JobCategory;
  postDate: string; // e.g. "20-05-2026"
  isNew: boolean;
  isExpired?: boolean;
  state: string;
  orgName?: string;
  advtNo?: string;
  postName?: string;
  totalVacancies?: string | number;
  shortInfo?: string;
  ageLimit?: string | {
    min?: string | number;
    max?: string | number;
    asOn?: string;
    relaxation?: string;
    details?: string;
  };
  eligibility?: string;
  qualifications?: string[];
  qualification?: string | string[];
  lastLinkAuditAt?: string;
  postWiseVacancies?: PostWiseVacancy[];
  subjects?: SubjectItem[];
  selectionProcess?: string[];
  salary?: string;
  payScale?: string; // Dedicated Pay Scale or Salary Information
  salaryInfo?: string; // Alias for Salary Information
  payLevel?: string;
  howToApply?: string[];
  importantDocuments?: string[];
  importantInstructions?: string[];
  examPattern?: string;
  syllabus?: string;
  officialSource?: string;
  lastUpdated?: string;
  status?: 'Upcoming' | 'Application Open' | 'Last Date Near' | 'Application Closed' | 'Admit Card Released' | 'Result Released' | 'Answer Key Released' | string;
  viewsCount?: number;
  fees?: {
    general?: string;
    obc?: string;
    ews?: string;
    scSt?: string;
    ph?: string;
    female?: string;
    paymentMode?: string;
  };
  dates?: {
    start?: string;
    last?: string;
    feeLast?: string;
    correctionDate?: string;
    examDate?: string;
    admitCardDate?: string;
    resultDate?: string;
    answerKeyDate?: string;
    reExamDate?: string;
    cityAvailableDate?: string;
  };
  links?: {
    apply?: string;
    applyServer2?: string;
    official?: string;
    notification?: string;
    admitCard?: string;
    admitCardNotice?: string;
    result?: string;
    resultServer2?: string;
    resultNotice?: string;
    cutoff?: string;
    answerKey?: string;
    answerKeyNotice?: string;
    examCity?: string;
    syllabus?: string;
    applicationForm?: string;
    correctionForm?: string;
    meritList?: string;
    examDate?: string;
    videoHindi?: string;
    extendedNotice?: string;
    telegram?: string;
    whatsapp?: string;
    tools?: string;
    otherLinks?: Array<{ title: string; url: string }>;
    [key: string]: any;
  };
  needsReview?: boolean;
  linkHealthStatus?: 'Healthy' | 'Needs Review' | 'Repaired';
  linkReviewStatus?: Record<string, string>;
  unrepairableLinks?: string[];
  sourceId?: string;
  sourceName?: string;
  scrapedAt?: string;
  confidenceScore?: number;
}

export interface ScraperSource {
  id: string;
  name: string;
  url: string;
  officialUrl?: string;
  type: 'rss' | 'html_scraper' | 'api';
  defaultCategory: JobCategory;
  state: string;
  enabled: boolean;
  lastScraped?: string;
  itemCount?: number;
  status: 'idle' | 'success' | 'scraping' | 'error';
  errorMessage?: string;
}

export interface ScrapedPost {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  category: JobCategory;
  postDate: string;
  state: string;
  shortInfo?: string;
  dates?: { start?: string; last?: string };
  fees?: { general?: string; scSt?: string };
  links?: { apply?: string; official?: string; notification?: string };
  scrapedAt: string;
  confidenceScore: number;
  status: 'pending' | 'approved' | 'rejected';
}

export type SocialPlatform = 'telegram' | 'whatsapp' | 'youtube' | 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'discord' | 'threads' | 'other';

export type SuperAdminTabType = 
  | 'websiteControl'
  | 'analytics' 
  | 'marquee' 
  | 'colors'
  | 'columns'
  | 'seo'
  | 'categorySeo'
  | 'sitemap'
  | 'social' 
  | 'earnings'
  | 'site' 
  | 'versions' 
  | 'database' 
  | 'subscribers'
  | 'emailNotifications'
  | 'employees' 
  | 'autofeed' 
  | 'npm'
  | 'pages'
  | 'apiIntegrations'
  | 'activityLogs'
  | 'helpdesk'
  | 'autoBroadcast'
  | 'adsManager'
  | 'jobsManager'
  | 'mobileTabs'
  | 'mobileCardSizing'
  | 'bannersManager'
  | 'approvals'
  | 'documentCenter'
  | 'linkHealth';

export interface EmailNotificationConfig {
  autoSendOnPublish: boolean;
  provider: 'built-in' | 'smtp' | 'resend' | 'sendgrid' | 'webhook';
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  apiKey?: string;
  webhookUrl?: string;
  subjectTemplate: string;
  preheaderText: string;
  bannerTitle: string;
  callToActionText: string;
  footerNote: string;
  sendCategories: string[];
  sendDelaySeconds?: number;
  includePdfLink: boolean;
  includeApplyLink: boolean;
  updatedAt?: string;
}

export interface NotificationDispatchLog {
  id: string;
  jobId: string;
  jobTitle: string;
  category: string;
  sentAt: string;
  recipientCount: number;
  provider: string;
  status: 'delivered' | 'processing' | 'partial' | 'failed';
  subject: string;
  details?: string;
  sampleRecipients?: string[];
}

export interface SocialLinkItem {
  id: string;
  platform: SocialPlatform;
  title: string;
  url: string;
  handle?: string;
  icon?: string;
  isCustom?: boolean;
  badgeText?: string;
  enabled?: boolean;
  order?: number;
  color?: string;
  updatedAt?: string;
}

export interface DynamicPageItem {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  lastUpdated?: string;
  isPublished?: boolean;
  metaDescription?: string;
}

export interface ApiAnalyticsConfig {
  ga4Id?: string;
  telegramBotToken?: string;
  telegramChannelId?: string;
  facebookPixelId?: string;
  whatsappApiKey?: string;
  updatedAt?: string;
}

export interface TicketReply {
  id: string;
  sender: 'user' | 'admin' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface HelpdeskTicket {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category?: string;
  issue: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'high' | 'medium' | 'low';
  unread?: boolean;
  time?: string;
  createdAt: string;
  updatedAt?: string;
  replies?: TicketReply[];
}

export interface SyncLogEntry {
  id: number | string;
  time: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'system';
  sourceName?: string;
  sourceUrl?: string;
  durationMs?: number;
  statusCode?: number;
  errorDetails?: string;
  postsCount?: number;
  endpoint?: string;
}

export interface AppToolItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: string;
  gradient: string;
  accentColor?: string;
  enabled: boolean;
  order: number;
  category?: string;
  description: string;
  examSpecs?: string[];
  howToUse: string[];
  features: string[];
}

export interface AppCategoryButton {
  id: string;
  label: string;
  color: string;
  textColor: string;
  filterKey: string;
  enabled: boolean;
  order: number;
}

export interface MobilePwaCardConfig {
  // Job Card Dimensions (Mobile PWA)
  cardWidthPercent: number;       // 80 to 100 (%)
  cardCustomMaxWidth: number;     // 0 for 100%, or 280 to 600 (px)
  cardHeightMode: 'auto' | 'compact' | 'standard' | 'spacious' | 'custom';
  cardMinHeight: number;          // in px: 48 to 160
  cardPaddingY: number;           // in px: 4 to 20
  cardPaddingX: number;           // in px: 6 to 24
  cardBorderRadius: number;       // in px: 0 to 24
  
  // Job Card Icon Dimensions (Mobile PWA)
  showCardIcon: boolean;          // boolean: whether icon is shown
  iconContainerWidth: number;     // in px: 20 to 60
  iconContainerHeight: number;    // in px: 20 to 60
  iconGraphicSize: number;        // in px: 12 to 36
  iconShape: 'squircle' | 'rounded' | 'circle' | 'square';
  iconBgStyle: 'brand' | 'subtle' | 'gradient' | 'minimal';
  
  // Column Card & Header Icon
  columnCardWidthPercent: number; // 85 to 100 (%)
  columnHeaderIconWidth: number;  // in px: 20 to 48
  columnHeaderIconHeight: number; // in px: 20 to 48
  columnBorderRadius: number;     // in px: 8 to 28
  
  // Font sizes for mobile
  cardTitleFontSize: number;      // in px: 12 to 18
  cardMetaFontSize: number;       // in px: 9 to 13
}

export interface AppBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: string;
  gradient: string;
  readMoreColor?: string;
  buttonText?: string;
  targetType?: 'category' | 'job' | 'url';
  targetValue?: string;
  category?: string;
  boardText?: string;
  illustrationType?: 'classroom' | 'custom_image' | 'gradient_only';
  customImageUrl?: string;
  enabled: boolean;
  order: number;
}

export interface BannerSliderConfig {
  autoSlide: boolean;
  slideIntervalMs: number;
  showDots: boolean;
  showArrows: boolean;
  pauseOnHover: boolean;
  transitionSpeed?: 'normal' | 'smooth' | 'snappy';
}

export interface AppVersionRelease {
  version: string;
  buildNumber?: string | number;
  title: string;
  releaseNotes: string[];
  forceUpdate: boolean;
  targetPlatform?: 'all' | 'mobile_pwa' | 'web';
  releasedAt: string;
  releasedBy?: string;
  downloadUrl?: string;
  status: 'active' | 'archived';
  changelogText?: string;
}

export interface MobileTabsConfig {
  tools: AppToolItem[];
  categoryButtons: AppCategoryButton[];
  banners?: AppBannerItem[];
  bannerSliderConfig?: BannerSliderConfig;
  toolsSectionTitle?: string;
  categorySectionTitle?: string;
  pwaCardConfig?: MobilePwaCardConfig;
  updatedAt?: string;
}




export interface StudentDocument {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  shortDescription: string;
  icon: string;
  officialAuthority: string;
  officialWebsite: string;
  applyUrl: string;
  downloadUrl: string;
  verificationUrl: string;
  eligibility: string;
  requiredDocuments: string[];
  applicationProcess: string;
  applicationFee: string;
  processingTime: string;
  importantNotes: string;
  tags: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
}

export const DOCUMENT_CATEGORIES = [
  { id: 'identity', label: '🪪 Identity Documents' },
  { id: 'education', label: '🎓 Education Documents' },
  { id: 'government', label: '🏛️ Government Certificates' },
  { id: 'exam', label: '📝 Examination Documents' },
  { id: 'job', label: '💼 Career & Job Documents' },
  { id: 'scholarship', label: '💰 Scholarship Documents' },
  { id: 'financial', label: '🏦 Financial Documents' },
  { id: 'pdf-tools', label: '📑 PDF & Document Tools' },
  { id: 'photo-tools', label: '🪪 Photo & Signature Tools' },
  { id: 'verification', label: '🔐 Verification Services' }
];

export interface StagingJob extends JobAlert {
  stagingId?: string;
  sourceType?: 'auto_scraper' | 'github_backend' | 'rss_feed' | 'manual_ingest' | string;
  sourceName?: string;
  sourceUrl?: string;
  ingestedAt?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  autoPromoted?: boolean;
}

export interface BackendPipelineConfig {
  autoPromoteEnabled: boolean;
  webhookSecret: string;
  githubRepoUrl?: string;
  lastIngestAt?: string;
  totalIngestedCount?: number;
}
