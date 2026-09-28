import React, { useState } from 'react';
import { 
  Send, 
  MessageCircle, 
  Youtube, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Globe, 
  ExternalLink, 
  Edit3, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Link as LinkIcon,
  Eye,
  RefreshCw,
  Share2
} from 'lucide-react';
import { SocialLinkItem, SocialPlatform } from '../types';
import { defaultSocialLinks } from '../data';
import { OfficialSocialLogo } from './SocialIcons';

interface SocialLinksManagerProps {
  socialLinks: SocialLinkItem[];
  setSocialLinks: (links: SocialLinkItem[]) => void;
  onSaveToFirestore: (links: SocialLinkItem[]) => Promise<void>;
  onToast: (msg: string) => void;
}

export const getSocialIcon = (platform: SocialPlatform, className = "w-5 h-5") => {
  return <OfficialSocialLogo platform={platform} className={className} />;
};

export const getSocialTheme = (platform: SocialPlatform) => {
  switch (platform) {
    case 'telegram':
      return {
        bg: 'from-sky-500 to-blue-600',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        color: '#0088cc',
        name: 'Telegram'
      };
    case 'whatsapp':
      return {
        bg: 'from-emerald-500 to-green-600',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        color: '#25D366',
        name: 'WhatsApp'
      };
    case 'youtube':
      return {
        bg: 'from-rose-500 to-red-600',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        color: '#FF0000',
        name: 'YouTube'
      };
    case 'instagram':
      return {
        bg: 'from-pink-500 via-rose-500 to-amber-500',
        text: 'text-pink-400',
        border: 'border-pink-500/30',
        badge: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
        color: '#E1306C',
        name: 'Instagram'
      };
    case 'twitter':
      return {
        bg: 'from-slate-700 to-slate-900',
        text: 'text-sky-300',
        border: 'border-slate-500/30',
        badge: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
        color: '#1DA1F2',
        name: 'Twitter (X)'
      };
    case 'facebook':
      return {
        bg: 'from-blue-600 to-indigo-700',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        color: '#1877F2',
        name: 'Facebook'
      };
    case 'linkedin':
      return {
        bg: 'from-blue-700 to-sky-800',
        text: 'text-blue-300',
        border: 'border-blue-500/30',
        badge: 'bg-blue-700/20 text-blue-300 border-blue-600/30',
        color: '#0077B5',
        name: 'LinkedIn'
      };
    default:
      return {
        bg: 'from-amber-500 to-orange-600',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        color: '#ffb703',
        name: 'Custom Web / Link'
      };
  }
};

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({
  socialLinks,
  setSocialLinks,
  onSaveToFirestore,
  onToast
}) => {
  const [editingLink, setEditingLink] = useState<SocialLinkItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formPlatform, setFormPlatform] = useState<SocialPlatform>('telegram');
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formHandle, setFormHandle] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);

  const openEditModal = (item: SocialLinkItem) => {
    setEditingLink(item);
    setIsAddingNew(false);
    setFormPlatform(item.platform);
    setFormTitle(item.title);
    setFormUrl(item.url);
    setFormHandle(item.handle || '');
    setFormBadgeText(item.badgeText || '');
    setFormEnabled(item.enabled);
  };

  const openAddNewModal = () => {
    setEditingLink(null);
    setIsAddingNew(true);
    setFormPlatform('telegram');
    setFormTitle('Telegram Channel');
    setFormUrl('https://t.me/');
    setFormHandle('@GovtBharat');
    setFormBadgeText('Join Channel');
    setFormEnabled(true);
  };

  const handlePlatformSelect = (p: SocialPlatform) => {
    setFormPlatform(p);
    const theme = getSocialTheme(p);
    if (!formTitle || formTitle.includes('Channel') || formTitle.includes('Page')) {
      setFormTitle(`${theme.name} Official`);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl.trim()) {
      alert('Please enter a valid URL link (e.g. https://t.me/yourchannel)');
      return;
    }

    setIsSaving(true);
    let updatedList: SocialLinkItem[] = [];

    if (isAddingNew) {
      const newItem: SocialLinkItem = {
        id: `social-${Date.now()}`,
        platform: formPlatform,
        title: formTitle.trim() || getSocialTheme(formPlatform).name,
        url: formUrl.trim(),
        handle: formHandle.trim(),
        badgeText: formBadgeText.trim(),
        enabled: formEnabled,
        order: socialLinks.length + 1,
        updatedAt: new Date().toISOString()
      };
      updatedList = [...socialLinks, newItem];
    } else if (editingLink) {
      updatedList = socialLinks.map(item => {
        if (item.id === editingLink.id) {
          return {
            ...item,
            platform: formPlatform,
            title: formTitle.trim() || item.title,
            url: formUrl.trim(),
            handle: formHandle.trim(),
            badgeText: formBadgeText.trim(),
            enabled: formEnabled,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
    }

    setSocialLinks(updatedList);
    try {
      await onSaveToFirestore(updatedList);
      onToast(`✅ ${formTitle || 'Social link'} saved and updated for all users!`);
    } catch (err) {
      console.error('Error saving social links:', err);
      onToast('Saved locally in browser!');
    }

    setIsSaving(false);
    setEditingLink(null);
    setIsAddingNew(false);
  };

  const toggleLinkStatus = async (linkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = socialLinks.map(l => l.id === linkId ? { ...l, enabled: !l.enabled } : l);
    setSocialLinks(updated);
    try {
      await onSaveToFirestore(updated);
      onToast('Social link visibility updated!');
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDeleteLink = async (linkId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const updated = socialLinks.filter(l => l.id !== linkId);
    setSocialLinks(updated);
    try {
      await onSaveToFirestore(updated);
      onToast(`Deleted "${title}"!`);
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Reset all social links to default GovtBharat Official channels?')) return;
    setSocialLinks(defaultSocialLinks);
    try {
      await onSaveToFirestore(defaultSocialLinks);
      onToast('Social media channels reset to default!');
    } catch (err) {
      console.error('Error resetting:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 rounded-2xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Social Media & Official Channels Manager
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Live Public Sync
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Super Admin can add and edit all official social media links (Telegram, WhatsApp, YouTube, Instagram, X, Facebook). When updated, public visitors see and click them instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={openAddNewModal}
            className="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Social Link
          </button>
          <button
            onClick={handleResetToDefaults}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Reset to default official channels"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Social Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {socialLinks.map((item) => {
          const theme = getSocialTheme(item.platform);
          return (
            <div
              key={item.id}
              onClick={() => openEditModal(item)}
              className={`relative bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-0.5 ${
                item.enabled 
                  ? 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50' 
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900/50'
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    {getSocialIcon(item.platform, "w-6 h-6")}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {item.handle || theme.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => toggleLinkStatus(item.id, e)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all cursor-pointer ${
                      item.enabled 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                    title={item.enabled ? "Visible to public. Click to hide." : "Hidden from public. Click to enable."}
                  >
                    {item.enabled ? '● Active' : '○ Disabled'}
                  </button>
                </div>
              </div>

              {/* URL Display */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2 border border-slate-200 dark:border-slate-700/60 mb-3">
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.url}</span>
                </p>
              </div>

              {/* Bottom Row: Badge & Action buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                {item.badgeText ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${theme.badge}`}>
                    {item.badgeText}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Click card to edit</span>
                )}

                <div className="flex items-center gap-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Test Open Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Link Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteLink(item.id, item.title, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal Dialog */}
      {(editingLink || isAddingNew) && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  {getSocialIcon(formPlatform, "w-5 h-5")}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isAddingNew ? 'Add New Social Media Link' : `Edit ${editingLink?.title || 'Social Link'}`}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Public users will be redirected to this link upon clicking.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingLink(null);
                  setIsAddingNew(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300 max-h-[80vh] overflow-y-auto">
              {/* Platform Selector */}
              <div>
                <label className="block mb-1.5 text-slate-900 dark:text-white font-bold">
                  Select Social Media Platform *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {(['telegram', 'whatsapp', 'youtube', 'instagram', 'twitter', 'facebook', 'linkedin', 'other'] as SocialPlatform[]).map((p) => {
                    const theme = getSocialTheme(p);
                    const isSelected = formPlatform === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePlatformSelect(p)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500 dark:text-amber-400 shadow-sm font-black'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className={`mb-1 ${isSelected ? 'text-amber-500' : ''}`}>
                          {getSocialIcon(p, "w-5 h-5")}
                        </div>
                        <span className="text-[10px] capitalize truncate max-w-full">
                          {theme.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Name */}
              <div>
                <label className="block mb-1 text-slate-800 dark:text-slate-200 font-bold">
                  Channel / Page Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Telegram Channel"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Target URL */}
              <div>
                <label className="block mb-1 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-between">
                  <span>Target URL / Link * (Aapka link yahan daalein)</span>
                  {formUrl && (
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-500 hover:underline flex items-center gap-1"
                    >
                      Test Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://t.me/yourchannel ya https://whatsapp.com/channel/..."
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:border-amber-500 font-mono text-xs transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  💡 Hint: Users clicking on this social icon will directly open this URL.
                </p>
              </div>

              {/* Username / Handle & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-800 dark:text-slate-200">
                    Handle / Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @govtbharatofficial"
                    value={formHandle}
                    onChange={(e) => setFormHandle(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-800 dark:text-slate-200">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Join 150K+ Aspirants"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Visibility Switch */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Public Visibility
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Enable to display this social button on the website for public users.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormEnabled(!formEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                    formEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-400 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLink(null);
                    setIsAddingNew(false);
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-6 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Social Link
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
