import { JobAlert, JobCategory, PostWiseVacancy, SubjectItem } from '../types';

/**
 * Creates a clean, URL-friendly slug from job title
 */
export function generateJobSlug(title: string, id?: string): string {
  if (!title) return id ? `job-${id}` : 'govt-job-details';
  const clean = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  return clean || (id ? `job-${id}` : 'govt-job-details');
}

/**
 * Strips RSS/feed/XML artifacts and suffixes from URLs to guarantee pure, clean official portal links.
 * E.g., 'https://bssc.bihar.gov.in/rss.xml' -> 'https://bssc.bihar.gov.in'
 *       'https://bssc.bihar.gov.in/rss.xml/' -> 'https://bssc.bihar.gov.in'
 *       'https://ssc.gov.in/notices/rss.xml' -> 'https://ssc.gov.in'
 *       'https://ssc.gov.in/feed.xml' -> 'https://ssc.gov.in'
 *       'https://domain.gov.in/feed' -> 'https://domain.gov.in'
 *       'https://domain.gov.in/atom.xml' -> 'https://domain.gov.in'
 *       'https://telangana.urbandevelopment.gov.in/rss.xml/admit-card' -> 'https://telangana.urbandevelopment.gov.in/admit-card'
 */
import { normalizeExternalUrl } from './urlUtils';
import { resolveOfficialPortals } from './govtPortals';

export function cleanOfficialUrl(url?: string, defaultFallback: string = 'https://india.gov.in'): string {
  const norm = normalizeExternalUrl(url);
  if (!norm) return defaultFallback;
  
  try {
    const u = new URL(norm);
    
    // Only strip feed-related search parameters explicitly, preserve others
    if (u.search) {
      const params = new URLSearchParams(u.search);
      if (params.has('feed')) params.delete('feed');
      if (params.has('format') && params.get('format') === 'xml') params.delete('format');
      u.search = params.toString();
    }

    // Strip feed artifacts from pathname safely, preserving normal paths
    let path = u.pathname
      .replace(/\/(rss|feed|atom)\.xml$/i, '')
      .replace(/\/(rss|feed|rss-feed|feeds)$/i, '')
      .replace(/\.xml$/i, '')
      .replace(/\/$/, '');
      
    u.pathname = path || '/';

    return u.toString();
  } catch {
    return norm;
  }
}

/**
 * Smart organization matcher from job title or state
 */
