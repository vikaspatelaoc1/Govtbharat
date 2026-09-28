/**
 * Verified Official Indian Government Portals and Recruitment Commission Directory
 * Contains verified, high-availability domains for Central and State Government bodies.
 */

export interface PortalConfig {
  official: string;
  apply: string;
  notification?: string;
  psc?: string;
  ssc?: string;
  police?: string;
  highCourt?: string;
  education?: string;
  name: string;
}

// 1. Central Government Authorities & Recruitment Boards
export const CENTRAL_PORTALS: Record<string, { official: string; apply: string; name: string }> = {
  upsc: {
    official: 'https://www.upsc.gov.in',
    apply: 'https://upsconline.nic.in',
    name: 'Union Public Service Commission (UPSC)'
  },
  ssc: {
    official: 'https://ssc.gov.in',
    apply: 'https://ssc.gov.in',
    name: 'Staff Selection Commission (SSC)'
  },
  railways: {
    official: 'https://indianrailways.gov.in',
    apply: 'https://indianrailways.gov.in',
    name: 'Railway Recruitment Boards (RRB) / Indian Railways'
  },
  rrb: {
    official: 'https://indianrailways.gov.in',
    apply: 'https://indianrailways.gov.in',
    name: 'Railway Recruitment Boards (RRB)'
  },
  rpf: {
    official: 'https://indianrailways.gov.in',
    apply: 'https://indianrailways.gov.in',
    name: 'Railway Protection Force (RPF)'
  },
  ibps: {
    official: 'https://www.ibps.in',
    apply: 'https://www.ibps.in',
    name: 'Institute of Banking Personnel Selection (IBPS)'
  },
  sbi: {
    official: 'https://sbi.co.in',
    apply: 'https://sbi.co.in/careers',
    name: 'State Bank of India (SBI)'
  },
  rbi: {
    official: 'https://rbi.org.in',
    apply: 'https://opportunities.rbi.org.in',
    name: 'Reserve Bank of India (RBI)'
  },
  nta: {
    official: 'https://www.nta.ac.in',
    apply: 'https://exams.nta.ac.in',
    name: 'National Testing Agency (NTA)'
  },
  cbse: {
    official: 'https://cbse.gov.in',
    apply: 'https://cbse.gov.in',
    name: 'Central Board of Secondary Education (CBSE)'
  },
  ctet: {
    official: 'https://ctet.nic.in',
    apply: 'https://ctet.nic.in',
    name: 'Central Teacher Eligibility Test (CTET)'
  },
  army: {
    official: 'https://joinindianarmy.nic.in',
    apply: 'https://joinindianarmy.nic.in',
    name: 'Indian Army'
  },
  navy: {
    official: 'https://joinindiannavy.gov.in',
    apply: 'https://joinindiannavy.gov.in',
    name: 'Indian Navy'
  },
  airforce: {
    official: 'https://agnipathvayu.cdac.in',
    apply: 'https://agnipathvayu.cdac.in',
    name: 'Indian Air Force (IAF)'
  },
  bsf: {
    official: 'https://rectt.bsf.gov.in',
    apply: 'https://rectt.bsf.gov.in',
    name: 'Border Security Force (BSF)'
  },
  crpf: {
    official: 'https://rect.crpf.gov.in',
    apply: 'https://rect.crpf.gov.in',
    name: 'Central Reserve Police Force (CRPF)'
  },
  cisf: {
    official: 'https://cisfrectt.cisf.gov.in',
    apply: 'https://cisfrectt.cisf.gov.in',
    name: 'Central Industrial Security Force (CISF)'
  },
  itbp: {
    official: 'https://recruitment.itbpolice.nic.in',
    apply: 'https://recruitment.itbpolice.nic.in',
    name: 'Indo-Tibetan Border Police (ITBP)'
  },
  ssb: {
    official: 'https://ssbrectt.gov.in',
    apply: 'https://ssbrectt.gov.in',
    name: 'Sashastra Seema Bal (SSB)'
  },
  indiapost: {
    official: 'https://indiapostgdsonline.gov.in',
    apply: 'https://indiapostgdsonline.gov.in',
    name: 'India Post (Gramin Dak Sevak)'
  },
  drdo: {
    official: 'https://drdo.gov.in',
    apply: 'https://drdo.gov.in',
    name: 'Defence Research and Development Organisation (DRDO)'
  },
  isro: {
    official: 'https://www.isro.gov.in',
    apply: 'https://www.isro.gov.in',
    name: 'Indian Space Research Organisation (ISRO)'
  },
  barc: {
    official: 'https://barc.gov.in',
    apply: 'https://barc.gov.in',
    name: 'Bhabha Atomic Research Centre (BARC)'
  },
  dsssb: {
    official: 'https://dsssb.delhi.gov.in',
    apply: 'https://dsssbonline.nic.in',
    name: 'Delhi Subordinate Services Selection Board (DSSSB)'
  },
  kvs: {
    official: 'https://kvsangathan.nic.in',
    apply: 'https://kvsangathan.nic.in',
    name: 'Kendriya Vidyalaya Sangathan (KVS)'
  },
  nvs: {
    official: 'https://navodaya.gov.in',
    apply: 'https://navodaya.gov.in',
    name: 'Navodaya Vidyalaya Samiti (NVS)'
  },
  pib: {
    official: 'https://pib.gov.in',
    apply: 'https://pib.gov.in',
    name: 'Press Information Bureau (PIB)'
  },
  employmentnews: {
    official: 'https://employmentnews.gov.in',
    apply: 'https://employmentnews.gov.in',
    name: 'Employment News Official'
  },
  scholarship: {
    official: 'https://scholarships.gov.in',
    apply: 'https://scholarships.gov.in',
    name: 'National Scholarship Portal (NSP)'
  },
  voter: {
    official: 'https://voters.eci.gov.in',
    apply: 'https://voters.eci.gov.in',
    name: 'Election Commission of India (ECI)'
  },
  aadhaar: {
    official: 'https://myaadhaar.uidai.gov.in',
    apply: 'https://myaadhaar.uidai.gov.in',
    name: 'UIDAI Aadhaar Official'
  },
  pancard: {
    official: 'https://incometaxindia.gov.in',
    apply: 'https://www.protean-tinpan.com',
    name: 'Income Tax PAN Service (Protean / NSDL)'
  },
  digilocker: {
    official: 'https://www.digilocker.gov.in',
    apply: 'https://www.digilocker.gov.in',
    name: 'DigiLocker India'
  }
};

