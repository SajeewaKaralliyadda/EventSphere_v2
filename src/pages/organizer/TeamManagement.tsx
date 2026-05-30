import React, { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { UserPlus, Trash2, Mail, Shield, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  listTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  type TeamMemberResponse,
} from '../../services/organizerService';

type BackendRole = 'ORGANIZER' | 'CO_ORGANIZER' | 'GATE_SCANNER';
type InviteRole = 'CO_ORGANIZER' | 'GATE_SCANNER';

const ROLE_LABELS: Record<BackendRole, string> = {
  ORGANIZER: 'Organizer',
  CO_ORGANIZER: 'Co-Organizer',
  GATE_SCANNER: 'Gate Scanner',
};

const ROLE_BADGE: Record<BackendRole, string> = {
  ORGANIZER:
    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  CO_ORGANIZER:
    'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  GATE_SCANNER:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
};

export default function TeamManagement() {
  const { user } = useAuth();

  // ── Team list ──────────────────────────────────────────────────────────────
  const [team, setTeam] = useState<TeamMemberResponse[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingTeam(true);
    try {
      // organizerId === user.id (1:1 mapping)
      const members = await listTeamMembers(user.id);
      setTeam(members);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to load team members.');
    } finally {
      setIsLoadingTeam(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  // ── Invite form ────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('GATE_SCANNER');
  const [isSending, setIsSending] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter an email address.'); return; }
    if (!user?.id) { toast.error('Not authenticated.'); return; }

    setIsSending(true);
    try {
      // Backend resolves user UUID from email internally
      const newMember = await inviteTeamMember(user.id, email.trim(), inviteRole);
      setTeam(prev => [...prev, newMember]);
      setEmail('');
      toast.success(`Invitation sent to ${email.trim()}.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to send invitation.');
    } finally {
      setIsSending(false);
    }
  };

  // ── Remove member ──────────────────────────────────────────────────────────
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (member: TeamMemberResponse) => {
    if (!user?.id) return;
    setRemovingId(member.id);
    try {
      await removeTeamMember(user.id, member.id);
      setTeam(prev => prev.filter(m => m.id !== member.id));
      toast.success('Team member removed.');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to remove team member.');
    } finally {
      setRemovingId(null);
    }
  };

  /**
   * UI restriction: the ORGANIZER row (the account owner) cannot be deleted
   * or have their role changed. This prevents Co-Organizers from locking out
   * the original account holder.
   */
  const isProtectedRow = (member: TeamMemberResponse) =>
    member.role === 'ORGANIZER';

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Invite co-organizers and gate scanners to help manage your events.
            </p>
          </div>
          <button
            onClick={fetchTeam}
            disabled={isLoadingTeam}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingTeam ? 'animate-spin text-blue-500' : ''}`} />
          </button>
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
                      onChange={e => setEmail(e.target.value)}
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
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value as InviteRole)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="CO_ORGANIZER">Co-Organizer</option>
                      <option value="GATE_SCANNER">Gate Scanner</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {inviteRole === 'CO_ORGANIZER'
                      ? 'Can manage events, view reports, and invite others.'
                      : 'Can only access the mobile scanner to validate tickets.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSending ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
            </div>
          </div>

          {/* Team List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold">Current Team</h2>
                <span className="text-xs text-slate-400">{team.length} member{team.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">User</th>
                      <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Role</th>
                      <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTeam ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                          Loading team members...
                        </td>
                      </tr>
                    ) : team.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">
                          No team members yet. Invite someone to help manage your events.
                        </td>
                      </tr>
                    ) : (
                      team.map(member => {
                        const protected_ = isProtectedRow(member);
                        const isRemoving = removingId === member.id;
                        return (
                          <tr
                            key={member.id}
                            className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                                  {member.userId.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-medium text-slate-900 dark:text-white text-sm font-mono">
                                    {member.userId}
                                  </span>
                                  {protected_ && (
                                    <span className="ml-2 text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
                                      You (Owner)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                  ROLE_BADGE[member.role as BackendRole] ?? 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {ROLE_LABELS[member.role as BackendRole] ?? member.role}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {protected_ ? (
                                <span
                                  className="inline-block p-2 text-slate-200 dark:text-slate-700 cursor-not-allowed"
                                  title="Cannot remove the main Organizer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleRemove(member)}
                                  disabled={isRemoving}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                  title="Remove member"
                                >
                                  {isRemoving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
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
