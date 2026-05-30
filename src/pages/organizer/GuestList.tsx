import React, { useState } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Download, Mail, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { listEvents, listBookings, emailAttendees } from '../../services/organizerService';

export default function GuestList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [guests, setGuests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      listEvents(user.id)
        .then(data => {
          setEvents(data);
          if (data.length > 0) setSelectedEventId(data[0].id);
        })
        .catch(e => console.error("Failed to fetch events", e));
    }
  }, [user?.id]);

  useEffect(() => {
    // Only fetch if eventId is a valid UUID, not 'undefined' or empty
    if (!selectedEventId || selectedEventId === 'undefined') {
      setGuests([]);
      return;
    }
    setIsLoading(true);
    listBookings(selectedEventId)
      .then(res => setGuests(res))
      .catch(e => toast.error('Failed to load guests'))
      .finally(() => setIsLoading(false));
  }, [selectedEventId]);

  const filteredGuests = guests.filter(guest => {
    const searchLow = searchTerm.toLowerCase();
    const nameMatch = guest.purchaserEmail?.toLowerCase().includes(searchLow);
    const typeMatch = guest.ticketType?.toLowerCase().includes(searchLow);
    const isNotPendingPayment = guest.status !== 'PENDING_PAYMENT';
    return (nameMatch || typeMatch) && isNotPendingPayment;
  });

  const handleDownload = () => {
    if (filteredGuests.length === 0) {
      toast.error('No guests to export.');
      return;
    }

    const headers = ['Name,Email,Ticket Type,Purchase Date,Status'];
    const rows = filteredGuests.map(guest => {
      const name = (guest.purchaserEmail?.split('@')[0] || 'Anonymous').replace(/,/g, '');
      const email = (guest.purchaserEmail || '').replace(/,/g, '');
      const type = (guest.ticketType || 'Ticket').replace(/,/g, '');
      const date = guest.createdAt ? format(new Date(guest.createdAt), 'MMM dd yyyy') : 'N/A';
      const status = guest.status || 'PENDING';
      return `${name},${email},${type},${date},${status}`;
    });

    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `guests_${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Downloading guest list as CSV...');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }
    if (!emailSubject || !emailBody) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!user?.id) return;
    try {
      await emailAttendees(user.id, selectedEventId, { subject: emailSubject, body: emailBody });
      toast.success(`Email sent to ${filteredGuests.length} attendees!`);
    } catch (e) {
      toast.error('Failed to send emails.');
    } finally {
      setIsEmailModalOpen(false);
      setEmailSubject('');
      setEmailBody('');
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Guest List</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage attendees for your events.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Email Attendees
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative max-w-md w-full sm:w-80">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              >
                {events.length === 0 && <option value="">No events available</option>}
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
            
            <div className="relative max-w-md w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or ticket type..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Name</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Email</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Ticket Type</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Purchase Date</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading guests...</td>
                  </tr>
                ) : filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No guests found matching your search.
                    </td>
                  </tr>
                ) : filteredGuests.map((guest) => (
                  <tr key={guest.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{guest.purchaserEmail?.split('@')[0] || 'Anonymous'}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{guest.purchaserEmail}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium">
                        {guest.ticketType || 'Ticket'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{guest.createdAt ? format(new Date(guest.createdAt), 'MMM dd, yyyy') : 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        guest.status === 'CONFIRMED' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {guest.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEmailModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Email Attendees</h3>
                <button onClick={() => setIsEmailModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                This message will be sent to <strong>{filteredGuests.length}</strong> attendees.
              </p>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Important update regarding the event"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea 
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Type your message here..."
                    rows={6}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" /> Send Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