export function detectOrganization(title: string = '', state: string = ''): { orgName: string; officialUrl: string; applyUrl: string } {
  const t = title.toLowerCase();

  if (t.includes('ssc') || t.includes('staff selection')) {
    return {
      orgName: 'Staff Selection Commission (SSC)',
      officialUrl: 'https://ssc.gov.in',
      applyUrl: 'https://ssc.gov.in'
    };
  }
  if (t.includes('upsc') || t.includes('union public service')) {
    return {
      orgName: 'Union Public Service Commission (UPSC)',
      officialUrl: 'https://upsc.gov.in',
      applyUrl: 'https://upsconline.nic.in'
    };
  }
  if (t.includes('rrb') || t.includes('railway') || t.includes('alp') || t.includes('ntpc')) {
    return {
      orgName: 'Railway Recruitment Control Board (RRB / Indian Railways)',
      officialUrl: 'https://indianrailways.gov.in',
      applyUrl: 'https://rrbapply.gov.in'
    };
  }
  if (t.includes('nta') || t.includes('ugc net') || t.includes('neet') || t.includes('cuet') || t.includes('jee')) {
    return {
      orgName: 'National Testing Agency (NTA)',
      officialUrl: 'https://nta.ac.in',
      applyUrl: 'https://ugcnet.nta.ac.in'
    };
  }
  if (t.includes('ibps')) {
    return {
      orgName: 'Institute of Banking Personnel Selection (IBPS)',
      officialUrl: 'https://ibps.in',
      applyUrl: 'https://ibps.in'
    };
  }
  if (t.includes('sbi') || t.includes('state bank of india')) {
    return {
      orgName: 'State Bank of India (SBI)',
      officialUrl: 'https://sbi.co.in/careers',
      applyUrl: 'https://sbi.co.in/careers'
    };
  }
  if (t.includes('uppbpb') || (t.includes('up') && (t.includes('police') || t.includes('constable') || t.includes('sub inspector') || t.includes('si')))) {
    return {
      orgName: 'Uttar Pradesh Police Recruitment & Promotion Board (UPPRPB)',
      officialUrl: 'https://uppbpb.gov.in',
      applyUrl: 'https://uppbpb.gov.in'
    };
  }
  if (t.includes('bpsc') || (t.includes('bihar') && t.includes('public service'))) {
    return {
      orgName: 'Bihar Public Service Commission (BPSC)',
      officialUrl: 'https://bpsc.bih.nic.in',
      applyUrl: 'https://onlinebpsc.bihar.gov.in'
    };
  }
  if (t.includes('bssc') || (t.includes('bihar') && t.includes('staff selection'))) {
    return {
      orgName: 'Bihar Staff Selection Commission (BSSC)',
      officialUrl: 'https://bssc.bihar.gov.in',
      applyUrl: 'https://onlinebssc.com'
    };
  }
  if (t.includes('cbse') || t.includes('ctet')) {
    return {
      orgName: 'Central Board of Secondary Education (CBSE / CTET)',
      officialUrl: 'https://cbse.gov.in',
      applyUrl: 'https://ctet.nic.in'
    };
  }
  if (t.includes('navy') || t.includes('agniveer navy') || t.includes('nausena')) {
    return {
      orgName: 'Indian Navy (Nausena Bharti)',
      officialUrl: 'https://joinindiannavy.gov.in',
      applyUrl: 'https://joinindiannavy.gov.in'
    };
  }
  if (t.includes('airforce') || t.includes('air force') || t.includes('afcat') || t.includes('agniveer vayu')) {
    return {
      orgName: 'Indian Air Force (Bhartiya Vayu Sena)',
      officialUrl: 'https://agnipathvayu.cdac.in',
      applyUrl: 'https://agnipathvayu.cdac.in'
    };
  }
  if (t.includes('army') || t.includes('agniveer army') || t.includes('join indian army')) {
    return {
      orgName: 'Join Indian Army (Bhartiya Thal Sena)',
      officialUrl: 'https://joinindianarmy.nic.in',
      applyUrl: 'https://joinindianarmy.nic.in'
    };
  }
  if (t.includes('dsssb') || (t.includes('delhi') && t.includes('subordinate'))) {
    return {
      orgName: 'Delhi Subordinate Services Selection Board (DSSSB)',
      officialUrl: 'https://dsssb.delhi.gov.in',
      applyUrl: 'https://dsssbonline.nic.in'
    };
  }
  if (t.includes('rpsc') || (t.includes('rajasthan') && t.includes('public service'))) {
    return {
      orgName: 'Rajasthan Public Service Commission (RPSC)',
      officialUrl: 'https://rpsc.rajasthan.gov.in',
      applyUrl: 'https://sso.rajasthan.gov.in'
    };
  }
  if (t.includes('rsmssb') || (t.includes('rajasthan') && t.includes('subordinate'))) {
    return {
      orgName: 'Rajasthan Staff Selection Board (RSSB / RSMSSB)',
      officialUrl: 'https://rsmssb.rajasthan.gov.in',
      applyUrl: 'https://sso.rajasthan.gov.in'
    };
  }
  if (t.includes('mppsc') || (t.includes('madhya pradesh') && t.includes('public service'))) {
    return {
      orgName: 'Madhya Pradesh Public Service Commission (MPPSC)',
      officialUrl: 'https://mppsc.mp.gov.in',
      applyUrl: 'https://mponline.gov.in'
    };
  }
  if (t.includes('esb') || t.includes('peb') || (t.includes('mp') && t.includes('vyapam'))) {
    return {
      orgName: 'Madhya Pradesh Employees Selection Board (MP ESB / Vyapam)',
      officialUrl: 'https://esb.mp.gov.in',
      applyUrl: 'https://esb.mp.gov.in'
    };
  }
  if (t.includes('ukpsc') || (t.includes('uttarakhand') && t.includes('public service'))) {
    return {
      orgName: 'Uttarakhand Public Service Commission (UKPSC)',
      officialUrl: 'https://psc.uk.gov.in',
      applyUrl: 'https://ukpsc.net.in'
    };
  }
  if (t.includes('hssc') || (t.includes('haryana') && t.includes('staff selection'))) {
    return {
      orgName: 'Haryana Staff Selection Commission (HSSC)',
      officialUrl: 'https://hssc.gov.in',
      applyUrl: 'https://onetimeregn.haryana.gov.in'
    };
  }
  if (t.includes('jssc') || (t.includes('jharkhand') && t.includes('staff selection'))) {
    return {
      orgName: 'Jharkhand Staff Selection Commission (JSSC)',
      officialUrl: 'https://jssc.nic.in',
      applyUrl: 'https://jssc.nic.in'
    };
  }

  // Fallback based on State and Title
  const resolved = resolveOfficialPortals({ title, state });
  return {
    orgName: resolved.orgName,
    officialUrl: resolved.official,
    applyUrl: resolved.apply
  };
}

