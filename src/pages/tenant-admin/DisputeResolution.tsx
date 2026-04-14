import React, { useState } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { ShieldAlert, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../lib/api';

interface Dispute {
  id: string;
  organizer: string;
  event: string;
  reason: string;
  status: 'Open' | 'Resolved' | 'Suspended';
  date: string;
}

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  React.useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const response = await api.get('/api/tenant-admin/disputes');
        setDisputes(response.data);
      } catch (err) {
        toast.error('Failed to fetch disputes');
      }
    };
    fetchDisputes();
  }, []);

  const handleSuspend = async (id: string, organizer: string) => {
    try {
      await api.post(`/api/tenant-admin/disputes/${id}/suspend`);
      setDisputes(disputes.map(d => d.id === id ? { ...d, status: 'Suspended' } : d));
      toast.success(`Account for ${organizer} has been suspended.`);
    } catch (err) {
      toast.error('Failed to suspend account.');
    }
  };

  const handleWarn = async (id: string, organizer: string) => {
    try {
      await api.post(`/api/tenant-admin/disputes/${id}/warn`);
      toast.success(`Warning sent to ${organizer}.`);
    } catch (err) {
      toast.error('Failed to send warning.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/api/tenant-admin/disputes/${id}/status`, { status: newStatus });
      setDisputes(disputes.map(d => d.id === id ? { ...d, status: newStatus as any } : d));
      toast.success('Dispute status updated.');
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dispute Resolution</h1>
          <p className="text-slate-500 dark:text-slate-400">Review user reports and manage organizer accounts.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Reported Organizer</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Event</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Reason for Report</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Date</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Status</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-orange-500" />
                        {dispute.organizer}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{dispute.event}</td>
                    <td className="p-4">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {dispute.reason}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{dispute.date}</td>
                    <td className="p-4">
                      <select 
                        value={dispute.status}
                        onChange={(e) => handleStatusChange(dispute.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold outline-none border border-slate-200 dark:border-slate-700 ${
                          dispute.status === 'Open' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                          dispute.status === 'Suspended' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {dispute.status !== 'Suspended' && (
                          <>
                            <button 
                              onClick={() => handleWarn(dispute.id, dispute.organizer)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg transition-colors"
                            >
                              Send Warning
                            </button>
                            <button 
                              onClick={() => handleSuspend(dispute.id, dispute.organizer)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" /> Suspend
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
