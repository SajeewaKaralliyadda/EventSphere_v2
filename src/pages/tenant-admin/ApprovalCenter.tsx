import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Search, Filter, AlertCircle, Building2, Calendar as CalendarIcon, Eye, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import SidebarLayout from '../../components/ui/SidebarLayout';

import api from '../../lib/api';

export default function ApprovalCenter() {
  const [activeTab, setActiveTab] = useState<'organizers' | 'events'>('organizers');
  
  // State for Rejection Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingItem, setRejectingItem] = useState<{ id: any, type: 'organizer' | 'event', name: string } | null>(null);

  // State for Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedRequestType, setSelectedRequestType] = useState<'organizer' | 'event'>('organizer');

  // State for lists to allow removing items after action
  const [organizerRequests, setOrganizerRequests] = useState<any[]>([]);
  const [eventRequests, setEventRequests] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, eventRes] = await Promise.all([
          api.get('/api/tenant-admin/approvals/organizers'),
          api.get('/api/tenant-admin/approvals/events')
        ]);
        setOrganizerRequests(orgRes.data);
        setEventRequests(eventRes.data);
      } catch (err) {
        toast.error('Failed to load pending requests');
      }
    };
    fetchData();
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    category: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const handleApplyFilters = () => {
    setAppliedFilters({
      category: filterCategory,
      status: filterStatus,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo
    });
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setAppliedFilters({
      category: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Filtered Data
  const filteredOrganizerRequests = organizerRequests.filter(req => 
    req.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.clubName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEventRequests = eventRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || req.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = appliedFilters.category ? req.category === appliedFilters.category : true;
    const matchesStatus = appliedFilters.status ? req.status === appliedFilters.status : true;
    
    let matchesDate = true;
    if (appliedFilters.dateFrom && req.date < appliedFilters.dateFrom) matchesDate = false;
    if (appliedFilters.dateTo && req.date > appliedFilters.dateTo) matchesDate = false;

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const handleApprove = async (id: any, type: 'organizer' | 'event') => {
    try {
      if (type === 'organizer') {
        await api.post(`/api/tenant-admin/approvals/organizers/${id}/approve`);
        setOrganizerRequests(prev => prev.filter(req => req.id !== id));
        toast.success('Organizer request approved successfully.');
      } else {
        await api.post(`/api/tenant-admin/approvals/events/${id}/approve`);
        setEventRequests(prev => prev.filter(req => req.id !== id));
        toast.success('Event request approved successfully.');
      }
    } catch (err) {
      toast.error('Approval failed.');
    }
  };

  const openRejectModal = (id: number, type: 'organizer' | 'event', name: string) => {
    setRejectingItem({ id, type, name });
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (rejectingItem) {
      try {
        if (rejectingItem.type === 'organizer') {
          await api.post(`/api/tenant-admin/approvals/organizers/${rejectingItem.id}/reject`);
          setOrganizerRequests(prev => prev.filter(req => req.id !== rejectingItem.id));
          toast.success('Organizer request rejected.');
        } else {
          await api.post(`/api/tenant-admin/approvals/events/${rejectingItem.id}/reject`);
          setEventRequests(prev => prev.filter(req => req.id !== rejectingItem.id));
          toast.success('Event request rejected.');
        }
      } catch (err) {
        toast.error('Rejection failed.');
      }
    }
    setIsRejectModalOpen(false);
    setRejectingItem(null);
  };

  const openDetailsModal = (request: any, type: 'organizer' | 'event') => {
    setSelectedRequest(request);
    setSelectedRequestType(type);
    setIsDetailsModalOpen(true);
  };

  const handleModalReject = async (id: any, type: 'organizer' | 'event', reason: string) => {
    try {
      if (type === 'organizer') {
        await api.post(`/api/tenant-admin/approvals/organizers/${id}/reject`);
        setOrganizerRequests(prev => prev.filter(req => req.id !== id));
        toast.success('Organizer request rejected.');
      } else {
        await api.post(`/api/tenant-admin/approvals/events/${id}/reject`);
        setEventRequests(prev => prev.filter(req => req.id !== id));
        toast.success('Event request rejected.');
      }
    } catch (err) {
      toast.error('Rejection failed.');
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Approval Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage pending requests from organizers and events.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-px">
          <button
            onClick={() => setActiveTab('organizers')}
            className={`px-6 py-3 font-medium text-sm transition-all relative ${
              activeTab === 'organizers' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organizer Requests
              {organizerRequests.length > 0 && (
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 py-0.5 px-2 rounded-full text-xs ml-1">
                  {organizerRequests.length}
                </span>
              )}
            </div>
            {activeTab === 'organizers' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 font-medium text-sm transition-all relative ${
              activeTab === 'events' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Event Requests
              {eventRequests.length > 0 && (
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 py-0.5 px-2 rounded-full text-xs ml-1">
                  {eventRequests.length}
                </span>
              )}
            </div>
            {activeTab === 'events' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
            {activeTab === 'events' && (
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                  isFilterOpen || appliedFilters.category || appliedFilters.status || appliedFilters.dateFrom || appliedFilters.dateTo
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
            )}
          </div>

          {/* Expandable Filter Panel for Events */}
          <AnimatePresence>
            {activeTab === 'events' && isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        <option value="">All Categories</option>
                        <option value="Technology">Technology</option>
                        <option value="Academic">Academic</option>
                        <option value="Competition">Competition</option>
                        <option value="Music">Music</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Status</label>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">From Date</label>
                      <input 
                        type="date" 
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">To Date</label>
                      <input 
                        type="date" 
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={handleApplyFilters}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <AnimatePresence mode="wait">
            {activeTab === 'organizers' ? (
              <motion.div
                key="organizers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                        <th className="p-4 font-medium">Applicant Name</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Club / Society Name</th>
                        <th className="p-4 font-medium">Date Applied</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredOrganizerRequests.map((req) => (
                          <motion.tr 
                            key={req.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group"
                          >
                            <td className="p-4 font-medium">{req.name}</td>
                            <td className="p-4 text-slate-500 dark:text-slate-400">{req.email}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                                {req.clubName}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{req.date}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => openDetailsModal(req, 'organizer')}
                                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleApprove(req.id, 'organizer')}
                                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openRejectModal(req.id, 'organizer', req.name)}
                                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {filteredOrganizerRequests.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No pending organizer requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                        <th className="p-4 font-medium">Event Title</th>
                        <th className="p-4 font-medium">Organizer</th>
                        <th className="p-4 font-medium">Event Date</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredEventRequests.map((req) => (
                          <motion.tr 
                            key={req.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group"
                          >
                            <td className="p-4 font-medium">
                              {req.title}
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">{req.category}</div>
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400">{req.organizer}</td>
                            <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{req.date}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                                {req.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => openDetailsModal(req, 'event')}
                                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleApprove(req.id, 'event')}
                                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openRejectModal(req.id, 'event', req.title)}
                                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {filteredEventRequests.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No pending event requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsRejectModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Reject Request</h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  You are about to reject the request for <strong className="text-slate-900 dark:text-white">{rejectingItem?.name}</strong>. Please provide a reason for this rejection.
                </p>

                <div className="space-y-2 mb-8">
                  <label className="block text-sm font-medium">Reason for Rejection</label>
                  <textarea 
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Missing required documentation..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmReject}
                    disabled={!rejectReason.trim()}
                    className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
        type={selectedRequestType}
        onApprove={handleApprove}
        onReject={handleModalReject}
      />
    </SidebarLayout>
  );
}

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  type: 'organizer' | 'event';
  onApprove: (id: any, type: 'organizer' | 'event') => void;
  onReject: (id: any, type: 'organizer' | 'event', reason: string) => void;
}

function RequestDetailsModal({ isOpen, onClose, request, type, onApprove, onReject }: RequestDetailsModalProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!request) return null;

  const handleReject = () => {
    if (isRejecting) {
      onReject(request.id, type, rejectReason);
      setIsRejecting(false);
      setRejectReason('');
      onClose();
    } else {
      setIsRejecting(true);
    }
  };

  const handleApprove = () => {
    onApprove(request.id, type);
    onClose();
  };

  const handleClose = () => {
    setIsRejecting(false);
    setRejectReason('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold">
                {type === 'organizer' ? 'Organizer Request Details' : 'Event Request Details'}
              </h3>
              <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Details */}
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                    Information
                  </h4>
                  
                  {type === 'organizer' ? (
                    <div className="space-y-4">
                      <DetailRow label="Full Name" value={request.name} />
                      <DetailRow label="Email" value={request.email} />
                      <DetailRow label="Phone" value={request.phone || '+1 (555) 123-4567'} />
                      <DetailRow label="Club / Society Name" value={request.clubName} />
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Description</span>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          {request.description || 'We are a student-led organization dedicated to fostering innovation and collaboration among tech enthusiasts on campus.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <DetailRow label="Event Title" value={request.title} />
                      <DetailRow label="Organizer" value={request.organizer} />
                      <DetailRow label="Category" value={request.category || 'Technology'} />
                      <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Date" value={request.date} />
                        <DetailRow label="Time" value={request.time || '09:00 AM'} />
                      </div>
                      <DetailRow label="Venue" value={request.venue || 'Main Campus Auditorium'} />
                      <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Total Capacity" value={request.capacity} />
                        <DetailRow label="Target Audience" value={request.audience || 'University Students Only'} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ticket Tiers</span>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Early Bird</span>
                            <span className="text-slate-500">Rs. 500 (50 qty)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">General Admission</span>
                            <span className="text-slate-500">Rs. 1000 (100 qty)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Document */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {type === 'organizer' ? 'ID / Approval Document' : 'Required Documents'}
                    </h4>
                    {request.documentUrl && (
                      <a href={request.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        <Download className="w-4 h-4" /> Download
                      </a>
                    )}
                  </div>
                  
                  {type === 'event' && request.coverImageUrl && (
                    <div className="mb-4">
                      <p className="text-sm font-medium font-bold text-slate-900 dark:text-white mb-2">Cover Image</p>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden aspect-video relative flex items-center justify-center">
                        <img 
                          src={request.coverImageUrl} 
                          alt="Cover Image Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden aspect-[3/4] relative flex items-center justify-center group p-4">
                    {/* Document View */}
                    {request.documentUrl ? (
                      request.documentUrl.toLowerCase().includes('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-center">
                          <FileText className="w-16 h-16 mb-4 opacity-50" />
                          <p className="font-bold text-slate-900 dark:text-white mb-1">PDF Document</p>
                          <a href={request.documentUrl} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg text-sm font-medium">Open PDF Document</a>
                        </div>
                      ) : (
                        <div className="w-full h-full p-2">
                          <img 
                            src={request.documentUrl} 
                            alt="Document Preview" 
                            className="w-full h-full object-contain rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )
                    ) : (
                       <div className="text-center p-6 text-slate-500">
                         <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                         <p>No document provided</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Area */}
              <AnimatePresence>
                {isRejecting && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4">
                        <AlertCircle className="w-5 h-5" />
                        <h4 className="font-bold">Provide Rejection Reason</h4>
                      </div>
                      <textarea 
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Explain why this request is being rejected..."
                        className="w-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0 flex items-center justify-end gap-3">
              {isRejecting ? (
                <>
                  <button 
                    onClick={() => setIsRejecting(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel Rejection
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                    className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Confirm Reject
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleReject}
                    className="px-5 py-2.5 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="px-5 py-2.5 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-bold text-slate-900 dark:text-white text-right">{value}</span>
    </div>
  );
}