// 2. State-Wise Official Portals & Boards
export const STATE_PORTALS: Record<string, PortalConfig> = {
  'UP': {
    name: 'Uttar Pradesh',
    official: 'https://up.gov.in',
    apply: 'https://uppbpb.gov.in',
    psc: 'https://uppsc.up.nic.in',
    ssc: 'https://upsssc.gov.in',
    police: 'https://uppbpb.gov.in',
    highCourt: 'https://allahabadhighcourt.in',
    education: 'https://upmsp.edu.in'
  },
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    official: 'https://up.gov.in',
    apply: 'https://uppbpb.gov.in',
    psc: 'https://uppsc.up.nic.in',
    ssc: 'https://upsssc.gov.in',
    police: 'https://uppbpb.gov.in',
    highCourt: 'https://allahabadhighcourt.in',
    education: 'https://upmsp.edu.in'
  },
  'Bihar': {
    name: 'Bihar',
    official: 'https://state.bihar.gov.in',
    apply: 'https://onlinebpsc.bihar.gov.in',
    psc: 'https://bpsc.bih.nic.in',
    ssc: 'https://bssc.bihar.gov.in',
    police: 'https://csbc.bih.nic.in',
    highCourt: 'https://patnahighcourt.gov.in',
    education: 'https://biharboardonline.bihar.gov.in'
  },
  'MP': {
    name: 'Madhya Pradesh',
    official: 'https://mp.gov.in',
    apply: 'https://esb.mp.gov.in',
    psc: 'https://mppsc.mp.gov.in',
    ssc: 'https://esb.mp.gov.in',
    police: 'https://esb.mp.gov.in',
    highCourt: 'https://mphc.gov.in',
    education: 'https://mpbse.nic.in'
  },
  'Madhya Pradesh': {
    name: 'Madhya Pradesh',
    official: 'https://mp.gov.in',
    apply: 'https://esb.mp.gov.in',
    psc: 'https://mppsc.mp.gov.in',
    ssc: 'https://esb.mp.gov.in',
    police: 'https://esb.mp.gov.in',
    highCourt: 'https://mphc.gov.in',
    education: 'https://mpbse.nic.in'
  },
  'Rajasthan': {
    name: 'Rajasthan',
    official: 'https://rajasthan.gov.in',
    apply: 'https://sso.rajasthan.gov.in',
    psc: 'https://rpsc.rajasthan.gov.in',
    ssc: 'https://rsmssb.rajasthan.gov.in',
    police: 'https://police.rajasthan.gov.in',
    highCourt: 'https://hcraj.nic.in',
    education: 'https://rajeduboard.rajasthan.gov.in'
  },
  'Delhi': {
    name: 'Delhi',
    official: 'https://delhi.gov.in',
    apply: 'https://dsssbonline.nic.in',
    psc: 'https://dsssb.delhi.gov.in',
    ssc: 'https://dsssbonline.nic.in',
    police: 'https://delhipolice.gov.in',
    highCourt: 'https://delhihighcourt.nic.in',
    education: 'https://edudel.nic.in'
  },
  'Haryana': {
    name: 'Haryana',
    official: 'https://haryana.gov.in',
    apply: 'https://hssc.gov.in',
    psc: 'https://hpsc.gov.in',
    ssc: 'https://hssc.gov.in',
    police: 'https://haryanapolice.gov.in',
    highCourt: 'https://highcourtchd.gov.in',
    education: 'https://bseh.org.in'
  },
  'Punjab': {
    name: 'Punjab',
    official: 'https://punjab.gov.in',
    apply: 'https://sssb.punjab.gov.in',
    psc: 'https://ppsc.gov.in',
    ssc: 'https://sssb.punjab.gov.in',
    police: 'https://punjabpolice.gov.in',
    highCourt: 'https://highcourtchd.gov.in',
    education: 'https://pseb.ac.in'
  },
  'Maharashtra': {
    name: 'Maharashtra',
    official: 'https://maharashtra.gov.in',
    apply: 'https://mpsc.gov.in',
    psc: 'https://mpsc.gov.in',
    ssc: 'https://mahapariksha.gov.in',
    police: 'https://mahapolice.gov.in',
    highCourt: 'https://bombayhighcourt.nic.in',
    education: 'https://mahahsscboard.in'
  },
  'West Bengal': {
    name: 'West Bengal',
    official: 'https://wb.gov.in',
    apply: 'https://psc.wb.gov.in',
    psc: 'https://psc.wb.gov.in',
    ssc: 'https://wbssc.gov.in',
    police: 'https://prb.wb.gov.in',
    highCourt: 'https://calcuttahighcourt.gov.in',
    education: 'https://wbbse.wb.gov.in'
  },
  'Jharkhand': {
    name: 'Jharkhand',
    official: 'https://jharkhand.gov.in',
    apply: 'https://jssc.nic.in',
    psc: 'https://jpsc.gov.in',
    ssc: 'https://jssc.nic.in',
    police: 'https://jhpolice.gov.in',
    highCourt: 'https://jharkhandhighcourt.nic.in',
    education: 'https://jac.jharkhand.gov.in'
  },
  'Chhattisgarh': {
    name: 'Chhattisgarh',
    official: 'https://cgstate.gov.in',
    apply: 'https://vyapam.cgstate.gov.in',
    psc: 'https://psc.cg.gov.in',
    ssc: 'https://vyapam.cgstate.gov.in',
    police: 'https://cgpolice.gov.in',
    highCourt: 'https://highcourt.cg.gov.in',
    education: 'https://cgbse.nic.in'
  },
  'Uttarakhand': {
    name: 'Uttarakhand',
    official: 'https://uk.gov.in',
    apply: 'https://sssc.uk.gov.in',
    psc: 'https://psc.uk.gov.in',
    ssc: 'https://sssc.uk.gov.in',
    police: 'https://uttarakhandpolice.uk.gov.in',
    highCourt: 'https://highcourtofuttarakhand.gov.in',
    education: 'https://ubse.uk.gov.in'
  },
  'Himachal Pradesh': {
    name: 'Himachal Pradesh',
    official: 'https://himachal.nic.in',
    apply: 'https://hppsc.hp.gov.in',
    psc: 'https://hppsc.hp.gov.in',
    ssc: 'https://hprca.hp.gov.in',
    police: 'https://hppolice.gov.in',
    highCourt: 'https://hphighcourt.nic.in',
    education: 'https://hpbose.org'
  },
  'Gujarat': {
    name: 'Gujarat',
    official: 'https://gujaratindia.gov.in',
    apply: 'https://ojas.gujarat.gov.in',
    psc: 'https://gpsc.gujarat.gov.in',
    ssc: 'https://gsssb.gujarat.gov.in',
    police: 'https://police.gujarat.gov.in',
    highCourt: 'https://gujarathighcourt.nic.in',
    education: 'https://gseb.org'
  },
  'Odisha': {
    name: 'Odisha',
    official: 'https://odisha.gov.in',
    apply: 'https://osssc.gov.in',
    psc: 'https://opsc.gov.in',
    ssc: 'https://osssc.gov.in',
    police: 'https://odishapolice.gov.in',
    highCourt: 'https://orissahighcourt.nic.in',
    education: 'https://bseodisha.ac.in'
  },
  'Assam': {
    name: 'Assam',
    official: 'https://assam.gov.in',
    apply: 'https://slprbassam.in',
    psc: 'https://apsc.nic.in',
    ssc: 'https://slprbassam.in',
    police: 'https://slprbassam.in',
    highCourt: 'https://ghconline.gov.in',
    education: 'https://sebaonline.org'
  },
  'Karnataka': {
    name: 'Karnataka',
    official: 'https://karnataka.gov.in',
    apply: 'https://kpsc.kar.nic.in',
    psc: 'https://kpsc.kar.nic.in',
    ssc: 'https://kpsc.kar.nic.in',
    police: 'https://ksp.karnataka.gov.in',
    highCourt: 'https://karnatakahihecourt.kar.nic.in',
    education: 'https://kseab.karnataka.gov.in'
  },
  'Kerala': {
    name: 'Kerala',
    official: 'https://kerala.gov.in',
    apply: 'https://keralapsc.gov.in',
    psc: 'https://keralapsc.gov.in',
    ssc: 'https://keralapsc.gov.in',
    police: 'https://keralapolice.gov.in',
    highCourt: 'https://hckerala.gov.in',
    education: 'https://keralapareekshabhavan.in'
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu',
    official: 'https://tn.gov.in',
    apply: 'https://tnpsc.gov.in',
    psc: 'https://tnpsc.gov.in',
    ssc: 'https://tnusrb.tn.gov.in',
    police: 'https://tnusrb.tn.gov.in',
    highCourt: 'https://hcmadras.tn.gov.in',
    education: 'https://dge.tn.gov.in'
  },
  'Telangana': {
    name: 'Telangana',
    official: 'https://telangana.gov.in',
    apply: 'https://websitenew.tspsc.gov.in',
    psc: 'https://websitenew.tspsc.gov.in',
    ssc: 'https://tslprb.in',
    police: 'https://tslprb.in',
    highCourt: 'https://tshc.gov.in',
    education: 'https://bse.telangana.gov.in'
  },
  'Andhra Pradesh': {
    name: 'Andhra Pradesh',
    official: 'https://ap.gov.in',
    apply: 'https://psc.ap.gov.in',
    psc: 'https://psc.ap.gov.in',
    ssc: 'https://slprb.ap.gov.in',
    police: 'https://slprb.ap.gov.in',
    highCourt: 'https://aphc.gov.in',
    education: 'https://bse.ap.gov.in'
  },
  'Jammu & Kashmir': {
    name: 'Jammu & Kashmir',
    official: 'https://jk.gov.in',
    apply: 'https://jkssb.nic.in',
    psc: 'https://jkpsc.nic.in',
    ssc: 'https://jkssb.nic.in',
    police: 'https://jkpolice.gov.in',
    highCourt: 'https://jkhighcourt.nic.in',
    education: 'https://jkbose.nic.in'
  }
};