/**
 * Extracts total vacancies number or string from title/text
 */
export function extractVacancies(title: string = '', shortInfo: string = ''): string | undefined {
  const text = `${title} ${shortInfo}`;
  // Patterns like "17,727 Posts", "60,244 Post", "4455 Vacancies", "2000 पद"
  const match = text.match(/([\d,]+)\s*(?:posts?|vacanc(?:y|ies)|seats?|पद)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return undefined;
}

/**
 * Extracts advertisement / notification number
 */
export function extractAdvtNo(title: string = '', shortInfo: string = ''): string | undefined {
  const text = `${title} ${shortInfo}`;
  const match = text.match(/(?:advt\.?\s*no\.?|notification\s*no\.?|cen\s*no\.?|crp\s*[-–\w/]+)[:\s]*([a-z0-9/–_-]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  // If year exists, generate realistic advt no
  const yearMatch = title.match(/20\d\d/);
  const year = yearMatch ? yearMatch[0] : '2026';
  return `EN/${year}/Govt-Notif`;
}

/**
 * Calculates current job status from dates and category
 */
export function calculateJobStatus(
  category: JobCategory,
  dates?: { start?: string; last?: string; examDate?: string; resultDate?: string; admitCardDate?: string; answerKeyDate?: string }
): 'Upcoming' | 'Application Open' | 'Last Date Near' | 'Application Closed' | 'Admit Card Released' | 'Result Released' | 'Answer Key Released' {
  if (category === 'results' || dates?.resultDate) {
    return 'Result Released';
  }
  if (category === 'admit-cards' || dates?.admitCardDate) {
    return 'Admit Card Released';
  }
  if (category === 'answer-key' || dates?.answerKeyDate) {
    return 'Answer Key Released';
  }

  const lastDateStr = dates?.last;
  const startDateStr = dates?.start;

  if (lastDateStr && lastDateStr !== 'N/A' && lastDateStr !== '-') {
    const match = lastDateStr.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (match) {
      const lastDate = new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
      lastDate.setHours(23, 59, 59, 999);
      const now = new Date();
      const diffDays = Math.ceil((lastDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return 'Application Closed';
      }
      if (diffDays <= 3) {
        return 'Last Date Near';
      }
    }
  }

  if (startDateStr && startDateStr !== 'N/A' && startDateStr !== '-') {
    const match = startDateStr.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (match) {
      const startDate = new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
      startDate.setHours(0, 0, 0, 0);
      const now = new Date();
      if (now < startDate) {
        return 'Upcoming';
      }
    }
  }

  return 'Application Open';
}

/**
 * Standard formatted date string: DD Month YYYY (e.g. 30 August 2026)
 */
export function formatLongDate(dateInput?: string | Date): string {
  if (!dateInput) {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  if (dateInput instanceof Date) {
    return dateInput.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  // If already "30 August 2026", return as is
  if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }

  // Parse DD-MM-YYYY or DD/MM/YYYY
  const match = dateInput.trim().match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (match) {
    const d = new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }

  return dateInput;
}

/**
 * Normalizes and guarantees complete government job details structure
 * Zero/minimum manual data entry needed: automatically extracts & synthesizes rich sections!
 */
export function enrichJobDetails(rawJob: Partial<JobAlert>): JobAlert {
  const title = (rawJob.title || 'Govt Recruitment Notification 2026').trim();
  const id = rawJob.id || `job-${Date.now()}`;
  const category: JobCategory = (rawJob.category as JobCategory) || 'latest-jobs';
  const state = rawJob.state || 'Central';
  const postDate = rawJob.postDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const slug = rawJob.slug || generateJobSlug(title, id);

  // Auto-detect organization & default verified URLs
  const org = detectOrganization(title, state);
  const orgName = rawJob.orgName || org.orgName;

  // Extract vacancy numbers
  let totalVacancies = rawJob.totalVacancies || extractVacancies(title, rawJob.shortInfo || '');
  if (!totalVacancies || totalVacancies === 'Multiple Posts' || totalVacancies === 'N/A') {
    const titleVacMatch = title.match(/(\d[\d,]+)\s*(?:Post|Vacancy|Vacancies|Seat)/i);
    if (titleVacMatch) {
      totalVacancies = `${titleVacMatch[1]} Posts`;
    } else {
      totalVacancies = category === 'results' || category === 'admit-cards' || category === 'answer-key'
        ? 'As per Notification'
        : 'Multiple Posts (Various Positions)';
    }
  }

  // Advt No
  let advtNo = rawJob.advtNo || extractAdvtNo(title, rawJob.shortInfo || '');
  if (!advtNo) {
    const cleanOrg = orgName.replace(/[^a-zA-Z]/g, '').substring(0, 5).toUpperCase() || 'GOVT';
    const year = new Date().getFullYear();
    advtNo = `Advt No. ${cleanOrg}/${year}/Rectt-01`;
  }

  // Extract Post Name
  let postName = rawJob.postName;
  if (!postName) {
    if (title.includes('CGL')) postName = 'Combined Graduate Level (Various Group B & C Posts)';
    else if (title.includes('CHSL')) postName = 'Combined Higher Secondary Level (LDC / JSA / DEO)';
    else if (title.includes('ALP') || title.includes('Loco Pilot')) postName = 'Assistant Loco Pilot (ALP) & Technician';
    else if (title.includes('PO')) postName = 'Probationary Officer (PO / MT)';
    else if (title.includes('Clerk')) postName = 'Clerk / Junior Associate';
    else if (title.includes('Constable')) postName = 'Police Constable & PAC';
    else if (title.includes('Sub Inspector') || title.includes('SI')) postName = 'Sub Inspector (SI) / Platoon Commander';
    else if (title.includes('NET') || title.includes('JRF')) postName = 'Assistant Professor & Junior Research Fellowship (JRF)';
    else if (title.includes('Teacher') || title.includes('TGT') || title.includes('PGT')) postName = 'Teaching Faculty (TGT / PGT / PRT)';
    else {
      // Clean post name from title
      postName = title.replace(/\b(202\d|recruitment|online form|apply online|notification|out|released)\b/gi, '').trim();
      if (!postName) postName = 'Various Group A, B & C Posts';
    }
  }

  // Dates handling
  const rawDates = rawJob.dates || {};
  let startDate = rawDates.start && rawDates.start !== '-' ? rawDates.start : postDate;
  let lastDateVal = rawDates.last;
  if (!lastDateVal || lastDateVal === '-' || lastDateVal.toLowerCase().includes('check official') || lastDateVal === 'Notify Soon') {
    if (category === 'latest-jobs' || category === 'admission') {
      const baseDateStr = startDate || postDate;
      const m = baseDateStr.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
      if (m) {
        const d = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10) + 25);
        lastDateVal = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
      } else {
        lastDateVal = '30 Days from Notification';
      }
    } else if (category === 'admit-cards') {
      lastDateVal = 'Till Exam Date';
    } else if (category === 'results') {
      lastDateVal = 'Active Online';
    } else if (category === 'answer-key') {
      lastDateVal = 'Within 7 Days of Release';
    } else {
      lastDateVal = 'Available Now';
    }
  }

  const dates = {
    start: startDate,
    last: lastDateVal,
    feeLast: rawDates.feeLast && !rawDates.feeLast.toLowerCase().includes('check official') ? rawDates.feeLast : lastDateVal,
    correctionDate: rawDates.correctionDate || 'As per Official Notice',
    examDate: rawDates.examDate || (category === 'admit-cards' ? 'Check Admit Card / Exam Schedule' : 'To Be Announced'),
    admitCardDate: rawDates.admitCardDate || (category === 'admit-cards' ? 'Available Now' : 'Before Examination'),
    resultDate: rawDates.resultDate || (category === 'results' ? 'Declared Today' : 'After Examination'),
    answerKeyDate: rawDates.answerKeyDate || (category === 'answer-key' ? 'Released Now' : 'After Examination')
  };

  // Fees handling
  const rawFees = rawJob.fees || {};
  let fees = {
    general: rawFees.general || (category === 'results' || category === 'admit-cards' || category === 'answer-key' ? 'N/A' : '₹100/- to ₹500/-'),
    obc: rawFees.obc || rawFees.general || (category === 'results' || category === 'admit-cards' || category === 'answer-key' ? 'N/A' : '₹100/- to ₹500/-'),
    ews: rawFees.ews || rawFees.general || (category === 'results' || category === 'admit-cards' || category === 'answer-key' ? 'N/A' : '₹100/-'),
    scSt: rawFees.scSt || (category === 'results' || category === 'admit-cards' || category === 'answer-key' ? 'N/A' : '₹0/- (Exempted)'),
    ph: rawFees.ph || '₹0/- (Exempted)',
    female: rawFees.female || '₹0/- (Exempted / As per Rules)',
    paymentMode: rawFees.paymentMode || 'Pay the Examination Fee Through Debit Card, Credit Card, Net Banking, UPI, or E-Challan Mode.'
  };

  // Age Limit Handling
  let ageLimit = rawJob.ageLimit;
  if (!ageLimit) {
    if (title.includes('Constable') || title.includes('Army') || title.includes('Navy') || title.includes('Air Force')) {
      ageLimit = 'Minimum Age: 18 Years | Maximum Age: 25 Years. Age Relaxation Extra as per Official Recruitment Rules.';
    } else if (title.includes('NET') || title.includes('JRF')) {
      ageLimit = 'JRF: Maximum Age 31 Years | Assistant Professor (NET): No Age Limit. Age Relaxation Extra as per UGC NET Exam Rules.';
    } else if (title.includes('PO') || title.includes('Officer') || title.includes('CGL')) {
      ageLimit = 'Minimum Age: 18 to 20 Years | Maximum Age: 30 to 32 Years. Age Relaxation as per Category (OBC: 3 Yrs, SC/ST: 5 Yrs).';
    } else {
      ageLimit = 'Minimum Age: 18 Years | Maximum Age: 28 to 35 Years (As on Last Date of Application). Age Relaxation Extra as per Rules.';
    }
  }

  // Eligibility Handling
  let eligibility = rawJob.eligibility;
  if (!eligibility) {
    if (title.includes('CGL') || title.includes('Graduate') || title.includes('PO') || title.includes('Officer')) {
      eligibility = 'Passed Bachelor Degree in Any Stream from Any Recognized University in India.';
    } else if (title.includes('CHSL') || title.includes('10+2') || title.includes('Intermediate') || title.includes('Constable')) {
      eligibility = 'Passed 10+2 Intermediate Exam in Any Stream from Any Recognized Board in India.';
    } else if (title.includes('ALP') || title.includes('Technician') || title.includes('ITI')) {
      eligibility = 'Class 10th High School Exam with ITI Certificate in Relevant Trade OR Diploma/Degree in Engineering.';
    } else if (title.includes('NET') || title.includes('JRF') || title.includes('Professor')) {
      eligibility = 'Passed / Appeared Master Degree in Concerned Subject with at least 55% Marks (50% for SC/ST/PwD). 4 Year Bachelor Degree Candidates Also Eligible.';
    } else {
      eligibility = 'Class 10th / 12th / Diploma / Graduate Degree in relevant stream from a recognized Board or University in India. (Refer to official notification for post-wise criteria).';
    }
  }

  // Short Info - sanitize and guarantee rich descriptive text
  let shortInfo = rawJob.shortInfo;
  if (!shortInfo || shortInfo.includes('Automated feed') || shortInfo.includes('rss.xml') || shortInfo.length < 30) {
    if (category === 'results') {
      shortInfo = `${orgName} has officially declared the examination results and merit list for ${title}. All candidates who appeared in the written / online examination can now check and download their result, scorecard, cutoff marks, and selection list using the direct links below.`;
    } else if (category === 'admit-cards') {
      shortInfo = `${orgName} has released the official Admit Card / Hall Ticket and Exam City Intimation slip for ${title}. Registered candidates can download their hall ticket by entering their Application Number and Date of Birth / Password through the direct link provided below.`;
    } else if (category === 'answer-key') {
      shortInfo = `${orgName} has published the provisional / final answer key and question paper for ${title}. Candidates can check the official answer key, calculate their tentative scores, and raise objections / challenges through the portal before the last date.`;
    } else if (category === 'syllabus') {
      shortInfo = `${orgName} has announced the updated exam pattern, marking scheme, and topic-wise syllabus for ${title}. Candidates preparing for the examination can check complete syllabus details and download the official PDF guide below.`;
    } else if (category === 'admission') {
      shortInfo = `${orgName} has invited online applications for admission and entrance examination for ${title}. Eligible students seeking admission can check eligible courses, fee structure, counseling dates, and apply online before the deadline.`;
    } else {
      shortInfo = `${orgName} has published the official recruitment notification for ${title}. Eligible and interested candidates who fulfill all eligibility criteria can read the complete notification details, age limit, educational qualification, category-wise vacancies, selection process, and submit their online application form before the last date.`;
    }
  }

  // Links Handling - Guarantee pure, clean official portal links (no rss.xml, feed.xml or XML artifacts)
  const rawLinks = rawJob.links || {};
  const cleanedOfficial = cleanOfficialUrl(rawLinks.official, org.officialUrl);
  const officialUrl = cleanedOfficial || org.officialUrl;
  const applyUrl = cleanOfficialUrl(rawLinks.apply, org.applyUrl) || org.applyUrl;
  const notifUrl = cleanOfficialUrl(rawLinks.notification, `${officialUrl}/notices`) || `${officialUrl}/notices`;

  const links = {
    apply: applyUrl,
    applyServer2: cleanOfficialUrl(rawLinks.applyServer2, applyUrl),
    official: officialUrl,
    notification: notifUrl,
    admitCard: cleanOfficialUrl(rawLinks.admitCard, (category === 'admit-cards' ? applyUrl : `${officialUrl}/admit-card`)),
    admitCardNotice: cleanOfficialUrl(rawLinks.admitCardNotice, notifUrl),
    result: cleanOfficialUrl(rawLinks.result, (category === 'results' ? applyUrl : `${officialUrl}/results`)),
    resultServer2: cleanOfficialUrl(rawLinks.resultServer2, `${officialUrl}/results`),
    resultNotice: cleanOfficialUrl(rawLinks.resultNotice, notifUrl),
    cutoff: cleanOfficialUrl(rawLinks.cutoff, notifUrl),
    answerKey: cleanOfficialUrl(rawLinks.answerKey, `${officialUrl}/answer-key`),
    answerKeyNotice: cleanOfficialUrl(rawLinks.answerKeyNotice, notifUrl),
    examCity: cleanOfficialUrl(rawLinks.examCity, `${officialUrl}/exam-city`),
    syllabus: cleanOfficialUrl(rawLinks.syllabus, notifUrl),
    videoHindi: rawLinks.videoHindi || `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' Form Kaise Bhare')}`,
    extendedNotice: cleanOfficialUrl(rawLinks.extendedNotice, notifUrl),
    telegram: rawLinks.telegram || 'https://t.me/govtbharatofficial',
    whatsapp: rawLinks.whatsapp || 'https://whatsapp.com/channel/govtbharatofficial',
    tools: rawLinks.tools || '/?tab=documents'
  };

  // Selection Process Steps
  const selectionProcess = rawJob.selectionProcess && rawJob.selectionProcess.length > 0 ? rawJob.selectionProcess : [
    'Stage 1: Computer Based Written Examination (CBT / OMR)',
    'Stage 2: Skill Test / Typing Test / Physical Efficiency Test (PET / PST) where applicable',
    'Stage 3: Document Verification (DV)',
    'Stage 4: Detailed Medical Examination (DME)'
  ];

  // How to Apply Steps
  const howToApply = rawJob.howToApply && rawJob.howToApply.length > 0 ? rawJob.howToApply : [
    `Candidates must read the complete official notification issued by ${orgName} carefully before applying online.`,
    'Check and gather all required documents: Eligibility Proof, ID Proof (Aadhaar / Voter ID), Address Details, and Basic Details.',
    'Keep ready scanned copies of required documents (Passport Size Color Photo, Signature, Thumb Impression, Educational Marksheets).',
    'Visit the official application portal using the direct "Apply Online" link below and complete User Registration / Login.',
    'Fill in all mandatory details in the online form and preview every column thoroughly before final submission.',
    'Pay the required examination fee through online payment mode (Debit Card / Credit Card / Net Banking / UPI). Incomplete applications without fee payment will be rejected.',
    'Take a clear printout of the final submitted application form and fee payment receipt for future reference.'
  ];

  // Important Documents
  const importantDocuments = rawJob.importantDocuments && rawJob.importantDocuments.length > 0 ? rawJob.importantDocuments : [
    'Recent Passport Size Color Photograph with white/light background (JPG/JPEG format 20KB-50KB)',
    'Running Signature of Candidate in Black/Blue Ink (10KB-20KB)',
    'Class 10th High School Marksheet / Certificate (for Date of Birth verification)',
    'Class 12th Intermediate / Graduation / Diploma Marksheets & Degrees',
    'Valid Government Photo ID Card (Aadhaar Card, PAN Card, Driving License, Voter ID, or Passport)',
    'Category / Caste Certificate (OBC-NCL / EWS / SC / ST) issued by Competent Authority if applicable',
    'Domicile / Residence Certificate and Disability Certificate (PwD) if applicable'
  ];

  // Post Wise Vacancies table guarantee with category reservation breakdown
  let postWiseVacancies: PostWiseVacancy[] = rawJob.postWiseVacancies || [];
  if (postWiseVacancies.length === 0) {
    const numericPart = totalVacancies ? parseInt(String(totalVacancies).replace(/[^\d]/g, ''), 10) : 0;
    const hasNumeric = !isNaN(numericPart) && numericPart > 0;
    
    postWiseVacancies = [
      {
        postName: postName,
        total: totalVacancies || 'Multiple Posts',
        general: hasNumeric ? Math.round(numericPart * 0.40) : 'As per Rules',
        obc: hasNumeric ? Math.round(numericPart * 0.27) : 'As per Rules',
        ews: hasNumeric ? Math.round(numericPart * 0.10) : 'As per Rules',
        sc: hasNumeric ? Math.round(numericPart * 0.15) : 'As per Rules',
        st: hasNumeric ? Math.round(numericPart * 0.08) : 'As per Rules',
        eligibility: typeof eligibility === 'string' ? eligibility : 'Passed 10th / 12th / ITI / Diploma / Bachelor Degree in relevant stream from any recognized board/university in India.'
      }
    ];
  } else {
    // Fill any missing category breakdown fields in existing postWiseVacancies
    postWiseVacancies = postWiseVacancies.map(pv => {
      const numericPart = pv.total ? parseInt(String(pv.total).replace(/[^\d]/g, ''), 10) : 0;
      const hasNumeric = !isNaN(numericPart) && numericPart > 0;
      return {
        postName: pv.postName || postName,
        total: pv.total || totalVacancies || 'Multiple Posts',
        general: pv.general ?? (hasNumeric ? Math.round(numericPart * 0.40) : 'As per Rules'),
        obc: pv.obc ?? (hasNumeric ? Math.round(numericPart * 0.27) : 'As per Rules'),
        ews: pv.ews ?? (hasNumeric ? Math.round(numericPart * 0.10) : 'As per Rules'),
        sc: pv.sc ?? (hasNumeric ? Math.round(numericPart * 0.15) : 'As per Rules'),
        st: pv.st ?? (hasNumeric ? Math.round(numericPart * 0.08) : 'As per Rules'),
        eligibility: pv.eligibility || (typeof eligibility === 'string' ? eligibility : 'Passed 10th / 12th / ITI / Diploma / Bachelor Degree in relevant stream from any recognized board/university in India.')
      };
    });
  }

  // Subjects list if UGC NET or academic job
  let subjects: SubjectItem[] | undefined = rawJob.subjects;
  if (!subjects && (title.includes('NET') || title.includes('JRF') || title.includes('Teacher'))) {
    subjects = [
      { sno: 1, name: 'Adult Education / Non-Formal Education' },
      { sno: 2, name: 'Anthropology' },
      { sno: 3, name: 'Arab Culture and Islamic Studies' },
      { sno: 4, name: 'Arabic' },
      { sno: 5, name: 'Archaeology' },
      { sno: 6, name: 'Assamese' },
      { sno: 7, name: 'Bengali' },
      { sno: 8, name: 'Bodo' },
      { sno: 9, name: 'Buddhist, Jaina, Gandhian and Peace Studies' },
      { sno: 10, name: 'Commerce & Business Studies' },
      { sno: 11, name: 'Computer Science and Applications' },
      { sno: 12, name: 'Economics / Rural Economics / Econometrics' },
      { sno: 13, name: 'Education' },
      { sno: 14, name: 'Electronic Science' },
      { sno: 15, name: 'English Literature' },
      { sno: 16, name: 'Environmental Sciences' },
      { sno: 17, name: 'Geography' },
      { sno: 18, name: 'Hindi Literature' },
      { sno: 19, name: 'History' },
      { sno: 20, name: 'Law & Jurisprudence' },
      { sno: 21, name: 'Library and Information Science' },
      { sno: 22, name: 'Management (HR / Marketing / Finance)' },
      { sno: 23, name: 'Mass Communication and Journalism' },
      { sno: 24, name: 'Music' },
      { sno: 25, name: 'Philosophy' },
      { sno: 26, name: 'Physical Education' },
      { sno: 27, name: 'Political Science & International Relations' },
      { sno: 28, name: 'Psychology' },
      { sno: 29, name: 'Public Administration' },
      { sno: 30, name: 'Sociology' }
    ];
  }

  // Salary / Pay Scale / Remuneration
  const payScale = rawJob.payScale || rawJob.salaryInfo || rawJob.salary || (
    title.includes('CGL') || title.includes('Officer') ? 'Pay Level 7 & 8 (₹44,900 to ₹1,42,400 per month) + DA, HRA & Allowances' :
    title.includes('Constable') || title.includes('ALP') ? 'Pay Level 2 & 3 (₹19,900 to ₹63,200 per month) + Allowances' :
    title.includes('Assistant') || title.includes('Clerk') ? 'Pay Level 4 & 5 (₹25,500 to ₹81,100 per month)' :
    'As per 7th Central / State Pay Commission Matrix with standard DA, HRA, and Medical Allowances.'
  );
  const salary = rawJob.salary || payScale;

  // Status calculation
  const status = rawJob.status || calculateJobStatus(category, dates);

  // Last updated string
  const lastUpdated = rawJob.lastUpdated || formatLongDate(postDate);

  return {
    ...rawJob,
    id,
    slug,
    title,
    category,
    postDate,
    isNew: rawJob.isNew ?? true,
    isExpired: rawJob.isExpired ?? (status === 'Application Closed'),
    state,
    orgName,
    advtNo,
    postName,
    totalVacancies,
    shortInfo,
    ageLimit,
    eligibility,
    fees,
    dates,
    links,
    selectionProcess,
    howToApply,
    importantDocuments,
    postWiseVacancies,
    subjects,
    salary,
    payScale,
    status,
    lastUpdated,
    officialSource: rawJob.officialSource || orgName,
    viewsCount: rawJob.viewsCount || Math.floor(Math.random() * 4500) + 1200
  };
}
