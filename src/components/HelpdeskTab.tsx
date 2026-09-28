import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, Phone, Clock, CheckCircle2, AlertCircle, Search, 
  Send, Trash2, Check, RefreshCw, Plus, MessageSquare, Filter, 
  ExternalLink, Copy, Shield, Tag, CornerDownRight, Sparkles, Archive,
  ChevronDown, AlertTriangle, HelpCircle, CheckCheck, X
} from 'lucide-react';
import { HelpdeskTicket, TicketReply } from '../types';
import { subscribeToHelpdeskTickets, saveHelpdeskTicketsToFirestore } from '../services/firestoreService';

const initialDefaultTickets: HelpdeskTicket[] = [
  { 
    id: 'TK-8401', 
    name: 'Ramesh Singh', 
    email: 'ramesh.singh@gmail.com', 
    phone: '+91 98765 43210',
    category: 'Broken Link',
    issue: 'Broken Link in RRB Technician post', 
    message: 'Hello Support Team, the direct download link for RRB Technician Grade 3 Admit Card is giving 404 error on the official server. Kindly update with the mirror link.', 
    status: 'open',
    priority: 'high',
    time: '10m ago', 
    unread: true,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    replies: [
      {
        id: 'rep-1',
        sender: 'user',
        senderName: 'Ramesh Singh',
        message: 'Hello Support Team, the direct download link for RRB Technician Grade 3 Admit Card is giving 404 error on the official server. Kindly update with the mirror link.',
        timestamp: '10 mins ago'
      }
    ]
  },
  { 
    id: 'TK-8394', 
    name: 'Priya Kumari', 
    email: 'priya.k99@yahoo.com', 
    phone: '+91 91234 56789',
    category: 'Answer Key',
    issue: 'How to download CTET answer key & OMR sheet?', 
    message: 'I appeared for CTET Paper 1 and Paper 2. Where can I find the official question paper master set along with response key PDF?', 
    status: 'in_progress',
    priority: 'medium',
    time: '2h ago', 
    unread: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: 'rep-2',
        sender: 'user',
        senderName: 'Priya Kumari',
        message: 'I appeared for CTET Paper 1 and Paper 2. Where can I find the official question paper master set along with response key PDF?',
        timestamp: '2 hours ago'
      },
      {
        id: 'rep-3',
        sender: 'admin',
        senderName: 'GovtBharat Support Team',
        message: 'Dear Priya, please navigate to the "Answer Key" column on GovtBharat home page and click on CTET 2026 Answer Key. Direct link to candidate login with roll number is provided.',
        timestamp: '1 hour ago'
      }
    ]
  },
  { 
    id: 'TK-8380', 
    name: 'Amit Yadav', 
    email: 'amit.yadav.up@gmail.com', 
    category: 'Eligibility',
    issue: 'Age limit & relaxation query for SSC CGL', 
    message: 'Is 3 years OBC non-creamy layer age relaxation applicable for Junior Statistical Officer post in SSC CGL 2026? My date of birth is 15-Aug-1994.', 
    status: 'resolved',
    priority: 'low',
    time: '1d ago', 
    unread: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: 'rep-4',
        sender: 'user',
        senderName: 'Amit Yadav',
        message: 'Is 3 years OBC non-creamy layer age relaxation applicable for Junior Statistical Officer post in SSC CGL 2026? My date of birth is 15-Aug-1994.',
        timestamp: 'Yesterday'
      },
      {
        id: 'rep-5',
        sender: 'admin',
        senderName: 'Editorial Desk',
        message: 'Yes Amit, as per Central Govt reservation norms, 3 years upper age limit relaxation is valid for all OBC category candidates holding a valid central OBC-NCL certificate.',
        timestamp: 'Yesterday, 4:00 PM'
      }
    ]
  },
  { 
    id: 'TK-8372', 
    name: 'Neha Sharma', 
    email: 'neha.sharma.exam@outlook.com', 
    category: 'Admit Card',
    issue: 'Exam City Intimation Slip Date for UPSC CSE', 
    message: 'When will UPSC release the Exam City center slip for Civil Services Prelims 2026? Please verify notification timeline.', 
    status: 'closed',
    priority: 'low',
    time: '3d ago', 
    unread: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: 'rep-6',
        sender: 'user',
        senderName: 'Neha Sharma',
        message: 'When will UPSC release the Exam City center slip for Civil Services Prelims 2026? Please verify notification timeline.',
        timestamp: '3 days ago'
      },
      {
        id: 'rep-7',
        sender: 'admin',
        senderName: 'GovtBharat Admin',
        message: 'UPSC usually releases City Slip 10 days prior to exam date on upsc.gov.in. Link will be posted on Admit Card column once live.',
        timestamp: '3 days ago'
      }
    ]
  }
];

