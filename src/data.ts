import { JobAlert, SocialLinkItem } from './types';
import { historicalJobsDatabase } from './data/historicalJobs';
import { fullCatalogJobs } from './data/fullCatalogJobs';
import { liveDatabaseJobs } from './data/liveDatabaseJobs';

const baseJobsDatabase: JobAlert[] = [
  {
    id: 'important-job-1',
    title: 'UP Nursing Council Registration Online Form 2026',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Nursing Council Registration Online Form 2026',
    links: { official: '#' }
  },
  {
    id: 'important-job-2',
    title: 'NIELIT CCC Exam Online Form 2026',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'NIELIT CCC Exam Online Form 2026',
    links: { official: '#' }
  },
  {
    id: 'important-job-3',
    title: 'Delhi DSSB E Dossiers Form 2026',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'Delhi DSSB E Dossiers Form 2026',
    links: { official: '#' }
  },
  {
    id: 'important-job-4',
    title: 'UP Self Enumeration Online Registration 2026 Last Date : 21/05/2026',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Self Enumeration Online Registration 2026 Last Date : 21/05/2026',
    links: { official: '#' }
  },
  {
    id: 'important-job-5',
    title: 'NIELIT CCC Online Form 2026 Last Date : NA',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'NIELIT CCC Online Form 2026 Last Date : NA',
    links: { official: '#' }
  },
  {
    id: 'important-job-6',
    title: 'MP Rojgar Panjiyan 2025',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'MP Rojgar Panjiyan 2025',
    links: { official: '#' }
  },
  {
    id: 'important-job-7',
    title: 'UP Scholarship Online Form 2024 Last Date : 31/12/2024',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Scholarship Online Form 2024 Last Date : 31/12/2024',
    links: { official: '#' }
  },
  {
    id: 'important-job-8',
    title: 'SSC One Time Registration OTR Online Form 2024 Last Date : NA',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'SSC One Time Registration OTR Online Form 2024 Last Date : NA',
    links: { official: '#' }
  },
  {
    id: 'important-job-9',
    title: 'Voter ID Online Form 2024, E EPIC Download',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'Voter ID Online Form 2024, E EPIC Download',
    links: { official: '#' }
  },
  {
    id: 'important-job-10',
    title: 'Har Ghar Tiranga Abhiyan 2023',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'Har Ghar Tiranga Abhiyan 2023',
    links: { official: '#' }
  },
  {
    id: 'important-job-11',
    title: 'Sahara Refund Portal Online Registration 2023',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'Sahara Refund Portal Online Registration 2023',
    links: { official: '#' }
  },
  {
    id: 'important-job-12',
    title: 'UP Family ID Ek Parivar Ek Pahchan Scheme Online Registration 2023',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Family ID Ek Parivar Ek Pahchan Scheme Online Registration 2023',
    links: { official: '#' }
  },
  {
    id: 'important-job-13',
    title: 'MPESB Profile Online Registration 2023 Last Date : NA',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'MPESB Profile Online Registration 2023 Last Date : NA',
    links: { official: '#' }
  },
  {
    id: 'important-job-14',
    title: 'UP Mukhyamantri Fellowship Programme Online Form 2022 Last Date : 24/08/2022',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Mukhyamantri Fellowship Programme Online Form 2022 Last Date : 24/08/2022',
    links: { official: '#' }
  },
  {
    id: 'important-job-15',
    title: 'Har Ghar Tiranga Abhiyan Online Registration 2022',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'Har Ghar Tiranga Abhiyan Online Registration 2022',
    links: { official: '#' }
  },
  {
    id: 'important-job-16',
    title: 'UP Scholarship Online Form 2022',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Scholarship Online Form 2022',
    links: { official: '#' }
  },
  {
    id: 'important-job-17',
    title: 'UP Election 2022 Voter Slip Download',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Election 2022 Voter Slip Download',
    links: { official: '#' }
  },
  {
    id: 'important-job-18',
    title: 'Aadhar Card Download | Appointment Book | Update | PVC Order | Etc 2022',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'Aadhar Card Download | Appointment Book | Update | PVC Order | Etc 2022',
    links: { official: '#' }
  },
  {
    id: 'important-job-19',
    title: 'E Sharam Card Online Registration 2022',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'E Sharam Card Online Registration 2022',
    links: { official: '#' }
  },
  {
    id: 'important-job-20',
    title: 'UP Scholarship 2021 Online Form Last Date : 21/10/2021',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Scholarship 2021 Online Form Last Date : 21/10/2021',
    links: { official: '#' }
  },
  {
    id: 'important-job-21',
    title: 'UP Teacher Transfer Online Form 2021 Last Date : 02/07/2021',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Teacher Transfer Online Form 2021 Last Date : 02/07/2021',
    links: { official: '#' }
  },
  {
    id: 'important-job-22',
    title: 'High Security Number Plate HSRP Online Registration 2021',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'High Security Number Plate HSRP Online Registration 2021',
    links: { official: '#' }
  },
  {
    id: 'important-job-23',
    title: 'UPSSSC OTR Registration Online Form 2021',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UPSSSC OTR Registration Online Form 2021',
    links: { official: '#' }
  },
  {
    id: 'important-job-24',
    title: 'Corona Vaccine Online Registration 2021',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'Corona Vaccine Online Registration 2021',
    links: { official: '#' }
  },
  {
    id: 'important-job-25',
    title: 'UP NTSE Online Form 2020 Last Date : 10/11/2020',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP NTSE Online Form 2020 Last Date : 10/11/2020',
    links: { official: '#' }
  },
  {
    id: 'important-job-26',
    title: 'MP Rojgar Panjiyan Online Form',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'MP Rojgar Panjiyan Online Form',
    links: { official: '#' }
  },
  {
    id: 'important-job-27',
    title: 'UP Scholarship Class 9 to 12 Online Form 2020',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Scholarship Class 9 to 12 Online Form 2020',
    links: { official: '#' }
  },
  {
    id: 'important-job-28',
    title: 'CCC Result, Admit Card,Certificate, Online Form',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'CCC Result, Admit Card,Certificate, Online Form',
    links: { official: '#' }
  },
  {
    id: 'important-job-29',
    title: 'UP Learning License Online Form 2020',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Learning License Online Form 2020',
    links: { official: '#' }
  },
  {
    id: 'important-job-30',
    title: 'UP Bar Declaration Online Form',
    category: 'important',
    postDate: '15-08-2026',
    isNew: false,
    state: 'All India',
    shortInfo: 'UP Bar Declaration Online Form',
    links: { official: '#' }
  },
  // ==========================================
  // 1. LATEST JOBS (ALL FROM SARKARI RESULT)
  // ==========================================
  {
    id: 'job-raj-safai-karmchari-2026',
    title: 'Rajasthan Safai Karmchari Online Form 2026 (24,752 posts) – Start',
    category: 'latest-jobs',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Rajasthan',
    shortInfo: 'Department of Local Self Government (DLB Rajasthan) has released recruitment notification for 24,752 Safai Karmchari posts across various municipal bodies.',
    ageLimit: '18 to 40 Years (Age Relaxation as per DLB Rajasthan rules)',
    eligibility: 'Resident of Rajasthan with Minimum 1 Year Sanitation Experience in Govt/Private entity.',
    fees: { general: '₹600', scSt: '₹400' },
    dates: { start: '15-08-2026', last: '15-09-2026' },
    links: { apply: 'https://lsg.urban.rajasthan.gov.in', official: 'https://sso.rajasthan.gov.in', notification: 'https://lsg.urban.rajasthan.gov.in' }
  },
  {
    id: 'job-uksssc-asst-accountant',
    title: 'UKSSSC Assistant Accountant Online Form 2026 – Last Date Today',
    category: 'latest-jobs',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Uttarakhand',
    shortInfo: 'Uttarakhand Subordinate Service Selection Commission (UKSSSC) Assistant Accountant / Sahayak Lekhakar direct recruitment.',
    ageLimit: '21 to 42 Years',
    eligibility: 'B.Com / BBA / Post Graduate in Accountancy with Hindi Typing.',
    fees: { general: '₹300', scSt: '₹150' },
    dates: { start: '15-07-2026', last: '15-08-2026' },
    links: { apply: 'https://sssc.uk.gov.in', official: 'https://sssc.uk.gov.in', notification: 'https://sssc.uk.gov.in' }
  },
  {
    id: 'job-upsrtc-bus-conductor',
    title: 'UPSRTC Bus Conductor Online Form 2026 – Last Date Today',
    category: 'latest-jobs',
    postDate: '15-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Uttar Pradesh State Road Transport Corporation (UPSRTC) invites online application for Samvida Conductor (Bus Conductor) across various UP districts.',
    ageLimit: '18 to 40 Years',
    eligibility: 'Intermediate (10+2) with CCC Exam Passed from NIELIT.',
    fees: { general: '₹200', scSt: '₹100' },
    dates: { start: '01-08-2026', last: '15-08-2026' },
    links: { apply: 'https://sewayojan.up.nic.in', official: 'https://upsrtc.up.gov.in', notification: 'https://sewayojan.up.nic.in' }
  },
  {
    id: 'job-bpsc-deputy-director',
    title: 'Bihar BPSC Deputy Director Online Form 2026 – Last Date Today',
    category: 'latest-jobs',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar Public Service Commission (BPSC) Deputy Director recruitment in various state government departments.',
    ageLimit: '21 to 45 Years',
    eligibility: 'Post Graduate Degree in relevant subject with administrative experience.',
    fees: { general: '₹750', scSt: '₹200' },
    dates: { start: '20-07-2026', last: '15-08-2026' },
    links: { apply: 'https://onlinebpsc.bihar.gov.in', official: 'https://bpsc.bih.nic.in', notification: 'https://bpsc.bih.nic.in' }
  },
  {
    id: 'job-bpsc-additional-director',
    title: 'Bihar BPSC Additional Director Online Form 2026 – Last Date Today',
    category: 'latest-jobs',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar Public Service Commission (BPSC) invites applications for Additional Director posts under Advt No 2026.',
    ageLimit: '25 to 50 Years',
    eligibility: 'Master Degree in relevant discipline with prescribed work experience.',
    fees: { general: '₹750', scSt: '₹200' },
    dates: { start: '20-07-2026', last: '15-08-2026' },
    links: { apply: 'https://onlinebpsc.bihar.gov.in', official: 'https://bpsc.bih.nic.in', notification: 'https://bpsc.bih.nic.in' }
  },
  {
    id: 'job-bpssc-forest-range-officer',
    title: 'BPSSC Bihar Forest Range Officer Online Form 2026',
    category: 'latest-jobs',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar Police Subordinate Services Commission (BPSSC) Forest Range Officer (Vano ke Kshetriya Adhikari) recruitment in Environment & Forest Dept.',
    ageLimit: '21 to 42 Years',
    eligibility: 'Bachelor Degree in Science (Botany, Zoology, Chemistry, Physics, Maths, Geology, Forestry) or BCA / B.Tech.',
    fees: { general: '₹700', scSt: '₹400' },
    dates: { start: '10-08-2026', last: '10-09-2026' },
    links: { apply: 'https://bpssc.bih.nic.in', official: 'https://bpssc.bih.nic.in', notification: 'https://bpssc.bih.nic.in' }
  },
  {
    id: 'job-pnb-bank-lbo-2026',
    title: 'PNB Bank LBO Online Form 2026',
    category: 'latest-jobs',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Punjab National Bank (PNB) invites online applications for Local Bank Officer (LBO) vacancies in various branches nationwide.',
    ageLimit: '20 to 30 Years',
    eligibility: 'Bachelor Degree in Any Stream from a Recognized University in India with Local Language proficiency.',
    fees: { general: '₹850', scSt: '₹175' },
    dates: { start: '08-08-2026', last: '31-08-2026' },
    links: { apply: 'https://pnbindia.in', official: 'https://pnbindia.in', notification: 'https://pnbindia.in/recruitment.aspx' }
  },
  {
    id: 'job-upsssc-pet-2026',
    title: 'UPSSSC PET Online Form 2026',
    category: 'latest-jobs',
    postDate: '14-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Uttar Pradesh Subordinate Services Selection Commission (UPSSSC) Preliminary Eligibility Test (PET 2026) for all UP Group C Recruitments.',
    ageLimit: '18 to 40 Years (Age relaxation as per UP rules)',
    eligibility: 'Class 10th (High School) passed or any higher qualification from recognized board.',
    fees: { general: '₹185', scSt: '₹95 (PH ₹25)' },
    dates: { start: '05-08-2026', last: '05-09-2026' },
    links: { apply: 'https://upsssc.gov.in', official: 'https://upsssc.gov.in', notification: 'https://upsssc.gov.in' }
  },
  {
    id: 'job-upsssc-je-agriculture',
    title: 'UPSSSC Junior Engineer JE (Agriculture) Online Form 2026',
    category: 'latest-jobs',
    postDate: '14-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPSSSC Junior Engineer (Agriculture Engineering) Recruitment Exam under Advt 2026.',
    ageLimit: '18 to 40 Years',
    eligibility: 'UPSSSC PET Scorecard with Diploma in Agriculture Engineering.',
    fees: { general: '₹25', scSt: '₹25' },
    dates: { start: '12-08-2026', last: '12-09-2026' },
    links: { apply: 'https://upsssc.gov.in', official: 'https://upsssc.gov.in', notification: 'https://upsssc.gov.in' }
  },
  {
    id: 'job-upsssc-veterinary-pharmacist',
    title: 'UPSSSC Veterinary Pharmacist Online Form 2026',
    category: 'latest-jobs',
    postDate: '13-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPSSSC Animal Husbandry Department Veterinary Pharmacist recruitment.',
    ageLimit: '18 to 40 Years',
    eligibility: 'UPSSSC PET Score + Diploma in Veterinary Pharmacy.',
    fees: { general: '₹25', scSt: '₹25' },
    dates: { start: '10-08-2026', last: '10-09-2026' },
    links: { apply: 'https://upsssc.gov.in', official: 'https://upsssc.gov.in', notification: 'https://upsssc.gov.in' }
  },
  {
    id: 'job-bihar-stet-2026',
    title: 'Bihar STET Online Form 2026',
    category: 'latest-jobs',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar School Examination Board (BSEB) Secondary Teacher Eligibility Test (STET 2026) for Paper I (Secondary) & Paper II (Senior Secondary).',
    ageLimit: '21 to 37 Years (Male), 40 Years (Female)',
    eligibility: 'Graduation / Post Graduation in relevant subject with B.Ed / D.El.Ed.',
    fees: { general: '₹960 (Single) / ₹1440 (Both)', scSt: '₹760 / ₹1140' },
    dates: { start: '01-08-2026', last: '31-08-2026' },
    links: { apply: 'https://bsebstet.com', official: 'https://secondary.biharboardonline.com', notification: 'https://bsebstet.com' }
  },
  {
    id: 'job-rrb-je-online-form',
    title: 'RRB Junior Engineer JE Online Form 2026 – Start',
    category: 'latest-jobs',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Railway Recruitment Boards (RRBs) CEN 03/2026 Junior Engineer (JE), JE IT, Depot Material Superintendent (DMS) & CMA vacancies.',
    ageLimit: '18 to 36 Years',
    eligibility: 'Diploma / Degree in Engineering in relevant engineering discipline (Civil, Mech, Electrical, Electronics, CS/IT).',
    fees: { general: '₹500 (Refundable ₹400)', scSt: '₹250' },
    dates: { start: '10-08-2026', last: '09-09-2026' },
    links: { apply: 'https://rrbapply.gov.in', official: 'https://indianrailways.gov.in', notification: 'https://rrbapply.gov.in' }
  },
  {
    id: 'job-ibps-clerk-16th-2026',
    title: 'IBPS Clerk (CSA) 16th Online Form 2026 (11,403 Posts)',
    category: 'latest-jobs',
    postDate: '12-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Institute of Banking Personnel Selection (IBPS) CRP Clerks / Customer Service Associates (CSA XVI) for 11,403 posts in public sector banks.',
    ageLimit: '20 to 28 Years',
    eligibility: 'Bachelor Degree in Any Discipline with Computer Literacy certificate.',
    fees: { general: '₹850', scSt: '₹175' },
    dates: { start: '01-08-2026', last: '28-08-2026' },
    links: { apply: 'https://ibps.in', official: 'https://ibps.in', notification: 'https://ibps.in/index.php/crp-clerk-xvi/' }
  },
  {
    id: 'job-sbi-clerk-2026',
    title: 'SBI Junior Associates Clerk Online Form 2026 (9,124 Posts)',
    category: 'latest-jobs',
    postDate: '12-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'State Bank of India (SBI) Recruitment of Junior Associates (Customer Support & Sales) across India.',
    ageLimit: '20 to 28 Years',
    eligibility: 'Graduation in Any Discipline from a recognized university.',
    fees: { general: '₹750', scSt: '₹0 (Free)' },
    dates: { start: '05-08-2026', last: '31-08-2026' },
    links: { apply: 'https://sbi.co.in/careers', official: 'https://sbi.co.in', notification: 'https://bank.sbi/careers' }
  },
  {
    id: 'job-up-anganwadi-2026',
    title: 'UP Anganwadi Bharti Online Form 2026 (Updated)',
    category: 'latest-jobs',
    postDate: '11-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Uttar Pradesh Bal Vikas Seva Evam Pushtahar Vibhag Anganwadi Karyakatri (Worker) recruitment across 75 districts.',
    ageLimit: '18 to 35 Years (Female Candidates Only)',
    eligibility: '10+2 (Intermediate) Passed from recognized board in India.',
    fees: { general: '₹0 (No Fee)', scSt: '₹0 (No Fee)' },
    dates: { start: '01-08-2026', last: '31-08-2026' },
    links: { apply: 'https://upanganwadibharti.in', official: 'https://balvikasup.gov.in', notification: 'https://upanganwadibharti.in' }
  },
  {
    id: 'job-isro-assistant-2026',
    title: 'ISRO Assistant & Junior Personal Assistant Online Form 2026 – Date Extend',
    category: 'latest-jobs',
    postDate: '11-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Indian Space Research Organisation (ISRO ICRB) Assistant, Junior Personal Assistant (JPA) and UDC recruitment.',
    ageLimit: '18 to 28 Years',
    eligibility: 'Graduation with Minimum 60% Marks / CGPA 6.32 with Proficiency in Computers.',
    fees: { general: '₹500 (Refundable ₹400)', scSt: '₹500 (Full Refundable ₹500)' },
    dates: { start: '20-07-2026', last: '25-08-2026' },
    links: { apply: 'https://isro.gov.in', official: 'https://isro.gov.in/Careers.html', notification: 'https://isro.gov.in' }
  },
  {
    id: 'job-gims-noida-staff-nurse',
    title: 'GIMS Noida Staff Nurse Online Form 2026',
    category: 'latest-jobs',
    postDate: '10-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Government Institute of Medical Sciences (GIMS Greater Noida) Staff Nurse / Nursing Officer Recruitment.',
    ageLimit: '21 to 40 Years',
    eligibility: 'B.Sc Nursing / Post Basic B.Sc Nursing OR GNM with 2 Yrs Hospital Experience.',
    fees: { general: '₹1180', scSt: '₹708' },
    dates: { start: '01-08-2026', last: '28-08-2026' },
    links: { apply: 'https://gims.ac.in', official: 'https://gims.ac.in', notification: 'https://gims.ac.in' }
  },
  {
    id: 'job-upsssc-livestock-officer',
    title: 'UPSSSC Livestock Extension Officer Online Form 2026',
    category: 'latest-jobs',
    postDate: '10-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPSSSC Pashudhan Prasar Adhikari (Livestock Extension Officer) Recruitment 2026.',
    ageLimit: '18 to 40 Years',
    eligibility: 'UPSSSC PET Scorecard + 10+2 with Science/Agriculture and Livestock Diploma.',
    fees: { general: '₹25', scSt: '₹25' },
    dates: { start: '05-08-2026', last: '05-09-2026' },
    links: { apply: 'https://upsssc.gov.in', official: 'https://upsssc.gov.in', notification: 'https://upsssc.gov.in' }
  },
  {
    id: 'job-railway-icf-apprentice',
    title: 'Railway ICF Apprentice Online Form 2026',
    category: 'latest-jobs',
    postDate: '09-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Integral Coach Factory (ICF Chennai) Trade Apprentice in Fitter, Electrician, Machinist, Welder trades.',
    ageLimit: '15 to 24 Years',
    eligibility: 'Class 10th with ITI in relevant trade or 10+2 with Science & Maths for Freshers.',
    fees: { general: '₹100', scSt: '₹0' },
    dates: { start: '01-08-2026', last: '31-08-2026' },
    links: { apply: 'https://pb.icf.gov.in', official: 'https://icf.indianrailways.gov.in', notification: 'https://pb.icf.gov.in' }
  },
  {
    id: 'job-rcf-kapurthala-apprentice',
    title: 'RCF Kapurthala Apprentice Online Form 2026',
    category: 'latest-jobs',
    postDate: '09-08-2026',
    isNew: true,
    state: 'Punjab',
    shortInfo: 'Rail Coach Factory (RCF Kapurthala) Act Apprentice recruitment for 550+ slots.',
    ageLimit: '15 to 24 Years',
    eligibility: '10th with minimum 50% Marks + NCVT/SCVT ITI Certificate.',
    fees: { general: '₹100', scSt: '₹0' },
    dates: { start: '02-08-2026', last: '01-09-2026' },
    links: { apply: 'https://rcf.indianrailways.gov.in', official: 'https://rcf.indianrailways.gov.in', notification: 'https://rcf.indianrailways.gov.in' }
  },
  {
    id: 'job-hp-high-court-2026',
    title: 'Himachal Pradesh High Court Various Posts Online Form 2026',
    category: 'latest-jobs',
    postDate: '08-08-2026',
    isNew: true,
    state: 'Himachal Pradesh',
    shortInfo: 'High Court of Himachal Pradesh Shimla invites online applications for Clerk, Stenographer, Driver, Mali & Peon.',
    ageLimit: '18 to 45 Years',
    eligibility: 'Class 10th / 12th / Graduation based on post applied.',
    fees: { general: '₹340', scSt: '₹190' },
    dates: { start: '01-08-2026', last: '28-08-2026' },
    links: { apply: 'https://hphighcourt.nic.in', official: 'https://hphighcourt.nic.in', notification: 'https://hphighcourt.nic.in/recruitment.htm' }
  },
  {
    id: 'job-ssc-cgl-2026',
    title: 'SSC CGL 2026 Online Application Form (17,727 Posts)',
    category: 'latest-jobs',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Staff Selection Commission (SSC) Combined Graduate Level Examination (CGL 2026) for Inspector, ASO, Tax Assistant.',
    ageLimit: '18 to 32 Years',
    eligibility: 'Bachelor Degree in Any Stream from Recognized University in India.',
    fees: { general: '₹100', scSt: '₹0' },
    dates: { start: '10-08-2026', last: '09-09-2026' },
    links: { apply: 'https://ssc.gov.in', official: 'https://ssc.gov.in', notification: 'https://ssc.gov.in/notices' }
  },
  {
    id: 'job-rrb-alp-2026',
    title: 'Railway RRB ALP & Technician 2026 (18,799 Vacancies)',
    category: 'latest-jobs',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Railway Recruitment Boards (RRBs) Assistant Loco Pilot (ALP) and Technicians across all Railway Zones.',
    ageLimit: '18 to 33 Years',
    eligibility: 'Class 10th with ITI in relevant trade OR Diploma in Engineering.',
    fees: { general: '₹500 (Refundable ₹400 on CBT 1)', scSt: '₹250' },
    dates: { start: '01-08-2026', last: '31-08-2026' },
    links: { apply: 'https://rrbapply.gov.in', official: 'https://indianrailways.gov.in', notification: 'https://rrbapply.gov.in' }
  },
  {
    id: 'job-ibps-po-2026',
    title: 'IBPS PO / MT XIV Recruitment 2026 (4,455 Posts)',
    category: 'latest-jobs',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'IBPS Probationary Officers / Management Trainees (PO/MT) CRP-PO/MT-XIV in Participating Banks.',
    ageLimit: '20 to 30 Years',
    eligibility: 'Graduation Degree in any discipline from a recognized University.',
    fees: { general: '₹850', scSt: '₹175' },
    dates: { start: '05-08-2026', last: '28-08-2026' },
    links: { apply: 'https://ibps.in', official: 'https://ibps.in', notification: 'https://ibps.in' }
  },
  {
    id: 'job-up-police-si-2026',
    title: 'UP Police Sub Inspector (SI) & PAC Platoon Commander (3,200 Posts)',
    category: 'latest-jobs',
    postDate: '12-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPPRPB invites online application for Sub Inspector (Civil Police) and Platoon Commander.',
    ageLimit: '21 to 28 Years',
    eligibility: 'Bachelor Degree in Any Stream. Height: 168 CMS for Male.',
    fees: { general: '₹400', scSt: '₹400' },
    dates: { start: '12-08-2026', last: '15-09-2026' },
    links: { apply: 'https://uppbpb.gov.in', official: 'https://uppbpb.gov.in', notification: 'https://uppbpb.gov.in/Recruitment' }
  },
  {
    id: 'job-bihar-bssc-cgl',
    title: 'Bihar BSSC 4th Graduate Level (4th CGL) 2026 (2,648 Posts)',
    category: 'latest-jobs',
    postDate: '11-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar Staff Selection Commission 4th Combined Graduate Level Examination.',
    ageLimit: '21 to 37 Years (Male), 40 Years (Female)',
    eligibility: 'Graduate in Any Discipline from recognized university.',
    fees: { general: '₹540', scSt: '₹135' },
    dates: { start: '08-08-2026', last: '08-09-2026' },
    links: { apply: 'https://bssc.bihar.gov.in', official: 'https://bssc.bihar.gov.in', notification: 'https://bssc.bihar.gov.in' }
  },
  {
    id: 'job-ssc-mts-havaldar',
    title: 'SSC Multi Tasking Staff (MTS) & Havaldar 2026 (9,583 Posts)',
    category: 'latest-jobs',
    postDate: '09-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Staff Selection Commission (SSC) Non-Technical Staff and Havaldar (CBIC & CBN) Examination 2026.',
    ageLimit: '18 to 25 / 27 Years',
    eligibility: 'Class 10th High School Exam Passed from Any Recognized Board.',
    fees: { general: '₹100', scSt: '₹0' },
    dates: { start: '01-08-2026', last: '31-08-2026' },
    links: { apply: 'https://ssc.gov.in', official: 'https://ssc.gov.in', notification: 'https://ssc.gov.in' }
  },

  // ==========================================
  // 2. RESULTS (ALL FROM SARKARI RESULT)
  // ==========================================
  {
    id: 'res-rssb-forester-2026',
    title: 'RSSB Forester Result 2026',
    category: 'results',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Rajasthan',
    shortInfo: 'Rajasthan Staff Selection Board (RSSB / RSMSSB Jaipur) Forester (Vanpal) final recommendation list and marks uploaded.',
    dates: { start: '15-08-2026', last: 'Document Verification' },
    links: { apply: 'https://rsmssb.rajasthan.gov.in', official: 'https://rsmssb.rajasthan.gov.in', notification: 'https://rsmssb.rajasthan.gov.in/page?menuName=results' }
  },
  {
    id: 'res-rssb-lab-assistant',
    title: 'RSSB Lab Assistant Result 2026 – Out',
    category: 'results',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Rajasthan',
    shortInfo: 'RSMSSB Lab Assistant (Prayogshala Sahayak) Written Examination Scorecard & Category-wise Cutoff marks.',
    dates: { start: '15-08-2026', last: 'Scorecard Live' },
    links: { apply: 'https://rsmssb.rajasthan.gov.in', official: 'https://rsmssb.rajasthan.gov.in', notification: 'https://rsmssb.rajasthan.gov.in' }
  },
  {
    id: 'res-uppsc-asst-professor',
    title: 'UPPSC Assistant Professor Result 2026 – Updated',
    category: 'results',
    postDate: '15-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Uttar Pradesh Public Service Commission (UPPSC) Assistant Professor Government Degree College Interview result list.',
    dates: { start: '15-08-2026', last: 'Result Live' },
    links: { apply: 'https://uppsc.up.nic.in', official: 'https://uppsc.up.nic.in', notification: 'https://uppsc.up.nic.in/Results.aspx' }
  },
  {
    id: 'res-mpesb-van-rakshak',
    title: 'MPESB Van Rakshak / Jail Prahari Result 2026 – Out',
    category: 'results',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Madhya Pradesh',
    shortInfo: 'Madhya Pradesh Employees Selection Board (MPESB Bhopal) Van Rakshak, Kshetra Rakshak and Jail Prahari Stage-1 Result & Scorecard.',
    dates: { start: '14-08-2026', last: 'PET Scheduled' },
    links: { apply: 'https://esb.mp.gov.in', official: 'https://esb.mp.gov.in', notification: 'https://esb.mp.gov.in/results/result.htm' }
  },
  {
    id: 'res-ib-security-assistant',
    title: 'IB Security Assistant / Executive Final Result 2026',
    category: 'results',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Intelligence Bureau (MHA IB) Security Assistant / Executive & Multi-Tasking Staff (MTS) Final Selected Candidates List.',
    dates: { start: '14-08-2026', last: 'Joining Soon' },
    links: { apply: 'https://mha.gov.in', official: 'https://mha.gov.in', notification: 'https://mha.gov.in/en/notifications/vacancies' }
  },
  {
    id: 'res-delhi-hc-hjs',
    title: 'Delhi High Court Higher Judicial Service HJS Result 2026',
    category: 'results',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Delhi',
    shortInfo: 'High Court of Delhi has declared the written examination results for Delhi Higher Judicial Service Exam.',
    dates: { start: '14-08-2026', last: 'Interview: Sept 2026' },
    links: { apply: 'https://delhihighcourt.nic.in', official: 'https://delhihighcourt.nic.in', notification: 'https://delhihighcourt.nic.in' }
  },
  {
    id: 'res-bihar-vidhan-parishad-ldc',
    title: 'Bihar Vidhan Parishad LDC Pre / PA Final Result 2026',
    category: 'results',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar Legislative Council (Vidhan Parishad Sachivalaya) Lower Division Clerk (LDC) and Personal Assistant (PA) Final Result.',
    dates: { start: '13-08-2026', last: 'Scorecard Active' },
    links: { apply: 'https://biharvidhanparishad.gov.in', official: 'https://biharvidhanparishad.gov.in', notification: 'https://biharvidhanparishad.gov.in' }
  },
  {
    id: 'res-rssb-nhm-rajmes',
    title: 'RSSB NHM & RajMES Final Result 2026 – Updated',
    category: 'results',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Rajasthan',
    shortInfo: 'RSMSSB Community Health Officer (CHO) and RajMES Medical Staff final appointment merit list.',
    dates: { start: '13-08-2026', last: 'Allotment' },
    links: { apply: 'https://rsmssb.rajasthan.gov.in', official: 'https://rsmssb.rajasthan.gov.in', notification: 'https://rsmssb.rajasthan.gov.in' }
  },
  {
    id: 'res-rssb-jta-result',
    title: 'RSSB Junior Technical Assistant JTA Final Result 2026',
    category: 'results',
    postDate: '12-08-2026',
    isNew: true,
    state: 'Rajasthan',
    shortInfo: 'RSMSSB Junior Technical Assistant (JTA) and Account Assistant Final Cutoff & Marks.',
    dates: { start: '12-08-2026', last: 'DV Stage' },
    links: { apply: 'https://rsmssb.rajasthan.gov.in', official: 'https://rsmssb.rajasthan.gov.in', notification: 'https://rsmssb.rajasthan.gov.in' }
  },
  {
    id: 'res-rssb-ayush-officer',
    title: 'RSSB Ayush Officer Final Result 2026 – Out',
    category: 'results',
    postDate: '12-08-2026',
    isNew: true,
    state: 'Rajasthan',
    shortInfo: 'Rajasthan Ayush Medical Officer Final Merit List & Category Roll numbers.',
    dates: { start: '12-08-2026', last: 'Final Order' },
    links: { apply: 'https://rsmssb.rajasthan.gov.in', official: 'https://rsmssb.rajasthan.gov.in', notification: 'https://rsmssb.rajasthan.gov.in' }
  },
  {
    id: 'res-upsssc-auditor-result',
    title: 'UPSSSC Auditor / Assistant Accountant 2024 Final Result',
    category: 'results',
    postDate: '11-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPSSSC Lekha Parikshak Evam Sahayak Lekhakar Direct Recruitment Final Result with Department Allotment.',
    dates: { start: '11-08-2026', last: 'Selected' },
    links: { apply: 'https://upsssc.gov.in', official: 'https://upsssc.gov.in', notification: 'https://upsssc.gov.in' }
  },
  {
    id: 'res-upsc-capf-ac',
    title: 'UPSC CAPF AC 2025 Final Marks',
    category: 'results',
    postDate: '11-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Union Public Service Commission Central Armed Police Forces (Assistant Commandants) Exam Marks of Recommended Candidates.',
    dates: { start: '11-08-2026', last: 'Marks Portal Live' },
    links: { apply: 'https://upsc.gov.in', official: 'https://upsc.gov.in', notification: 'https://upsc.gov.in/examinations/marks-information' }
  },
  {
    id: 'res-cbse-12th-compartment',
    title: 'CBSE Board 12th Compartment Result 2026 – Out',
    category: 'results',
    postDate: '10-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Central Board of Secondary Education Class XII Supplementary / Compartment Exam Scorecard online.',
    dates: { start: '10-08-2026', last: 'DigiLocker Active' },
    links: { apply: 'https://cbseresults.nic.in', official: 'https://cbse.gov.in', notification: 'https://results.digilocker.gov.in' }
  },
  {
    id: 'res-bpssc-si-prohibition',
    title: 'Bihar Police BPSSC SI Prohibition Pre Result 2026 – Out',
    category: 'results',
    postDate: '10-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'BPSSC Sub Inspector Prohibition & Sub-Divisional Fire Station Officer Preliminary Exam Results declared.',
    dates: { start: '10-08-2026', last: 'Mains: Sept 2026' },
    links: { apply: 'https://bpssc.bih.nic.in', official: 'https://bpssc.bih.nic.in', notification: 'https://bpssc.bih.nic.in' }
  },
  {
    id: 'res-bpssc-havildar-instructor',
    title: 'BPSSC Bihar Police Havildar Instructor Result 2026 – Out',
    category: 'results',
    postDate: '09-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'BPSSC Bihar Police Havildar Instructor written test cutoffs and qualifying candidate roll list.',
    dates: { start: '09-08-2026', last: 'PST Exam' },
    links: { apply: 'https://bpssc.bih.nic.in', official: 'https://bpssc.bih.nic.in', notification: 'https://bpssc.bih.nic.in' }
  },
  {
    id: 'res-bpssc-asi-operation',
    title: 'Bihar Police BPSSC ASI (Operation) Pre Result 2026 – Out',
    category: 'results',
    postDate: '09-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Assistant Sub-Inspector Operation (Wireless) Prelims examination result PDF released.',
    dates: { start: '09-08-2026', last: 'Stage 2 Active' },
    links: { apply: 'https://bpssc.bih.nic.in', official: 'https://bpssc.bih.nic.in', notification: 'https://bpssc.bih.nic.in' }
  },
  {
    id: 'res-hpsc-pgt-cs',
    title: 'HPSC PGT Computer Science Final Result 2026',
    category: 'results',
    postDate: '08-08-2026',
    isNew: false,
    state: 'Haryana',
    shortInfo: 'Haryana Public Service Commission Post Graduate Teachers (PGT) Computer Science Final Merit List.',
    dates: { start: '08-08-2026', last: 'Selection List' },
    links: { apply: 'https://hpsc.gov.in', official: 'https://hpsc.gov.in', notification: 'https://hpsc.gov.in/en-us/Results' }
  },
  {
    id: 'res-aiims-cre-5th',
    title: 'AIIMS CRE 5th Group B, C Result 2026',
    category: 'results',
    postDate: '08-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'AIIMS Common Recruitment Examination (CRE) for Non-Faculty Group B & C posts final stage results.',
    dates: { start: '08-08-2026', last: 'Allotment' },
    links: { apply: 'https://aiimsexams.ac.in', official: 'https://aiimsexams.ac.in', notification: 'https://aiimsexams.ac.in' }
  },
  {
    id: 'res-bihar-dcece-pe',
    title: 'Bihar DCECE-PE 2026 PM / PMM 1st Round Allotment Result',
    category: 'results',
    postDate: '07-08-2026',
    isNew: false,
    state: 'Bihar',
    shortInfo: 'BCECEB Bihar Polytechnic & Para Medical 1st Round Seat Allotment Letter & Document Verification Dates.',
    dates: { start: '07-08-2026', last: 'Admission Open' },
    links: { apply: 'https://bceceboard.bihar.gov.in', official: 'https://bceceboard.bihar.gov.in', notification: 'https://bceceboard.bihar.gov.in' }
  },
  {
    id: 'res-bpsc-dso-ad',
    title: 'BPSC DSO/ AD Mains Result 2026',
    category: 'results',
    postDate: '07-08-2026',
    isNew: false,
    state: 'Bihar',
    shortInfo: 'District Statistical Officer & Assistant Director Mains Written Examination Result declared by BPSC.',
    dates: { start: '07-08-2026', last: 'Interview' },
    links: { apply: 'https://bpsc.bih.nic.in', official: 'https://bpsc.bih.nic.in', notification: 'https://bpsc.bih.nic.in' }
  },
  {
    id: 'job-up-police-constable-result',
    title: 'UP Police Constable 60,244 Post Written Exam Result & Cutoff 2026',
    category: 'results',
    postDate: '15-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPPRPB Constable Written Exam Scorecard, Merit List and Category Cutoffs.',
    dates: { start: 'Scorecard Active', last: 'DV/PST: Sept 2026' },
    links: { apply: 'https://uppbpb.gov.in', official: 'https://uppbpb.gov.in', notification: 'https://uppbpb.gov.in/Results' }
  },
  {
    id: 'job-ssc-gd-constable-final-result',
    title: 'SSC GD Constable in CAPFs, SSF & Rifleman Final Result 2026',
    category: 'results',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Staff Selection Commission Final Merit List and Force Allocation (BSF, CISF, CRPF, SSB, ITBP).',
    dates: { start: '14-08-2026', last: 'Joining: Oct 2026' },
    links: { apply: 'https://ssc.gov.in', official: 'https://ssc.gov.in', notification: 'https://ssc.gov.in/results' }
  },

  // ==========================================
  // 3. ADMIT CARDS (ALL FROM SARKARI RESULT)
  // ==========================================
  {
    id: 'adm-ibps-po-pre-admit',
    title: 'IBPS CRP PO MT XVI Pre Admit Card 2026 – Out',
    category: 'admit-cards',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Institute of Banking Personnel Selection CRP PO/MT XVI Preliminary Examination Call Letter download active.',
    dates: { start: 'Download Started', last: 'Exam Date: 23 & 24 Aug 2026' },
    links: { apply: 'https://ibps.in', official: 'https://ibps.in', notification: 'https://ibps.in' }
  },
  {
    id: 'adm-up-home-guard-pet',
    title: 'UP Home Guard PET Date Notice 2026',
    category: 'admit-cards',
    postDate: '15-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Uttar Pradesh Home Guard Recruitment Physical Efficiency Test (PET) Schedule & Centre Guidelines.',
    dates: { start: '15-08-2026', last: 'PET: Sept 2026' },
    links: { apply: 'https://homeguard.up.gov.in', official: 'https://homeguard.up.gov.in', notification: 'https://homeguard.up.gov.in' }
  },
  {
    id: 'adm-bpsc-72-pre-date',
    title: 'Bihar BPSC 72 Pre New Exam Date 2026',
    category: 'admit-cards',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar Public Service Commission 72nd Combined Competitive (CCE) Preliminary Exam Date Notice & Admit Card Schedule.',
    dates: { start: '14-08-2026', last: 'Exam: 13-09-2026' },
    links: { apply: 'https://bpsc.bih.nic.in', official: 'https://bpsc.bih.nic.in', notification: 'https://bpsc.bih.nic.in' }
  },
  {
    id: 'adm-rrb-group-d-admit',
    title: 'Railway RRB Group D Exam City / Admit Card 2026',
    category: 'admit-cards',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Railway RRC Group D Level 1 CBT Exam City Slip & E-Call Letter.',
    dates: { start: 'City Slip Live', last: 'Exam: Sept 2026' },
    links: { apply: 'https://rrbapply.gov.in', official: 'https://indianrailways.gov.in', notification: 'https://rrbapply.gov.in' }
  },
  {
    id: 'adm-upsc-ias-mains',
    title: 'UPSC Civil Services IAS Mains Admit Card 2026 – Out',
    category: 'admit-cards',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Union Public Service Commission Civil Services (Mains) Examination e-Admit Card released.',
    dates: { start: 'Download Started', last: 'Exam: 20-29 Sept 2026' },
    links: { apply: 'https://upsconline.nic.in', official: 'https://upsc.gov.in', notification: 'https://upsconline.nic.in/eadmitcard/' }
  },
  {
    id: 'adm-upsssc-lower-pcs',
    title: 'UPSSSC Lower PCS Exam City Details 2026 – Out',
    category: 'admit-cards',
    postDate: '13-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPSSSC Lower Subordinate Services Exam District Allotment & Hall Ticket link.',
    dates: { start: '13-08-2026', last: 'Exam: 30-08-2026' },
    links: { apply: 'https://upsssc.gov.in', official: 'https://upsssc.gov.in', notification: 'https://upsssc.gov.in' }
  },
  {
    id: 'adm-bpsc-exam-calendar',
    title: 'BPSC Exam Calendar 2026',
    category: 'admit-cards',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar Public Service Commission Revised Annual Examination Calendar with all upcoming exam dates.',
    dates: { start: 'PDF Available', last: 'Year 2026-27' },
    links: { apply: 'https://bpsc.bih.nic.in', official: 'https://bpsc.bih.nic.in', notification: 'https://bpsc.bih.nic.in' }
  },
  {
    id: 'adm-bhu-teacher-admit',
    title: 'BHU School Teacher TGT, PGT, PRT, Principal Exam Date 2026',
    category: 'admit-cards',
    postDate: '12-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Banaras Hindu University (BHU Varanasi) Central Hindu School (CHS) Teacher Recruitment Exam City.',
    dates: { start: '12-08-2026', last: 'Exam: 02-09-2026' },
    links: { apply: 'https://bhu.ac.in', official: 'https://bhu.ac.in', notification: 'https://bhu.ac.in' }
  },
  {
    id: 'adm-uppsc-computer-asst',
    title: 'UPPSC Computer Assistant Typing Test Admit Card 2026',
    category: 'admit-cards',
    postDate: '12-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPPSC Computer Assistant Hindi & English Typing Skill Test Hall Ticket.',
    dates: { start: '12-08-2026', last: 'Typing: 25-08-2026' },
    links: { apply: 'https://uppsc.up.nic.in', official: 'https://uppsc.up.nic.in', notification: 'https://uppsc.up.nic.in' }
  },
  {
    id: 'adm-nta-aiapget',
    title: 'NTA AIAPGET Exam City Details 2026',
    category: 'admit-cards',
    postDate: '11-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'All India AYUSH Post Graduate Entrance Test Advance Exam City Intimation Slip.',
    dates: { start: '11-08-2026', last: 'Exam: 25-08-2026' },
    links: { apply: 'https://aiapget.nta.nic.in', official: 'https://nta.ac.in', notification: 'https://aiapget.nta.nic.in' }
  },
  {
    id: 'adm-allahabad-hc-research',
    title: 'Allahabad High Court Research Associates Admit Card 2026',
    category: 'admit-cards',
    postDate: '11-08-2026',
    isNew: false,
    state: 'UP',
    shortInfo: 'High Court of Judicature at Allahabad Research Associates Screening Test Call Letter.',
    dates: { start: '11-08-2026', last: 'Exam: 28-08-2026' },
    links: { apply: 'https://allahabadhighcourt.in', official: 'https://allahabadhighcourt.in', notification: 'https://allahabadhighcourt.in' }
  },
  {
    id: 'adm-rssb-computer-instructor',
    title: 'RSSB Computer Instructor Exam City Details 2026',
    category: 'admit-cards',
    postDate: '10-08-2026',
    isNew: false,
    state: 'Rajasthan',
    shortInfo: 'RSMSSB Basic & Senior Computer Instructor Exam Centre City Slip.',
    dates: { start: '10-08-2026', last: 'Exam: 29-08-2026' },
    links: { apply: 'https://rsmssb.rajasthan.gov.in', official: 'https://rsmssb.rajasthan.gov.in', notification: 'https://rsmssb.rajasthan.gov.in' }
  },
  {
    id: 'adm-sbi-law-manager',
    title: 'SBI Assistant Manager Law, Deputy Manager Law Admit Card 2026',
    category: 'admit-cards',
    postDate: '10-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'State Bank of India Specialist Cadre Officers (SCO Law) Online Written Exam Admit Card.',
    dates: { start: 'Download Started', last: 'Exam: 27-08-2026' },
    links: { apply: 'https://sbi.co.in/careers', official: 'https://sbi.co.in', notification: 'https://bank.sbi/careers' }
  },
  {
    id: 'adm-upsc-cds-2-schedule',
    title: 'UPSC CDS-II Exam Schedule 2026',
    category: 'admit-cards',
    postDate: '09-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Combined Defence Services Examination (II) 2026 Time Table & Shift timings.',
    dates: { start: 'Admit Card: 20-08-2026', last: 'Exam: 01-09-2026' },
    links: { apply: 'https://upsc.gov.in', official: 'https://upsc.gov.in', notification: 'https://upsc.gov.in' }
  },
  {
    id: 'adm-upsc-nda-2-schedule',
    title: 'UPSC NDA II Exam Schedule 2026',
    category: 'admit-cards',
    postDate: '09-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'National Defence Academy & Naval Academy Exam (II) Schedule & Centre Guidelines.',
    dates: { start: 'Admit Card: 20-08-2026', last: 'Exam: 01-09-2026' },
    links: { apply: 'https://upsc.gov.in', official: 'https://upsc.gov.in', notification: 'https://upsc.gov.in' }
  },
  {
    id: 'adm-ssc-steno-date',
    title: 'SSC Stenographer Exam Date 2026',
    category: 'admit-cards',
    postDate: '08-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'SSC Stenographer Grade C & D CBT Exam Dates Notice for all regions.',
    dates: { start: 'Notice Released', last: 'Exam: Oct 2026' },
    links: { apply: 'https://ssc.gov.in', official: 'https://ssc.gov.in', notification: 'https://ssc.gov.in' }
  },
  {
    id: 'adm-ssc-jht-date',
    title: 'SSC Combined Hindi Translators JHT Exam Date 2026',
    category: 'admit-cards',
    postDate: '08-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Junior Hindi Translator (JHT) Paper-I CBT Schedule.',
    dates: { start: 'Notice Live', last: 'Exam: Oct 2026' },
    links: { apply: 'https://ssc.gov.in', official: 'https://ssc.gov.in', notification: 'https://ssc.gov.in' }
  },
  {
    id: 'adm-neet-pg-city',
    title: 'NEET PG Exam City Details 2026',
    category: 'admit-cards',
    postDate: '07-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'NBEMS National Eligibility cum Entrance Test PG Test City Allotment Slip.',
    dates: { start: 'Active', last: 'Exam: 24-08-2026' },
    links: { apply: 'https://natboard.edu.in', official: 'https://nbe.edu.in', notification: 'https://natboard.edu.in' }
  },
  {
    id: 'adm-bsnl-jto-admit',
    title: 'BSNL Junior Telecom Officer JTO Exam City Details 2026 – Out',
    category: 'admit-cards',
    postDate: '07-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Bharat Sanchar Nigam Limited (BSNL) JTO Examination Hall Ticket & City slip.',
    dates: { start: '07-08-2026', last: 'Exam: 28-08-2026' },
    links: { apply: 'https://bsnl.co.in', official: 'https://bsnl.co.in', notification: 'https://bsnl.co.in' }
  },
  {
    id: 'adm-uppsc-lt-grade',
    title: 'UPPSC LT Grade Assistant Teacher Mains Admit Card 2026 – Updated',
    category: 'admit-cards',
    postDate: '06-08-2026',
    isNew: false,
    state: 'UP',
    shortInfo: 'UPPSC LT Grade Assistant Teacher (Purush / Mahila Shakha) Mains Admit Card.',
    dates: { start: 'Download Started', last: 'Exam: 31-08-2026' },
    links: { apply: 'https://uppsc.up.nic.in', official: 'https://uppsc.up.nic.in', notification: 'https://uppsc.up.nic.in' }
  },
  {
    id: 'adm-up-police-dv-pst',
    title: 'UP Police Constable DV / PST Admit Card 2026 – Out',
    category: 'admit-cards',
    postDate: '06-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UP Police Constable 60,244 Posts Document Verification & Physical Standard Test Call Letter.',
    dates: { start: 'Download Active', last: 'DV/PST: Sept 2026' },
    links: { apply: 'https://uppbpb.gov.in', official: 'https://uppbpb.gov.in', notification: 'https://uppbpb.gov.in' }
  },
  {
    id: 'adm-csbc-bihar-driver',
    title: 'CSBC Bihar Police Driver DET Admit Card 2026',
    category: 'admit-cards',
    postDate: '05-08-2026',
    isNew: false,
    state: 'Bihar',
    shortInfo: 'Central Selection Board of Constable Driving Efficiency Test (DET) E-Admit Card.',
    dates: { start: 'Download Live', last: 'DET: 26-08-2026' },
    links: { apply: 'https://csbc.bih.nic.in', official: 'https://csbc.bih.nic.in', notification: 'https://csbc.bih.nic.in' }
  },

  // ==========================================
  // 4. ANSWER KEYS (ALL FROM SARKARI RESULT)
  // ==========================================
  {
    id: 'key-nta-ugc-net-june',
    title: 'NTA UGC NET June Answer Key 2026',
    category: 'answer-key',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'National Testing Agency (NTA) UGC NET June Provisional Answer Key and Recorded Responses with Challenge portal.',
    dates: { start: '15-08-2026', last: 'Objection Last: 18-08-2026' },
    links: { apply: 'https://ugcnet.nta.ac.in', official: 'https://nta.ac.in', notification: 'https://ugcnet.nta.ac.in' }
  },
  {
    id: 'key-bpsc-apo-answer',
    title: 'Bihar BPSC APO Answer Key 2026',
    category: 'answer-key',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar Assistant Prosecution Officer (APO) Mains Exam official model answer keys.',
    dates: { start: '15-08-2026', last: 'Objection: 20-08-2026' },
    links: { apply: 'https://bpsc.bih.nic.in', official: 'https://bpsc.bih.nic.in', notification: 'https://bpsc.bih.nic.in' }
  },
  {
    id: 'key-upsssc-agri-ta',
    title: 'UPSSSC Agriculture Technical Assistant Group-C Answer Key 2026 – Out',
    category: 'answer-key',
    postDate: '14-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UPSSSC Krishi Pravidhik Sahayak (AGTA) Written Examination Master Question Paper & Answer Key.',
    dates: { start: '14-08-2026', last: 'Challenge Window Active' },
    links: { apply: 'https://upsssc.gov.in', official: 'https://upsssc.gov.in', notification: 'https://upsssc.gov.in' }
  },
  {
    id: 'key-dsssb-july-key',
    title: 'Delhi DSSSB July Answer Key 2026',
    category: 'answer-key',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Delhi',
    shortInfo: 'Delhi Subordinate Services Selection Board CBT Exam Draft Answer Key for Various Teaching & Non-Teaching Posts.',
    dates: { start: '14-08-2026', last: 'Objection: 19-08-2026' },
    links: { apply: 'https://dsssbonline.nic.in', official: 'https://dsssb.delhi.gov.in', notification: 'https://dsssb.delhi.gov.in' }
  },
  {
    id: 'key-afcat-02-2026',
    title: 'AFCAT 02/2026 Answer Key – Out',
    category: 'answer-key',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Indian Air Force Air Force Common Admission Test (AFCAT 02/2026) Shift-wise Memory-based & Official Key.',
    dates: { start: '13-08-2026', last: 'Available Now' },
    links: { apply: 'https://afcat.cdac.in', official: 'https://careerindianairforce.cdac.in', notification: 'https://afcat.cdac.in' }
  },
  {
    id: 'key-nta-icar-aieea',
    title: 'NTA ICAR AIEEA PG Ph.D Answer Key 2026',
    category: 'answer-key',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Indian Council of Agricultural Research All India Entrance Examination PG & Ph.D Answer Sheet.',
    dates: { start: '13-08-2026', last: 'Objection: 17-08-2026' },
    links: { apply: 'https://icar.nta.nic.in', official: 'https://nta.ac.in', notification: 'https://icar.nta.nic.in' }
  },
  {
    id: 'key-nta-csir-ugc-net',
    title: 'NTA CSIR UGC NET June Answer Key 2026',
    category: 'answer-key',
    postDate: '12-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Joint CSIR-UGC NET for Chemical, Earth, Life, Mathematical & Physical Sciences provisional key.',
    dates: { start: '12-08-2026', last: 'Objection: 16-08-2026' },
    links: { apply: 'https://csirnet.nta.ac.in', official: 'https://nta.ac.in', notification: 'https://csirnet.nta.ac.in' }
  },
  {
    id: 'key-jssc-field-worker',
    title: 'JSSC Field Worker Answer Key 2026 – Out',
    category: 'answer-key',
    postDate: '12-08-2026',
    isNew: true,
    state: 'Jharkhand',
    shortInfo: 'Jharkhand Staff Selection Commission (JSSC JFWCE) Field Worker Competitive Exam Model Answers.',
    dates: { start: '12-08-2026', last: 'Objection Window' },
    links: { apply: 'https://jssc.nic.in', official: 'https://jssc.nic.in', notification: 'https://jssc.nic.in' }
  },
  {
    id: 'key-bpsc-auditor-omr',
    title: 'Bihar BPSC Auditor Pre Exam OMR Sheet 2026',
    category: 'answer-key',
    postDate: '11-08-2026',
    isNew: false,
    state: 'Bihar',
    shortInfo: 'BPSC Auditor Preliminary Exam Candidate OMR Sheet and Question Booklet Key released.',
    dates: { start: 'Download OMR', last: 'Active till 25-08-2026' },
    links: { apply: 'https://onlinebpsc.bihar.gov.in', official: 'https://bpsc.bih.nic.in', notification: 'https://bpsc.bih.nic.in' }
  },
  {
    id: 'key-rrb-alp-cbt2',
    title: 'RRB ALP CBT-II Answer Key 2026',
    category: 'answer-key',
    postDate: '10-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Railway Recruitment Boards Assistant Loco Pilot CBT Stage-2 Trade-wise Answer Sheet.',
    dates: { start: '10-08-2026', last: 'Objection Closed' },
    links: { apply: 'https://rrbapply.gov.in', official: 'https://indianrailways.gov.in', notification: 'https://rrbapply.gov.in' }
  },
  {
    id: 'key-upsc-cms',
    title: 'UPSC CMS Answer Key 2026',
    category: 'answer-key',
    postDate: '09-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Combined Medical Services (CMS) Examination Paper 1 (Code A, B, C, D) & Paper 2 Answer Keys.',
    dates: { start: 'PDF Released', last: 'Available' },
    links: { apply: 'https://upsc.gov.in', official: 'https://upsc.gov.in', notification: 'https://upsc.gov.in/examinations/answer-keys' }
  },
  {
    id: 'key-rpsc-2nd-grade',
    title: 'RPSC 2nd Grade Teacher Answer Key 2026 – Updated',
    category: 'answer-key',
    postDate: '09-08-2026',
    isNew: false,
    state: 'Rajasthan',
    shortInfo: 'Rajasthan Public Service Commission Senior Teacher Group A & B Revised Final Key.',
    dates: { start: 'Updated Key Live', last: 'N/A' },
    links: { apply: 'https://rpsc.rajasthan.gov.in', official: 'https://rpsc.rajasthan.gov.in', notification: 'https://rpsc.rajasthan.gov.in' }
  },
  {
    id: 'key-haryana-htet',
    title: 'Haryana HTET Result / Answer Key 2026 – Out',
    category: 'answer-key',
    postDate: '08-08-2026',
    isNew: false,
    state: 'Haryana',
    shortInfo: 'Board of School Education Haryana (BSEH Bhiwani) HTET Level 1, 2, 3 Final Answer Key.',
    dates: { start: 'PDF Live', last: 'N/A' },
    links: { apply: 'https://bseh.org.in', official: 'https://bseh.org.in', notification: 'https://bseh.org.in' }
  },
  {
    id: 'key-punjab-pspcl-je',
    title: 'Punjab PSPCL JE Electrical Answer Key 2026 – Out',
    category: 'answer-key',
    postDate: '07-08-2026',
    isNew: false,
    state: 'Punjab',
    shortInfo: 'Punjab State Power Corporation Limited Junior Engineer (Electrical) CBT Answer Key.',
    dates: { start: 'Active', last: 'Objection Closed' },
    links: { apply: 'https://pspcl.in', official: 'https://pspcl.in', notification: 'https://pspcl.in' }
  },
  {
    id: 'key-rrb-ministerial',
    title: 'RRB Ministerial & Isolated Category Answer Key 2026',
    category: 'answer-key',
    postDate: '06-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Railway Ministerial & Isolated Categories (CEN 03/2019) Response sheet & Key.',
    dates: { start: 'Available', last: 'N/A' },
    links: { apply: 'https://rrbapply.gov.in', official: 'https://indianrailways.gov.in', notification: 'https://rrbapply.gov.in' }
  },

  // ==========================================
  // 5. ADMISSION (ALL FROM SARKARI RESULT)
  // ==========================================
  {
    id: 'adm-iit-gate-2027',
    title: 'IIT GATE 2027 Online Form',
    category: 'admission',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Graduate Aptitude Test in Engineering (GATE 2027) organized for M.Tech Admissions and PSU Recruitment.',
    ageLimit: 'No Age Limit',
    eligibility: 'Bachelor Degree in Engineering / Technology / Architecture / Science / Commerce / Arts.',
    fees: { general: '₹1800 (Female/SC/ST ₹900)', scSt: '₹900' },
    dates: { start: '25-08-2026', last: '26-09-2026' },
    links: { apply: 'https://gate.iitk.ac.in', official: 'https://gate.iitk.ac.in', notification: 'https://gate.iitk.ac.in' }
  },
  {
    id: 'adm-up-deled-counselling',
    title: 'UP DELEd 2026 Online Counselling',
    category: 'admission',
    postDate: '15-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Uttar Pradesh Examination Regulatory Authority (PNP Prayagraj) 2-Year D.El.Ed (BTC) State Rank & College Choice Locking.',
    ageLimit: '18 to 35 Years',
    eligibility: 'Graduation Degree with minimum 50% marks (45% for SC/ST/OBC).',
    fees: { general: '₹700', scSt: '₹500' },
    dates: { start: '10-08-2026', last: '25-08-2026' },
    links: { apply: 'https://updeled.gov.in', official: 'https://updeled.gov.in', notification: 'https://updeled.gov.in' }
  },
  {
    id: 'adm-bseb-deled-form',
    title: 'Bihar BSEB DElEd 2026 Common Application Form',
    category: 'admission',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Bihar School Examination Board 2-Year Diploma in Elementary Education Joint Entrance Test.',
    ageLimit: 'Minimum 17 Years',
    eligibility: '10+2 Intermediate with at least 50% marks.',
    fees: { general: '₹960', scSt: '₹760' },
    dates: { start: '01-08-2026', last: '28-08-2026' },
    links: { apply: 'https://deledbihar.com', official: 'https://secondary.biharboardonline.com', notification: 'https://deledbihar.com' }
  },
  {
    id: 'adm-neet-ug-counselling',
    title: 'NEET UG 2026 Online Counselling',
    category: 'admission',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Medical Counselling Committee (MCC) 15% All India Quota MBBS, BDS, B.Sc Nursing Round 1 Choice Filling.',
    ageLimit: 'NEET UG 2026 Qualified',
    eligibility: '10+2 with Physics, Chemistry, Biology & Valid NEET Score.',
    fees: { general: '₹1000 + Security ₹10,000', scSt: '₹500 + Security ₹5,000' },
    dates: { start: '14-08-2026', last: '21-08-2026' },
    links: { apply: 'https://mcc.nic.in', official: 'https://mcc.nic.in', notification: 'https://mcc.nic.in/ug-medical-counselling/' }
  },
  {
    id: 'adm-sav-bihar-class6',
    title: 'SAV Bihar Class 6 Online Form 2027-28',
    category: 'admission',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Bihar',
    shortInfo: 'Simultala Awasiya Vidyalaya (SAV Jamui) Class VI Entrance Test Registration by BSEB.',
    ageLimit: '10 to 12 Years as on 01-04-2027',
    eligibility: 'Studying in Class 5th in recognized school in Bihar.',
    fees: { general: '₹200', scSt: '₹100' },
    dates: { start: '10-08-2026', last: '05-09-2026' },
    links: { apply: 'https://secondary.biharboardonline.com', official: 'https://biharboardonline.com', notification: 'https://secondary.biharboardonline.com' }
  },
  {
    id: 'adm-clat-2026',
    title: 'CLAT Online Form 2026 – Start',
    category: 'admission',
    postDate: '12-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Consortium of National Law Universities Common Law Admission Test for UG (BA LLB) and PG (LLM) Courses.',
    ageLimit: 'No Upper Age Limit',
    eligibility: '10+2 with 45% (UG) / LLB Degree with 50% (PG).',
    fees: { general: '₹4000', scSt: '₹3500' },
    dates: { start: '15-07-2026', last: '15-10-2026' },
    links: { apply: 'https://consortiumofnlus.ac.in', official: 'https://consortiumofnlus.ac.in', notification: 'https://consortiumofnlus.ac.in/clat-2026/' }
  },
  {
    id: 'adm-iim-cat-2026',
    title: 'IIM CAT 2026 Online Form – Start',
    category: 'admission',
    postDate: '12-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Common Admission Test (CAT 2026) for MBA admissions in top IIMs and premier management institutes.',
    ageLimit: 'No Age Limit',
    eligibility: 'Bachelor Degree with minimum 50% marks (45% for SC/ST/PwD).',
    fees: { general: '₹2400', scSt: '₹1200' },
    dates: { start: '01-08-2026', last: '13-09-2026' },
    links: { apply: 'https://iimcat.ac.in', official: 'https://iimcat.ac.in', notification: 'https://iimcat.ac.in' }
  },
  {
    id: 'adm-up-scholarship-2026',
    title: 'UP Scholarship Online Form 2026-27',
    category: 'admission',
    postDate: '11-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'UP Scholarship & Fee Reimbursement Online System for Pre-Matric (9th-10th) and Post-Matric (11th-12th, Dashmottar).',
    ageLimit: 'Enrolled in recognized school/college in UP',
    eligibility: 'Domicile of UP with valid caste/income certificate.',
    fees: { general: '₹0 (Free)', scSt: '₹0 (Free)' },
    dates: { start: '01-07-2026', last: '30-11-2026' },
    links: { apply: 'https://scholarship.up.gov.in', official: 'https://scholarship.up.gov.in', notification: 'https://scholarship.up.gov.in' }
  },
  {
    id: 'adm-cg-set-2026',
    title: 'Chhattisgarh State Eligibility Test SET Online Form 2026',
    category: 'admission',
    postDate: '10-08-2026',
    isNew: true,
    state: 'Chhattisgarh',
    shortInfo: 'CG Vyapam Chhattisgarh State Eligibility Test for Assistant Professor recruitment.',
    ageLimit: 'No Upper Age Limit',
    eligibility: 'Post Graduate with 55% marks (50% for CG reserved categories).',
    fees: { general: '₹0 (Free for CG residents)', scSt: '₹0' },
    dates: { start: '01-08-2026', last: '25-08-2026' },
    links: { apply: 'https://vyapam.cgstate.gov.in', official: 'https://vyapam.cgstate.gov.in', notification: 'https://vyapam.cgstate.gov.in' }
  },
  {
    id: 'adm-au-pgat-counselling',
    title: 'Allahabad University PGAT 2026 Online Counselling',
    category: 'admission',
    postDate: '09-08-2026',
    isNew: false,
    state: 'UP',
    shortInfo: 'University of Allahabad Post Graduate Admission Test (PGAT I & II) Cutoff Marks & Document Upload.',
    ageLimit: 'PGAT 2026 Qualified',
    eligibility: 'Graduation in relevant stream.',
    fees: { general: '₹300 Counselling Fee', scSt: '₹150' },
    dates: { start: '05-08-2026', last: '28-08-2026' },
    links: { apply: 'https://allduniv.ac.in', official: 'https://allduniv.ac.in', notification: 'https://aupravesh2024.cbtexam.in' }
  },
  {
    id: 'adm-up-dgmhup-anm',
    title: 'UP DGMHUP ANM Training Online Registration 2026',
    category: 'admission',
    postDate: '08-08-2026',
    isNew: false,
    state: 'UP',
    shortInfo: 'Directorate of Medical & Health Services UP 2-Year ANM Training Admission for Female Candidates.',
    ageLimit: '17 to 35 Years',
    eligibility: '10+2 Intermediate with 45% Marks (Female Only).',
    fees: { general: '₹200', scSt: '₹100' },
    dates: { start: '01-08-2026', last: '31-08-2026' },
    links: { apply: 'https://dgmhup.gov.in', official: 'https://dgmhup.gov.in', notification: 'https://dgmhup.gov.in' }
  },
  {
    id: 'adm-bseb-deled-spot',
    title: 'Bihar BSEB DELED Spot Admission 2025-27',
    category: 'admission',
    postDate: '07-08-2026',
    isNew: false,
    state: 'Bihar',
    shortInfo: 'Bihar DElEd Vacant Seats Spot Admission Round for Government & Private DIET Colleges.',
    ageLimit: 'DElEd Qualified',
    eligibility: 'Appeared in Bihar DElEd 2025/2026 Exam.',
    fees: { general: 'College Specific', scSt: 'College Specific' },
    dates: { start: 'Active', last: '25-08-2026' },
    links: { apply: 'https://deledbihar.com', official: 'https://secondary.biharboardonline.com', notification: 'https://deledbihar.com' }
  },
  {
    id: 'adm-bcece-mop-up',
    title: 'BCECE Mop-Up Revised Counselling Schedule 2025',
    category: 'admission',
    postDate: '06-08-2026',
    isNew: false,
    state: 'Bihar',
    shortInfo: 'Bihar Combined Entrance Competitive Examination Board Agriculture, Pharmacy & Nursing Mop-Up offline counselling.',
    dates: { start: 'Choice Willingness', last: '24-08-2026' },
    links: { apply: 'https://bceceboard.bihar.gov.in', official: 'https://bceceboard.bihar.gov.in', notification: 'https://bceceboard.bihar.gov.in' }
  },
  {
    id: 'adm-bihar-iti-cat-mopup',
    title: 'Bihar ITI CAT Offline Mop-Up Counselling 2025',
    category: 'admission',
    postDate: '05-08-2026',
    isNew: false,
    state: 'Bihar',
    shortInfo: 'Industrial Training Institute Competitive Admission Test (ITICAT) IAS Bhawan Patna offline interview schedule.',
    dates: { start: 'Willingness Online', last: '22-08-2026' },
    links: { apply: 'https://bceceboard.bihar.gov.in', official: 'https://bceceboard.bihar.gov.in', notification: 'https://bceceboard.bihar.gov.in' }
  },

  // ==========================================
  // 6. DOCUMENTS & CERTIFICATE SERVICES (FROM SARKARI RESULT)
  // ==========================================
  {
    id: 'doc-delhi-laxmi-yojana',
    title: 'Delhi Laxmi Yojana Form 2026',
    category: 'documents',
    postDate: '15-08-2026',
    isNew: true,
    state: 'Delhi',
    shortInfo: 'Delhi Government Ladli / Mahila Samriddhi Laxmi Yojana online registration & eligibility check.',
    eligibility: 'Resident of NCT Delhi with annual family income criteria.',
    fees: { general: '₹0 (Free)', scSt: '₹0' },
    dates: { start: 'Open', last: 'Ongoing' },
    links: { apply: 'https://edistrict.delhigovt.nic.in', official: 'https://delhi.gov.in', notification: 'https://edistrict.delhigovt.nic.in' }
  },
  {
    id: 'doc-uppsc-exam-calendar',
    title: 'UPPSC Exam Calendar 2026',
    category: 'documents',
    postDate: '14-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Uttar Pradesh Public Service Commission (UPPSC Prayagraj) Official Annual Exam Calendar with PCS, RO/ARO, Medical Officer dates.',
    dates: { start: 'PDF Available', last: 'Year 2026-27' },
    links: { apply: 'https://uppsc.up.nic.in', official: 'https://uppsc.up.nic.in', notification: 'https://uppsc.up.nic.in' }
  },
  {
    id: 'doc-ssc-exam-calendar',
    title: 'SSC Exam Calendar 2026-27',
    category: 'documents',
    postDate: '14-08-2026',
    isNew: true,
    state: 'Central',
    shortInfo: 'Staff Selection Commission Revised Examination Calendar for CGL, CHSL, MTS, GD, CPO, Stenographer and Selection Posts.',
    dates: { start: 'PDF Live', last: '2026-2027 Schedule' },
    links: { apply: 'https://ssc.gov.in', official: 'https://ssc.gov.in', notification: 'https://ssc.gov.in/notices' }
  },
  {
    id: 'doc-rpsc-exam-calendar',
    title: 'RPSC Exam Calendar 2026',
    category: 'documents',
    postDate: '13-08-2026',
    isNew: true,
    state: 'Rajasthan',
    shortInfo: 'Rajasthan Public Service Commission (RPSC Ajmer) Yearly Exam Calendar for RAS, Lecturer, Teacher, Junior Legal Officer.',
    dates: { start: 'Available', last: '2026 Schedule' },
    links: { apply: 'https://rpsc.rajasthan.gov.in', official: 'https://rpsc.rajasthan.gov.in', notification: 'https://rpsc.rajasthan.gov.in' }
  },
  {
    id: 'doc-up-scholarship-status-25',
    title: 'UP Scholarship Online Form 2025-26 Status & Correction',
    category: 'documents',
    postDate: '12-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Check PFMS Payment Status, Application Correction and Bank Aadhaar Seeding for UP Scholarship.',
    dates: { start: 'Status Live', last: 'Correction Open' },
    links: { apply: 'https://scholarship.up.gov.in', official: 'https://pfms.nic.in', notification: 'https://scholarship.up.gov.in' }
  },
  {
    id: 'doc-up-police-otr',
    title: 'UP Police OTR Registration 2026',
    category: 'documents',
    postDate: '11-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Uttar Pradesh Police Recruitment Board One Time Registration (OTR) portal for all future Constable, SI & Jail Warder exams.',
    eligibility: 'All UP Police aspirants.',
    fees: { general: '₹0 (Free)', scSt: '₹0' },
    dates: { start: 'Active 24x7', last: 'Mandatory' },
    links: { apply: 'https://uppbpb.gov.in', official: 'https://uppbpb.gov.in', notification: 'https://uppbpb.gov.in' }
  },
  {
    id: 'doc-up-police-si-syllabus',
    title: 'UP Police SI, ASI Syllabus / Exam Pattern 2026 – Out',
    category: 'documents',
    postDate: '10-08-2026',
    isNew: true,
    state: 'UP',
    shortInfo: 'Detailed Section-wise Syllabus (Hindi, GK/Law, Maths, Reasoning) and Physical Test standards for UP Police SI.',
    dates: { start: 'Download PDF', last: 'Free' },
    links: { apply: 'https://uppbpb.gov.in', official: 'https://uppbpb.gov.in', notification: 'https://uppbpb.gov.in' }
  },
  {
    id: 'doc-up-police-calendar',
    title: 'UP Police Recruitment Calendar 2026',
    category: 'documents',
    postDate: '09-08-2026',
    isNew: false,
    state: 'UP',
    shortInfo: 'UPPRPB Upcoming Vacancies Timeline for Constable, SI, Computer Operator, Radio Operator.',
    dates: { start: 'PDF Live', last: '2026-27' },
    links: { apply: 'https://uppbpb.gov.in', official: 'https://uppbpb.gov.in', notification: 'https://uppbpb.gov.in' }
  },
  {
    id: 'doc-pan-card-service',
    title: 'PAN Card Registration, Correction & Other Service 2026',
    category: 'documents',
    postDate: '08-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Apply for New PAN Card (Form 49A), Name/DOB Correction, Instant e-PAN with Aadhaar, and PAN-Aadhaar Link Status (NSDL / UTIITSL).',
    fees: { general: '₹107 (Physical) / ₹66 (e-PAN)', scSt: '₹107' },
    dates: { start: 'Instant Service', last: 'Always Active' },
    links: { apply: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', official: 'https://incometax.gov.in', notification: 'https://pan.utiitsl.com' }
  },
  {
    id: 'doc-aadhar-service',
    title: 'Aadhar Card Download, Correction, Status 2026 (UIDAI)',
    category: 'documents',
    postDate: '08-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'UIDAI myAadhaar Portal - Download E-Aadhaar PDF, Update Address Online, Check Enrolment Status, Order PVC Card, Lock/Unlock Biometrics.',
    fees: { general: 'Free Download / ₹50 PVC Card', scSt: 'Free' },
    dates: { start: '24x7 Portal', last: 'Ongoing' },
    links: { apply: 'https://myaadhaar.uidai.gov.in', official: 'https://uidai.gov.in', notification: 'https://myaadhaar.uidai.gov.in' }
  },
  {
    id: 'doc-up-certificate-verify',
    title: 'UP Income, Cast, Residential Certificate Online Verification 2026',
    category: 'documents',
    postDate: '07-08-2026',
    isNew: false,
    state: 'UP',
    shortInfo: 'Uttar Pradesh eDistrict Portal - Verify Jati Praman Patra (Caste), Aay Praman Patra (Income) and Niwas Praman Patra (Domicile) online with certificate number.',
    fees: { general: 'Free Verification', scSt: 'Free' },
    dates: { start: 'Instant Check', last: '24x7' },
    links: { apply: 'https://edistrict.up.gov.in/edistrictup/', official: 'https://edistrict.up.gov.in', notification: 'https://edistrict.up.gov.in' }
  },
  {
    id: 'doc-bihar-certificate-service',
    title: 'Bihar Income, Cast, Residential Certificate Online Apply & Verification 2026',
    category: 'documents',
    postDate: '07-08-2026',
    isNew: false,
    state: 'Bihar',
    shortInfo: 'Bihar RTPS Service Plus - Online Application & Instant Download of Jati, Aay, Awasiya & Non-Creamy Layer (NCL) Certificates.',
    fees: { general: '₹0 (Free Govt Service)', scSt: '₹0' },
    dates: { start: 'Instant Service', last: 'Always Active' },
    links: { apply: 'https://serviceonline.bihar.gov.in', official: 'https://serviceonline.bihar.gov.in', notification: 'https://serviceonline.bihar.gov.in' }
  },
  {
    id: 'doc-voter-id-service',
    title: 'Voter ID Registration & Other Voter Service 2026 (ECI)',
    category: 'documents',
    postDate: '06-08-2026',
    isNew: false,
    state: 'Central',
    shortInfo: 'Election Commission of India (ECI) Voters Service Portal - Apply New Voter Card (Form 6), Shift Residence/Correction (Form 8), Download e-EPIC PDF.',
    fees: { general: '₹0 (Free)', scSt: '₹0' },
    dates: { start: 'Online Portal', last: 'Ongoing' },
    links: { apply: 'https://voters.eci.gov.in', official: 'https://eci.gov.in', notification: 'https://voters.eci.gov.in' }
  }
];

// Combine full catalog (750+ live government jobs), base jobs, and historical archives category-wise
const combinedMap = new Map<string, JobAlert>();

// Add full comprehensive catalog (900+ official jobs)
fullCatalogJobs.forEach(job => {
  if (job && job.id) {
    combinedMap.set(job.id, job);
  }
});

// Add historical 2016-2026 dataset
historicalJobsDatabase.forEach(job => {
  if (job && job.id && !combinedMap.has(job.id)) {
    combinedMap.set(job.id, job);
  }
});

// Add and merge base jobs
baseJobsDatabase.forEach(job => {
  if (job && job.id && !combinedMap.has(job.id)) {
    combinedMap.set(job.id, job);
  }
});

// Add live database and custom ingested jobs
liveDatabaseJobs.forEach(job => {
  if (job && job.id) {
    combinedMap.set(job.id, { ...(combinedMap.get(job.id) || {}), ...job });
  }
});

export const defaultJobsDatabase: JobAlert[] = Array.from(combinedMap.values());

export const defaultSocialLinks: SocialLinkItem[] = [
  {
    id: 'social-telegram',
    platform: 'telegram',
    title: 'Telegram Channel',
    url: 'https://t.me/govtbharatofficial',
    handle: '@govtbharatofficial',
    badgeText: 'Join 150K+ Aspirants',
    enabled: true,
    color: '#0088cc',
    order: 1,
  },
  {
    id: 'social-whatsapp',
    platform: 'whatsapp',
    title: 'WhatsApp Channel',
    url: 'https://whatsapp.com/channel/govtbharatofficial',
    handle: 'GovtBharat Alerts',
    badgeText: 'Instant Job Alerts',
    enabled: true,
    color: '#25D366',
    order: 2,
  },
  {
    id: 'social-youtube',
    platform: 'youtube',
    title: 'YouTube Official',
    url: 'https://youtube.com/@govtbharat',
    handle: '@govtbharat',
    badgeText: 'Video Updates & Analysis',
    enabled: true,
    color: '#FF0000',
    order: 3,
  },
  {
    id: 'social-instagram',
    platform: 'instagram',
    title: 'Instagram Page',
    url: 'https://instagram.com/govtbharat',
    handle: '@govtbharat',
    badgeText: 'Daily GK & Info',
    enabled: true,
    color: '#E1306C',
    order: 4,
  },
  {
    id: 'social-twitter',
    platform: 'twitter',
    title: 'Twitter / X',
    url: 'https://x.com/govtbharat',
    handle: '@govtbharat',
    badgeText: 'Official Notices',
    enabled: true,
    color: '#000000',
    order: 5,
  },
  {
    id: 'social-facebook',
    platform: 'facebook',
    title: 'Facebook Page',
    url: 'https://facebook.com/govtbharat',
    handle: 'GovtBharat Portal',
    badgeText: 'Community Page',
    enabled: true,
    color: '#1877F2',
    order: 6,
  }
];