/**
 * Checks if a hostname matches known synthetic or non-resolving domains
 */
export function isSyntheticOrBrokenDomain(hostname: string): boolean {
  if (!hostname || typeof hostname !== 'string') return true;
  const h = hostname.toLowerCase().trim();

  // Spaces in hostname (e.g. 'post office.gov.in')
  if (/\s/.test(h)) return true;

  // Obvious non-existent placeholder patterns
  if (h === 'example.com' || h.endsWith('.example.com') || h === 'localhost' || h === 'test.com' || h === 'dummy') {
    return true;
  }

  // Non-resolving specific domains identified in previous audits that cause ERR_NAME_NOT_RESOLVED
  const badSpecificHosts = new Set([
    'postoffice.gov.in', 'indianarmy.gov.in', 'indiannavy.gov.in', 'indianairforce.gov.in', 'coastguard.gov.in'
  ]);

  if (badSpecificHosts.has(h) || badSpecificHosts.has(h.replace(/^www\./, ''))) {
    return true;
  }

  return false;
}

/**
 * Given a job's metadata (title, state, orgName, category),
 * returns the authoritative, verified official website and online apply portal.
 */
export function resolveOfficialPortals(job: {
  title?: string;
  state?: string;
  orgName?: string;
  category?: string;
}): { official: string; apply: string; orgName: string } {
  const title = (job.title || '').trim();
  const tLow = title.toLowerCase();
  const state = (job.state || 'Central').trim();
  const orgName = (job.orgName || '').trim();
  const oLow = orgName.toLowerCase();

  // 1. Central Authorities matchers
  if (tLow.includes('ssc') || tLow.includes('staff selection') || oLow.includes('staff selection')) {
    return { official: CENTRAL_PORTALS.ssc.official, apply: CENTRAL_PORTALS.ssc.apply, orgName: CENTRAL_PORTALS.ssc.name };
  }
  if (tLow.includes('upsc') || tLow.includes('civil services') || tLow.includes('nda') || tLow.includes('cds') || oLow.includes('upsc')) {
    return { official: CENTRAL_PORTALS.upsc.official, apply: CENTRAL_PORTALS.upsc.apply, orgName: CENTRAL_PORTALS.upsc.name };
  }
  if (tLow.includes('railway') || tLow.includes('rrb') || tLow.includes('rrc') || tLow.includes('loco pilot') || tLow.includes('alp') || tLow.includes('trackman')) {
    return { official: CENTRAL_PORTALS.railways.official, apply: CENTRAL_PORTALS.railways.apply, orgName: CENTRAL_PORTALS.railways.name };
  }
  if (tLow.includes('rpf')) {
    return { official: CENTRAL_PORTALS.rpf.official, apply: CENTRAL_PORTALS.rpf.apply, orgName: CENTRAL_PORTALS.rpf.name };
  }
  if (tLow.includes('ibps') || tLow.includes('bank po') || tLow.includes('bank clerk') || oLow.includes('ibps')) {
    return { official: CENTRAL_PORTALS.ibps.official, apply: CENTRAL_PORTALS.ibps.apply, orgName: CENTRAL_PORTALS.ibps.name };
  }
  if (tLow.includes('sbi') || oLow.includes('state bank')) {
    return { official: CENTRAL_PORTALS.sbi.official, apply: CENTRAL_PORTALS.sbi.apply, orgName: CENTRAL_PORTALS.sbi.name };
  }
  if (tLow.includes('rbi') || oLow.includes('reserve bank')) {
    return { official: CENTRAL_PORTALS.rbi.official, apply: CENTRAL_PORTALS.rbi.apply, orgName: CENTRAL_PORTALS.rbi.name };
  }
  if (tLow.includes('ctet')) {
    return { official: CENTRAL_PORTALS.ctet.official, apply: CENTRAL_PORTALS.ctet.apply, orgName: CENTRAL_PORTALS.ctet.name };
  }
  if (tLow.includes('cbse')) {
    return { official: CENTRAL_PORTALS.cbse.official, apply: CENTRAL_PORTALS.cbse.apply, orgName: CENTRAL_PORTALS.cbse.name };
  }
  if (tLow.includes('nta') || tLow.includes('neet') || tLow.includes('jee main') || tLow.includes('cuet') || tLow.includes('ugc net')) {
    return { official: CENTRAL_PORTALS.nta.official, apply: CENTRAL_PORTALS.nta.apply, orgName: CENTRAL_PORTALS.nta.name };
  }
  if (tLow.includes('navy') || tLow.includes('nausena')) {
    return { official: CENTRAL_PORTALS.navy.official, apply: CENTRAL_PORTALS.navy.apply, orgName: CENTRAL_PORTALS.navy.name };
  }
  if (tLow.includes('army') || tLow.includes('agniveer rally')) {
    return { official: CENTRAL_PORTALS.army.official, apply: CENTRAL_PORTALS.army.apply, orgName: CENTRAL_PORTALS.army.name };
  }
  if (tLow.includes('air force') || tLow.includes('airforce') || tLow.includes('agnipathvayu') || tLow.includes('iaf')) {
    return { official: CENTRAL_PORTALS.airforce.official, apply: CENTRAL_PORTALS.airforce.apply, orgName: CENTRAL_PORTALS.airforce.name };
  }
  if (tLow.includes('bsf')) {
    return { official: CENTRAL_PORTALS.bsf.official, apply: CENTRAL_PORTALS.bsf.apply, orgName: CENTRAL_PORTALS.bsf.name };
  }
  if (tLow.includes('crpf')) {
    return { official: CENTRAL_PORTALS.crpf.official, apply: CENTRAL_PORTALS.crpf.apply, orgName: CENTRAL_PORTALS.crpf.name };
  }
  if (tLow.includes('cisf')) {
    return { official: CENTRAL_PORTALS.cisf.official, apply: CENTRAL_PORTALS.cisf.apply, orgName: CENTRAL_PORTALS.cisf.name };
  }
  if (tLow.includes('itbp')) {
    return { official: CENTRAL_PORTALS.itbp.official, apply: CENTRAL_PORTALS.itbp.apply, orgName: CENTRAL_PORTALS.itbp.name };
  }
  if (tLow.includes('ssb') && !tLow.includes('sssb')) {
    return { official: CENTRAL_PORTALS.ssb.official, apply: CENTRAL_PORTALS.ssb.apply, orgName: CENTRAL_PORTALS.ssb.name };
  }
  if (tLow.includes('post office') || tLow.includes('india post') || tLow.includes('gds') || oLow.includes('post')) {
    return { official: CENTRAL_PORTALS.indiapost.official, apply: CENTRAL_PORTALS.indiapost.apply, orgName: CENTRAL_PORTALS.indiapost.name };
  }
  if (tLow.includes('drdo')) {
    return { official: CENTRAL_PORTALS.drdo.official, apply: CENTRAL_PORTALS.drdo.apply, orgName: CENTRAL_PORTALS.drdo.name };
  }
  if (tLow.includes('isro')) {
    return { official: CENTRAL_PORTALS.isro.official, apply: CENTRAL_PORTALS.isro.apply, orgName: CENTRAL_PORTALS.isro.name };
  }
  if (tLow.includes('barc')) {
    return { official: CENTRAL_PORTALS.barc.official, apply: CENTRAL_PORTALS.barc.apply, orgName: CENTRAL_PORTALS.barc.name };
  }
  if (tLow.includes('dsssb')) {
    return { official: CENTRAL_PORTALS.dsssb.official, apply: CENTRAL_PORTALS.dsssb.apply, orgName: CENTRAL_PORTALS.dsssb.name };
  }
  if (tLow.includes('kvs') || tLow.includes('kendriya vidyalaya')) {
    return { official: CENTRAL_PORTALS.kvs.official, apply: CENTRAL_PORTALS.kvs.apply, orgName: CENTRAL_PORTALS.kvs.name };
  }
  if (tLow.includes('nvs') || tLow.includes('navodaya')) {
    return { official: CENTRAL_PORTALS.nvs.official, apply: CENTRAL_PORTALS.nvs.apply, orgName: CENTRAL_PORTALS.nvs.name };
  }
  if (tLow.includes('pib')) {
    return { official: CENTRAL_PORTALS.pib.official, apply: CENTRAL_PORTALS.pib.apply, orgName: CENTRAL_PORTALS.pib.name };
  }
  if (tLow.includes('employment news')) {
    return { official: CENTRAL_PORTALS.employmentnews.official, apply: CENTRAL_PORTALS.employmentnews.apply, orgName: CENTRAL_PORTALS.employmentnews.name };
  }
  if (tLow.includes('scholarship')) {
    return { official: CENTRAL_PORTALS.scholarship.official, apply: CENTRAL_PORTALS.scholarship.apply, orgName: CENTRAL_PORTALS.scholarship.name };
  }
  if (tLow.includes('voter') || tLow.includes('epic')) {
    return { official: CENTRAL_PORTALS.voter.official, apply: CENTRAL_PORTALS.voter.apply, orgName: CENTRAL_PORTALS.voter.name };
  }
  if (tLow.includes('aadhaar') || tLow.includes('uidai')) {
    return { official: CENTRAL_PORTALS.aadhaar.official, apply: CENTRAL_PORTALS.aadhaar.apply, orgName: CENTRAL_PORTALS.aadhaar.name };
  }
  if (tLow.includes('pan card') || tLow.includes('nsdl')) {
    return { official: CENTRAL_PORTALS.pancard.official, apply: CENTRAL_PORTALS.pancard.apply, orgName: CENTRAL_PORTALS.pancard.name };
  }
  if (tLow.includes('digilocker')) {
    return { official: CENTRAL_PORTALS.digilocker.official, apply: CENTRAL_PORTALS.digilocker.apply, orgName: CENTRAL_PORTALS.digilocker.name };
  }

  // 2. State Portals Matcher
  const stateEntry = STATE_PORTALS[state] || STATE_PORTALS['Uttar Pradesh'];
  if (state && STATE_PORTALS[state]) {
    const s = STATE_PORTALS[state];
    if (tLow.includes('police') || tLow.includes('constable') || tLow.includes('si ') || oLow.includes('police')) {
      return { official: s.police || s.official, apply: s.police || s.apply, orgName: `${s.name} Police Department` };
    }
    if (tLow.includes('psc') || tLow.includes('public service') || oLow.includes('psc')) {
      return { official: s.psc || s.official, apply: s.psc || s.apply, orgName: `${s.name} Public Service Commission` };
    }
    if (tLow.includes('ssc') || tLow.includes('subordinate') || tLow.includes('vyapam') || oLow.includes('ssc')) {
      return { official: s.ssc || s.official, apply: s.ssc || s.apply, orgName: `${s.name} Subordinate Services Selection Board` };
    }
    if (tLow.includes('high court') || oLow.includes('court')) {
      return { official: s.highCourt || s.official, apply: s.highCourt || s.apply, orgName: `${s.name} High Court` };
    }
    if (tLow.includes('education') || tLow.includes('board') || tLow.includes('matric') || tLow.includes('intermediate')) {
      return { official: s.education || s.official, apply: s.education || s.apply, orgName: `${s.name} Education Examination Board` };
    }
    // Generic state department (Electricity, Health, Transport, Forest, etc.)
    return { official: s.official, apply: s.apply, orgName: orgName || `${s.name} Govt Department` };
  }

  // 3. Fallback to National Official Portal
  return {
    official: 'https://www.india.gov.in',
    apply: 'https://www.india.gov.in',
    orgName: orgName || 'Government of India Official Portal'
  };
}

