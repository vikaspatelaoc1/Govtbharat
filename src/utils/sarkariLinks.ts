import { JobAlert } from '../types';
import { CENTRAL_PORTALS, STATE_PORTALS } from './govtPortals';
import { normalizeExternalUrl } from './urlUtils';

export interface SarkariLinkRow {
  id: string;
  categoryTitle: string;
  categorySubtitle?: string;
  actionText: string;
  actionUrl: string;
  server2Text?: string;
  server2Url?: string;
  isExternal: boolean;
  colorClass?: string;
  badge?: string;
  type: 'apply' | 'notification' | 'official' | 'admitCard' | 'result' | 'answerKey' | 'syllabus' | 'cutoff' | 'video' | 'social' | 'tools';
}

/**
 * Resolves authoritative, category-wise working links for ANY job,
 * exactly matching the Sarkari Result & Sarkari Naukri portal behavior.
 */
export function getCategoryWiseJobLinks(job: JobAlert): SarkariLinkRow[] {
  if (!job) return [];

  const title = (job.title || 'Govt Recruitment 2026').trim();
  const orgName = (job.orgName || '').trim();
  const state = (job.state || 'Central').trim();
  const category = (job.category || 'latest-jobs').trim();
  const rawLinks = job.links || {};

  const tLow = (title + ' ' + orgName).toLowerCase();
  const sLow = state.toLowerCase();

  // Helper to validate whether a link is a real custom link (not empty, #, or generic placeholder)
  const isValidCustomUrl = (url?: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim();
    if (!clean || clean === '#' || clean.toLowerCase() === 'needs review' || clean.toLowerCase() === 'n/a' || clean === 'https://www.google.com') return false;
    // Let normalizeExternalUrl handle the protocol addition, just check if it's a non-empty string.
    return true; 
  };

  // 1. Detect authoritative application and official portals for known boards
  let authoritativeOfficial = '';
  let authoritativeApply = '';

  // Central Boards & Recruitment Commissions
  if (tLow.includes('ssc') || tLow.includes('staff selection')) {
    authoritativeOfficial = 'https://ssc.gov.in';
    authoritativeApply = 'https://ssc.gov.in';
  } else if (tLow.includes('upsc') || tLow.includes('union public service')) {
    authoritativeOfficial = 'https://www.upsc.gov.in';
    authoritativeApply = 'https://upsconline.nic.in';
  } else if (tLow.includes('rrb') || tLow.includes('railway') || tLow.includes('alp') || tLow.includes('ntpc') || tLow.includes('group d') || tLow.includes('technician')) {
    authoritativeOfficial = 'https://indianrailways.gov.in';
    authoritativeApply = 'https://www.rrbapply.gov.in';
  } else if (tLow.includes('nta') || tLow.includes('ugc net') || tLow.includes('csir net') || tLow.includes('cuet') || tLow.includes('neet') || tLow.includes('jee main')) {
    authoritativeOfficial = 'https://www.nta.ac.in';
    authoritativeApply = 'https://exams.nta.ac.in';
  } else if (tLow.includes('ibps')) {
    authoritativeOfficial = 'https://www.ibps.in';
    authoritativeApply = 'https://www.ibps.in';
  } else if (tLow.includes('sbi') || tLow.includes('state bank of india')) {
    authoritativeOfficial = 'https://sbi.co.in';
    authoritativeApply = 'https://sbi.co.in/careers';
  } else if (tLow.includes('rbi') || tLow.includes('reserve bank')) {
    authoritativeOfficial = 'https://rbi.org.in';
    authoritativeApply = 'https://opportunities.rbi.org.in';
  } else if (tLow.includes('army') || tLow.includes('agniveer army') || tLow.includes('tes')) {
    authoritativeOfficial = 'https://joinindianarmy.nic.in';
    authoritativeApply = 'https://joinindianarmy.nic.in';
  } else if (tLow.includes('navy') || tLow.includes('agniveer navy') || tLow.includes('nausena')) {
    authoritativeOfficial = 'https://joinindiannavy.gov.in';
    authoritativeApply = 'https://joinindiannavy.gov.in';
  } else if (tLow.includes('air force') || tLow.includes('airforce') || tLow.includes('agnipathvayu') || tLow.includes('iaf') || tLow.includes('afcat')) {
    authoritativeOfficial = 'https://agnipathvayu.cdac.in';
    authoritativeApply = 'https://agnipathvayu.cdac.in';
  } else if (tLow.includes('bsf')) {
    authoritativeOfficial = 'https://rectt.bsf.gov.in';
    authoritativeApply = 'https://rectt.bsf.gov.in';
  } else if (tLow.includes('crpf')) {
    authoritativeOfficial = 'https://rect.crpf.gov.in';
    authoritativeApply = 'https://rect.crpf.gov.in';
  } else if (tLow.includes('cisf')) {
    authoritativeOfficial = 'https://cisfrectt.cisf.gov.in';
    authoritativeApply = 'https://cisfrectt.cisf.gov.in';
  } else if (tLow.includes('itbp')) {
    authoritativeOfficial = 'https://recruitment.itbpolice.nic.in';
    authoritativeApply = 'https://recruitment.itbpolice.nic.in';
  } else if (tLow.includes('ssb') && !tLow.includes('sssb')) {
    authoritativeOfficial = 'https://ssbrectt.gov.in';
    authoritativeApply = 'https://ssbrectt.gov.in';
  } else if (tLow.includes('post office') || tLow.includes('india post') || tLow.includes('gds')) {
    authoritativeOfficial = 'https://indiapostgdsonline.gov.in';
    authoritativeApply = 'https://indiapostgdsonline.gov.in';
  } else if (tLow.includes('cbse') || tLow.includes('ctet')) {
    authoritativeOfficial = 'https://ctet.nic.in';
    authoritativeApply = 'https://ctet.nic.in';
  } else if (tLow.includes('dsssb')) {
    authoritativeOfficial = 'https://dsssbonline.nic.in';
    authoritativeApply = 'https://dsssbonline.nic.in';
  }

  // State Boards & Commissions
  if (!authoritativeOfficial || !authoritativeApply) {
    if (sLow.includes('uttar pradesh') || sLow === 'up' || tLow.includes('uppsc') || tLow.includes('upsssc') || tLow.includes('uppbpb')) {
      if (tLow.includes('police') || tLow.includes('constable') || tLow.includes('si') || tLow.includes('uppbpb')) {
        authoritativeOfficial = 'https://uppbpb.gov.in';
        authoritativeApply = 'https://uppbpb.gov.in';
      } else if (tLow.includes('upsssc') || tLow.includes('pet') || tLow.includes('lekhpal') || tLow.includes('vdo')) {
        authoritativeOfficial = 'https://upsssc.gov.in';
        authoritativeApply = 'https://upsssc.gov.in';
      } else {
        authoritativeOfficial = 'https://uppsc.up.nic.in';
        authoritativeApply = 'https://uppsc.up.nic.in';
      }
    } else if (sLow.includes('bihar') || tLow.includes('bpsc') || tLow.includes('bssc') || tLow.includes('csbc')) {
      if (tLow.includes('police') || tLow.includes('csbc')) {
        authoritativeOfficial = 'https://csbc.bih.nic.in';
        authoritativeApply = 'https://csbc.bih.nic.in';
      } else if (tLow.includes('bssc')) {
        authoritativeOfficial = 'https://bssc.bihar.gov.in';
        authoritativeApply = 'https://bssc.bihar.gov.in';
      } else {
        authoritativeOfficial = 'https://bpsc.bih.nic.in';
        authoritativeApply = 'https://onlinebpsc.bihar.gov.in';
      }
    } else if (sLow.includes('rajasthan') || tLow.includes('rpsc') || tLow.includes('rsmssb')) {
      authoritativeOfficial = 'https://rpsc.rajasthan.gov.in';
      authoritativeApply = 'https://sso.rajasthan.gov.in';
    } else if (sLow.includes('madhya pradesh') || sLow === 'mp' || tLow.includes('mppsc') || tLow.includes('esb') || tLow.includes('vyapam')) {
      authoritativeOfficial = 'https://esb.mp.gov.in';
      authoritativeApply = 'https://esb.mp.gov.in';
    } else if (sLow.includes('haryana') || tLow.includes('hssc') || tLow.includes('hpsc')) {
      authoritativeOfficial = 'https://hssc.gov.in';
      authoritativeApply = 'https://hssc.gov.in';
    } else if (sLow.includes('delhi') || tLow.includes('dsssb')) {
      authoritativeOfficial = 'https://dsssbonline.nic.in';
      authoritativeApply = 'https://dsssbonline.nic.in';
    } else if (sLow.includes('jharkhand') || tLow.includes('jssc') || tLow.includes('jpsc')) {
      authoritativeOfficial = 'https://jssc.nic.in';
      authoritativeApply = 'https://jssc.nic.in';
    } else if (sLow.includes('uttarakhand') || tLow.includes('ukpsc') || tLow.includes('uksssc')) {
      authoritativeOfficial = 'https://psc.uk.gov.in';
      authoritativeApply = 'https://psc.uk.gov.in';
    } else if (STATE_PORTALS[state]) {
      const sp = STATE_PORTALS[state];
      authoritativeOfficial = sp.official;
      authoritativeApply = sp.apply || sp.psc || sp.official;
    }
  }

  // Fallbacks if no specific board matched
  const resolvedOfficial = isValidCustomUrl(rawLinks.official)
    ? normalizeExternalUrl(rawLinks.official)
    : (authoritativeOfficial || `https://www.google.com/search?q=${encodeURIComponent((orgName || title) + ' Official Website Portal')}`);

  const resolvedApply = isValidCustomUrl(rawLinks.apply)
    ? normalizeExternalUrl(rawLinks.apply)
    : (authoritativeApply || `https://www.google.com/search?q=${encodeURIComponent(title + ' Apply Online Portal Registration Direct Link')}`);

  const resolvedApplyServer2 = isValidCustomUrl(rawLinks.applyServer2)
    ? normalizeExternalUrl(rawLinks.applyServer2)
    : undefined;

  const resolvedNotification = isValidCustomUrl(rawLinks.notification)
    ? normalizeExternalUrl(rawLinks.notification)
    : `https://www.google.com/search?q=${encodeURIComponent(title + ' Official Notification PDF Download')}`;

  const resolvedAdmitCard = isValidCustomUrl(rawLinks.admitCard)
    ? normalizeExternalUrl(rawLinks.admitCard)
    : `https://www.google.com/search?q=${encodeURIComponent(title + ' Admit Card Hall Ticket Download')}`;

  const resolvedResult = isValidCustomUrl(rawLinks.result)
    ? normalizeExternalUrl(rawLinks.result)
    : `https://www.google.com/search?q=${encodeURIComponent(title + ' Result Merit List Cut Off Download')}`;

  const resolvedResultServer2 = isValidCustomUrl(rawLinks.resultServer2)
    ? normalizeExternalUrl(rawLinks.resultServer2)
    : undefined;

  const resolvedAnswerKey = isValidCustomUrl(rawLinks.answerKey)
    ? normalizeExternalUrl(rawLinks.answerKey)
    : `https://www.google.com/search?q=${encodeURIComponent(title + ' Official Answer Key Question Paper Download')}`;

  const resolvedSyllabus = isValidCustomUrl(rawLinks.syllabus)
    ? normalizeExternalUrl(rawLinks.syllabus)
    : `https://www.google.com/search?q=${encodeURIComponent(title + ' Syllabus Exam Pattern PDF Download')}`;

  const resolvedCutOff = isValidCustomUrl(rawLinks.cutoff)
    ? normalizeExternalUrl(rawLinks.cutoff)
    : `https://www.google.com/search?q=${encodeURIComponent(title + ' Cut Off Marks Category Wise PDF Download')}`;

  const resolvedVideoHindi = isValidCustomUrl(rawLinks.videoHindi)
    ? rawLinks.videoHindi!
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' Form Kaise Bhare Step by Step Hindi')}`;

  const rows: SarkariLinkRow[] = [];

  // 1. APPLY ONLINE
  if (isValidCustomUrl(rawLinks.apply)) {
    rows.push({
      id: 'link-apply',
      categoryTitle: 'APPLY ONLINE',
      actionText: 'Click Here',
      actionUrl: normalizeExternalUrl(rawLinks.apply),
      server2Text: isValidCustomUrl(rawLinks.applyServer2) ? 'Server II' : undefined,
      server2Url: isValidCustomUrl(rawLinks.applyServer2) ? normalizeExternalUrl(rawLinks.applyServer2) : undefined,
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      badge: category === 'latest-jobs' || category === 'admission' ? 'Active' : undefined,
      type: 'apply'
    });
  }

  // 2. DOWNLOAD NOTIFICATION
  if (isValidCustomUrl(rawLinks.notification)) {
    rows.push({
      id: 'link-notification',
      categoryTitle: 'DOWNLOAD NOTIFICATION',
      actionText: 'Click Here',
      actionUrl: normalizeExternalUrl(rawLinks.notification),
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      badge: 'Official PDF',
      type: 'notification'
    });
  }

  // 3. OFFICIAL WEBSITE
  if (isValidCustomUrl(rawLinks.official)) {
    rows.push({
      id: 'link-official',
      categoryTitle: 'OFFICIAL WEBSITE',
      actionText: 'Click Here',
      actionUrl: normalizeExternalUrl(rawLinks.official),
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      type: 'official'
    });
  }

  // 4. DOWNLOAD ADMIT CARD
  if (isValidCustomUrl(rawLinks.admitCard)) {
    rows.push({
      id: 'link-admit-card',
      categoryTitle: 'DOWNLOAD ADMIT CARD',
      actionText: 'Click Here',
      actionUrl: normalizeExternalUrl(rawLinks.admitCard),
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      badge: category === 'admit-cards' ? 'Available Now' : undefined,
      type: 'admitCard'
    });
  }

  // 5. DOWNLOAD RESULT
  if (isValidCustomUrl(rawLinks.result)) {
    rows.push({
      id: 'link-result',
      categoryTitle: 'DOWNLOAD RESULT',
      actionText: 'Server I',
      actionUrl: normalizeExternalUrl(rawLinks.result),
      server2Text: isValidCustomUrl(rawLinks.resultServer2) ? 'Server II' : undefined,
      server2Url: isValidCustomUrl(rawLinks.resultServer2) ? normalizeExternalUrl(rawLinks.resultServer2) : undefined,
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      badge: category === 'results' ? 'Declared' : undefined,
      type: 'result'
    });
  }

  // 6. DOWNLOAD ANSWER KEY
  if (isValidCustomUrl(rawLinks.answerKey)) {
    rows.push({
      id: 'link-answer-key',
      categoryTitle: 'DOWNLOAD ANSWER KEY',
      actionText: 'Click Here',
      actionUrl: normalizeExternalUrl(rawLinks.answerKey),
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      badge: category === 'answer-key' ? 'Released' : undefined,
      type: 'answerKey'
    });
  }

  // 7. DOWNLOAD SYLLABUS
  if (isValidCustomUrl(rawLinks.syllabus)) {
    rows.push({
      id: 'link-syllabus',
      categoryTitle: 'DOWNLOAD SYLLABUS',
      actionText: 'Click Here',
      actionUrl: normalizeExternalUrl(rawLinks.syllabus),
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      badge: category === 'syllabus' ? 'Official' : undefined,
      type: 'syllabus'
    });
  }

  // 8. DOWNLOAD CUT OFF
  if (isValidCustomUrl(rawLinks.cutoff)) {
    rows.push({
      id: 'link-cutoff',
      categoryTitle: 'DOWNLOAD CUT OFF',
      actionText: 'Click Here',
      actionUrl: normalizeExternalUrl(rawLinks.cutoff),
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      type: 'cutoff'
    });
  }

  // 9. HOW TO FILL FORM (VIDEO HINDI)
  if (isValidCustomUrl(rawLinks.videoHindi)) {
    rows.push({
      id: 'link-video',
      categoryTitle: 'HOW TO FILL FORM (VIDEO HINDI)',
      actionText: 'Watch Video',
      actionUrl: rawLinks.videoHindi,
      isExternal: true,
      colorClass: 'text-[#d91e63] dark:text-[#f472b6]',
      type: 'video'
    });
  }

  // 10. JOIN GOVTBHARAT ALERTS CHANNEL (Always show)
  rows.push({
    id: 'link-social',
    categoryTitle: 'JOIN GOVTBHARAT ALERTS CHANNEL',
    actionText: 'Telegram',
    actionUrl: rawLinks.telegram || 'https://t.me/govtbharatofficial',
    server2Text: 'WhatsApp',
    server2Url: rawLinks.whatsapp || 'https://whatsapp.com/channel/govtbharatofficial',
    isExternal: true,
    colorClass: 'text-[#059669] dark:text-[#34d399]',
    type: 'social'
  });

  // 11. GOVTBHARAT TOOLS (PHOTO RESIZER, PDF COMPRESS) (Always show)
  rows.push({
    id: 'link-tools',
    categoryTitle: 'GOVTBHARAT TOOLS (PHOTO RESIZER, PDF COMPRESS)',
    actionText: 'GovtBharat Tools Portal',
    actionUrl: '/?tab=documents',
    isExternal: false,
    colorClass: 'text-[#059669] dark:text-[#34d399]',
    type: 'tools'
  });

  return rows;
}
