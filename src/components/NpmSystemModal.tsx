import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Download, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Server, 
  Database, 
  Film, 
  Activity, 
  TrendingUp, 
  Cpu, 
  ArrowRight,
  Calculator,
  RefreshCw,
  Box,
  AlertCircle
} from 'lucide-react';

interface NpmSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NpmPackageDetail {
  name: string;
  description: string;
  version: string;
  license: string;
  homepage?: string;
  keywords?: string[];
  dependenciesCount?: number;
  dependencies?: Record<string, string>;
  readme?: string;
}

interface PopularPackage {
  name: string;
  version: string;
  description: string;
  downloads: number;
  license: string;
  keywords: string[];
}

interface SystemHealth {
  status: string;
  dbType: string;
  tmdbConfigured: boolean;
  systemTime: string;
}

export const NpmSystemContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'popular' | 'system' | 'nps'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<NpmPackageDetail | null>(null);
  const [pkgDownloads, setPkgDownloads] = useState<number | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  const [popularPkgs, setPopularPkgs] = useState<PopularPackage[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  // NPS Calculator State
  const [monthlyContrib, setMonthlyContrib] = useState<number>(5000);
  const [currentAge, setCurrentAge] = useState<number>(25);
  const [npsResult, setNpsResult] = useState<any>(null);

  useEffect(() => {
    fetchSystemHealth();
    fetchPopularPackages();
    handleNpsCalculate(5000, 25);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (e) {
      setSystemHealth({
        status: 'online',
        dbType: 'In-Memory DB',
        tmdbConfigured: false,
        systemTime: new Date().toLocaleTimeString()
      });
    }
  };

  const fetchPopularPackages = async () => {
    setIsLoadingPopular(true);
    try {
      const res = await fetch('/api/npm/popular');
      if (res.ok) {
        const data = await res.json();
        setPopularPkgs(data.packages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPopular(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/npm/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.objects || []);
      }
    } catch (err) {
      console.error('NPM Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const loadPackageDetail = async (pkgName: string) => {
    setIsLoadingDetail(true);
    setSelectedPkg(null);
    setPkgDownloads(null);
    try {
      const [detailRes, dlRes] = await Promise.all([
        fetch(`/api/npm/package/${encodeURIComponent(pkgName)}`),
        fetch(`/api/npm/downloads/${encodeURIComponent(pkgName)}`)
      ]);

      if (detailRes.ok) {
        const detailData = await detailRes.json();
        setSelectedPkg(detailData);
      }
      if (dlRes.ok) {
        const dlData = await dlRes.json();
        setPkgDownloads(dlData.downloads || 0);
      }
    } catch (err) {
      console.error('Failed to load pkg detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleNpsCalculate = async (pVal = monthlyContrib, ageVal = currentAge) => {
    try {
      const res = await fetch('/api/nps/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyContribution: pVal, age: ageVal, expectedReturn: 10 })
      });
      if (res.ok) {
        const data = await res.json();
        setNpsResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4 animate-in fade-in duration-200">
      
      {/* Tab Sub-Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-white flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-red-500 via-rose-600 to-amber-600 rounded-xl shadow-lg shadow-rose-950/50 shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black tracking-tight text-white">NPM & System Control Hub</h2>
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Registry v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">Node Package Registry API • System Diagnostics • NPS Pension Calculator</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Express API Active
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2 flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'search'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>NPM Package Search</span>
          </button>

          <button
            onClick={() => setActiveTab('popular')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'popular'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Featured Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>System & APIs Status</span>
          </button>

          <button
            onClick={() => setActiveTab('nps')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'nps'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>NPS Pension Calculator</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* TAB 1: NPM SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search npm registry (e.g. express, react, tailwindcss, lucide-react, mysql2)..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-950/30 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  <span>Search NPM</span>
                </button>
              </form>

              {/* Main 2-Column Search Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Search Results List */}
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {searchResults.length > 0 ? `Found ${searchResults.length} Packages` : 'Registry Packages'}
                  </h3>

                  {searchResults.length === 0 && !isSearching && (
                    <div className="p-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center space-y-3">
                      <Box className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Search any package from the official NPM Registry.</p>
                      <p className="text-xs text-slate-400">Try searching: <span className="text-rose-500 font-mono">express</span>, <span className="text-rose-500 font-mono">react</span>, <span className="text-rose-500 font-mono">mysql2</span></p>
                    </div>
                  )}

                  {isSearching && (
                    <div className="p-12 text-center text-slate-400 space-y-2">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-500" />
                      <p className="text-sm font-medium">Searching NPM Registry...</p>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[600px] lg:max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                    {searchResults.map((item) => {
                      const pkg = item.package;
                      const isSelected = selectedPkg?.name === pkg.name;
                      return (
                        <div
                          key={pkg.name}
                          onClick={() => loadPackageDetail(pkg.name)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-500/10 border-rose-500 dark:border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm font-mono">{pkg.name}</h4>
                            <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                              v{pkg.version}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{pkg.description}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                            <span>Author: {pkg.publisher?.username || 'npm'}</span>
                            <span className="text-rose-500 font-semibold">Inspect →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Package Details Inspector */}
                <div className="lg:col-span-7">
                  {isLoadingDetail ? (
                    <div className="p-16 text-center border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
                      <p className="text-sm text-slate-400 font-medium">Fetching package metadata and downloads from api.npmjs.org...</p>
                    </div>
                  ) : selectedPkg ? (
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                      
                      {/* Package Header */}
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-700/60 pb-5">
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">{selectedPkg.name}</h3>
                            <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                              v{selectedPkg.version}
                            </span>
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              {selectedPkg.license}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{selectedPkg.description}</p>
                        </div>

                        {selectedPkg.homepage && (
                          <a
                            href={selectedPkg.homepage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
                          >
                            <span>Homepage</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Download Command Box */}
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                          <span className="flex items-center space-x-1.5">
                            <Terminal className="w-4 h-4 text-rose-400" />
                            <span>Install Command</span>
                          </span>
                          <span>npm CLI</span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg font-mono text-sm text-emerald-400">
                          <code>npm install {selectedPkg.name}</code>
                          <button
                            onClick={() => handleCopy(`npm install ${selectedPkg.name}`, 'pkg-install')}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-all cursor-pointer"
                          >
                            {copiedCmd === 'pkg-install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Metrics Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Monthly Downloads</span>
                          <p className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                            {pkgDownloads !== null ? pkgDownloads.toLocaleString() : 'Loading...'}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dependencies</span>
                          <p className="text-lg font-black text-slate-900 dark:text-white font-mono">
                            {selectedPkg.dependenciesCount ?? Object.keys(selectedPkg.dependencies || {}).length}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">License</span>
                          <p className="text-lg font-black text-slate-900 dark:text-white font-mono">
                            {selectedPkg.license || 'MIT'}
                          </p>
                        </div>
                      </div>

                      {/* Keywords */}
                      {selectedPkg.keywords && selectedPkg.keywords.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Keywords</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedPkg.keywords.slice(0, 8).map((kw, idx) => (
                              <span key={idx} className="bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md font-mono">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dependencies List */}
                      {selectedPkg.dependencies && Object.keys(selectedPkg.dependencies).length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Dependencies ({Object.keys(selectedPkg.dependencies).length})
                          </h4>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto font-mono text-xs space-y-1.5">
                            {Object.entries(selectedPkg.dependencies).map(([depName, ver]) => (
                              <div key={depName} className="flex items-center justify-between py-0.5 border-b border-slate-100 dark:border-slate-800/60 last:border-none">
                                <span className="text-slate-800 dark:text-slate-200">{depName}</span>
                                <span className="text-slate-400">{ver}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="p-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-slate-400 space-y-3">
                      <Package className="w-12 h-12 mx-auto text-slate-400" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Select any package on the left to inspect detailed metrics.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: FEATURED POPULAR PACKAGES */}
          {activeTab === 'popular' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Essential Node.js & React Core Packages</h3>
                  <p className="text-xs text-slate-400">Live download metrics from official NPM API</p>
                </div>
                <button
                  onClick={fetchPopularPackages}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPopular ? 'animate-spin' : ''}`} />
                  <span>Refresh Metrics</span>
                </button>
              </div>

              {isLoadingPopular ? (
                <div className="p-16 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-500" />
                  <p className="text-sm">Fetching popular package download stats from api.npmjs.org...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularPkgs.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-rose-500/50 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-slate-900 dark:text-white text-base">{pkg.name}</span>
                          <span className="text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-full">
                            v{pkg.version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{pkg.description}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Weekly Downloads:</span>
                          <span className="font-mono font-bold text-rose-500">{pkg.downloads.toLocaleString()}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopy(`npm i ${pkg.name}`, `popular-${pkg.name}`)}
                            className="flex-1 py-1.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg flex items-center justify-center space-x-1 hover:bg-slate-950 transition-all cursor-pointer"
                          >
                            {copiedCmd === `popular-${pkg.name}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>npm i {pkg.name}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYSTEM & APIS HEALTH */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Server className="w-5 h-5 text-rose-500" />
                    <span>Full-Stack Application Infrastructure</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Status of Express Backend, MySQL Database, TMDB API, and NPM Registry Services</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Node Express */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Express API Server</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <p className="text-lg font-bold text-emerald-500">Online (Port 3000)</p>
                    <p className="text-[11px] text-slate-400">Node.js ES Engine Active</p>
                  </div>

                  {/* MySQL */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Database Engine</span>
                      <Database className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{systemHealth?.dbType || 'In-Memory Store'}</p>
                    <p className="text-[11px] text-slate-400">Configured in .env</p>
                  </div>

                  {/* TMDB API */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">TMDB Movie API</span>
                      <Film className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {systemHealth?.tmdbConfigured ? 'Connected' : 'Mock Driver Active'}
                    </p>
                    <p className="text-[11px] text-slate-400">The Movie Database API</p>
                  </div>

                  {/* NPM Registry API */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">NPM Registry API</span>
                      <Package className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-lg font-bold text-emerald-500">Live Endpoint</p>
                    <p className="text-[11px] text-slate-400">https://registry.npmjs.org</p>
                  </div>
                </div>

                {/* Environment Variables Reference */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configured Environment Variables (.env)</h4>
                  <div className="font-mono text-xs space-y-1.5 text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>MYSQL_HOST</span>
                      <span className="text-emerald-400">localhost</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>MYSQL_DATABASE</span>
                      <span className="text-emerald-400">GovtBharat_db</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>TMDB_API_KEY</span>
                      <span className="text-amber-400">{systemHealth?.tmdbConfigured ? 'Set ****' : 'Optional (Fallback enabled)'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>PORT</span>
                      <span className="text-emerald-400">3000 (Cloud Run)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: NPS (NATIONAL PENSION SYSTEM) CALCULATOR */}
          {activeTab === 'nps' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-6 space-y-6">
                
                <div>
                  <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 flex items-center space-x-2">
                    <Calculator className="w-6 h-6" />
                    <span>NPS (National Pension System) Calculator & Retirement Planner</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Official pension yield forecast for central/state government employees and private subscribers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="space-y-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Monthly Contribution (₹)</label>
                      <input
                        type="number"
                        value={monthlyContrib}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMonthlyContrib(val);
                          handleNpsCalculate(val, currentAge);
                        }}
                        className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white"
                      />
                      <input
                        type="range"
                        min="500"
                        max="50000"
                        step="500"
                        value={monthlyContrib}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMonthlyContrib(val);
                          handleNpsCalculate(val, currentAge);
                        }}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Current Age (Years)</label>
                      <input
                        type="number"
                        value={currentAge}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCurrentAge(val);
                          handleNpsCalculate(monthlyContrib, val);
                        }}
                        className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Calculations Output */}
                  {npsResult && (
                    <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                        Expected Pension & Maturity Summary (Age 60)
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Total Investment Period</span>
                          <p className="text-base font-mono font-bold text-white">{npsResult.investmentYears} Years</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Total Principal Amount</span>
                          <p className="text-base font-mono font-bold text-white">₹{npsResult.totalInvested?.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Interest Earned</span>
                          <p className="text-base font-mono font-bold text-emerald-400">₹{npsResult.interestEarned?.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Total Maturity Wealth</span>
                          <p className="text-lg font-mono font-black text-amber-400">₹{npsResult.totalMaturity?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between bg-slate-950 p-3 rounded-lg">
                        <span className="text-xs text-slate-300 font-medium">Estimated Monthly Pension</span>
                        <span className="text-xl font-black font-mono text-emerald-400">₹{npsResult.estimatedMonthlyPension?.toLocaleString()} / month</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>NPM Registry API and Express Gateway operational.</span>
          </div>
        </div>

    </div>
  );
};
