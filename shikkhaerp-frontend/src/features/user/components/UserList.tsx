import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import userService, { AppUser } from '../../dashboard/services/user.service';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { Search, X, Plus, ChevronLeft, ChevronRight, Users2 } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  DEVELOPER: 'Developer',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:               { label: 'Active',         color: '#1B8A5A', bg: '#E4F5EC' },
  INACTIVE:             { label: 'Inactive',       color: '#B3261E', bg: '#FBEAE9' },
  SUSPENDED:            { label: 'Suspended',      color: '#8A5A00', bg: '#FBF0DA' },
  PENDING_VERIFICATION: { label: 'Pending invite', color: '#1D4ED8', bg: '#E3EDFB' },
  LOCKED:               { label: 'Locked',         color: '#6B21A8', bg: '#F3E8FD' },
};

const statusStyle = (status: string) =>
  STATUS_STYLES[status] ?? { label: status, color: '#51607A', bg: '#EEF3F8' };

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '',                     label: 'All statuses' },
  { value: 'ACTIVE',               label: 'Active' },
  { value: 'INACTIVE',             label: 'Inactive' },
  { value: 'SUSPENDED',            label: 'Suspended' },
  { value: 'LOCKED',               label: 'Locked' },
  { value: 'PENDING_VERIFICATION', label: 'Pending invite' },
];

type ViewMode = 'active' | 'deleted';

