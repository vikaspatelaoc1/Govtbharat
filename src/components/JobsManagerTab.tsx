import React, { useState } from 'react';
import { JobAlert } from '../types';
import { bulkDeleteJobsFromFirestore } from '../services/firestoreService';
import { safeSaveJobsToLocalStorage } from '../utils/jobStorage';
import { Search, Trash2, CheckSquare, Square, AlertTriangle, Edit2, CheckCircle2, RefreshCw, Filter } from 'lucide-react';
import { PopularCategoriesAndTrafficAnalytics } from './PopularCategoriesAndTrafficAnalytics';

interface JobsManagerTabProps {
  jobs: JobAlert[];
  setJobs: React.Dispatch<React.SetStateAction<JobAlert[]>>;
  onToast: (msg: string) => void;
  onEditJob: (id: string, e: React.MouseEvent) => void;
  onDeleteJob: (id: string, e: React.MouseEvent) => void;
}

export const JobsManagerTab: React.FC<JobsManagerTabProps> = ({
  jobs,
  setJobs,
  onToast,
  onEditJob,
  onDeleteJob,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const uniqueStates = Array.from(new Set(jobs.map(j => j.state || 'Central'))).sort();

  const parseDate = (dateStr: string) => {
    if (!dateStr) return 0;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return new Date(dateStr).getTime() || 0;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      !searchQuery || 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.postDate?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesState = selectedStateFilter === 'all' || (job.state || 'Central') === selectedStateFilter;

    return matchesSearch && matchesCat && matchesState;
  }).sort((a, b) => {
    const dateA = parseDate(a.postDate);
    const dateB = parseDate(b.postDate);
    if (sortOrder === 'desc') return dateB - dateA;
    return dateA - dateB;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = filteredJobs.map(j => j.id);
      setSelectedJobIds(Array.from(new Set([...selectedJobIds, ...allFilteredIds])));
    } else {
      const filteredIdsSet = new Set(filteredJobs.map(j => j.id));
      setSelectedJobIds(selectedJobIds.filter(id => !filteredIdsSet.has(id)));
    }
  };

  const handleToggleSelectJob = (id: string) => {
    if (selectedJobIds.includes(id)) {
      setSelectedJobIds(selectedJobIds.filter(item => item !== id));
    } else {
      setSelectedJobIds([...selectedJobIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobIds.length === 0 || isBulkDeleting) return;
    setIsBulkDeleting(true);

    try {
      // 1. Delete from Firestore cloud database
      await bulkDeleteJobsFromFirestore(selectedJobIds);

      // 2. Update local state & localStorage
      setJobs(prev => {
        const updated = prev.filter(j => !selectedJobIds.includes(j.id));
        safeSaveJobsToLocalStorage(updated);
        return updated;
      });

      // 3. Sync with backend server
      await Promise.all(
        selectedJobIds.map(id =>
          fetch(`/api/v1/sarkari-posts/${id}`, { method: 'DELETE' }).catch(() => {})
        )
      );

      onToast(`Successfully deleted ${selectedJobIds.length} job postings in batch operation!`);
      setSelectedJobIds([]);
      setShowConfirmModal(false);
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      onToast(`❌ Bulk delete failed: ${err?.message || 'Database error'}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const isAllCurrentSelected = filteredJobs.length > 0 && filteredJobs.every(j => selectedJobIds.includes(j.id));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" /> Manage & Bulk Delete Jobs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select multiple job postings using checkboxes and execute instant batch deletion across all devices.
          </p>
        </div>

        {selectedJobIds.length > 0 && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer animate-pulse"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected ({selectedJobIds.length})</span>
          </button>
        )}
      </div>

      {/* Popular Job Categories & High-Traffic Links Radar for Editors */}
      <PopularCategoriesAndTrafficAnalytics
        jobs={jobs}
        compact={true}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onToast={onToast}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs by title, state..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(selectedJobIds.length > 0 || selectedCategory !== 'all' || selectedStateFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedJobIds([]);
                setSelectedCategory('all');
                setSelectedStateFilter('all');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline shrink-0 cursor-pointer px-2"
            >
              Clear Filters & Selection
            </button>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected && filteredJobs.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    title="Select All Visible"
                  />
                </th>
                <th className="p-3">Job Title & Details</th>
                <th className="p-3">
                  <div className="flex items-center gap-1.5">
                    CATEGORY
                    <div className="relative group">
                      <button className={`transition-colors p-1 ${selectedCategory !== 'all' ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'}`}>
                        <Filter className="w-3.5 h-3.5" />
                      </button>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        title="Filter by Category"
                      >
                        <option value="all">ALL</option>
                        <option value="latest-jobs">LATEST JOBS</option>
                        <option value="admit-cards">ADMIT CARDS</option>
                        <option value="results">RESULTS</option>
                        <option value="answer-key">ANSWER KEY</option>
                        <option value="syllabus">SYLLABUS</option>
                        <option value="admission">ADMISSION</option>
                        <option value="documents">CERTIFICATES</option>
                      </select>
                    </div>
                    {selectedCategory !== 'all' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    )}
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center gap-1.5">
                    STATE
                    <div className="relative group">
                      <button className={`transition-colors p-1 ${selectedStateFilter !== 'all' ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'}`}>
                        <Filter className="w-3.5 h-3.5" />
                      </button>
                      <select 
                        value={selectedStateFilter}
                        onChange={(e) => setSelectedStateFilter(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        title="Filter by State"
                      >
                        <option value="all">ALL</option>
                        {uniqueStates.map(st => (
                          <option key={String(st)} value={String(st)}>{String(st).toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    {selectedStateFilter !== 'all' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    )}
                  </div>
                </th>
                <th className="p-3">
                  <div 
                    className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    title="Sort by Date"
                  >
                    POST DATE
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 rounded px-1.5 py-0.5 flex items-center justify-center">
                      {sortOrder === 'desc' ? '▼' : '▲'}
                    </span>
                  </div>
                </th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No job postings found matching your search.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => {
                  const isSelected = selectedJobIds.includes(job.id);
                  return (
                    <tr 
                      key={job.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-rose-50/60 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectJob(job.id)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {job.title}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {job.shortInfo || 'No description provided'}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {job.category}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                        {job.state || 'Central'}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {job.postDate}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={(e) => onEditJob(job.id, e)}
                          className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold p-1 rounded transition-colors cursor-pointer"
                          title="Edit Job"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onDeleteJob(job.id, e)}
                          className="text-rose-500 hover:text-rose-700 font-bold p-1 rounded transition-colors cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing {filteredJobs.length} of {jobs.length} total jobs</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {selectedJobIds.length} items selected for batch operation
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">Confirm Batch Deletion</h4>
                <p className="text-xs text-slate-500">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              You are about to permanently delete <strong className="text-rose-600 font-black">{selectedJobIds.length}</strong> selected job postings from the live database across all connected user devices.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting {selectedJobIds.length} jobs...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete {selectedJobIds.length} Jobs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
