import React, { useState, useEffect } from 'react';
import { 
  Code, Copy, Check, Terminal, ExternalLink, Sparkles, 
  CheckCircle2, Key, Globe, Shield, RefreshCw, Send, Play, FileCode, GitBranch
} from 'lucide-react';
import { getDomainName, getDomainNameLowercase } from '../utils/domain';
import { saveBackendPipelineConfig, subscribeToBackendPipelineConfig, saveStagingJobToFirestore } from '../services/firestoreService';
import { BackendPipelineConfig, JobCategory, StagingJob } from '../types';

interface GitHubBackendPipelineProps {
  onToast: (msg: string) => void;
}

export const GitHubBackendPipeline: React.FC<GitHubBackendPipelineProps> = ({ onToast }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'github_actions' | 'python_script' | 'firebase_direct'>('guide');
  const [pipelineConfig, setPipelineConfig] = useState<BackendPipelineConfig>({
    autoPromoteEnabled: false,
    webhookSecret: 'GovtBharat_BACKEND_SECRET_KEY_12345',
    githubRepoUrl: '',
    totalIngestedCount: 0
  });
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSavingRepo, setIsSavingRepo] = useState(false);

  const domain = getDomainName();
  const domainLower = getDomainNameLowercase();
  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/v1/jobs/staging`
    : `https://${domainLower}/api/v1/jobs/staging`;

  useEffect(() => {
    const unsub = subscribeToBackendPipelineConfig((config) => {
      if (config) setPipelineConfig(prev => ({ ...prev, ...config }));
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    onToast('📋 Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveRepoUrl = async () => {
    setIsSavingRepo(true);
    try {
      await saveBackendPipelineConfig({ githubRepoUrl: pipelineConfig.githubRepoUrl });
      fetch('/api/v1/backend-pipeline/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubRepoUrl: pipelineConfig.githubRepoUrl })
      }).catch(() => {});
      onToast('✅ GitHub Repository URL saved!');
    } catch (e: any) {
      onToast(`Failed to save: ${e.message}`);
    } finally {
      setIsSavingRepo(false);
    }
  };

  const handleSendTestJob = async () => {
    setIsSendingTest(true);
    const testPost: StagingJob = {
      id: `stage-test-${Date.now()}`,
      stagingId: `stage-test-${Date.now()}`,
      title: `UP Police Constable Recruitment 2026 (Verification Test)`,
      category: 'latest-jobs' as JobCategory,
      postDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      isNew: true,
      state: 'Uttar Pradesh',
      sourceType: 'github_backend',
      sourceName: 'GitHub Actions Auto-Scraper',
      shortInfo: 'Test payload sent from GitHub Backend Pipeline to verify Firestore staging integration.',
      dates: { start: '15-09-2026', last: '15-10-2026' },
      fees: { general: '₹400', scSt: '₹400' },
      links: { apply: 'https://uppbpb.gov.in', official: 'https://uppbpb.gov.in' },
      ingestedAt: new Date().toISOString(),
      reviewStatus: 'pending' as const
    };

    try {
      // Direct Firestore write guarantee
      await saveStagingJobToFirestore(testPost);

      // Also invoke server staging API if active
      await fetch('/api/v1/jobs/staging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pipelineConfig.webhookSecret}`
        },
        body: JSON.stringify({
          posts: [testPost],
          sourceType: 'github_backend',
          sourceName: 'GitHub Actions Auto-Scraper'
        })
      }).catch(() => {});

      onToast('🎉 Test Job successfully injected into Backend Staging (Firebase)!');
    } catch (err: any) {
      onToast(`❌ Failed to send test: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  // GitHub Actions Workflow YAML
  const githubActionYaml = `# .github/workflows/scraper_pipeline.yml
# GovtBharat Job Portal - Independent Backend Scraper Daemon
# Automatically runs on a schedule and feeds new jobs into Firebase Staging

name: GovtBharat Automated Scraper & Backend Feed

on:
  schedule:
    # Runs every 2 hours (00:00, 02:00, 04:00, ...)
    - cron: '0 */2 * * *'
  workflow_dispatch: # Allows manual trigger from GitHub UI

jobs:
  scrape-and-ingest:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Backend Repository
        uses: actions/checkout@v4

      - name: Setup Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Dependencies
        run: |
          pip install requests beautifulsoup4 feedparser

      - name: Run Scraper & Push to GovtBharat Staging
        env:
          GovtBharat_WEBHOOK_URL: "\${{ secrets.GovtBharat_WEBHOOK_URL }}"
          GovtBharat_BACKEND_TOKEN: "\${{ secrets.GovtBharat_BACKEND_TOKEN }}"
        run: |
          python scraper_daemon.py
`;

  // Python Scraper Script
  const pythonScraperScript = `# scraper_daemon.py
# GovtBharat Government Job Scraper - GitHub Backend Daemon
# Runs independently on GitHub Actions & feeds into Firebase Staging

import os
import requests
import feedparser
from datetime import datetime

# 1. Configuration (Set these in GitHub Repository Secrets)
WEBHOOK_URL = os.environ.get("GovtBharat_WEBHOOK_URL", "${webhookUrl}")
BACKEND_TOKEN = os.environ.get("GovtBharat_BACKEND_TOKEN", "${pipelineConfig.webhookSecret}")

# 2. Official Government Feeds to Scrape
OFFICIAL_FEEDS = [
    {
        "name": "Staff Selection Commission (SSC)",
        "url": "https://ssc.gov.in",
        "category": "latest-jobs",
        "state": "Central"
    },
    {
        "name": "National Testing Agency (NTA)",
        "url": "https://nta.ac.in",
        "category": "admit-cards",
        "state": "Central"
    },
    {
        "name": "Union Public Service Commission (UPSC)",
        "url": "https://upsc.gov.in",
        "category": "results",
        "state": "Central"
    },
    {
        "name": "Railway Recruitment Boards (RRB)",
        "url": "https://indianrailways.gov.in",
        "category": "latest-jobs",
        "state": "Central"
    }
]

def push_to_GovtBharat_staging(jobs_batch):
    if not jobs_batch:
        print("ℹ️ No new jobs to push.")
        return

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {BACKEND_TOKEN}"
    }

    payload = {
        "posts": jobs_batch,
        "sourceType": "github_backend",
        "sourceName": "GitHub Actions Auto-Scraper Daemon"
    }

    print(f"🚀 Pushing {len(jobs_batch)} jobs to GovtBharat Backend Staging: {WEBHOOK_URL}")
    try:
        response = requests.post(WEBHOOK_URL, json=payload, headers=headers, timeout=20)
        print(f"✅ Response ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"❌ Failed to push to webhook: {e}")

def main():
    print("⚡ GovtBharat Backend Scraper Started at:", datetime.now().isoformat())
    collected_jobs = []

    for feed in OFFICIAL_FEEDS:
        print(f"📡 Processing feed: {feed['name']} ({feed['url']})")
        # In your production script, fetch HTML or RSS XML using BeautifulSoup or feedparser
        # Example structured item:
        today_str = datetime.now().strftime("%d-%m-%Y")
        item = {
            "title": f"{feed['name']} Latest Official Recruitment Notice 2026",
            "category": feed["category"],
            "postDate": today_str,
            "state": feed["state"],
            "shortInfo": f"New official job announcement extracted from {feed['name']} portal.",
            "dates": {
                "start": today_str,
                "last": "30-10-2026"
            },
            "fees": {
                "general": "₹100",
                "scSt": "₹0"
            },
            "links": {
                "apply": feed["url"],
                "official": feed["url"]
            }
        }
        collected_jobs.append(item)

    push_to_GovtBharat_staging(collected_jobs)
    print("🎯 Scraper execution finished successfully.")

if __name__ == "__main__":
    main()
`;

  // Direct Firestore Python script
  const directFirestoreScript = `# direct_firebase_scraper.py
# If you prefer writing directly to Firebase Firestore from GitHub Actions without an HTTP server!
# Requirements: pip install firebase-admin

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# 1. Load Firebase Service Account from GitHub Secrets
# (Store your Firebase Service Account JSON string in GitHub Secret: FIREBASE_SERVICE_ACCOUNT)
service_account_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
cred = credentials.Certificate(service_account_info)
firebase_admin.initialize_app(cred)
db = firestore.client()

def save_to_staging(job_item):
    staging_id = f"stage-gh-{int(datetime.now().timestamp() * 1000)}"
    job_item["id"] = staging_id
    job_item["stagingId"] = staging_id
    job_item["sourceType"] = "github_backend"
    job_item["ingestedAt"] = datetime.now().isoformat()
    job_item["reviewStatus"] = "pending"

    # Writes directly to Firestore collection 'staging_jobs'
    db.collection("staging_jobs").document(staging_id).set(job_item, merge=True)
    print(f"✅ Saved to Firestore staging_jobs: {job_item['title']}")

print("🔥 Connected directly to Firebase Firestore Staging Pipeline!")
`;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-purple-950/40 shrink-0">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-black text-white tracking-tight">
                  GitHub Backend Repository &amp; Staging Architecture
                </h3>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Two-Tier Data Safety
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Aapka Main Data (Live Jobs) aur Backend Data (Staging Jobs) alag-alag Firebase collections me surakshit rahenge.
                Jab bhi aap AI Studio me naya code update karenge ya naya function publish karenge, aapka live data refresh ya delete nahi hoga!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSendTestJob}
              disabled={isSendingTest}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className={`w-4 h-4 ${isSendingTest ? 'animate-bounce' : ''}`} />
              <span>{isSendingTest ? 'Sending Test Post...' : '🚀 Test Ingest to Staging'}</span>
            </button>
          </div>
        </div>

        {/* Quick Credentials Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800/80">
          {/* Endpoint */}
          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-400">Webhook Ingest URL (POST)</span>
              <p className="text-xs font-mono text-slate-200 truncate">{webhookUrl}</p>
            </div>
            <button
              onClick={() => copyToClipboard(webhookUrl, 'webhook-url')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'webhook-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>

          {/* Secret Token */}
          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-emerald-400">Bearer Secret Token</span>
              <p className="text-xs font-mono text-slate-200 truncate">{pipelineConfig.webhookSecret}</p>
            </div>
            <button
              onClick={() => copyToClipboard(pipelineConfig.webhookSecret, 'secret-token')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'secret-token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* GitHub Repo Link Input */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={pipelineConfig.githubRepoUrl || ''}
            onChange={(e) => setPipelineConfig(prev => ({ ...prev, githubRepoUrl: e.target.value }))}
            placeholder="Apna GitHub Backend Repo URL yahan dalein (e.g. https://github.com/username/GovtBharat-backend-scraper)"
            className="flex-1 px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSaveRepoUrl}
            disabled={isSavingRepo}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
          >
            {isSavingRepo ? 'Saving...' : 'Save Repo URL'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-purple-600 text-white font-extrabold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Step-by-Step Setup Guide (Hindi / English)</span>
        </button>

        <button
          onClick={() => setActiveTab('github_actions')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'github_actions'
              ? 'bg-purple-600 text-white font-extrabold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>.github/workflows/scraper.yml</span>
        </button>

        <button
          onClick={() => setActiveTab('python_script')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'python_script'
              ? 'bg-purple-600 text-white font-extrabold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Python Scraper (scraper_daemon.py)</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase_direct')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'firebase_direct'
              ? 'bg-purple-600 text-white font-extrabold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Direct Firebase Admin Script (Alternative)</span>
        </button>
      </div>

      {/* TAB 1: GUIDE */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>GitHub Backend Repository Setup Step-by-Step</span>
              </h4>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl">
                  <strong className="text-purple-900 dark:text-purple-200 font-bold block mb-1">
                    1. GitHub me Naya Repository Banayein:
                  </strong>
                  GitHub par jaakar ek new repository banayein (e.g. <code>GovtBharat-backend-scraper</code>). Yeh repository aapke scraper aur cron automation ko chalayega.
                </div>

                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl">
                  <strong className="text-blue-900 dark:text-blue-200 font-bold block mb-1">
                    2. GitHub Secrets Add Karein (Settings &gt; Secrets and Variables &gt; Actions):
                  </strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 font-mono text-[11px]">
                    <li><strong>GovtBharat_WEBHOOK_URL</strong>: <code>{webhookUrl}</code></li>
                    <li><strong>GovtBharat_BACKEND_TOKEN</strong>: <code>{pipelineConfig.webhookSecret}</code></li>
                  </ul>
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl">
                  <strong className="text-emerald-900 dark:text-emerald-200 font-bold block mb-1">
                    3. Workflow File aur Python Script Upload Karein:
                  </strong>
                  <p>
                    Upar diye gaye tab se <code>.github/workflows/scraper.yml</code> aur <code>scraper_daemon.py</code> copy karke apne repository me push kar dijiye.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl">
                  <strong className="text-amber-900 dark:text-amber-200 font-bold block mb-1">
                    4. Data Safety Guarantee (Kyu Refresh Nahi Hoga?):
                  </strong>
                  <p>
                    Aapka scraper naye jobs direct Firebase ke <code className="bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded font-mono">staging_jobs</code> me daalta hai. 
                    Jab tak aap Super Admin panel se <strong>"Publish All to Live Portal"</strong> nahi dabate, public ko koi disturbance nahi hota.
                    Aur jab aap AI Studio me naya code update karenge, tab bhi Firebase ke live jobs safe rahenge!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Test Card */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-4">
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Test via cURL</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Aap apne computer ya terminal se bhi direct job push karke test kar sakte hain:
              </p>
              
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto">
                <pre>{`curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${pipelineConfig.webhookSecret}" \\
  -d '{
    "title": "SSC CHSL Recruitment 2026",
    "category": "latest-jobs",
    "state": "Central"
  }'`}</pre>
              </div>

              <button
                onClick={() => copyToClipboard(`curl -X POST "${webhookUrl}" -H "Content-Type: application/json" -H "Authorization: Bearer ${pipelineConfig.webhookSecret}" -d '{"title": "SSC CHSL Recruitment 2026", "category": "latest-jobs", "state": "Central"}'`, 'curl-test')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'curl-test' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy cURL Command</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GITHUB ACTIONS YAML */}
      {activeTab === 'github_actions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-white">.github/workflows/scraper_pipeline.yml</span>
            </div>
            <button
              onClick={() => copyToClipboard(githubActionYaml, 'action-yaml')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === 'action-yaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Workflow File</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px]">
            <pre>{githubActionYaml}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: PYTHON SCRAPER SCRIPT */}
      {activeTab === 'python_script' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-white">scraper_daemon.py</span>
            </div>
            <button
              onClick={() => copyToClipboard(pythonScraperScript, 'py-script')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === 'py-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Python Script</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px]">
            <pre>{pythonScraperScript}</pre>
          </div>
        </div>
      )}

      {/* TAB 4: DIRECT FIREBASE SCRIPT */}
      {activeTab === 'firebase_direct' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-white">direct_firebase_scraper.py</span>
            </div>
            <button
              onClick={() => copyToClipboard(directFirestoreScript, 'firebase-direct')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === 'firebase-direct' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Firebase Admin Script</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px]">
            <pre>{directFirestoreScript}</pre>
          </div>
        </div>
      )}

    </div>
  );
};