export const UserList: React.FC = () => {
  const { getUserRole } = useAuth();
  const currentRole = getUserRole();

  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<AppUser | null>(null);
  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => clearTimeout(t);
  }, [keyword]);

  const isDeletedView = viewMode === 'deleted';
  const isSearchMode = !isDeletedView && debouncedKeyword.length > 0;

  const loadUsers = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      if (viewMode === 'deleted') {
        const result = await userService.getDeletedPaginated(targetPage, PAGE_SIZE);
        setUsers(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setPage(result.pageNumber);
      } else if (debouncedKeyword) {
        const results = await userService.search(debouncedKeyword);
        const filtered = statusFilter
          ? results.filter((u) => u.status === statusFilter)
          : results;
        setUsers(filtered);
        setTotalPages(1);
        setTotalElements(filtered.length);
        setPage(0);
      } else {
        const result = await userService.getAllPaginated(
          targetPage,
          PAGE_SIZE,
          undefined,
          statusFilter || undefined
        );
        setUsers(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setPage(result.pageNumber);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ||
        (viewMode === 'deleted' ? 'Could not load deleted users.' : 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  }, [viewMode, debouncedKeyword, statusFilter]);

  useEffect(() => {
    loadUsers(0);
  }, [loadUsers]);

  const switchView = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setError(null);
    setNotice(null);
    setKeyword('');
    setStatusFilter('');
    setViewMode(mode);
  };

  const handleActivate = async (target: AppUser) => {
    setNotice(null);
    try {
      await userService.setEnabled(target.id, true);
      loadUsers(page);
    } catch {
      setError(`Could not update status for ${target.name}.`);
    }
  };

  const handleDeactivateConfirmed = async () => {
    if (!deactivatingUser) return;
    setDeactivateSubmitting(true);
    setNotice(null);
    try {
      await userService.setEnabled(deactivatingUser.id, false);
      setDeactivatingUser(null);
      loadUsers(page);
    } catch {
      setError(`Could not deactivate ${deactivatingUser.name}.`);
    } finally {
      setDeactivateSubmitting(false);
    }
  };

  const handleUnlock = async (target: AppUser) => {
    setUnlockingId(target.id);
    setError(null);
    setNotice(null);
    try {
      await userService.unlock(target.id, target.email);
      setNotice(`${target.name}'s account has been unlocked.`);
      loadUsers(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Could not unlock ${target.name}.`);
    } finally {
      setUnlockingId(null);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingUser) return;
    setDeleteSubmitting(true);
    try {
      await userService.delete(deletingUser.id);
      setDeletingUser(null);
      loadUsers(page);
    } catch {
      setError(`Could not delete ${deletingUser.name}.`);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleRestore = async (target: AppUser) => {
    setRestoringId(target.id);
    setError(null);
    try {
      await userService.restore(target.id);
      loadUsers(page);
    } catch {
      setError(`Could not restore ${target.name}.`);
    } finally {
      setRestoringId(null);
    }
  };

  const handleResendInvite = async (target: AppUser) => {
    setResendingId(target.id);
    setError(null);
    setNotice(null);
    try {
      await userService.resendInvite(target.id);
      setNotice(`Invitation re-sent to ${target.email}.`);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Could not resend the invitation to ${target.email}.`);
    } finally {
      setResendingId(null);
    }
  };

  const initials = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const pendingCount = users.filter((u) => u.status === 'PENDING_VERIFICATION').length;

  const tabBtn = (mode: ViewMode, label: string) => (
    <button
      onClick={() => switchView(mode)}
      className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
        viewMode === mode ? 'bg-brand text-white shadow-sm' : 'text-slatesoft hover:bg-surfaceinset'
      }`}
    >
      {label}
    </button>
  );

  const smallBtn = (
    label: string,
    onClick: () => void,
    opts: { className: string; disabled?: boolean }
  ) => (
    <button
      onClick={onClick}
      disabled={opts.disabled}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${opts.className}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Users2 className="h-4 w-4" />
              </span>
              <h1 className="font-display text-lg font-extrabold text-ink">
                {isDeletedView ? 'Deleted users' : 'Users'}
                <span className="ml-2 text-sm font-medium text-slatesoft">({totalElements})</span>
              </h1>
            </div>
            <div className="flex gap-1.5 rounded-xl bg-surfaceinset p-1">
              {tabBtn('active', 'Active')}
              {tabBtn('deleted', 'Deleted')}
            </div>
            {!isDeletedView && pendingCount > 0 && (
              <span className="rounded-full bg-ocean/10 px-2.5 py-1 text-xs font-bold text-ocean">
                {pendingCount} pending invite{pendingCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          {!isDeletedView && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              <Plus className="h-4 w-4" /> Add user
            </button>
          )}
        </div>

        {/* Search + filter */}
        {!isDeletedView && (
          <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-3.5">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slatesoft" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search name, email, or school…"
                maxLength={120}
                className="w-full rounded-xl border border-linestrong bg-surfacefield px-9 py-2.5 text-sm text-ink outline-none transition-shadow focus:border-brand focus:ring-4 focus:ring-ocean/15"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slatesoft hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer rounded-xl border border-linestrong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-ocean/15"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Banners */}
        {error && (
          <div className="bg-alert/10 px-5 py-2.5 text-sm font-medium text-alert">{error}</div>
        )}
        {notice && (
          <div className="bg-success/10 px-5 py-2.5 text-sm font-medium text-success">{notice}</div>
        )}

        {/* Table / states */}
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative h-14 overflow-hidden rounded-xl bg-line/60">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surfaceinset text-slatesoft">
              <Users2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-slatesoft">
              {isDeletedView
                ? 'No deleted users.'
                : isSearchMode
                  ? `No users match “${debouncedKeyword}”.`
                  : 'No users found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surfaceinset">
                  {['Name', 'Role', 'School', 'Status', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`border-b border-line px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slatesoft ${i === 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const s = statusStyle(u.status);
                  const isPending = u.status === 'PENDING_VERIFICATION';
                  return (
                    <tr key={u.id} className={`border-b border-line transition-colors hover:bg-surfaceinset/60 ${isDeletedView ? 'opacity-70' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-softblue font-display text-xs font-bold text-brand">
                            {initials(u.name)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-ink">{u.name}</div>
                            <div className="text-xs text-slatesoft">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink">{ROLE_LABELS[u.role] ?? u.role}</td>
                      <td className="px-5 py-3.5 text-sm text-ink">
                        {u.schoolId ?? <span className="text-slatesoft">— platform —</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {isDeletedView ? (
                          <span className="inline-block rounded-full px-2.5 py-1 text-xs font-bold" style={{ color: '#8A5A00', background: '#FBF0DA' }}>
                            Deleted
                          </span>
                        ) : (
                          <span className="inline-block rounded-full px-2.5 py-1 text-xs font-bold" style={{ color: s.color, background: s.bg }}>
                            {s.label}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {isDeletedView ? (
                            smallBtn(
                              restoringId === u.id ? 'Restoring…' : 'Restore',
                              () => handleRestore(u),
                              { className: 'border-success/30 text-success hover:bg-success/5', disabled: restoringId === u.id }
                            )
                          ) : (
                            <>
                              {u.status === 'LOCKED' && smallBtn(
                                unlockingId === u.id ? 'Unlocking…' : 'Unlock',
                                () => handleUnlock(u),
                                { className: 'border-[#D8C4F0] text-[#6B21A8] hover:bg-[#F3E8FD]', disabled: unlockingId === u.id }
                              )}
                              {isPending && smallBtn(
                                resendingId === u.id ? 'Sending…' : 'Resend invite',
                                () => handleResendInvite(u),
                                { className: 'border-ocean/30 text-ocean hover:bg-ocean/5', disabled: resendingId === u.id }
                              )}
                              {smallBtn('Edit', () => setEditingUser(u), { className: 'border-linestrong text-ink hover:bg-surfaceinset' })}
                              {smallBtn(
                                u.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
                                u.status === 'ACTIVE' ? () => setDeactivatingUser(u) : () => handleActivate(u),
                                { className: 'border-linestrong text-slatesoft hover:bg-surfaceinset' }
                              )}
                              {smallBtn('Delete', () => setDeletingUser(u), { className: 'border-alert/20 text-alert hover:bg-alert/5' })}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !isSearchMode && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3.5 text-sm">
            <span className="text-slatesoft">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => loadUsers(page - 1)}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-linestrong px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surfaceinset disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={() => loadUsers(page + 1)}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-linestrong px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surfaceinset disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => { setKeyword(''); setStatusFilter(''); loadUsers(0); }}
      />
      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={() => loadUsers(page)}
      />

      {/* Delete confirm */}
      {deletingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5 backdrop-blur-sm"
          onClick={() => !deleteSubmitting && setDeletingUser(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-extrabold text-ink">Delete {deletingUser.name}?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slatesoft">
              This removes them from the active user list. It's a soft delete — their records
              (grades, attendance, history) are kept, and this can be reversed later from the Deleted view.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setDeletingUser(null)}
                disabled={deleteSubmitting}
                className="rounded-xl border border-linestrong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surfaceinset"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={deleteSubmitting}
                className="rounded-xl bg-alert px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-95 disabled:opacity-70"
              >
                {deleteSubmitting ? 'Deleting…' : 'Delete user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate confirm */}
      {deactivatingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5 backdrop-blur-sm"
          onClick={() => !deactivateSubmitting && setDeactivatingUser(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-extrabold text-ink">Deactivate {deactivatingUser.name}?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slatesoft">
              They'll stay in the user list but won't be able to sign in until an admin reactivates them. This is reversible.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setDeactivatingUser(null)}
                disabled={deactivateSubmitting}
                className="rounded-xl border border-linestrong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surfaceinset"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateConfirmed}
                disabled={deactivateSubmitting}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-95 disabled:opacity-70"
                style={{ background: '#8A5A00' }}
              >
                {deactivateSubmitting ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
