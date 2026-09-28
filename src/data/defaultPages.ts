import { getDomainName, getDomainNameLowercase } from '../utils/domain';
import { DynamicPageItem } from '../types';

export const defaultDynamicPages: Record<string, DynamicPageItem> = {
  about: {
    id: 'about',
    title: 'About Us',
    subtitle: 'About GovtBharat Portal',
    metaDescription: 'Learn about GovtBharat official career and job notification portal.',
    lastUpdated: '2026-08-27',
    isPublished: true,
    content: `<div class="space-y-4">
  <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
    <h3 class="text-base sm:text-lg font-black text-amber-400">About GovtBharat Portal</h3>
    <p class="text-xs sm:text-sm mt-1 text-slate-200">GovtBharat is India's next-generation, high-speed career and government vacancy notification engine. Built with modern, lightning-fast web technologies, we empower millions of aspiring youth across 28 States and 8 Union Territories with instant, authenticated updates.</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
    <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
      <strong class="text-emerald-400 font-bold block text-xs">⚡ Ultra Fast Sync</strong>
      <p class="text-[11px] text-slate-400">Instant alerts for Results, Admit Cards, Answer Keys, and Application Forms within minutes of release.</p>
    </div>
    <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
      <strong class="text-blue-400 font-bold block text-xs">🎯 Verified Direct Links</strong>
      <p class="text-[11px] text-slate-400">Direct 1-click links to Official PDFs, Online Application Forms, and Syllabus guidelines without clickbait loops.</p>
    </div>
    <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
      <strong class="text-amber-400 font-bold block text-xs">📱 Multi-Channel Reach</strong>
      <p class="text-[11px] text-slate-400">Broadcasting instantly across Telegram, WhatsApp, YouTube, and mobile browser notifications.</p>
    </div>
  </div>

  <h4 class="text-sm font-black text-white mt-4">Our Editorial & Verification Process</h4>
  <p class="text-xs text-slate-300 leading-relaxed">Our research and editorial team actively tracks official portals of UPSC, SSC, IBPS, Defence (Army, Navy, Airforce), State Police, Teaching (CTET/UPTET/STET), and Railway boards daily. Every listing is manually reviewed for age qualification, category reservation, fees, and application timelines before publishing.</p>
</div>`
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Google AdSense & Digital Media Legal Guidelines Compliant',
    metaDescription: 'Official Privacy Policy adhering to Google AdSense, GDPR, and cookie consent.',
    lastUpdated: '2026-08-27',
    isPublished: true,
    content: `<div class="space-y-4">
  <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
    <div>
      <strong class="block font-bold text-white mb-0.5">Google AdSense Privacy Policy Compliance Notice</strong>
      This privacy statement outlines how GovtBharat collects, manages, and safeguards user data, cookies, and adheres strictly to Google AdSense Advertising Policies.
    </div>
  </div>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">1. Information We Collect</h3>
    <p class="text-xs sm:text-sm text-slate-300">At <strong>GovtBharat</strong>, one of our main priorities is the privacy of our visitors. We do not require visitors to register or share sensitive personal financial credentials simply to browse latest sarkari jobs, results, or admit card updates.</p>
    <ul class="list-disc pl-5 space-y-1 text-slate-400 text-xs">
      <li><strong>Log Files:</strong> Like standard web platforms, GovtBharat uses log files. These files log visitors when they visit websites. Information collected includes IP addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and click statistics.</li>
      <li><strong>Subscription Data:</strong> If you voluntarily subscribe to our free Email/SMS/Telegram job alert notifications, your email or contact handle is stored securely strictly for job broadcasts.</li>
    </ul>
  </section>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">2. Cookies and Web Beacons (Google AdSense & DoubleClick DART)</h3>
    <p class="text-xs sm:text-sm text-slate-300">GovtBharat uses standard browser cookies to store information including visitor preferences and optimized layout settings.</p>
    <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
      <strong class="text-amber-400 block font-bold">Google DoubleClick DART Cookie:</strong>
      <p class="text-slate-300">Google is one of our third-party advertising vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our portal and other sites on the internet.</p>
      <p class="text-slate-400">Users may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy.</p>
    </div>
  </section>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">3. Advertising Partners Policies</h3>
    <p class="text-xs sm:text-sm text-slate-300">Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements. GovtBharat has no access to or control over these cookies that are used by third-party advertisers.</p>
  </section>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">4. Children's Information & Consent</h3>
    <p class="text-xs sm:text-sm text-slate-300">We do not knowingly collect any Personal Identifiable Information from children under the age of 13. By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
  </section>
</div>`
  },
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'Portal Usage Terms & Intellectual Property Rights',
    metaDescription: 'Terms of service and user agreements for GovtBharat portal visitors.',
    lastUpdated: '2026-08-27',
    isPublished: true,
    content: `<div class="space-y-4">
  <section class="space-y-2">
    <h3 class="text-base font-black text-white">1. Terms of Portal Usage</h3>
    <p class="text-xs sm:text-sm text-slate-300">Welcome to <strong>GovtBharat</strong>. By accessing this website, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern GovtBharat's relationship with you in relation to this portal.</p>
  </section>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">2. Intellectual Property Rights</h3>
    <p class="text-xs sm:text-sm text-slate-300">The original editorial content, logo layout, database structure, and visual user interface designs created on GovtBharat are the intellectual property of GovtBharat. Government circulars, official exam syllabi, and departmental press releases belong to their respective authorities and are used under fair-use informative guidelines.</p>
  </section>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">3. User Conduct & Security</h3>
    <p class="text-xs sm:text-sm text-slate-300">You agree not to:</p>
    <ul class="list-disc pl-5 space-y-1 text-slate-400 text-xs">
      <li>Use automated bots or scrapers to overwhelm server infrastructure or harvest data maliciously.</li>
      <li>Attempt to bypass authentication protocols or modify administrative portal records without authorization.</li>
      <li>Post spam, defamatory comments, or misleading job claims in inquiry channels.</li>
    </ul>
  </section>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">4. Modifications of Service</h3>
    <p class="text-xs sm:text-sm text-slate-300">GovtBharat reserves the right to revise, update, or discontinue any feature, job column, or alert feed at any time without prior notice.</p>
  </section>
</div>`
  },
  disclaimer: {
    id: 'disclaimer',
    title: 'Disclaimer',
    subtitle: 'Non-Government Affiliation & Recruitment Advisory',
    metaDescription: 'Legal disclaimer regarding non-government affiliation and recruitment guidance.',
    lastUpdated: '2026-08-27',
    isPublished: true,
    content: `<div class="space-y-4">
  <div class="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-2">
    <div class="flex items-center gap-2 font-black text-white text-sm">
      <span>Important Legal Non-Government Affiliation Disclaimer</span>
    </div>
    <p class="text-xs text-rose-200 leading-relaxed">
      <strong>GovtBharat (${getDomainNameLowercase()}) is a private, independent educational and recruitment news indexing platform.</strong> We are <u>NOT</u> associated, affiliated, endorsed by, or in any way officially connected with the Government of India, UPSC, SSC, State Public Service Commissions (UPPSC, BPSC, MPPSC), NTA, Railway Recruitment Boards (RRB), or any other Central or State Government Agency.
    </p>
  </div>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">1. Authenticity & Verification Advice</h3>
    <p class="text-xs sm:text-sm text-slate-300">All examination dates, admit card links, results, answer keys, syllabi, and job notifications published on this portal are aggregated from publicly available official gazette notifications, employment news (Rozgar Samachar), and official commission portals purely for candidate convenience.</p>
    <div class="p-3 rounded-lg bg-slate-800 text-xs border border-slate-700 text-slate-300">
      <span class="text-amber-400 font-bold">Candidate Advisory: </span>
      While utmost care is taken to verify each post, candidates are strictly advised to cross-check and verify all eligibility criteria, fees, reservation norms, and official dates directly from the official notification on the respective department's official website before applying.
    </div>
  </section>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">2. No Guarantee of Recruitment / Zero Liability</h3>
    <p class="text-xs sm:text-sm text-slate-300">GovtBharat does not conduct any recruitment examinations, nor do we issue admit cards or job appointment letters. We never ask candidates for fees or payments for securing government jobs. Beware of touts or fraudulent individuals.</p>
  </section>

  <section class="space-y-2">
    <h3 class="text-base font-black text-white">3. Third Party Links & External Websites</h3>
    <p class="text-xs sm:text-sm text-slate-300">Our portal contains hyperlinks to official external government websites (like ssc.gov.in, upsc.gov.in, nta.ac.in). GovtBharat has no control over the content, uptime, or privacy practices of these third-party portals.</p>
  </section>
</div>`
  },
  contact: {
    id: 'contact',
    title: 'Contact Us & Grievance',
    subtitle: 'Support Desk & Legal Redressal SLA',
    metaDescription: 'Official support and grievance redressal officer contact channels.',
    lastUpdated: '2026-08-27',
    isPublished: true,
    content: `<div class="space-y-4">
  <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
    <h3 class="text-sm font-black text-white">Official Contact & Editorial Support</h3>
    <p class="text-xs text-slate-300">Have a suggestion, found a broken official link, or have a grievance regarding any notification? Reach out directly to our support desk:</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-700">
        <span class="text-[10px] uppercase font-bold text-slate-400 block">General Support & Inquiries</span>
        <strong class="text-amber-400 font-mono text-xs">support@${getDomainNameLowercase()}</strong>
      </div>

      <div class="p-3 rounded-xl bg-slate-900 border border-slate-700">
        <span class="text-[10px] uppercase font-bold text-slate-400 block">Grievance & Legal Officer</span>
        <strong class="text-slate-200 font-mono text-xs">contact@${getDomainNameLowercase()}</strong>
      </div>
    </div>
  </div>

  <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
    <strong class="text-white block font-bold">Grievance Redressal & Response SLA:</strong>
    <p class="text-slate-400">All user inquiries, discrepancy reports, and copyright notifications are reviewed by our grievance officer within <strong>24 to 48 business hours</strong>.</p>
    <div class="text-emerald-400 pt-1 font-semibold text-[11px]">
      Officially recognized grievance mechanism compliant with IT Rules 2021.
    </div>
  </div>
</div>`
  }
};