const cannedResponses = [
  { label: '🔗 Link Updated', text: 'Thank you for reporting. The official server link has been verified and updated on the GovtBharat post.' },
  { label: '🎫 Admit Card Help', text: 'Admit card servers are currently experiencing heavy traffic. Please clear your browser cache or try in incognito mode with the direct mirror link provided on our portal.' },
  { label: '📋 Eligibility Rule', text: 'Please refer to the official PDF notification attached under "Important Links" on the post for category-wise relaxation details.' },
  { label: '✅ Issue Resolved', text: 'We have resolved this inquiry. If you have any further questions or encounter any discrepancies, please feel free to reply.' }
];

interface HelpdeskTabProps {
  onToast?: (msg: string) => void;
}

export const HelpdeskTab: React.FC<HelpdeskTabProps> = ({ onToast }) => {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(() => {
    try {
      const saved = localStorage.getItem('GovtBharat_helpdesk_tickets');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return initialDefaultTickets;
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || 'TK-8401');
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Broken Link',
    issue: '',
    message: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  // Subscribe to real-time Firestore tickets
  useEffect(() => {
    const unsub = subscribeToHelpdeskTickets((cloudTickets) => {
      if (Array.isArray(cloudTickets) && cloudTickets.length > 0) {
        setTickets(cloudTickets);
        localStorage.setItem('GovtBharat_helpdesk_tickets', JSON.stringify(cloudTickets));
      }
    });
    return () => unsub();
  }, []);

  const saveTickets = async (updated: HelpdeskTicket[]) => {
    setTickets(updated);
    localStorage.setItem('GovtBharat_helpdesk_tickets', JSON.stringify(updated));
    try {
      await saveHelpdeskTicketsToFirestore(updated);
    } catch (e) {
      console.error('Error saving tickets to cloud:', e);
    }
  };

  const currentTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSelectTicket = (ticket: HelpdeskTicket) => {
    setSelectedTicketId(ticket.id);
    if (ticket.unread) {
      const updated = tickets.map(t => t.id === ticket.id ? { ...t, unread: false } : t);
      saveTickets(updated);
    }
  };

  const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    if (!currentTicket) return;
    const updated = tickets.map(t => t.id === currentTicket.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t);
    await saveTickets(updated);
    if (onToast) onToast(`Ticket status updated to "${newStatus.toUpperCase()}"`);
  };

  const handlePriorityChange = async (newPriority: 'high' | 'medium' | 'low') => {
    if (!currentTicket) return;
    const updated = tickets.map(t => t.id === currentTicket.id ? { ...t, priority: newPriority, updatedAt: new Date().toISOString() } : t);
    await saveTickets(updated);
    if (onToast) onToast(`Ticket priority set to "${newPriority.toUpperCase()}"`);
  };

  const handleToggleUnread = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tickets.map(t => t.id === ticketId ? { ...t, unread: !t.unread } : t);
    await saveTickets(updated);
  };

  const handleDeleteTicket = async (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Delete Ticket #${ticketId} permanently?`)) {
      const updated = tickets.filter(t => t.id !== ticketId);
      await saveTickets(updated);
      if (selectedTicketId === ticketId && updated.length > 0) {
        setSelectedTicketId(updated[0].id);
      }
      if (onToast) onToast(`Ticket #${ticketId} deleted`);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !currentTicket) return;

    setIsSaving(true);
    const newReply: TicketReply = {
      id: 'rep-' + Date.now(),
      sender: 'admin',
      senderName: 'GovtBharat Support Staff',
      message: replyText.trim(),
      timestamp: 'Just now'
    };

    const currentReplies = currentTicket.replies || [
      {
        id: 'rep-init',
        sender: 'user',
        senderName: currentTicket.name,
        message: currentTicket.message,
        timestamp: currentTicket.time || 'Initial query'
      }
    ];

    const updated = tickets.map(t => {
      if (t.id === currentTicket.id) {
        return {
          ...t,
          status: t.status === 'open' ? 'in_progress' : t.status,
          unread: false,
          updatedAt: new Date().toISOString(),
          replies: [...currentReplies, newReply]
        };
      }
      return t;
    });

    await saveTickets(updated);
    setReplyText('');
    setIsSaving(false);
    if (onToast) onToast(`Reply sent to ${currentTicket.name} (${currentTicket.email})!`);
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.name.trim() || !newTicket.issue.trim() || !newTicket.message.trim()) {
      alert('Please fill candidate name, issue title, and description');
      return;
    }

    const newId = 'TK-' + Math.floor(1000 + Math.random() * 9000);
    const createdTicket: HelpdeskTicket = {
      id: newId,
      name: newTicket.name.trim(),
      email: newTicket.email.trim() || 'candidate@govtbharat.com',
      phone: newTicket.phone.trim() || undefined,
      category: newTicket.category,
      issue: newTicket.issue.trim(),
      message: newTicket.message.trim(),
      status: 'open',
      priority: newTicket.priority,
      time: 'Just now',
      unread: true,
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: 'rep-init-' + Date.now(),
          sender: 'user',
          senderName: newTicket.name.trim(),
          message: newTicket.message.trim(),
          timestamp: 'Just now'
        }
      ]
    };

    const updated = [createdTicket, ...tickets];
    await saveTickets(updated);
    setSelectedTicketId(newId);
    setShowCreateModal(false);
    setNewTicket({
      name: '',
      email: '',
      phone: '',
      category: 'Broken Link',
      issue: '',
      message: '',
      priority: 'medium'
    });
    if (onToast) onToast(`Created support ticket #${newId}`);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Open</span>;
      case 'in_progress':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">In Progress</span>;
      case 'resolved':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Resolved</span>;
      case 'closed':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">Closed</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">High Priority</span>;
      case 'medium':
        return <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Medium</span>;
      case 'low':
        return <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Candidate Tickets & Helpdesk SLA
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Live Sync
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage candidate grievances, broken official links, and recruitment queries
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Ticket</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tickets</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Open Tickets</span>
            <div className="text-lg font-black text-blue-700 dark:text-blue-300 mt-0.5">{openCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">In Progress</span>
            <div className="text-lg font-black text-purple-700 dark:text-purple-300 mt-0.5">{inProgressCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved / Closed</span>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{resolvedCount}</div>
          </div>
        </div>

        {/* Main 2-Column Split: Ticket List (Left) & Ticket Conversation/Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6 min-h-[580px]">
          
          {/* Left Column: Tickets Queue (4 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-3 bg-slate-50/50 dark:bg-slate-950/30 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            
            {/* Search & Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or issue..." 
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
                {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[460px] pr-1">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold">No tickets found matching filters.</p>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = currentTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTicket(t)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                        isSelected
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700/70 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {t.unread && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 animate-pulse" title="Unread" />
                          )}
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {t.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            #{t.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{t.time || 'Recent'}</span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mb-1">
                        {t.issue}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                        {t.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getStatusBadge(t.status)}
                          {getPriorityBadge(t.priority)}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleToggleUnread(t.id, e)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            title={t.unread ? 'Mark as read' : 'Mark as unread'}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTicket(t.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Ticket Conversation & Response Desk (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            {currentTicket ? (
              <div className="flex flex-col h-full space-y-4">
                
                {/* Ticket Top Info Bar */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3.5 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                          #{currentTicket.id}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                          {currentTicket.issue}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span>From: <strong>{currentTicket.name}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          {currentTicket.email}
                          <button
                            onClick={() => handleCopyEmail(currentTicket.email)}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Copy candidate email"
                          >
                            {copiedEmail ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </span>
                        {currentTicket.phone && (
                          <>
                            <span>•</span>
                            <span>{currentTicket.phone}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status & Priority Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div>
                        <select
                          value={currentTicket.status}
                          onChange={(e) => handleStatusChange(e.target.value as any)}
                          className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="open">Status: Open</option>
                          <option value="in_progress">Status: In Progress</option>
                          <option value="resolved">Status: Resolved</option>
                          <option value="closed">Status: Closed</option>
                        </select>
                      </div>

                      <div>
                        <select
                          value={currentTicket.priority || 'medium'}
                          onChange={(e) => handlePriorityChange(e.target.value as any)}
                          className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="high">Priority: High</option>
                          <option value="medium">Priority: Medium</option>
                          <option value="low">Priority: Low</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleDeleteTicket(currentTicket.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conversation Thread Messages */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 max-h-[300px]">
                  {/* Category Note */}
                  {currentTicket.category && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <Tag className="w-3 h-3 text-indigo-500" />
                      <span>Category: {currentTicket.category}</span>
                    </div>
                  )}

                  {/* Render Thread Replies */}
                  {currentTicket.replies && currentTicket.replies.length > 0 ? (
                    currentTicket.replies.map((reply) => {
                      const isAdmin = reply.sender === 'admin';
                      return (
                        <div
                          key={reply.id}
                          className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                            <span className="font-bold text-slate-600 dark:text-slate-300">
                              {reply.senderName}
                            </span>
                            {isAdmin && (
                              <span className="px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded">
                                Staff
                              </span>
                            )}
                            <span>{reply.timestamp}</span>
                          </div>

                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                              isAdmin
                                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200/60 dark:border-slate-700'
                            }`}
                          >
                            {reply.message}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Fallback original message */
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                      {currentTicket.message}
                    </div>
                  )}
                </div>

                {/* Canned Responses Shortcut Chips */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Quick Canned:
                    </span>
                    {cannedResponses.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyText(item.text)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Multi-line Reply Input Desk */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      rows={2}
                      placeholder={`Type official reply to ${currentTicket.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleSendReply();
                        }
                      }}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />

                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSaving}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                          !replyText.trim() || isSaving
                            ? 'bg-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                        }`}
                      >
                        {isSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                    <span>Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[9px]">Ctrl+Enter</kbd> to quickly send reply</span>
                    <span>Replies are recorded in thread & database</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                <Users className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300">No Ticket Selected</h4>
                <p className="text-xs mt-1">Select a ticket from the left queue to view grievance thread and send replies.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create New Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Log New Candidate Support Ticket
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Sharma"
                    value={newTicket.name}
                    onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Email
                  </label>
                  <input
                    type="email"
                    placeholder="candidate@gmail.com"
                    value={newTicket.email}
                    onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Broken Link">Broken Link / Mirror Error</option>
                    <option value="Admit Card">Admit Card Download</option>
                    <option value="Result / Cutoff">Result / Cutoff Query</option>
                    <option value="Answer Key">Answer Key & OMR</option>
                    <option value="Eligibility">Eligibility & Age Limit</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">High (Urgent Discrepancy)</option>
                    <option value="medium">Medium (Standard Inquiry)</option>
                    <option value="low">Low (General Guidance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken download link for SSC GD Answer Key"
                  value={newTicket.issue}
                  onChange={(e) => setNewTicket({ ...newTicket, issue: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Query Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter detailed message from candidate..."
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  Create & Assign Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