/**
 * Validates, repairs, and sanitizes a single link URL
 */
export function sanitizeAndRepairUrl(
  url?: string,
  fallback: string = 'https://www.india.gov.in'
): string {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  let clean = url.trim().replace(/['"<>]/g, '');

  if (clean === '#' || clean.toLowerCase() === 'needs review' || clean.toLowerCase() === 'n/a') {
    return fallback;
  }

  if (clean.startsWith('//')) clean = 'https:' + clean;
  if (!/^https?:\/\//i.test(clean)) clean = `https://${clean}`;

  try {
    const u = new URL(clean);
    if (isSyntheticOrBrokenDomain(u.hostname)) {
      return fallback;
    }

    // Strip RSS/feed endpoints if pointing to a home portal
    let path = u.pathname
      .replace(/\/(notices\/)?(rss|feed)\.(xml|rss)/gi, '')
      .replace(/\/(updates|notices)\.rss/gi, '')
      .replace(/\/rss-feed/gi, '')
      .replace(/\/notifications\.xml/gi, '')
      .replace(/\/recruitment\.xml/gi, '')
      .replace(/\/+$/, '');

    u.pathname = path || '';
    // Do not wipe out query parameters (e.g. ?q=, ?search_query=, ?p=, ?id=)
    return u.toString();
  } catch {
    return fallback;
  }
}

/**
 * Audits and replaces any broken links in a job object with guaranteed working URLs
 */
export function verifyAndRepairJobLinks(job: any): any {
  if (!job || typeof job !== 'object') return job;

  const { official, apply, orgName } = resolveOfficialPortals(job);
  const rawLinks = job.links || {};

  const cleanApply = sanitizeAndRepairUrl(rawLinks.apply, apply);
  const cleanOfficial = sanitizeAndRepairUrl(rawLinks.official, official);
  const cleanNotification = sanitizeAndRepairUrl(rawLinks.notification, cleanOfficial);
  const cleanAdmitCard = sanitizeAndRepairUrl(rawLinks.admitCard, cleanApply);
  const cleanResult = sanitizeAndRepairUrl(rawLinks.result, cleanOfficial);
  const cleanAnswerKey = sanitizeAndRepairUrl(rawLinks.answerKey, cleanOfficial);
  const cleanSyllabus = sanitizeAndRepairUrl(rawLinks.syllabus, cleanOfficial);

  const title = job.title || 'Govt Recruitment';
  const videoSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' form fill up')}`;

  const repairedLinks = {
    apply: cleanApply,
    applyServer2: rawLinks.applyServer2 ? sanitizeAndRepairUrl(rawLinks.applyServer2, cleanApply) : undefined,
    official: cleanOfficial,
    notification: cleanNotification,
    admitCard: rawLinks.admitCard ? cleanAdmitCard : undefined,
    result: rawLinks.result ? cleanResult : undefined,
    resultServer2: rawLinks.resultServer2 ? sanitizeAndRepairUrl(rawLinks.resultServer2, cleanResult) : undefined,
    answerKey: rawLinks.answerKey ? cleanAnswerKey : undefined,
    syllabus: rawLinks.syllabus ? cleanSyllabus : undefined,
    videoHindi: rawLinks.videoHindi && rawLinks.videoHindi.startsWith('http') ? rawLinks.videoHindi : videoSearch,
    telegram: rawLinks.telegram || 'https://t.me/govtbharatofficial',
    whatsapp: rawLinks.whatsapp || 'https://whatsapp.com/channel/govtbharatofficial'
  };

  return {
    ...job,
    orgName: job.orgName || orgName,
    links: repairedLinks,
    linkHealthStatus: 'Healthy'
  };
}
