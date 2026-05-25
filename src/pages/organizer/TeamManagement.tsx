import React, { useState } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

interface TeamMember {
  id: string;
  email: string;
  role: 'Co-Organizer' | 'Gate Scanner';
  status: 'Active' | 'Pending';
}

const MOCK_TEAM: TeamMember[] = [
  { id: '1', email: 'jane.smith@example.com', role: 'Co-Organizer', status: 'Active' },
  { id: '2', email: 'mike.jones@example.com', role: 'Gate Scanner', status: 'Active' },
  { id: '3', email: 'sarah.williams@example.com', role: 'Gate Scanner', status: 'Pending' },
];

export default function TeamManagement() {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Co-Organizer' | 'Gate Scanner'>('Gate Scanner');
  const [isSending, setIsSending] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    if (!user?.tenantId) {
      toast.error('Tenant ID missing. Only tenant-bound organizers can invite team members.');
      return;
    }
    setIsSending(true);

    try {
      const backendRole = role === 'Co-Organizer' ? 'CO_ORGANIZER' : 'GATE_SCANNER';
      await api.post(`/api/identity/tenants/${user.tenantId}/team-invitations`, {
        email,
        role: backendRole
      });

      const newMember: TeamMember = {
        id: Date.now().toString(),
        email,
        role,
        status: 'Pending'
      };
      setTeam([...team, newMember]);
      setEmail('');
      toast.success(`Invitation sent to ${email}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  const handleRemove = (id: string) => {
    setTeam(team.filter(member => member.id !== id));
    toast.success('Team member removed');
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Invite co-organizers and gate scanners to help manage your events.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invite Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Invite Member
              </h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@university.edu"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'Co-Organizer' | 'Gate Scanner')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="Co-Organizer">Co-Organizer</option>
                      <option value="Gate Scanner">Gate Scanner</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {role === 'Co-Organizer' 
                      ? 'Can manage events, view reports, and invite others.' 
                      : 'Can only access the mobile scanner to validate tickets.'}
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={isSending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors mt-2 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
            </div>
          </div>

          {/* Team List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold">Current Team</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">User</th>
                      <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Role</th>
                      <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Status</th>
                      <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((member) => (
                      <tr key={member.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                              {member.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{member.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            member.role === 'Co-Organizer' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' 
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            member.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleRemove(member.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {team.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                          No team members yet. Invite someone to help manage your events.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
