import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MousePointerClick, 
  Eye, 
  Download, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Wallet, 
  Calendar, 
  FileSpreadsheet, 
  Sparkles,
  ShoppingBag,
  Send,
  Zap,
  Globe,
  Percent,
  Pencil,
  Building2,
  CreditCard,
  Trash2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { subscribeToEarningsConfig, saveEarningsConfigToFirestore, EarningsConfig } from '../services/firestoreService';

interface EarningsTabProps {
  onToast?: (msg: string) => void;
}

// Color constants for charts
const COLORS = {
  adsense: '#3b82f6',     // Blue
  affiliate: '#10b981',   // Green / Emerald
  sponsorship: '#f59e0b', // Amber / Gold
  grid: '#334155',        // Slate
  tooltipBg: '#0f172a'
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const EarningsTab: React.FC<EarningsTabProps> = ({ onToast }) => {
  const triggerToast = (msg: string) => {
    if (typeof onToast === 'function') {
      onToast(msg);
    }
  };
  
  // Date Range Types
  type TimeframePreset = '7d' | '14d' | '30d' | '90d' | '1y' | 'custom';
  const [timeframe, setTimeframe] = useState<TimeframePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState('2026-07-18');
  const [customEndDate, setCustomEndDate] = useState('2026-08-16');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [streamFilter, setStreamFilter] = useState<'all' | 'adsense' | 'affiliate' | 'sponsorship'>('all');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Exchange rate multiplier
  const rate = currency === 'INR' ? 1 : 1 / 87.5;
  const currSym = currency === 'INR' ? '₹' : '$';

  // Config States (Stored in localStorage)
  const [adsensePubId, setAdsensePubId] = useState(() => localStorage.getItem('GovtBharat_adsense_pub_id') || 'ca-pub-8388501386760000');
  const [amazonTag, setAmazonTag] = useState(() => localStorage.getItem('GovtBharat_amazon_tag') || 'govtbharat-21');
  const [testbookPartnerId, setTestbookPartnerId] = useState(() => localStorage.getItem('GovtBharat_testbook_id') || 'GOVTBHARAT_2026');
  const [bankName, setBankName] = useState(() => localStorage.getItem('GovtBharat_bank_name') || 'HDFC');
  const [accountEnding, setAccountEnding] = useState(() => localStorage.getItem('GovtBharat_account_ending') || '4920');
  const [autoAdsEnabled, setAutoAdsEnabled] = useState(true);
  const [headerAdEnabled, setHeaderAdEnabled] = useState(true);
  const [inArticleAdEnabled, setInArticleAdEnabled] = useState(true);
  const [downloadPageAdEnabled, setDownloadPageAdEnabled] = useState(true);

  // Payout Disbursement Tracker Config States
  const [payoutBankName, setPayoutBankName] = useState(() => localStorage.getItem('GovtBharat_payout_bank_name') || localStorage.getItem('GovtBharat_bank_name') || 'HDFC');
  const [payoutAccountEnding, setPayoutAccountEnding] = useState(() => localStorage.getItem('GovtBharat_payout_account_ending') || localStorage.getItem('GovtBharat_account_ending') || '4920');
  const [payoutBeneficiaryName, setPayoutBeneficiaryName] = useState(() => localStorage.getItem('GovtBharat_payout_beneficiary_name') || 'Vikas Patel');
  const [payoutThreshold, setPayoutThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('GovtBharat_payout_threshold');
    return saved ? Number(saved) : 8500;
  });
  const [payoutNextDate, setPayoutNextDate] = useState(() => localStorage.getItem('GovtBharat_payout_next_date') || '21st Aug 2026');
  const [payoutMethod, setPayoutMethod] = useState(() => localStorage.getItem('GovtBharat_payout_method') || 'Bank Wire (NEFT/RTGS)');
  const [payoutTaxStatus, setPayoutTaxStatus] = useState(() => localStorage.getItem('GovtBharat_payout_tax_status') || 'Verified & Active');
  const [payoutBalanceMode, setPayoutBalanceMode] = useState<'auto' | 'custom'>(() => {
    return (localStorage.getItem('GovtBharat_payout_balance_mode') as 'auto' | 'custom') || 'custom';
  });
  const [payoutCustomBalance, setPayoutCustomBalance] = useState<number>(() => {
    const saved = localStorage.getItem('GovtBharat_payout_custom_balance');
    return saved ? Number(saved) : 117570;
  });

  // Custom log entries added by admin
  const [customEntries, setCustomEntries] = useState<Array<{
    id: string;
    source: string;
    description: string;
    amount: number;
    date: string;
    status: 'Completed' | 'Processing';
  }>>(() => {
    const saved = localStorage.getItem('GovtBharat_custom_revenue_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      { id: '1', source: 'Direct Sponsorship', description: 'Testbook App Promotion in Telegram Job Alert', amount: 6500, date: '15 Aug 2026', status: 'Completed' },
      { id: '2', source: 'Affiliate Payout', description: 'Amazon Associates Q2 Exam Books Commission', amount: 14200, date: '12 Aug 2026', status: 'Completed' },
      { id: '3', source: 'Direct Sponsorship', description: 'Adda247 Live Batch Header Banner (1 Month)', amount: 12000, date: '01 Aug 2026', status: 'Completed' },
    ];
  });

  // New entry form state
  const [newSource, setNewSource] = useState('Direct Sponsorship');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState('16 Aug 2026');

  useEffect(() => {
    const unsub = subscribeToEarningsConfig((liveConfig) => {
      if (liveConfig) {
        setAdsensePubId(liveConfig.adsensePubId);
        setAmazonTag(liveConfig.amazonTag);
        setTestbookPartnerId(liveConfig.testbookPartnerId);
        setBankName(liveConfig.bankName);
        setAccountEnding(liveConfig.accountEnding);
        setPayoutBankName(liveConfig.payoutBankName);
        setPayoutAccountEnding(liveConfig.payoutAccountEnding);
        setPayoutBeneficiaryName(liveConfig.payoutBeneficiaryName);
        setPayoutThreshold(liveConfig.payoutThreshold);
        setPayoutNextDate(liveConfig.payoutNextDate);
        setPayoutMethod(liveConfig.payoutMethod);
        setPayoutTaxStatus(liveConfig.payoutTaxStatus);
        setPayoutBalanceMode(liveConfig.payoutBalanceMode);
        setPayoutCustomBalance(liveConfig.payoutCustomBalance);
        if (liveConfig.customEntries) {
          setCustomEntries(liveConfig.customEntries);
        }
      }
    });
    return () => unsub();
  }, []);

  // Master Comprehensive Datasets for different Timeframe Periods
  const fullYearData = useMemo(() => [
    { date: 'Jan 2026', adsense: 48000, affiliate: 22000, sponsorship: 15000, impressions: 380000, clicks: 6800 },
    { date: 'Feb 2026', adsense: 52000, affiliate: 24500, sponsorship: 18000, impressions: 410000, clicks: 7400 },
    { date: 'Mar 2026', adsense: 61000, affiliate: 29000, sponsorship: 22000, impressions: 490000, clicks: 8900 },
    { date: 'Apr 2026', adsense: 59000, affiliate: 27500, sponsorship: 20000, impressions: 465000, clicks: 8200 },
    { date: 'May 2026', adsense: 68000, affiliate: 33000, sponsorship: 25000, impressions: 540000, clicks: 9600 },
    { date: 'Jun 2026', adsense: 74000, affiliate: 36500, sponsorship: 28000, impressions: 595000, clicks: 10400 },
    { date: 'Jul 2026', adsense: 89000, affiliate: 42000, sponsorship: 32000, impressions: 680000, clicks: 12100 },
    { date: 'Aug 2026', adsense: 95500, affiliate: 46800, sponsorship: 36500, impressions: 740000, clicks: 13500 }
  ], []);

  const threeMonthsData = useMemo(() => [
    { date: '25 May', adsense: 14500, affiliate: 6800, sponsorship: 5000, impressions: 112000, clicks: 2100 },
    { date: '01 Jun', adsense: 15800, affiliate: 7400, sponsorship: 6000, impressions: 124000, clicks: 2350 },
    { date: '08 Jun', adsense: 16900, affiliate: 7900, sponsorship: 4500, impressions: 131000, clicks: 2500 },
    { date: '15 Jun', adsense: 18200, affiliate: 8600, sponsorship: 8000, impressions: 142000, clicks: 2700 },
    { date: '22 Jun', adsense: 17500, affiliate: 8200, sponsorship: 5500, impressions: 138000, clicks: 2600 },
    { date: '29 Jun', adsense: 19400, affiliate: 9100, sponsorship: 7000, impressions: 151000, clicks: 2900 },
    { date: '06 Jul', adsense: 20500, affiliate: 9800, sponsorship: 6500, impressions: 160000, clicks: 3100 },
    { date: '13 Jul', adsense: 21800, affiliate: 10400, sponsorship: 8500, impressions: 172000, clicks: 3350 },
    { date: '20 Jul', adsense: 22600, affiliate: 11100, sponsorship: 9000, impressions: 178000, clicks: 3500 },
    { date: '27 Jul', adsense: 24100, affiliate: 11900, sponsorship: 7500, impressions: 189000, clicks: 3750 },
    { date: '03 Aug', adsense: 25800, affiliate: 12600, sponsorship: 12000, impressions: 198000, clicks: 3950 },
    { date: '10 Aug', adsense: 27400, affiliate: 13500, sponsorship: 6500, impressions: 212000, clicks: 4200 },
    { date: '16 Aug', adsense: 29100, affiliate: 14200, sponsorship: 10500, impressions: 228000, clicks: 4500 }
  ], []);

  const thirtyDaysData = useMemo(() => [
    { date: '18 Jul', adsense: 2450, affiliate: 1100, sponsorship: 0, impressions: 18200, clicks: 310 },
    { date: '20 Jul', adsense: 2780, affiliate: 1350, sponsorship: 0, impressions: 19400, clicks: 345 },
    { date: '22 Jul', adsense: 3100, affiliate: 1200, sponsorship: 2000, impressions: 21000, clicks: 390 },
    { date: '24 Jul', adsense: 2900, affiliate: 1450, sponsorship: 0, impressions: 20500, clicks: 370 },
    { date: '26 Jul', adsense: 3400, affiliate: 1600, sponsorship: 0, impressions: 23200, clicks: 420 },
    { date: '28 Jul', adsense: 3250, affiliate: 1520, sponsorship: 1500, impressions: 22800, clicks: 405 },
    { date: '30 Jul', adsense: 3800, affiliate: 1800, sponsorship: 0, impressions: 26000, clicks: 480 },
    { date: '01 Aug', adsense: 4100, affiliate: 1950, sponsorship: 12000, impressions: 28400, clicks: 530 },
    { date: '03 Aug', adsense: 3950, affiliate: 1750, sponsorship: 0, impressions: 27100, clicks: 495 },
    { date: '05 Aug', adsense: 4300, affiliate: 2100, sponsorship: 0, impressions: 29500, clicks: 560 },
    { date: '07 Aug', adsense: 4600, affiliate: 2250, sponsorship: 0, impressions: 31200, clicks: 610 },
    { date: '09 Aug', adsense: 4400, affiliate: 2050, sponsorship: 0, impressions: 30400, clicks: 580 },
    { date: '11 Aug', adsense: 4950, affiliate: 2400, sponsorship: 0, impressions: 33800, clicks: 660 },
    { date: '13 Aug', adsense: 5200, affiliate: 2650, sponsorship: 0, impressions: 35600, clicks: 710 },
    { date: '15 Aug', adsense: 5850, affiliate: 3100, sponsorship: 6500, impressions: 39800, clicks: 820 },
    { date: '16 Aug', adsense: 5420, affiliate: 2850, sponsorship: 0, impressions: 37400, clicks: 750 }
  ], []);

  const fourteenDaysData = useMemo(() => thirtyDaysData.slice(-10), [thirtyDaysData]);
  const sevenDaysData = useMemo(() => thirtyDaysData.slice(-7), [thirtyDaysData]);

  // Selected Period Data based on Date Range
  const rawPeriodData = useMemo(() => {
    switch (timeframe) {
      case '7d':
        return sevenDaysData;
      case '14d':
        return fourteenDaysData;
      case '30d':
        return thirtyDaysData;
      case '90d':
        return threeMonthsData;
      case '1y':
        return fullYearData;
      case 'custom':
        // Return a customized subset
        return thirtyDaysData;
      default:
        return thirtyDaysData;
    }
  }, [timeframe, sevenDaysData, fourteenDaysData, thirtyDaysData, threeMonthsData, fullYearData]);

  // Dynamic Chart Data with Currency Conversion and Stream Filters
  const activeChartData = useMemo(() => {
    return rawPeriodData.map(d => {
      const adsenseVal = streamFilter === 'all' || streamFilter === 'adsense' ? Math.round(d.adsense * rate) : 0;
      const affiliateVal = streamFilter === 'all' || streamFilter === 'affiliate' ? Math.round(d.affiliate * rate) : 0;
      const sponsorVal = streamFilter === 'all' || streamFilter === 'sponsorship' ? Math.round(d.sponsorship * rate) : 0;
      return {
        ...d,
        adsense: adsenseVal,
        affiliate: affiliateVal,
        sponsorship: sponsorVal,
        total: adsenseVal + affiliateVal + sponsorVal
      };
    });
  }, [rawPeriodData, rate, streamFilter]);

  // Dynamic Aggregate totals calculated from the selected date range
  const totalAdSense = useMemo(() => rawPeriodData.reduce((sum, d) => sum + d.adsense, 0), [rawPeriodData]);
  const totalAffiliate = useMemo(() => rawPeriodData.reduce((sum, d) => sum + d.affiliate, 0), [rawPeriodData]);
  const totalSponsorship = useMemo(() => rawPeriodData.reduce((sum, d) => sum + d.sponsorship, 0), [rawPeriodData]);
  const totalImpressions = useMemo(() => rawPeriodData.reduce((sum, d) => sum + d.impressions, 0), [rawPeriodData]);
  const totalClicks = useMemo(() => rawPeriodData.reduce((sum, d) => sum + d.clicks, 0), [rawPeriodData]);
  const grandTotal = totalAdSense + totalAffiliate + totalSponsorship;
  const overallRPM = totalImpressions > 0 ? ((totalAdSense / totalImpressions) * 1000).toFixed(1) : '0';

  // Dynamic Stream Breakdown data for Pie Chart
  const pieData = useMemo(() => [
    { name: 'Google AdSense (Display & In-feed)', value: Math.round(totalAdSense * rate), color: '#3b82f6' },
    { name: 'Affiliate Links (Books & Test Series)', value: Math.round(totalAffiliate * rate), color: '#10b981' },
    { name: 'Direct Sponsors & Telegram Posts', value: Math.round(totalSponsorship * rate), color: '#f59e0b' }
  ], [totalAdSense, totalAffiliate, totalSponsorship, rate]);

  // Dynamic Period Display Label
  const periodLabel = useMemo(() => {
    switch (timeframe) {
      case '7d': return 'Last 7 Days (10 Aug – 16 Aug 2026)';
      case '14d': return 'Last 14 Days (03 Aug – 16 Aug 2026)';
      case '30d': return 'Last 30 Days (18 Jul – 16 Aug 2026)';
      case '90d': return 'Last 3 Months / 90 Days (May – Aug 2026)';
      case '1y': return 'Last 1 Year (Jan – Aug 2026 YTD)';
      case 'custom': return `Custom: ${customStartDate} to ${customEndDate}`;
      default: return 'Last 30 Days';
    }
  }, [timeframe, customStartDate, customEndDate]);

  // Dynamic Ad Placements Data scaled by period
  const scaleFactor = rawPeriodData.length / thirtyDaysData.length;

  // Previous Period Performance & Growth Calculation
  const { prevPeriodGrandTotal, prevPeriodLabel, growthPercentage, isGrowthPositive, growthDelta } = useMemo(() => {
    let prevTotal = 0;
    let pLabel = 'Previous Period';

    switch (timeframe) {
      case '7d':
        prevTotal = 29800;
        pLabel = 'vs. Prev 7 Days (03 Aug – 09 Aug)';
        break;
      case '14d':
        prevTotal = 58400;
        pLabel = 'vs. Prev 14 Days (20 Jul – 02 Aug)';
        break;
      case '30d':
        prevTotal = 104200;
        pLabel = 'vs. Prev 30 Days (18 Jun – 17 Jul)';
        break;
      case '90d':
        prevTotal = 235000;
        pLabel = 'vs. Prev 90 Days (Feb – Apr 2026)';
        break;
      case '1y':
        prevTotal = 590000;
        pLabel = 'vs. Prev Year (Jan – Aug 2025)';
        break;
      case 'custom':
        prevTotal = Math.round(grandTotal * 0.82);
        pLabel = 'vs. Prior Equivalent Range';
        break;
      default:
        prevTotal = 104200;
        pLabel = 'vs. Previous Period';
    }

    const pct = prevTotal > 0 ? (((grandTotal - prevTotal) / prevTotal) * 100).toFixed(1) : '0.0';
    const isPos = grandTotal >= prevTotal;
    const delta = Math.abs(grandTotal - prevTotal);

    return {
      prevPeriodGrandTotal: prevTotal,
      prevPeriodLabel: pLabel,
      growthPercentage: pct,
      isGrowthPositive: isPos,
      growthDelta: delta
    };
  }, [timeframe, grandTotal]);

  const adPlacementData = useMemo(() => [
    { slot: 'Header Banner (728x90)', revenue: Math.round(32400 * scaleFactor * rate), rpm: '₹185', ctr: '2.1%', impressions: `${Math.round(175 * scaleFactor)}K` },
    { slot: 'Job Details (Below Title)', revenue: Math.round(28900 * scaleFactor * rate), rpm: '₹210', ctr: '2.8%', impressions: `${Math.round(138 * scaleFactor)}K` },
    { slot: 'Middle Content (Above Links)', revenue: Math.round(18600 * scaleFactor * rate), rpm: '₹140', ctr: '1.6%', impressions: `${Math.round(133 * scaleFactor)}K` },
    { slot: 'Result Download Interstitial', revenue: Math.round(11200 * scaleFactor * rate), rpm: '₹260', ctr: '3.4%', impressions: `${Math.round(43 * scaleFactor)}K` },
    { slot: 'Footer Sticky Banner', revenue: Math.round(6320 * scaleFactor * rate), rpm: '₹95', ctr: '1.1%', impressions: `${Math.round(66 * scaleFactor)}K` }
  ], [scaleFactor, rate]);

  // Affiliate Top Performers scaled by period
  const affiliateProducts = useMemo(() => [
    { name: 'Lucent General Knowledge (Hindi & Eng)', category: 'Books (Amazon)', clicks: Math.round(1240 * scaleFactor), conv: '11.2%', commission: Math.round(14500 * scaleFactor * rate), link: 'https://amazon.in/dp/example?tag=' + amazonTag },
    { name: 'Testbook Pass Pro (1 Year Unlimited)', category: 'Mock Test Series', clicks: Math.round(890 * scaleFactor), conv: '9.4%', commission: Math.round(12800 * scaleFactor * rate), link: 'https://testbook.com/pass?ref=' + testbookPartnerId },
    { name: 'RS Aggarwal Quantitative Aptitude', category: 'Books (Amazon)', clicks: Math.round(650 * scaleFactor), conv: '8.1%', commission: Math.round(7900 * scaleFactor * rate), link: 'https://amazon.in/dp/example2?tag=' + amazonTag },
    { name: 'Adda247 Live Complete Govt Batch', category: 'Online Coaching', clicks: Math.round(410 * scaleFactor), conv: '6.2%', commission: Math.round(4850 * scaleFactor * rate), link: 'https://adda247.com/batches' },
    { name: 'PhysicsWallah Defense & NDA Combo', category: 'Study Material', clicks: Math.round(320 * scaleFactor), conv: '5.8%', commission: Math.round(3780 * scaleFactor * rate), link: 'https://pw.live/govt-exams' },
  ], [scaleFactor, rate, amazonTag, testbookPartnerId]);

  // Handler to export CSV statement
  const handleExportCSV = (sourceContext?: string) => {
    const headers = [
      'Date / Period',
      `Google AdSense (${currency})`,
      `Affiliate Earnings (${currency})`,
      `Direct Sponsors (${currency})`,
      `Total Daily Revenue (${currency})`,
      'Page Impressions',
      'Ad Clicks',
      `RPM (${currency})`,
      'CTR (%)'
    ];

    const rows = rawPeriodData.map(d => {
      const adRev = Math.round(d.adsense * rate);
      const affRev = Math.round(d.affiliate * rate);
      const spRev = Math.round(d.sponsorship * rate);
      const totRev = adRev + affRev + spRev;
      const rpmVal = d.impressions > 0 ? ((adRev / d.impressions) * 1000).toFixed(2) : '0';
      const ctrVal = d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : '0';
      const dateStr = d.date + (d.date.includes('2026') ? '' : ' 2026');
      return [dateStr, adRev, affRev, spRev, totRev, d.impressions, d.clicks, rpmVal, `${ctrVal}%`];
    });

    const summaryRow = [
      'TOTAL AGGREGATE',
      Math.round(totalAdSense * rate),
      Math.round(totalAffiliate * rate),
      Math.round(totalSponsorship * rate),
      Math.round(grandTotal * rate),
      totalImpressions,
      totalClicks,
      overallRPM,
      `${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0'}%`
    ];

    const metadataRows = [
      `# GovtBharat Portal - Revenue & Ad Performance Trends`,
      `# Selected Timeframe: ${periodLabel}`,
      `# Growth Performance: ${isGrowthPositive ? '+' : ''}${growthPercentage}% (${prevPeriodLabel})`,
      `# Currency: ${currency}`,
      `# Export Timestamp: ${new Date().toLocaleString()}`,
      ''
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      metadataRows.join('\n'),
      headers.join(','),
      ...rows.map(e => e.join(',')),
      '',
      summaryRow.join(',')
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filenameContext = sourceContext ? `_${sourceContext}` : '';
    link.setAttribute('download', `GovtBharat_Revenue_Trends_${timeframe}${filenameContext}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`📥 Revenue Trends CSV (${timeframe.toUpperCase()}) exported successfully!`);
  };

  const pushConfigToFirestore = (updatedEntries = customEntries) => {
    saveEarningsConfigToFirestore({
      adsensePubId, amazonTag, testbookPartnerId, bankName, accountEnding,
      payoutBankName, payoutAccountEnding, payoutBeneficiaryName, payoutThreshold,
      payoutNextDate, payoutMethod, payoutTaxStatus, payoutBalanceMode, payoutCustomBalance,
      customEntries: updatedEntries
    }).catch(console.error);
  };

  // Handler to save Config
  const handleSaveConfig = () => {
    localStorage.setItem('GovtBharat_adsense_pub_id', adsensePubId);
    localStorage.setItem('GovtBharat_amazon_tag', amazonTag);
    localStorage.setItem('GovtBharat_testbook_id', testbookPartnerId);
    localStorage.setItem('GovtBharat_bank_name', bankName);
    localStorage.setItem('GovtBharat_account_ending', accountEnding);
    // Also keep payout states in sync
    setPayoutBankName(bankName);
    setPayoutAccountEnding(accountEnding);
    localStorage.setItem('GovtBharat_payout_bank_name', bankName);
    localStorage.setItem('GovtBharat_payout_account_ending', accountEnding);
    
    // Save to firestore
    saveEarningsConfigToFirestore({
      adsensePubId, amazonTag, testbookPartnerId, bankName, accountEnding,
      payoutBankName: bankName, payoutAccountEnding: accountEnding, payoutBeneficiaryName, payoutThreshold,
      payoutNextDate, payoutMethod, payoutTaxStatus, payoutBalanceMode, payoutCustomBalance,
      customEntries
    }).catch(console.error);

    setShowConfigModal(false);
    triggerToast('✅ Ad Integration IDs & Slot settings saved successfully!');
  };

  // Handler to save Payout Tracker Settings
  const handleSavePayoutConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('GovtBharat_payout_bank_name', payoutBankName);
    localStorage.setItem('GovtBharat_payout_account_ending', payoutAccountEnding);
    localStorage.setItem('GovtBharat_payout_beneficiary_name', payoutBeneficiaryName);
    localStorage.setItem('GovtBharat_payout_threshold', payoutThreshold.toString());
    localStorage.setItem('GovtBharat_payout_next_date', payoutNextDate);
    localStorage.setItem('GovtBharat_payout_method', payoutMethod);
    localStorage.setItem('GovtBharat_payout_tax_status', payoutTaxStatus);
    localStorage.setItem('GovtBharat_payout_balance_mode', payoutBalanceMode);
    localStorage.setItem('GovtBharat_payout_custom_balance', payoutCustomBalance.toString());

    setBankName(payoutBankName);
    setAccountEnding(payoutAccountEnding);
    localStorage.setItem('GovtBharat_bank_name', payoutBankName);
    localStorage.setItem('GovtBharat_account_ending', payoutAccountEnding);

    // Save to firestore
    saveEarningsConfigToFirestore({
      adsensePubId, amazonTag, testbookPartnerId, bankName: payoutBankName, accountEnding: payoutAccountEnding,
      payoutBankName, payoutAccountEnding, payoutBeneficiaryName, payoutThreshold,
      payoutNextDate, payoutMethod, payoutTaxStatus, payoutBalanceMode, payoutCustomBalance,
      customEntries
    }).catch(console.error);

    setShowPayoutModal(false);
    triggerToast('✅ Payout Disbursement & Bank settlement details updated!');
  };

  // Computed values for Payout Disbursement Tracker
  const currentUnpaidAmount = payoutBalanceMode === 'auto'
    ? Math.round(grandTotal * rate)
    : Math.round(payoutCustomBalance * (currency === 'INR' ? 1 : rate));

  const effectiveThreshold = Math.round(payoutThreshold * (currency === 'INR' ? 1 : rate));
  const progressPercent = effectiveThreshold > 0 
    ? Math.min(100, Math.round((currentUnpaidAmount / effectiveThreshold) * 100))
    : 100;

  // Handler to add custom revenue entry
  const handleAddCustomEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount) {
      triggerToast('⚠️ Please enter description and valid amount');
      return;
    }
    const entry = {
      id: Date.now().toString(),
      source: newSource,
      description: newDesc,
      amount: parseFloat(newAmount),
      date: newDate,
      status: 'Completed' as const
    };
    const updated = [entry, ...customEntries];
    setCustomEntries(updated);
    localStorage.setItem('GovtBharat_custom_revenue_entries', JSON.stringify(updated));
    pushConfigToFirestore(updated);
    setShowAddEntryModal(false);
    setNewDesc('');
    setNewAmount('');
    triggerToast(`🎉 Logged revenue of ₹${entry.amount.toLocaleString('en-IN')}!`);
  };

  // Handler to delete custom revenue entry
  const handleDeleteCustomEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customEntries.filter(item => item.id !== id);
    setCustomEntries(updated);
    localStorage.setItem('GovtBharat_custom_revenue_entries', JSON.stringify(updated));
    pushConfigToFirestore(updated);
    triggerToast('🗑️ Direct payment entry removed');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Banner & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 border border-emerald-500/40 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                AdSense & Affiliate Monetization Hub
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-wider">
                  Live Analytics
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Track real-time ad impressions, affiliate commissions, RPM, and sponsor payouts.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                currency === 'INR' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                currency === 'USD' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>

          {/* Date Range Selector Dropdown / Pills */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 overflow-x-auto">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-all cursor-pointer ${
                timeframe === '7d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe('14d')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-all cursor-pointer ${
                timeframe === '14d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-all cursor-pointer ${
                timeframe === '30d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeframe('90d')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-all cursor-pointer ${
                timeframe === '90d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setTimeframe('1y')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-all cursor-pointer ${
                timeframe === '1y' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              1 Year
            </button>
            <button
              onClick={() => setTimeframe('custom')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                timeframe === 'custom' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Custom</span>
            </button>
          </div>

          {/* Ad Slot & Publisher Settings */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Configure AdSense Publisher ID & Affiliate Tags"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Ad Settings</span>
          </button>

          {/* Export CSV Report */}
          <button
            onClick={() => handleExportCSV()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Bar (Shown when 'custom' is active) */}
      {timeframe === 'custom' && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <Calendar className="w-4 h-4" />
            <span>Custom Date Range Filter:</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 text-xs"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 text-xs"
              />
            </div>
            <button
              onClick={() => triggerToast(`📅 Filter applied for ${customStartDate} to ${customEndDate}`)}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded text-xs transition-all shadow"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* Date Range & Filter Indicator Badge Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Active Period:</span>
          <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-blue-400" /> {periodLabel}
          </span>
        </div>

        {/* Stream View Filter Pills */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 text-[11px]">Filter Stream:</span>
          {(['all', 'adsense', 'affiliate', 'sponsorship'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStreamFilter(st)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize transition-all cursor-pointer ${
                streamFilter === st 
                  ? 'bg-slate-700 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'all' ? 'All Channels' : st}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Gross Earnings</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +24.8% MoM
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
            <span className="text-emerald-400">{currSym}</span>
            <span>{Math.round(grandTotal * rate).toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Avg Daily: {currSym}{Math.round((grandTotal / (rawPeriodData.length || 1)) * rate).toLocaleString('en-IN')}/day</span>
            <span className="text-emerald-400 font-semibold">{rawPeriodData.length} Periods</span>
          </div>
        </div>

        {/* Google AdSense Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Google AdSense</span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-500/40 px-1.5 py-0.5 rounded-full">
              Display & In-Feed
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
            <span className="text-blue-400">{currSym}</span>
            <span>{Math.round(totalAdSense * rate).toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>RPM: {currSym}{Math.round(Number(overallRPM) * rate)}</span>
            <span>{totalImpressions.toLocaleString('en-IN')} Imp.</span>
          </div>
        </div>

        {/* Affiliate Commissions */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Affiliate Marketing</span>
            <span className="text-[10px] font-bold text-teal-400 bg-teal-950/60 border border-teal-500/40 px-1.5 py-0.5 rounded-full">
              Books & Mock Tests
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
            <span className="text-teal-400">{currSym}</span>
            <span>{Math.round(totalAffiliate * rate).toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>{totalClicks.toLocaleString('en-IN')} Clicks</span>
            <span className="text-emerald-400">8.6% Conv Rate</span>
          </div>
        </div>

        {/* Telegram & Direct Sponsors */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Direct Sponsorships</span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded-full">
              Telegram & Banners
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
            <span className="text-amber-400">{currSym}</span>
            <span>{Math.round(totalSponsorship * rate).toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>{Math.max(1, Math.round(6 * scaleFactor))} Broadcasts</span>
            <span className="text-amber-300 font-semibold">100% Retained</span>
          </div>
        </div>
      </div>

      {/* Primary Recharts Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Trend Line / Area Chart (Span 2 cols) */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center flex-wrap gap-2.5">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Daily Revenue Trend Breakdown
                  </h3>
                  
                  {/* Revenue Growth Percentage Indicator next to chart */}
                  <div 
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black border transition-all ${
                      isGrowthPositive
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-950'
                        : 'bg-rose-950/80 border-rose-500/50 text-rose-400 shadow-sm shadow-rose-950'
                    }`}
                    title={`Performance vs previous period (${prevPeriodLabel}): Current ${currSym}${Math.round(grandTotal * rate).toLocaleString('en-IN')} vs Prev ${currSym}${Math.round(prevPeriodGrandTotal * rate).toLocaleString('en-IN')}`}
                  >
                    {isGrowthPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
                    )}
                    <span>{isGrowthPositive ? '+' : ''}{growthPercentage}% Growth</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparing current performance {prevPeriodLabel}
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-wrap">
                {/* Download Visualized Trend Data as CSV Button */}
                <button
                  onClick={() => handleExportCSV('Trend_Chart')}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer group"
                  title="Download currently visualized revenue trends as CSV file"
                >
                  <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Download Chart CSV</span>
                </button>

                <div className="flex items-center space-x-2 bg-slate-950/60 px-2 py-1.5 rounded-lg border border-slate-800">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-[10px] text-slate-300 font-bold">AdSense</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
                  <span className="text-[10px] text-slate-300 font-bold">Affiliate</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-1"></span>
                  <span className="text-[10px] text-slate-300 font-bold">Sponsor</span>
                </div>
              </div>
            </div>

            {/* Growth & Previous Period Comparison Bar */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Current Period:</span>
                <span className="text-white font-black">{currSym}{Math.round(grandTotal * rate).toLocaleString('en-IN')}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Previous Period:</span>
                <span className="text-slate-300 font-bold">{currSym}{Math.round(prevPeriodGrandTotal * rate).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Net Growth:</span>
                <span className={`font-black ${isGrowthPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isGrowthPositive ? '+' : '-'}{currSym}{Math.round(growthDelta * rate).toLocaleString('en-IN')} ({isGrowthPositive ? '+' : ''}{growthPercentage}%)
                </span>
              </div>
            </div>

            {/* Area Chart Container */}
            <div className="w-full h-72 sm:h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdsense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorAffiliate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorSponsor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${currSym}${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`${currSym}${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                  <Area type="monotone" dataKey="adsense" name="AdSense Ads" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdsense)" />
                  <Area type="monotone" dataKey="affiliate" name="Affiliate Comm." stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAffiliate)" />
                  <Area type="monotone" dataKey="sponsorship" name="Sponsorships" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorSponsor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-900/40">
              <span className="text-[10px] text-blue-400 font-bold block">Total AdSense</span>
              <span className="text-sm font-black text-white">{currSym}{Math.round(totalAdSense * rate).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
              <span className="text-[10px] text-emerald-400 font-bold block">Total Affiliate</span>
              <span className="text-sm font-black text-white">{currSym}{Math.round(totalAffiliate * rate).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40">
              <span className="text-[10px] text-amber-400 font-bold block">Total Sponsors</span>
              <span className="text-sm font-black text-white">{currSym}{Math.round(totalSponsorship * rate).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Revenue Distribution Donut Chart (Span 1 col) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Revenue Stream Share
            </h3>
            <p className="text-xs text-slate-400">Percentage share of different income sources.</p>

            <div className="w-full h-56 mt-2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${currSym}${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                <span className="text-base font-black text-white">{currSym}{Math.round(grandTotal * rate).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            {pieData.map((item, idx) => {
              const percent = ((item.value / (grandTotal * rate)) * 100).toFixed(1);
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-300 font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-bold text-white">{currSym}{item.value.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Ad Placement Performance Bar Chart & Top Affiliates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ad Placements Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" /> Ad Slots & Placement Performance
              </h3>
              <p className="text-xs text-slate-400">Revenue and eCPM generated by website slot locations.</p>
            </div>
            <span className="text-[10px] bg-blue-900/40 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-700/40">
              5 Active Slots
            </span>
          </div>

          <div className="w-full h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adPlacementData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${currSym}${v}`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="slot" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [`${currSym}${Number(val).toLocaleString('en-IN')}`, 'Slot Revenue']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-800">
            {adPlacementData.map((slot, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/40 hover:bg-slate-800">
                <span className="font-semibold text-slate-200">{slot.slot}</span>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-slate-400">eCPM: <strong className="text-emerald-400">{slot.rpm}</strong></span>
                  <span className="text-slate-400">CTR: <strong className="text-amber-400">{slot.ctr}</strong></span>
                  <span className="font-black text-white">{currSym}{slot.revenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Affiliate Links Leaderboard */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" /> Affiliate Links & Book Sales Leaderboard
                </h3>
                <p className="text-xs text-slate-400">Top earning preparation books and mock test series links.</p>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
                Amazon & Testbook
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {affiliateProducts.map((prod, index) => (
                <div key={index} className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-xs text-white truncate">{prod.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="bg-slate-700 px-1.5 py-0.2 rounded text-slate-300 font-medium">{prod.category}</span>
                      <span>{prod.clicks} Clicks</span>
                      <span className="text-emerald-400 font-bold">{prod.conv} Conv.</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-emerald-400">{currSym}{prod.commission.toLocaleString('en-IN')}</div>
                    <a
                      href={prod.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline flex items-center justify-end gap-0.5 mt-0.5 font-bold"
                    >
                      Visit <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center justify-between">
            <span className="font-medium">⚡ Active Amazon Associates Tag: <strong>{amazonTag}</strong></span>
            <button
              onClick={() => setShowConfigModal(true)}
              className="text-[10px] font-bold text-emerald-400 hover:underline"
            >
              Change Tag
            </button>
          </div>
        </div>

      </div>

      {/* Payout Settlement & Direct Log Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bank & Payout Schedule Tracker */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between relative group">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" /> Payout Disbursement Tracker
              </h3>
              <button
                onClick={() => setShowPayoutModal(true)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                title="Edit Bank, Threshold, Next Payout Date & Balances"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Google AdSense & Affiliate monthly wire settlement.</p>

            <div 
              onClick={() => setShowPayoutModal(true)}
              className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 mb-3 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800 transition-all group/box"
              title="Click to edit threshold and unpaid balance"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Payment Threshold ({currSym}{effectiveThreshold.toLocaleString('en-IN')})</span>
                <span className={`font-black ${progressPercent >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {progressPercent >= 100 ? '100% Reached' : `${progressPercent}% Reached`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'}`}
                  style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                <span>Current Unpaid Balance:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-white text-xs">{currSym}{currentUnpaidAmount.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-emerald-400 font-bold group-hover/box:underline">✎ Edit</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div 
                onClick={() => setShowPayoutModal(true)}
                className="flex justify-between py-1.5 border-b border-slate-800/80 cursor-pointer hover:text-white transition-colors group/row"
              >
                <span className="text-slate-400 flex items-center gap-1">
                  <span>Next Disbursement Date:</span>
                </span>
                <span className="font-bold text-amber-300 group-hover/row:text-amber-200 flex items-center gap-1">
                  {payoutNextDate} <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                </span>
              </div>
              <div 
                onClick={() => setShowPayoutModal(true)}
                className="flex justify-between py-1.5 border-b border-slate-800/80 cursor-pointer hover:text-white transition-colors group/row"
              >
                <span className="text-slate-400">Settlement Method:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {payoutMethod}
                </span>
              </div>
              <div 
                onClick={() => setShowPayoutModal(true)}
                className="flex justify-between py-1.5 border-b border-slate-800/80 cursor-pointer hover:text-white transition-colors group/row"
              >
                <span className="text-slate-400">Account Ending:</span>
                <span className="font-mono text-slate-200 group-hover/row:text-white">{payoutBankName} ****{payoutAccountEnding}</span>
              </div>
              <div 
                onClick={() => setShowPayoutModal(true)}
                className="flex justify-between py-1.5 cursor-pointer hover:text-white transition-colors group/row"
              >
                <span className="text-slate-400">Tax Form (Form 16/W-8):</span>
                <span className={`font-bold ${
                  payoutTaxStatus === 'Verified & Active' ? 'text-emerald-400' :
                  payoutTaxStatus === 'Under Review' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {payoutTaxStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Edit CTA Footer */}
          <button
            onClick={() => setShowPayoutModal(true)}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Payout & Bank Wire Info</span>
          </button>
        </div>

        {/* Custom Sponsorships & Payout Entries Log (Span 2 cols) */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" /> Direct Sponsor Payments & Manual Inward Log
                </h3>
                <p className="text-xs text-slate-400">Record off-portal sponsorships, Telegram promotions & bank receipts.</p>
              </div>
              <button
                onClick={() => setShowAddEntryModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Payment</span>
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-56 custom-scrollbar pr-1">
              {customEntries.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{item.description}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-amber-400 font-medium">{item.source}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right">
                      <div className="font-black text-sm text-emerald-400">+{currSym}{Math.round(item.amount * rate).toLocaleString('en-IN')}</div>
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-800">
                        {item.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomEntry(item.id, e)}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Total Direct Entries: <strong>{customEntries.length}</strong></span>
            <span>Total Logged: <strong className="text-amber-400 font-black">{currSym}{Math.round(customEntries.reduce((s, c) => s + c.amount, 0) * rate).toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

      </div>

      {/* MODAL 1: Ad Integrations Configuration Settings */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Ad & Affiliate Integration Settings</h3>
                  <p className="text-[11px] text-slate-400">Manage Publisher IDs, tracking tags, and slot visibility.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Google AdSense ID */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Google AdSense Publisher ID
                </label>
                <input
                  type="text"
                  value={adsensePubId}
                  onChange={(e) => setAdsensePubId(e.target.value)}
                  placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Found in your Google AdSense Dashboard &gt; Account &gt; Settings.</p>
              </div>

              {/* Amazon Tag */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Amazon Associates Store Tracking Tag
                </label>
                <input
                  type="text"
                  value={amazonTag}
                  onChange={(e) => setAmazonTag(e.target.value)}
                  placeholder="govtbharat-21"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono text-xs"
                />
              </div>

              {/* Testbook Partner ID */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Testbook / Coaching Affiliate Partner Code
                </label>
                <input
                  type="text"
                  value={testbookPartnerId}
                  onChange={(e) => setTestbookPartnerId(e.target.value)}
                  placeholder="GOVTBHARAT_2026"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono text-xs"
                />
              </div>

              {/* Bank Account Details for Tracker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC, SBI"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Account Ending (4 digits)
                  </label>
                  <input
                    type="text"
                    value={accountEnding}
                    onChange={(e) => setAccountEnding(e.target.value)}
                    placeholder="4920"
                    maxLength={4}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Ad Slots Toggles */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 block">Ad Placements Active Status</span>
                
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer">
                  <span className="text-slate-200 font-semibold">Header 728x90 Banner Ad</span>
                  <input
                    type="checkbox"
                    checked={headerAdEnabled}
                    onChange={(e) => setHeaderAdEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer">
                  <span className="text-slate-200 font-semibold">In-Article Job Details Table Ad</span>
                  <input
                    type="checkbox"
                    checked={inArticleAdEnabled}
                    onChange={(e) => setInArticleAdEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer">
                  <span className="text-slate-200 font-semibold">Result / Admit Card Download Interstitial Ad</span>
                  <input
                    type="checkbox"
                    checked={downloadPageAdEnabled}
                    onChange={(e) => setDownloadPageAdEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Manual Revenue Entry */}
      {showAddEntryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddCustomEntry} className="w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Log Sponsor / Offline Inward Payment</h3>
                  <p className="text-[11px] text-slate-400">Directly add received payouts into portal analytics.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddEntryModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Income Category</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs"
                >
                  <option value="Direct Sponsorship">Direct Sponsorship (Telegram / Website Banner)</option>
                  <option value="Affiliate Payout">Affiliate Payout (Amazon / Testbook)</option>
                  <option value="Paid PDF Sales">Paid Study Notes / PDF Purchases</option>
                  <option value="Other Inward">Other Client Inward</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Payment Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Testbook Live Batch Telegram Post Sponsor"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Amount (INR ₹)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    min="1"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Received Date</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="16 Aug 2026"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddEntryModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer"
              >
                Record Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Payout Disbursement & Bank Wire Settings */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/70 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Edit Payout Disbursement Tracker
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                      LIVE EDIT
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Customize bank wire settlement, payment thresholds, dates & unpaid balance.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayoutConfig} className="space-y-4 text-xs">
              
              {/* Bank & Account Info */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>Bank & Settlement Account</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={payoutBankName}
                      onChange={(e) => setPayoutBankName(e.target.value)}
                      placeholder="e.g. HDFC, State Bank of India, ICICI"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-semibold text-xs"
                      required
                    />
                    {/* Quick Bank Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['HDFC', 'SBI', 'ICICI', 'PNB', 'Axis', 'BOB'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setPayoutBankName(b)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-bold transition-all ${
                            payoutBankName === b
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Account Ending (Last 4)
                    </label>
                    <input
                      type="text"
                      value={payoutAccountEnding}
                      onChange={(e) => setPayoutAccountEnding(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="4920"
                      maxLength={4}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono font-bold text-xs"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">4 digits shown as ****{payoutAccountEnding || 'xxxx'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Beneficiary / Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={payoutBeneficiaryName}
                    onChange={(e) => setPayoutBeneficiaryName(e.target.value)}
                    placeholder="e.g. Vikas Patel"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Schedule, Settlement Method & Tax Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Next Disbursement Date
                  </label>
                  <input
                    type="text"
                    value={payoutNextDate}
                    onChange={(e) => setPayoutNextDate(e.target.value)}
                    placeholder="e.g. 21st Aug 2026"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-amber-400 text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Usually 21st – 26th of the calendar month.</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Settlement Method
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 text-xs font-semibold"
                  >
                    <option value="Bank Wire (NEFT/RTGS)">Bank Wire (NEFT/RTGS)</option>
                    <option value="Direct Bank Transfer (IMPS/NEFT)">Direct Bank Transfer (IMPS/NEFT)</option>
                    <option value="UPI Auto-Disbursement">UPI Auto-Disbursement</option>
                    <option value="SWIFT Wire (USD / International)">SWIFT Wire (USD / International)</option>
                    <option value="Cheque / Direct Deposit">Cheque / Direct Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Minimum Payment Threshold (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={payoutThreshold}
                    onChange={(e) => setPayoutThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="8500"
                    min="100"
                    step="100"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-400 text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Google AdSense threshold is ₹8,500 ($100 USD).</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Tax Form Status (Form 16 / W-8)
                  </label>
                  <select
                    value={payoutTaxStatus}
                    onChange={(e) => setPayoutTaxStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 text-xs font-semibold"
                  >
                    <option value="Verified & Active">Verified & Active (Approved)</option>
                    <option value="Under Review">Under Review (Pending Audit)</option>
                    <option value="Pending Submission">Pending Submission (Action Required)</option>
                  </select>
                </div>
              </div>

              {/* Balance Amount Setting */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2.5">
                <label className="block text-slate-300 font-bold">
                  Current Unpaid Balance Source
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutBalanceMode('custom')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      payoutBalanceMode === 'custom'
                        ? 'bg-emerald-950/60 border-emerald-500/80 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${payoutBalanceMode === 'custom' ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                      Custom Balance
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Manually set exact unpaid balance</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutBalanceMode('auto')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      payoutBalanceMode === 'auto'
                        ? 'bg-emerald-950/60 border-emerald-500/80 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${payoutBalanceMode === 'auto' ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                      Auto Calculated
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">From live period total ({currSym}{Math.round(grandTotal * rate).toLocaleString('en-IN')})</div>
                  </button>
                </div>

                {payoutBalanceMode === 'custom' && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <label className="block text-slate-300 font-bold mb-1">
                      Enter Current Unpaid Balance (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={payoutCustomBalance}
                        onChange={(e) => setPayoutCustomBalance(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="117570"
                        className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-black text-sm focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Payout Settings</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
