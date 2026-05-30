import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Calendar, 
  Mail, 
  Phone, 
  MessageSquare,
  AlertCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPartnershipRequests, PartnershipRequestResponse } from '../../services/superAdminService';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import SidebarLayout from '../../components/ui/SidebarLayout';

export default function PartnershipRequests() {
  const [requests, setRequests] = useState<PartnershipRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PartnershipRequestResponse | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPartnershipRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch partnership requests:', error);
      toast.error('Failed to load partnership requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.representativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.officialEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
      case 'ACCEPTED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-500" />
            Partnership Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Review and manage incoming university partnership leads.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search universities, names, or emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium">University</th>
                <th className="py-4 px-6 font-medium">Representative</th>
                <th className="py-4 px-6 font-medium">Contact Details</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading requests...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-8 h-8 text-slate-400" />
                      <p>No partnership requests found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(new Date(req.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                      {req.universityName}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-900 dark:text-white font-medium">{req.representativeName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{req.designation}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a href={`mailto:${req.officialEmail}`} className="hover:text-blue-500 transition-colors">
                          {req.officialEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mt-1">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <a href={`tel:${req.phoneNumber}`} className="hover:text-blue-500 transition-colors">
                          {req.phoneNumber}
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                        getStatusColor(req.status)
                      )}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        View Message
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Request Details
              </h3>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">University</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedRequest.universityName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Date Submitted</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {format(new Date(selectedRequest.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Representative</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedRequest.representativeName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Designation</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedRequest.designation}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Message
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap min-h-[120px] max-h-[300px] overflow-y-auto">
                  {selectedRequest.message ? selectedRequest.message : (
                    <span className="text-slate-400 italic">No message provided.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </SidebarLayout>
  );
}
