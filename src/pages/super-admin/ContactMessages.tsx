import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContactMessages, ContactMessageResponse } from '../../services/superAdminService';

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getContactMessages();
        setMessages(data);
      } catch (err) {
        toast.error('Failed to fetch contact messages.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-slate-500 dark:text-slate-400">Review messages submitted through the public Contact Us form.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                No contact messages yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Sender</th>
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Subject</th>
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Message</th>
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Date</th>
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {msg.firstName} {msg.lastName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {msg.subject}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-700 dark:text-slate-300 max-w-md whitespace-pre-wrap break-words">
                          {msg.message}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          msg.status === 'OPEN' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        }`}>
                          {msg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
