import React, { useState, useEffect } from 'react';
import { EmployeeUser } from '../types';
import { Eye, EyeOff, KeyRound, Edit3, ShieldAlert, CheckCircle2, RotateCcw, X, ShieldCheck } from 'lucide-react';
import { getSuperAdminCredentials, updateSuperAdminCredentials } from '../services/firestoreService';


interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees?: EmployeeUser[];
  onLoginSuccess: (userType: 'superadmin' | 'admin' | 'employee', employee?: EmployeeUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, employees = [], onLoginSuccess }) => {
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Credentials State
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [currentSuperUser, setCurrentSuperUser] = useState('Vikaspatelaoc');
  const [currentSuperPass, setCurrentSuperPass] = useState('JTY@67YVP');

  // Edit Form Fields
  const [verifyOldUser, setVerifyOldUser] = useState('');
  const [verifyOldPass, setVerifyOldPass] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Load configured Super Admin credentials on mount
  useEffect(() => {
    // 1. Initial quick load from localStorage for rapid UX
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('GovtBharat_superadmin_user');
      const savedPass = localStorage.getItem('GovtBharat_superadmin_pass');
      if (savedUser) setCurrentSuperUser(savedUser);
      if (savedPass) setCurrentSuperPass(savedPass);
    }

    // 2. Real-time fetch and sync from Firestore to update local cache
    if (isOpen) {
      getSuperAdminCredentials().then(creds => {
        if (creds) {
          setCurrentSuperUser(creds.username);
          setCurrentSuperPass(creds.password);
          if (typeof window !== 'undefined') {
            localStorage.setItem('GovtBharat_superadmin_user', creds.username);
            localStorage.setItem('GovtBharat_superadmin_pass', creds.password);
          }
        }
      }).catch(err => {
        console.error("Failed to sync super admin credentials from Firestore on open:", err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Fetch live credentials from Firestore to ensure global verification across devices
    let activeSuperUser = 'Vikaspatelaoc';
    let activeSuperPass = 'JTY@67YVP';

    try {
      const creds = await getSuperAdminCredentials();
      if (creds) {
        activeSuperUser = creds.username;
        activeSuperPass = creds.password;
        
        // Sync local storage and state
        if (typeof window !== 'undefined') {
          localStorage.setItem('GovtBharat_superadmin_user', creds.username);
          localStorage.setItem('GovtBharat_superadmin_pass', creds.password);
        }
        setCurrentSuperUser(creds.username);
        setCurrentSuperPass(creds.password);
      }
    } catch (err) {
      console.warn("Real-time cloud credential verification failed, using local cache:", err);
      activeSuperUser = typeof window !== 'undefined' 
        ? (localStorage.getItem('GovtBharat_superadmin_user') || 'Vikaspatelaoc') 
        : 'Vikaspatelaoc';
      activeSuperPass = typeof window !== 'undefined' 
        ? (localStorage.getItem('GovtBharat_superadmin_pass') || 'JTY@67YVP') 
        : 'JTY@67YVP';
    }

    if (role === 'superadmin') {
      if (username === activeSuperUser && password === activeSuperPass) {
        onLoginSuccess('superadmin');
        setUsername('');
        setPassword('');
      } else {
        setErrorMsg('⚠️ Invalid Super Admin ID or Password. Check your credentials or click "Edit / Reset Credentials".');
      }
    } else {
      // Check Admin / Super Admin credentials
      if (username === activeSuperUser && password === activeSuperPass) {
        onLoginSuccess('superadmin');
        setUsername('');
        setPassword('');
        return;
      }

      // Check Employee IDs created by Super Admin
      const emp = employees.find(e => e.username === username && e.password === password);
      if (emp) {
        if (emp.status === 'suspended') {
          setErrorMsg('⚠️ Aapka ID Suspend kar diya gaya hai. Super Admin se sampark karein.');
          return;
        }
        onLoginSuccess('employee', emp);
        setUsername('');
        setPassword('');
      } else {
        setErrorMsg('⚠️ You may have entered the wrong User ID or password or your account may be locked.');
      }
    }
  };

  const handleSaveNewCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    let activeSuperUser = typeof window !== 'undefined' 
      ? (localStorage.getItem('GovtBharat_superadmin_user') || 'Vikaspatelaoc') 
      : 'Vikaspatelaoc';
    let activeSuperPass = typeof window !== 'undefined' 
      ? (localStorage.getItem('GovtBharat_superadmin_pass') || 'JTY@67YVP') 
      : 'JTY@67YVP';

    try {
      const creds = await getSuperAdminCredentials();
      if (creds) {
        activeSuperUser = creds.username;
        activeSuperPass = creds.password;
      }
    } catch (err) {
      console.warn("Could not fetch latest cloud credentials to verify old credentials:", err);
    }

    // Verify current credentials first
    if (verifyOldUser !== activeSuperUser || verifyOldPass !== activeSuperPass) {
      setErrorMsg('⚠️ Current Username or Password is incorrect! Verification failed.');
      return;
    }

    if (!newUsername.trim() || !newPassword.trim()) {
      setErrorMsg('⚠️ New Username and Password cannot be empty.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('⚠️ New Password must be at least 6 characters.');
      return;
    }

    try {
      // Save new credentials globally to Firestore cloud
      await updateSuperAdminCredentials(newUsername.trim(), newPassword.trim());

      // Save to local storage for quick access
      localStorage.setItem('GovtBharat_superadmin_user', newUsername.trim());
      localStorage.setItem('GovtBharat_superadmin_pass', newPassword.trim());
      setCurrentSuperUser(newUsername.trim());
      setCurrentSuperPass(newPassword.trim());

      setSuccessMsg('✅ Super Admin Username & Password updated globally across all devices successfully!');
      setVerifyOldUser('');
      setVerifyOldPass('');
      setNewUsername('');
      setNewPassword('');
      
      setTimeout(() => {
        setIsEditingCredentials(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg('⚠️ Failed to save credentials in Cloud database: ' + (err?.message || err));
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Reset Super Admin credentials globally to default (User: Vikaspatelaoc / Pass: JTY@67YVP)?')) {
      try {
        await updateSuperAdminCredentials('Vikaspatelaoc', 'JTY@67YVP');

        localStorage.removeItem('GovtBharat_superadmin_user');
        localStorage.removeItem('GovtBharat_superadmin_pass');
        setCurrentSuperUser('Vikaspatelaoc');
        setCurrentSuperPass('JTY@67YVP');
        setSuccessMsg('✅ Reset to Default Super Admin Credentials globally!');
        setTimeout(() => {
          setIsEditingCredentials(false);
          setSuccessMsg(null);
        }, 1200);
      } catch (err: any) {
        setErrorMsg('⚠️ Failed to reset credentials in Cloud database: ' + (err?.message || err));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 transform scale-95 transition-all overflow-y-auto max-h-[92vh] my-auto relative custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg> 
            {isEditingCredentials ? 'Edit Super Admin Credentials' : 'Portal Login Panel'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg cursor-pointer">
            &times;
          </button>
        </div>

        {/* Role Selector Tabs (when not editing) */}
        {!isEditingCredentials && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => { setRole('admin'); setErrorMsg(null); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${role === 'admin' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              👤 Admin / Employee
            </button>
            <button
              type="button"
              onClick={() => { setRole('superadmin'); setErrorMsg(null); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${role === 'superadmin' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              👑 Super Admin
            </button>
          </div>
        )}

        {/* EDIT CREDENTIALS VIEW */}
        {isEditingCredentials ? (
          <form onSubmit={handleSaveNewCredentials} className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px]">
              🔒 <strong>Security Verification:</strong> Enter current credentials to set new Username & Password.
            </div>

            <div>
              <label className="block mb-1 text-slate-800 dark:text-slate-200">Current Username *</label>
              <input 
                type="text" 
                required 
                placeholder="Enter Current Username" 
                value={verifyOldUser} 
                onChange={e => setVerifyOldUser(e.target.value)} 
                className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 text-xs" 
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-800 dark:text-slate-200">Current Password *</label>
              <input 
                type="password" 
                required 
                placeholder="Enter Current Password" 
                value={verifyOldPass} 
                onChange={e => setVerifyOldPass(e.target.value)} 
                className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 text-xs" 
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block mb-1 text-emerald-600 dark:text-emerald-400 font-bold">New Username *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. MasterAdmin2026" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)} 
                className="w-full border border-emerald-400/40 bg-transparent rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-mono" 
              />
            </div>

            <div>
              <label className="block mb-1 text-emerald-600 dark:text-emerald-400 font-bold">New Password *</label>
              <div className="relative">
                <input 
                  type={showNewPass ? 'text' : 'password'} 
                  required 
                  placeholder="Minimum 6 characters" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className="w-full border border-emerald-400/40 bg-transparent rounded-lg p-2 pr-9 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 text-xs" 
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="text-[11px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="text-[11px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                {successMsg}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => { setIsEditingCredentials(false); setErrorMsg(null); setSuccessMsg(null); }}
                className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD LOGIN VIEW */
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div>
              <label className="block mb-1 text-slate-800 dark:text-slate-200">
                {role === 'superadmin' ? 'Super Admin Username *' : 'Username *'}
              </label>
              <input 
                type="text" 
                required 
                placeholder="Enter Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-800 dark:text-slate-200">Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  placeholder="Enter Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded-lg p-2.5 pr-10 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500 transition-colors" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer flex items-center justify-center z-10"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {errorMsg && (
              <div className="text-[11px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                {errorMsg}
              </div>
            )}
            <div className="pt-2">
              <button 
                type="submit" 
                className={`w-full font-bold py-2.5 rounded-lg shadow-md transition-all cursor-pointer ${role === 'superadmin' ? 'bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-amber-300 border border-amber-500/50 hover:from-blue-900 hover:to-indigo-900' : 'bg-blue-900 text-white hover:bg-blue-800'}`}
              >
                {role === 'superadmin' ? '👑 Login as Super Admin' : 'Secure Verify & Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
