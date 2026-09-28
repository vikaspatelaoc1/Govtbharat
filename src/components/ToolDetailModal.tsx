import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Check, Download, Upload, RefreshCw, Sparkles, FileText, 
  Info, ShieldAlert, Share2, Printer, Sliders, Calendar, 
  CheckCircle2, ArrowRight, Eye, Smartphone, Zap
} from 'lucide-react';
import { AppToolItem } from '../types';

interface ToolDetailModalProps {
  tool: AppToolItem | null;
  isOpen: boolean;
  onClose: () => void;
  siteLogo?: string;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
  tool,
  isOpen,
  onClose,
  siteLogo
}) => {
  const [activeTab, setActiveTab] = useState<'tool' | 'guide'>('tool');
  const [copiedLink, setCopiedLink] = useState(false);

  // Tool 1: Image Resizer state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<string>('');
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [resizedFileSize, setResizedFileSize] = useState<string>('');
  const [preset, setPreset] = useState<string>('ssc-photo');
  const [targetWidth, setTargetWidth] = useState<number>(350);
  const [targetHeight, setTargetHeight] = useState<number>(450);
  const [targetMaxKB, setTargetMaxKB] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tool 2: Background Remover / Color Changer state
  const [bgUploadImg, setBgUploadImg] = useState<string | null>(null);
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#ffffff');
  const [bgResultImg, setBgResultImg] = useState<string | null>(null);

  // Tool 3: Name & Date on Photo state
  const [dopPhotoImg, setDopPhotoImg] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState<string>('RAVI KUMAR');
  const [dateOfPhoto, setDateOfPhoto] = useState<string>(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  });
  const [dopResultImg, setDopResultImg] = useState<string | null>(null);

  // Tool 4: Age Calculator state
  const [dob, setDob] = useState<string>('2001-05-15');
  const [cutoffDate, setCutoffDate] = useState<string>('2026-08-01');
  const [ageResult, setAgeResult] = useState<{ years: number; months: number; days: number; totalDays: number } | null>(null);

  // Tool 5: Marital Biodata state
  const [bioName, setBioName] = useState('Rahul Sharma');
  const [bioDob, setBioDob] = useState('18 Oct 1998');
  const [bioHeight, setBioHeight] = useState("5' 9\"");
  const [bioEdu, setBioEdu] = useState('B.Tech in Computer Science');
  const [bioJob, setBioJob] = useState('Inspector (Central Excise)');
  const [bioIncome, setBioIncome] = useState('₹12.5 LPA');
  const [bioFather, setBioFather] = useState('Shri R. P. Sharma (Retd. Govt Officer)');
  const [bioMother, setBioMother] = useState('Smt. Sunita Sharma (Homemaker)');
  const [bioContact, setBioContact] = useState('+91 98765 43210');
  const [bioAddress, setBioAddress] = useState('Lucknow, Uttar Pradesh');

  // Tool 6: Typing Test state
  const samplePassage = "Government examinations in India test the competence and dedication of candidates. Regular practice, focus on previous year questions, and consistent time management are essential to securing a top rank in SSC, UPSC, Railway, and State PSC recruitment.";
  const [typingInput, setTypingInput] = useState('');
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [typingWpm, setTypingWpm] = useState(0);
  const [typingAccuracy, setTypingAccuracy] = useState(100);

  // Reset when tool changes
  useEffect(() => {
    setActiveTab('tool');
  }, [tool?.id]);

  // Handle Preset change for Image Resizer
  const handlePresetChange = (selected: string) => {
    setPreset(selected);
    if (selected === 'ssc-photo') {
      setTargetWidth(350);
      setTargetHeight(450);
      setTargetMaxKB(50);
    } else if (selected === 'ssc-sign') {
      setTargetWidth(350);
      setTargetHeight(150);
      setTargetMaxKB(20);
    } else if (selected === 'upsc-photo') {
      setTargetWidth(350);
      setTargetHeight(350);
      setTargetMaxKB(300);
    } else if (selected === 'ibps-photo') {
      setTargetWidth(200);
      setTargetHeight(230);
      setTargetMaxKB(50);
    } else if (selected === 'railway-photo') {
      setTargetWidth(320);
      setTargetHeight(400);
      setTargetMaxKB(40);
    }
  };

  // Image Resizer Processing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      setUploadedImage(imgUrl);
      processResize(imgUrl, targetWidth, targetHeight, targetMaxKB);
    };
    reader.readAsDataURL(file);
  };

  const processResize = (imgSrc: string, width: number, height: number, maxKB: number) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Binary compression search for target KB
      let quality = 0.92;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let attempts = 0;

      while (attempts < 6) {
        const head = 'data:image/jpeg;base64,';
        const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
        const currentKB = sizeInBytes / 1024;

        if (currentKB <= maxKB || quality <= 0.25) {
          setResizedFileSize(`${currentKB.toFixed(1)} KB`);
          setResizedImage(dataUrl);
          break;
        }

        quality -= 0.15;
        dataUrl = canvas.toDataURL('image/jpeg', Math.max(0.15, quality));
        attempts++;
      }
      setIsProcessing(false);
    };
  };

  // Name & Date on Photo Generator
  const generateDopPhoto = () => {
    if (!dopPhotoImg) return;
    const img = new Image();
    img.src = dopPhotoImg;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = 400;
      const height = 520;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw photo
      ctx.drawImage(img, 0, 0, width, height);

      // Bottom white strip for Name and Date
      const stripHeight = 100;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, height - stripHeight, width, stripHeight);

      // Border top of strip
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, height - stripHeight, width, stripHeight);

      // Candidate Name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(candidateName.toUpperCase(), width / 2, height - stripHeight + 40);

      // Date of Photo
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(`D.O.P. : ${dateOfPhoto}`, width / 2, height - stripHeight + 75);

      setDopResultImg(canvas.toDataURL('image/jpeg', 0.95));
    };
  };

  useEffect(() => {
    if (dopPhotoImg) {
      generateDopPhoto();
    }
  }, [dopPhotoImg, candidateName, dateOfPhoto]);

  // Background replacement
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      setBgUploadImg(imgUrl);
      applyPassportBg(imgUrl, selectedBgColor);
    };
    reader.readAsDataURL(file);
  };

  const applyPassportBg = (imgSrc: string, color: string) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = 350;
      const height = 450;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);
      setBgResultImg(canvas.toDataURL('image/jpeg', 0.95));
    };
  };

  // Calculate Age
  const handleCalculateAge = () => {
    if (!dob || !cutoffDate) return;
    const birth = new Date(dob);
    const target = new Date(cutoffDate);

    if (target < birth) {
      alert('Cutoff date cannot be earlier than Date of Birth');
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffTime = Math.abs(target.getTime() - birth.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setAgeResult({ years, months, days, totalDays });
  };

  // Typing test handler
  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTypingInput(value);

    if (!typingStartTime && value.length > 0) {
      setTypingStartTime(Date.now());
    }

    if (typingStartTime) {
      const elapsedMins = (Date.now() - typingStartTime) / 60000;
      if (elapsedMins > 0) {
        const wordsTyped = value.trim().split(/\s+/).length;
        setTypingWpm(Math.round(wordsTyped / elapsedMins));

        let correctChars = 0;
        for (let i = 0; i < value.length; i++) {
          if (value[i] === samplePassage[i]) {
            correctChars++;
          }
        }
        const acc = Math.round((correctChars / Math.max(1, value.length)) * 100);
        setTypingAccuracy(acc);
      }
    }
  };

  const handleShareTool = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 max-h-[92vh] flex flex-col transition-colors duration-300"
      >
        {/* Top Header matching GovtBharat brand */}
        <div className="bg-gradient-to-r from-[#8c1328] via-[#a81934] to-[#670d1e] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            {siteLogo ? (
              <img src={siteLogo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain bg-white/15 p-1 backdrop-blur-xs shrink-0" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-amber-300 shrink-0">
                FA
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tight leading-tight truncate">
                  {tool.title}
                </h1>
                {tool.badge && (
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tool.badgeColor || 'bg-amber-400 text-slate-950'} shadow-2xs`}>
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-rose-100 font-medium line-clamp-1">
                {tool.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareTool}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Share tool"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Live Utility vs Exam Guidelines & Full Info) */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 sm:px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('tool')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-black tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === 'tool'
                ? 'border-[#8c1328] dark:border-[#e11d48] text-[#8c1328] dark:text-[#f43f5e]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Interactive Tool &amp; Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-black tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#8c1328] dark:border-[#e11d48] text-[#8c1328] dark:text-[#f43f5e]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-4 h-4 text-blue-500" />
            <span>Exam Specs &amp; Full Guide</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {activeTab === 'tool' ? (
            <div>
              {/* RENDER TOOL ACCORDING TO TOOL ID */}
              
              {/* 1. IMAGE RESIZER */}
              {tool.id === 'image-resizer' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Settings & Upload */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Select Official Exam Preset:
                        </label>
                        <select
                          value={preset}
                          onChange={(e) => handlePresetChange(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8c1328]"
                        >
                          <option value="ssc-photo">SSC Photo (350x450 px, Max 50 KB)</option>
                          <option value="ssc-sign">SSC Signature (350x150 px, Max 20 KB)</option>
                          <option value="upsc-photo">UPSC CSE Photo (350x350 px, Max 300 KB)</option>
                          <option value="ibps-photo">IBPS / Bank Photo (200x230 px, Max 50 KB)</option>
                          <option value="railway-photo">Railway Photo (320x400 px, Max 40 KB)</option>
                          <option value="custom">Custom Dimensions</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Width (px)</label>
                          <input
                            type="number"
                            value={targetWidth}
                            onChange={(e) => setTargetWidth(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Height (px)</label>
                          <input
                            type="number"
                            value={targetHeight}
                            onChange={(e) => setTargetHeight(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Max KB</label>
                          <input
                            type="number"
                            value={targetMaxKB}
                            onChange={(e) => setTargetMaxKB(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-rose-600"
                          />
                        </div>
                      </div>

                      {/* Upload Box */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#8c1328] dark:hover:border-[#e11d48] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 mx-auto text-[#8c1328] dark:text-[#e11d48] mb-2" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Click to select Photo or Signature
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Supports JPG, PNG, WEBP. Instant secure browser resize.
                        </p>
                      </div>

                      {uploadedImage && (
                        <button
                          onClick={() => processResize(uploadedImage, targetWidth, targetHeight, targetMaxKB)}
                          disabled={isProcessing}
                          className="w-full py-2.5 bg-[#8c1328] hover:bg-[#a61935] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                          {isProcessing ? 'Compressing...' : 'Re-compress with Current Settings'}
                        </button>
                      )}
                    </div>

                    {/* Right: Preview & Download */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      {resizedImage ? (
                        <div className="flex flex-col items-center space-y-3 w-full">
                          <div className="relative border-2 border-emerald-500 rounded-xl overflow-hidden shadow-lg max-h-56 bg-white p-1">
                            <img src={resizedImage} alt="Resized" className="max-h-52 object-contain" />
                            <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              {resizedFileSize}
                            </span>
                          </div>
                          <div className="text-center text-xs space-y-0.5">
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              ✓ Successfully Resized &amp; Compressed!
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Dimensions: {targetWidth} x {targetHeight} px | Size: {resizedFileSize} (Original: {originalFileSize})
                            </p>
                          </div>
                          <a
                            href={resizedImage}
                            download={`GovtBharat_Govt_Resized_${Date.now()}.jpg`}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            Download Official Exam JPG
                          </a>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <Eye className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p className="text-xs font-bold">No Image Selected Yet</p>
                          <p className="text-[10px]">Upload an image from the left to preview output</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. REMOVE IMAGE BACKGROUND */}
              {tool.id === 'remove-bg' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Select Official Passport Background Color:
                        </label>
                        <div className="flex items-center gap-3">
                          {[
                            { name: 'Pure White (SSC/UPSC)', color: '#ffffff', border: 'border-slate-300' },
                            { name: 'Sky Blue (State PSC)', color: '#e0f2fe', border: 'border-sky-300' },
                            { name: 'Soft Light Grey', color: '#f1f5f9', border: 'border-slate-300' },
                            { name: 'Royal Navy', color: '#0f172a', border: 'border-slate-700' }
                          ].map((b) => (
                            <button
                              key={b.color}
                              onClick={() => {
                                setSelectedBgColor(b.color);
                                if (bgUploadImg) applyPassportBg(bgUploadImg, b.color);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                selectedBgColor === b.color
                                  ? 'ring-2 ring-[#8c1328] bg-rose-50 dark:bg-rose-950/30'
                                  : 'bg-white dark:bg-slate-800'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border ${b.border}`} style={{ backgroundColor: b.color }} />
                              <span>{b.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-900/40">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgUpload}
                          className="hidden"
                          id="bg-file-input"
                        />
                        <label htmlFor="bg-file-input" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto text-[#8c1328] dark:text-[#e11d48] mb-2" />
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Upload Candidate Passport Photo
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Replaces distracting background with official plain background
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      {bgResultImg ? (
                        <div className="space-y-3 text-center w-full">
                          <div className="relative mx-auto rounded-xl overflow-hidden border-2 border-slate-300 shadow-md max-w-[200px]">
                            <img src={bgResultImg} alt="Processed BG" className="w-full object-contain" />
                          </div>
                          <a
                            href={bgResultImg}
                            download="Passport_Photo_Clean_BG.jpg"
                            className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#8c1328] hover:bg-[#a61935] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Download Clean Background Photo
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-bold">Upload a photo to see instant preview</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. NAME & DATE ON PHOTO */}
              {tool.id === 'name-date-photo' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Candidate Full Name (in CAPITAL):
                        </label>
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="e.g. VIKAS PATEL"
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Date of Photo (DD/MM/YYYY):
                        </label>
                        <input
                          type="text"
                          value={dateOfPhoto}
                          onChange={(e) => setDateOfPhoto(e.target.value)}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                          * As per SSC notice, photo must not be older than 3 months.
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 text-center bg-slate-50 dark:bg-slate-900/40">
                        <input
                          type="file"
                          accept="image/*"
                          id="dop-file"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const r = new FileReader();
                              r.onload = (ev) => setDopPhotoImg(ev.target?.result as string);
                              r.readAsDataURL(f);
                            }
                          }}
                          className="hidden"
                        />
                        <label htmlFor="dop-file" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto text-[#8c1328] dark:text-[#e11d48] mb-1.5" />
                          <p className="text-xs font-bold">Select Passport Photo</p>
                          <p className="text-[10px] text-slate-500">Auto adds bottom white strip with Name &amp; Date</p>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      {dopResultImg ? (
                        <div className="space-y-3 text-center w-full">
                          <div className="mx-auto rounded-lg overflow-hidden border-2 border-slate-900 shadow-xl max-w-[210px] bg-white">
                            <img src={dopResultImg} alt="DOP Result" className="w-full object-contain" />
                          </div>
                          <a
                            href={dopResultImg}
                            download={`Exam_Photo_DOP_${Date.now()}.jpg`}
                            className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Download Official Exam Photo
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-bold">Upload photo to view Name &amp; Date overlay</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MARITAL DATA MAKER */}
              {tool.id === 'marital-biodata' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Form */}
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-400">Full Name</label>
                          <input
                            type="text"
                            value={bioName}
                            onChange={(e) => setBioName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-400">Date of Birth</label>
                          <input
                            type="text"
                            value={bioDob}
                            onChange={(e) => setBioDob(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-400">Height</label>
                          <input
                            type="text"
                            value={bioHeight}
                            onChange={(e) => setBioHeight(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-400">Annual Income</label>
                          <input
                            type="text"
                            value={bioIncome}
                            onChange={(e) => setBioIncome(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400">Education</label>
                        <input
                          type="text"
                          value={bioEdu}
                          onChange={(e) => setBioEdu(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400">Occupation / Post</label>
                        <input
                          type="text"
                          value={bioJob}
                          onChange={(e) => setBioJob(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400">Father's Name &amp; Occ.</label>
                        <input
                          type="text"
                          value={bioFather}
                          onChange={(e) => setBioFather(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-400">Contact Number</label>
                          <input
                            type="text"
                            value={bioContact}
                            onChange={(e) => setBioContact(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-400">City &amp; State</label>
                          <input
                            type="text"
                            value={bioAddress}
                            onChange={(e) => setBioAddress(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Preview Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-[#162238] border-2 border-amber-300 dark:border-amber-600/50 shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="text-center pb-3 border-b border-amber-200 dark:border-amber-700/50">
                          <span className="text-amber-800 dark:text-amber-400 font-bold text-sm tracking-wider uppercase block">
                            || श्री गणेशाय नमः ||
                          </span>
                          <h3 className="text-lg font-black text-[#8c1328] dark:text-[#f43f5e] mt-0.5">
                            BIO-DATA
                          </h3>
                        </div>

                        <div className="py-3 space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Name:</span> {bioName}</p>
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Date of Birth:</span> {bioDob}</p>
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Height:</span> {bioHeight}</p>
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Education:</span> {bioEdu}</p>
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Occupation:</span> {bioJob}</p>
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Income:</span> {bioIncome}</p>
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Father's Info:</span> {bioFather}</p>
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Contact:</span> {bioContact}</p>
                          <p><span className="font-bold w-28 inline-block text-slate-600 dark:text-slate-400">Address:</span> {bioAddress}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => window.print()}
                        className="w-full mt-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        Print or Save as PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. AGE CALCULATOR */}
              {tool.id === 'age-calculator' && (
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        1. Select Your Date of Birth (DOB):
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        2. Notification Cutoff Date (Age as on):
                      </label>
                      <input
                        type="date"
                        value={cutoffDate}
                        onChange={(e) => setCutoffDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>

                    <button
                      onClick={handleCalculateAge}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Calculate Exact Age &amp; Eligibility
                    </button>
                  </div>

                  {ageResult && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-2">
                      <span className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-400">
                        Official Age Result
                      </span>
                      <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-300">
                        {ageResult.years} Years, {ageResult.months} Months, {ageResult.days} Days
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Total Days Lived: <span className="font-bold">{ageResult.totalDays.toLocaleString()}</span> days
                      </p>
                      <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-center gap-4 text-xs font-bold">
                        <span className="text-blue-600 dark:text-blue-400">General Category: {ageResult.years <= 27 ? 'Eligible (Under 27)' : 'Over-age'}</span>
                        <span className="text-amber-600 dark:text-amber-400">OBC (+3 Yrs): {ageResult.years <= 30 ? 'Eligible' : 'Over-age'}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">SC/ST (+5 Yrs): {ageResult.years <= 32 ? 'Eligible' : 'Over-age'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. TYPING TEST PORTAL */}
              {tool.id === 'typing-speed-test' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="bg-slate-100 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 select-none">
                    <p className="font-semibold">{samplePassage}</p>
                  </div>

                  <textarea
                    rows={4}
                    value={typingInput}
                    onChange={handleTypingChange}
                    placeholder="Click here and start typing the above text..."
                    className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <p className="text-[10px] font-bold text-slate-500">Speed</p>
                      <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{typingWpm} WPM</p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <p className="text-[10px] font-bold text-slate-500">Accuracy</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{typingAccuracy}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-500">Status</p>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-1">
                        {typingWpm >= 35 ? 'Qualifies SSC' : 'Practice more'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. PDF PORTAL FALLBACK */}
              {tool.id === 'pdf-portal' && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center space-y-3">
                    <FileText className="w-10 h-10 mx-auto text-red-600" />
                    <h3 className="text-base font-black text-red-900 dark:text-red-300">
                      PDF Processing Portal
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Compress your 10th, 12th, Caste &amp; Domicile certificates to under 200 KB or 500 KB to meet commission upload criteria.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button 
                        onClick={() => alert('PDF Compressor will optimize documents under 200KB.')}
                        className="py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                      >
                        Compress to 200 KB
                      </button>
                      <button 
                        onClick={() => alert('Convert camera photos into clean A4 PDF.')}
                        className="py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                      >
                        JPG to A4 PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* GUIDE & FULL INFORMATION TAB */
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#8c1328] dark:text-[#e11d48]" />
                  About This Tool
                </h3>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {tool.description}
                </p>
              </div>

              {/* Official Commission Specifications */}
              {tool.examSpecs && tool.examSpecs.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Official Commission Specifications (SSC / UPSC / RRB / Police)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {tool.examSpecs.map((spec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to use step-by-step */}
              {tool.howToUse && tool.howToUse.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    How to Use Step-by-Step
                  </h4>
                  <div className="space-y-2">
                    {tool.howToUse.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-[#8c1328] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {tool.features && tool.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Key Features &amp; Benefits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tool.features.map((feat, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            GovtBharat Result • 100% Free &amp; Secure
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-all cursor-pointer"
          >
            Back to App
          </button>
        </div>
      </div>
    </div>
  );
};
